import { dialog, ipcMain, clipboard, nativeImage, BrowserWindow, BrowserView } from 'electron'
import fs from 'fs/promises'
import Event from './event'
import Events from 'events'
import padStart from './padStart'
import getBoundAndDisplay from './getBoundAndDisplay'
import logger from './logger'

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export interface ScreenshotsOpts {
  lang: Record<string, string>
}
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

  private isReady = new Promise<void>(resolve => {
    ipcMain.once('SCREENSHOTS:ready', () => {
      logger('SCREENSHOTS:ready')

      resolve()
    })
  })

  constructor (opts?: ScreenshotsOpts) {
    super()
    this.listenIpc()
    this.$view.webContents.loadURL(`file://${require.resolve('react-screenshots/electron/electron.html')}`)
    if (opts?.lang) {
      this.isReady.then(() => {
        this.setLang(opts.lang)
      })
    }
  }

  /**
   * 开始截图
   */
  public startCapture (): void {
    logger('startCapture')

    this.isReady.then(() => {
      if (this.$win && !this.$win.isDestroyed()) {
        this.$win.close()
      }
      this.createWindow()

      // 捕捉桌面之后显示窗口
      // 避免截图窗口自己被截图
      ipcMain.once('SCREENSHOTS:captured', () => {
        logger('SCREENSHOTS:captured')

        if (!this.$win) return
        // linux截图存在黑屏，这里设置为false就不会出现这个问题
        this.$win.setFullScreen(true)
        this.$win.show()
        this.$win.focus()
      })
    })
  }

  /**
   * 结束截图
   */
  public endCapture (): void {
    logger('endCapture')

    if (!this.$win) return
    this.$win.setSimpleFullScreen(false)
    this.$win.close()
    this.$win = null
  }

  /**
   * 设置语言
   */
  public setLang (lang: Record<string, string>): void {
    logger('setLang', lang)

    this.$view.webContents.send('SCREENSHOTS:setLang', lang)
  }

  /**
   * 初始化窗口
   */
  private createWindow (): void {
    const { bound, display } = getBoundAndDisplay()
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
      // 为true，截屏显示为黑屏
      // 所以在截屏图像生成后再设置为true
      // 参考48-49行
      fullscreen: false,
      // 设为true mac全屏窗口没有桌面滚动效果
      simpleFullscreen: true,
      backgroundColor: '#00000000',
      titleBarStyle: 'hidden',
      // alwaysOnTop: true,
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

    this.$win.setBrowserView(this.$view)
    this.$view.setBounds(bound)

    logger('SCREENSHOTS:capture')

    this.$view.webContents.send('SCREENSHOTS:capture', display)
  }

  /**
   * 绑定ipc时间处理
   */
  private listenIpc (): void {
    /**
     * OK事件
     */
    ipcMain.on('SCREENSHOTS:ok', (e, buffer: Buffer, bounds: Bounds) => {
      logger('SCREENSHOTS:ok', buffer, bounds)

      const event = new Event()
      this.emit('ok', event, buffer, bounds)
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
      logger('SCREENSHOTS:cancel')

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
    ipcMain.on('SCREENSHOTS:save', async (e, buffer: Buffer, bounds: Bounds) => {
      logger('SCREENSHOTS:save', buffer, bounds)

      const event = new Event()
      this.emit('save', event, buffer, bounds)
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
