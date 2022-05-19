import debug, { Debugger } from 'debug'
import { BrowserView, BrowserWindow, clipboard, desktopCapturer, dialog, ipcMain, nativeImage } from 'electron'
import Events from 'events'
import fs from 'fs-extra'
import Event from './event'
import getBoundAndDisplay, { BoundAndDisplay } from './getBoundAndDisplay'
import padStart from './padStart'
import { Bounds, ScreenshotsData } from './preload'

export type LoggerFn = (...args: unknown[]) => void
export type Logger = Debugger | LoggerFn

export interface Lang {
  magnifier_position_label?: string
  operation_ok_title?: string
  operation_cancel_title?: string
  operation_save_title?: string
  operation_redo_title?: string
  operation_undo_title?: string
  operation_mosaic_title?: string
  operation_text_title?: string
  operation_brush_title?: string
  operation_arrow_title?: string
  operation_ellipse_title?: string
  operation_rectangle_title?: string
}

export interface ScreenshotsOpts {
  lang?: Lang
  logger?: Logger
}

export { Bounds }

export default class Screenshots extends Events {
  // 截图窗口对象
  public $win: BrowserWindow | null = null

  public $view: BrowserView = new BrowserView({
    webPreferences: {
      preload: require.resolve('./preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      nativeWindowOpen: false
    }
  })

  private logger: Logger

  private isReady = new Promise<void>(resolve => {
    ipcMain.once('SCREENSHOTS:ready', () => {
      this.logger('SCREENSHOTS:ready')

      resolve()
    })
  })

  constructor (opts?: ScreenshotsOpts) {
    super()
    this.logger = opts?.logger || debug('electron-screenshots')
    this.listenIpc()
    this.$view.webContents.loadURL(`file://${require.resolve('react-screenshots/electron/electron.html')}`)
    if (opts?.lang) {
      this.setLang(opts.lang)
    }
  }

  /**
   * 开始截图
   */
  public startCapture (): void {
    this.logger('startCapture')

    this.isReady.then(() => {
      if (this.$win && !this.$win.isDestroyed()) {
        this.$win.close()
      }
      const boundAndDisplay = getBoundAndDisplay()
      this.createWindow(boundAndDisplay)

      // 捕捉桌面之后显示窗口
      // 避免截图窗口自己被截图
      this.capture(boundAndDisplay).then(() => {
        if (!this.$win) return
        this.$win.show()
        this.$win.focus()
      })
    })
  }

  /**
   * 结束截图
   */
  public endCapture (): void {
    this.logger('endCapture')

    if (!this.$win) return
    this.$win.setSimpleFullScreen(false)
    this.$win.close()
    this.$win = null
  }

  /**
   * 设置语言
   */
  public setLang (lang: Partial<Lang>): void {
    this.isReady.then(() => {
      this.logger('setLang', lang)

      this.$view.webContents.send('SCREENSHOTS:setLang', lang)
    })
  }

  /**
   * 初始化窗口
   */
  private createWindow ({ bound }: BoundAndDisplay): void {
    this.$win = new BrowserWindow({
      title: 'screenshots',
      x: bound.x,
      y: bound.y,
      width: bound.width,
      height: bound.height,
      useContentSize: true,
      frame: false,
      show: false,
      autoHideMenuBar: true,
      transparent: true,
      resizable: false,
      movable: false,
      focusable: true,
      fullscreen: true,
      // 设为true 防止mac新开一个桌面，影响效果
      simpleFullscreen: true,
      backgroundColor: '#00000000',
      titleBarStyle: 'hidden',
      alwaysOnTop: true,
      enableLargerThanScreen: true,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: false,
        nativeWindowOpen: false
      }
    })

    this.$win.setTopBrowserView(this.$view)
    this.$view.setBounds(bound)
  }

  private async capture ({ display }: BoundAndDisplay): Promise<void> {
    this.logger('SCREENSHOTS:capture')

    try {
      const { Screenshots: NodeScreenshots } = await import('node-screenshots')
      const capturer = NodeScreenshots.fromDisplay(display.id)
      this.logger('SCREENSHOTS:NodeScreenshots.fromDisplay(%d) %o', display.id, capturer)
      if (!capturer) {
        throw new Error(`NodeScreenshots.fromDisplay(${display.id}) get null`)
      }

      const image = await capturer.capture()
      this.$view.webContents.send('SCREENSHOTS:capture', display, `data:image/png;base64,${image.toString('base64')}`)
    } catch (err) {
      this.logger('SCREENSHOTS:capturer.capture() error %o', err)

      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: display.width,
          height: display.height
        }
      })

      let source
      // Linux系统上，screen.getDisplayNearestPoint 返回的 Display 对象的 id 和 这儿 source 对象上的 display_id(Linux上，这个值是空字符串) 或 id 的中间部分，都不一致
      // 但是，如果只有一个显示器的话，其实不用判断，直接返回就行
      if (sources.length === 1) {
        source = sources[0]
      } else {
        source = sources.find(source => {
          return source.display_id === display.id.toString() || source.id.startsWith(`screen:${display.id}:`)
        })
      }

      if (!source) {
        console.error(sources)
        console.error(display)
        console.error("Can't find screen source")
        return
      }

      this.$view.webContents.send('SCREENSHOTS:capture', display, source.thumbnail.toDataURL())
    }
  }

  /**
   * 绑定ipc时间处理
   */
  private listenIpc (): void {
    /**
     * OK事件
     */
    ipcMain.on('SCREENSHOTS:ok', (e, buffer: Buffer, data: ScreenshotsData) => {
      this.logger('SCREENSHOTS:ok', buffer, data)

      const event = new Event()
      this.emit('ok', event, buffer, data)
      if (event.defaultPrevented) {
        return
      }
      clipboard.writeImage(nativeImage.createFromBuffer(buffer))
      this.endCapture()
    })
    /**
     * CANCEL事件
     */
    ipcMain.on('SCREENSHOTS:cancel', () => {
      this.logger('SCREENSHOTS:cancel')

      const event = new Event()
      this.emit('cancel', event)
      if (event.defaultPrevented) {
        return
      }
      this.endCapture()
    })

    /**
     * SAVE事件
     */
    ipcMain.on('SCREENSHOTS:save', async (e, buffer: Buffer, data: ScreenshotsData) => {
      this.logger('SCREENSHOTS:save', buffer, data)

      const event = new Event()
      this.emit('save', event, buffer, data)
      if (event.defaultPrevented || !this.$win) {
        return
      }

      const time = new Date()
      const year = time.getFullYear()
      const month = padStart(time.getMonth() + 1, 2, '0')
      const date = padStart(time.getDate(), 2, '0')
      const hours = padStart(time.getHours(), 2, '0')
      const minutes = padStart(time.getMinutes(), 2, '0')
      const seconds = padStart(time.getSeconds(), 2, '0')
      const milliseconds = padStart(time.getMilliseconds(), 3, '0')

      this.$win.setAlwaysOnTop(false)

      const { canceled, filePath } = await dialog.showSaveDialog(this.$win, {
        title: '保存图片',
        defaultPath: `${year}${month}${date}${hours}${minutes}${seconds}${milliseconds}.png`
      })

      if (!this.$win) {
        return
      }
      this.$win.setAlwaysOnTop(true)
      if (canceled || !filePath) {
        return
      }

      await fs.writeFile(filePath, buffer)
      this.endCapture()
    })
  }
}
