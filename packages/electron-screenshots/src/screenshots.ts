// @typescript-eslint/no-explicit-any

import debug, { Debugger } from 'debug'
import {
  app,
  BrowserView,
  BrowserWindow,
  clipboard,
  dialog,
  screen,
  ipcMain,
  nativeImage
} from 'electron'
import Events from 'events'
import fs from 'fs-extra'
import path from 'path'
import screenshot from 'screenshot-desktop'
import Event from './event'
import getDisplay, { Display, getAllDisplays } from './getDisplay'
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
  // @deprecated 没用到
  singleWindow?: boolean
}

export { Bounds }

export class Screenshots extends Events {
  // 截图窗口对象
  public $wins: BrowserWindow[] = []

  public displays: Display[] = []

  public $views: BrowserView[] = []

  private logger: Logger

  private singleWindow: boolean

  private screenshotPath: string

  private isReady = new Promise<void>((resolve) => {
    ipcMain.once('SCREENSHOTS:ready', () => {
      this.logger('SCREENSHOTS:ready')

      resolve()
    })
  })

  constructor (opts?: ScreenshotsOpts) {
    super()
    this.logger = opts?.logger || debug('electron-screenshots')
    this.singleWindow = opts?.singleWindow || false
    this.screenshotPath = path.join(app.getPath('userData'), '/AkeyTemp')
    fs.ensureDirSync(this.screenshotPath)
    this.listenIpc()
    this.refreshViews()
    if (opts?.lang) {
      this.setLang(opts.lang)
    }
  }

  // 根据屏幕数量预加载BrowserView
  // 初始化displays和$views
  private async refreshViews () {
    this.displays = await getAllDisplays()
    this.$views = this.displays.map((display) => {
      const browserView = new BrowserView({
        webPreferences: {
          preload: require.resolve('./preload.js'),
          nodeIntegration: false,
          contextIsolation: true
        }
      })
      browserView.webContents.loadURL(
        `file://${require.resolve(
          'akey-react-screenshots/electron/electron.html'
        )}?id=${display.id}`
      )
      return browserView
    })
    this.logger('screenshots refreshViews', this.displays)
  }

  private async resetWindows () {
    if (!this.$wins.length) {
      return
    }

    this.$wins.forEach((win) => {
      this.logger('resetWindows', win)
      // 先清除 Kiosk 模式，然后取消全屏才有效
      // win?.setKiosk?.(false)
      win?.destroy?.()
    })
    this.$wins = []
  }

  // 根据当前显示器数量分别初始化对应窗口
  async createWindowForDisplays (options: { isMacFullscreenHide? : boolean} = {}) {
    const { isMacFullscreenHide } = options
    let activeDisplayId = -1 // 如果不是mac且全屏隐藏窗口截图，那么这个值就用不到
    if (isMacFullscreenHide) {
      const activeDisplay = getDisplay()
      activeDisplayId = activeDisplay.id
    }

    return Promise.all(this.displays.map(async (display, i) => {
      const imageUrl = await this.capture(display)

      try {
        await this.createWindow(display, i)
      } catch (error: any) {
        console.log('createWindow error', i, error.message)
        this.logger(error)
      }
      this.logger('screenshots:start2', i, display, imageUrl)

      const enableBlackMask = isMacFullscreenHide && activeDisplayId === display.id // mac系统, 全屏截图且用户选择隐藏当前窗口

      this.$views[i].webContents.send('SCREENSHOTS:capture', display, imageUrl, {
        enableBlackMask
      })
    }))
  }

  /**
   * 开始截图
   */
  public async startCapture (options?: { isMacFullscreenHide : boolean}): Promise<void> {
    console.time('startCapture')

    this.logger('screenshots:startCapture')

    if (this.displays.length === 0) {
      return
    }

    await this.createWindowForDisplays(options)

    console.timeEnd('startCapture')
  }

  /**
   * 结束截图
   */
  public async endCapture (): Promise<void> {
    this.logger('endCapture')
    await this.reset()

    if (!this.$wins.length) {
      return
    }

    this.$wins.forEach((win, index) => {
      this.logger('endCapture:for', win)
      // 先清除 Kiosk 模式，然后取消全屏才有效
      // win?.setKiosk?.(false)
      win.blur()
      win.blurWebView()
      win.unmaximize()
      win.removeBrowserView(this.$views[index])

      // if (this.singleWindow) {
      //   win.hide()
      // } else {
      //   win?.destroy?.()
      // }
      win?.destroy?.()
    })

    this.$wins = []

    this.emit('endCapture')

    if (process.platform === 'darwin') {
      app.dock.show()
    }

    fs.emptyDir(this.screenshotPath)
  }

  /**
   * 设置语言
   */
  public async setLang (lang: Partial<Lang>): Promise<void> {
    this.logger('setLang', lang)

    await this.isReady

    // this.$views.webContents.send('SCREENSHOTS:setLang', lang)
    this.$views.forEach((win) =>
      win.webContents.send('SCREENSHOTS:setLang', lang)
    )
  }

  public async setDisabled (): Promise<void> {
    this.logger('setDisabled')

    this.$views.forEach((win) =>
      win.webContents.send('SCREENSHOTS:setDisabled')
    )
  }

  private async reset () {
    this.logger('reset')
    // 重置截图区域
    this.$views.forEach((win) => win.webContents.send('SCREENSHOTS:reset'))

    this.logger('reset1')
    // 保证 UI 有足够的时间渲染
    await Promise.race([
      new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
      new Promise<void>((resolve) =>
        ipcMain.once('SCREENSHOTS:reset', () => resolve())
      )
    ])
  }

  /**
   * 初始化窗口
   */
  private async createWindow (display: Display, index: number): Promise<BrowserWindow> {
    this.logger('createWindow', display)
    // 重置截图区域
    // await this.reset()

    // let win = this.$wins[index]

    // windows系统某些情况下复用未销毁的窗口
    // if (!win || win?.isDestroyed?.()) {
    const win = new BrowserWindow({
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
      // resizable: process.platform !== 'darwin',
      resizable: false,
      movable: false,
      // focusable 必须设置为 true, 否则窗口不能及时响应esc按键，输入框也不能输入
      focusable: true,
      skipTaskbar: true,
      alwaysOnTop: true,
      minimizable: false,
      // 窗口不可以最大化
      maximizable: false,
      /**
         * linux 下必须设置为false，否则不能全屏显示在最上层
         * mac 下设置为false，否则可能会导致程序坞不恢复问题，且与 kiosk 模式冲突
         */
      fullscreen: false,
      // mac fullscreenable 设置为 true 会导致应用崩溃
      fullscreenable: false,
      // kiosk: true,
      backgroundColor: '#00000000',
      titleBarStyle: 'hidden',
      enableLargerThanScreen: true,
      hasShadow: false,
      paintWhenInitiallyHidden: false,
      acceptFirstMouse: true
    })
    console.log('createWindow new')
    // } else {
    //   this.logger('createWindow use cache', win)
    //   console.log('createWindow use cache')
    // }

    win.on('show', () => {
      win?.focus()
    })

    win.on('closed', () => {
      this.emit('windowClosed', win)
      // const index = this.$wins.indexOf(win)
      // if (index > -1) {
      //   this.$wins?.splice?.(index, 1)
      // }
      // win = null
    })
    // }

    win.setBrowserView(this.$views[index])

    win.webContents.once('crashed', (e) => {
      this.logger(e)
    })

    win.webContents.once('render-process-gone', async (event, { reason }) => {
      const msg = `The renderer process has crashed unexpected or is killed (${reason}).`
      this.logger(msg)

      // if (reason == 'crashed') {
      // }
    })

    // 适定平台
    if (process.platform === 'darwin') {
      win.setWindowButtonVisibility(false)
    }

    if (process.platform !== 'win32') {
      win.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true,
        skipTransformProcessType: true
      })
    }

    win.setAlwaysOnTop(true, 'screen-saver')

    win.blur()
    // win.setKiosk(false)

    win.setBounds(display)
    this.$views[index].setBounds({
      x: 0,
      y: 0,
      width: display.width,
      height: display.height
    })

    win.show()

    this.$wins[index] = win

    return win
  }

  private async capture (display: Display): Promise<string> {
    const filename = path.join(this.screenshotPath, `/shot-${Date.now()}.png`)
    this.logger('SCREENSHOTS:capture', display, filename)

    const imgPath = await screenshot({
      screen: display.screenshotDesktopId,
      filename
    })

    return `file://${imgPath}`
  }

  /**
   * 绑定ipc时间处理
   */
  private listenIpc (): void {
    /**
     * OK事件
     */
    ipcMain.on('SCREENSHOTS:ok', (e, buffer: Buffer, data: ScreenshotsData) => {
      this.logger('SCREENSHOTS:ok', data)

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
     * DISABLED事件
     */
    ipcMain.on('SCREENSHOTS:disabled', () => {
      this.logger('SCREENSHOTS:disabled')

      this.setDisabled()
    })

    /**
     * SAVE事件
     */
    ipcMain.on(
      'SCREENSHOTS:save',
      async (e, buffer: Buffer, data: ScreenshotsData) => {
        this.logger('SCREENSHOTS:save', data)

        const event = new Event()
        this.emit('save', event, buffer, data)
        if (event.defaultPrevented || !this.$wins.length) {
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
        const index = data?.display?.index || 0

        const win = this.$wins[index]

        // win.setAlwaysOnTop(false)

        const { canceled, filePath } = await dialog.showSaveDialog(win, {
          defaultPath: `${year}${month}${date}${hours}${minutes}${seconds}${milliseconds}.png`
        })

        if (!win) {
          return
        }
        // win.setAlwaysOnTop(true)
        if (canceled || !filePath) {
          return
        }

        await fs.writeFile(filePath, buffer)
        this.endCapture()
      }
    )

    screen.on('display-metrics-changed', () => {
      this.logger('display-metrics-changed')
      // this.endCapture()
    })

    screen.on('display-added', async () => {
      // 屏幕变化期间不允许截图
      this.emit('screenchangestart')
      try {
        this.logger('display-added')
        this.endCapture()
        await this.refreshViews()
        await this.resetWindows()
      } catch (e: any) {
        this.logger(`display-added-error ${e.message}`)
      }

      this.emit('screenchangeend')
    })

    screen.on('display-removed', async () => {
      // 屏幕变化期间不允许截图
      this.emit('screenchangestart')
      try {
        this.logger('display-removed')
        this.endCapture()
        await this.refreshViews()
        await this.resetWindows()
      } catch (e: any) {
        this.logger(`display-removed-error ${e.message}`)
      }
      this.emit('screenchangeend')
    })
  }
}
