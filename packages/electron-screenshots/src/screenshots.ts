import debug, { Debugger } from 'debug'
import { BrowserView, BrowserWindow, clipboard, desktopCapturer, dialog, ipcMain, nativeImage } from 'electron'
import Events from 'events'
import fs from 'fs-extra'
import Event from './event'
import getDisplay, { Display } from './getDisplay'
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
  singleWindow?: boolean
}

export { Bounds }

export default class Screenshots extends Events {
  // 截图窗口对象
  public $win: BrowserWindow | null = null

  public $view: BrowserView = new BrowserView({
    webPreferences: {
      preload: require.resolve('./preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  private logger: Logger

  private singleWindow: boolean

  private isReady = new Promise<void>(resolve => {
    ipcMain.once('SCREENSHOTS:ready', () => {
      this.logger('SCREENSHOTS:ready')

      resolve()
    })
  })

  constructor (opts?: ScreenshotsOpts) {
    super()
    this.logger = opts?.logger || debug('electron-screenshots')
    this.singleWindow = opts?.singleWindow || false
    this.listenIpc()
    this.$view.webContents.loadURL(`file://${require.resolve('react-screenshots/electron/electron.html')}`)
    if (opts?.lang) {
      this.setLang(opts.lang)
    }
  }

  /**
   * 开始截图
   */
  public async startCapture (): Promise<void> {
    this.logger('startCapture')

    const display = getDisplay()

    const [imageUrl] = await Promise.all([this.capture(display), this.isReady])

    await this.createWindow(display)

    this.$view.webContents.send('SCREENSHOTS:capture', display, imageUrl)
  }

  /**
   * 结束截图
   */
  public async endCapture (): Promise<void> {
    this.logger('endCapture')
    await this.reset()

    if (!this.$win) {
      return
    }

    // 先清除 Kiosk 模式，然后取消全屏才有效
    this.$win.setKiosk(false)
    this.$win.setSimpleFullScreen(false)
    this.$win.blur()
    this.$win.blurWebView()
    this.$win.unmaximize()
    this.$win.removeBrowserView(this.$view)

    if (this.singleWindow) {
      this.$win.hide()
    } else {
      this.$win.destroy()
    }
  }

  /**
   * 设置语言
   */
  public async setLang (lang: Partial<Lang>): Promise<void> {
    this.logger('setLang', lang)

    await this.isReady

    this.$view.webContents.send('SCREENSHOTS:setLang', lang)
  }

  private async reset () {
    // 重置截图区域
    this.$view.webContents.send('SCREENSHOTS:reset')

    // 保证 UI 有足够的时间渲染
    await Promise.race([
      new Promise<void>(resolve => setTimeout(() => resolve(), 500)),
      new Promise<void>(resolve => ipcMain.once('SCREENSHOTS:reset', () => resolve()))
    ])
  }

  /**
   * 初始化窗口
   */
  private async createWindow (display: Display): Promise<void> {
    // 重置截图区域
    await this.reset()

    // 复用未销毁的窗口
    if (!this.$win || this.$win?.isDestroyed?.()) {
      this.$win = new BrowserWindow({
        title: 'screenshots',
        x: display.x,
        y: display.y,
        width: display.width,
        height: display.height,
        useContentSize: true,
        frame: false,
        show: false,
        autoHideMenuBar: true,
        transparent: true,
        // mac resizable 设置为 false 会导致页面崩溃
        resizable: process.platform !== 'darwin',
        movable: false,
        // focusable: true, 否则窗口不能及时响应esc按键，输入框也不能输入
        focusable: true,
        /**
         * linux 下必须设置为false，否则不能全屏显示在最上层
         * mac 下设置为false，否则可能会导致程序坞不恢复问题
         * https://github.com/nashaofu/screenshots/issues/148
         */
        // fullscreen: process.platform === 'darwin',
        // 设为true 防止mac新开一个桌面，影响效果
        simpleFullscreen: process.platform === 'darwin',
        backgroundColor: '#00000000',
        titleBarStyle: 'hidden',
        alwaysOnTop: true,
        enableLargerThanScreen: true,
        skipTaskbar: true,
        hasShadow: false,
        paintWhenInitiallyHidden: false,
        acceptFirstMouse: true
      })

      this.$win.on('show', () => {
        this.$win?.focus()
        /**
         * 在窗口显示时设置，防止与 fullscreen、x、y、width、height 等冲突, 导致显示效果不符合预期
         * mac 下不设置 kiosk 模式，https://github.com/nashaofu/screenshots/issues/148
         */
        this.$win?.setKiosk(process.platform !== 'darwin')
      })

      this.$win.on('closed', () => {
        this.$win = null
      })
    }

    this.$win.setBrowserView(this.$view)

    // 适定平台
    if (process.platform === 'darwin') {
      this.$win.setWindowButtonVisibility(false)
    }

    if (process.platform !== 'win32') {
      this.$win.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true,
        skipTransformProcessType: true
      })
    }

    this.$win.blur()
    this.$win.setKiosk(false)

    if (process.platform === 'darwin') {
      this.$win.setSimpleFullScreen(true)
    }

    this.$win.setBounds(display)
    this.$view.setBounds({
      x: 0,
      y: 0,
      width: display.width,
      height: display.height
    })
    this.$win.setAlwaysOnTop(true)
    this.$win.show()
  }

  private async capture (display: Display): Promise<string> {
    this.logger('SCREENSHOTS:capture')

    try {
      const { Screenshots: NodeScreenshots } = await import('node-screenshots')
      const capturer = NodeScreenshots.fromPoint(display.x + display.width / 2, display.y + display.height / 2)
      this.logger('SCREENSHOTS:capture NodeScreenshots.fromPoint arguments %o', display)
      this.logger(
        'SCREENSHOTS:capture NodeScreenshots.fromPoint return %o',
        capturer
          ? {
              id: capturer.id,
              x: capturer.x,
              y: capturer.y,
              width: capturer.width,
              height: capturer.height,
              rotation: capturer.rotation,
              scaleFactor: capturer.scaleFactor,
              isPrimary: capturer.isPrimary
            }
          : null
      )

      if (!capturer) {
        throw new Error(`NodeScreenshots.fromDisplay(${display.id}) get null`)
      }

      const image = await capturer.capture()
      return `data:image/png;base64,${image.toString('base64')}`
    } catch (err) {
      this.logger('SCREENSHOTS:capture NodeScreenshots capture() error %o', err)

      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: display.width * display.scaleFactor,
          height: display.height * display.scaleFactor
        }
      })

      let source
      // Linux系统上，screen.getDisplayNearestPoint 返回的 Display 对象的 id
      // 和这里 source 对象上的 display_id(Linux上，这个值是空字符串) 或 id 的中间部分，都不一致
      // 但是，如果只有一个显示器的话，其实不用判断，直接返回就行
      if (sources.length === 1) {
        source = sources[0]
      } else {
        source = sources.find(source => {
          return source.display_id === display.id.toString() || source.id.startsWith(`screen:${display.id}:`)
        })
      }

      if (!source) {
        this.logger("SCREENSHOTS:capture Can't find screen source. sources: %o, display: %o", sources, display)
        throw new Error("Can't find screen source")
      }

      return source.thumbnail.toDataURL()
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
      this.logger('SCREENSHOTS:ok buffer.length %d, data: %o', buffer.length, data)

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
      this.logger('SCREENSHOTS:save buffer.length %d, data: %o', buffer.length, data)

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
