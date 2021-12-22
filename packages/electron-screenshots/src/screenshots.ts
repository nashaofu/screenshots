import { dialog, ipcMain, clipboard, nativeImage, BrowserWindow, BrowserView } from 'electron'
import fs from 'fs'
import Event from './event'
import Events from 'events'
import padStart0 from './padStart0'
import getBoundAndDisplay from './getBoundAndDisplay'

interface Bounds {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface CaptureData {
  dataURL: string // 图片资源base64
  bounds: Bounds // 截图区域坐标信息
}

type OkData = CaptureData
type SaveData = CaptureData

export default class Screenshots extends Events {
  // 截图窗口对象
  public $win: BrowserWindow | null = null

  public $view: BrowserView = new BrowserView({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  private isReady = new Promise<true>(resolve => {
    ipcMain.once('SCREENSHOTS.ready', () => {
      resolve(true)
    })
  })

  constructor () {
    super()
    this.listenIpc()
    this.$view.webContents.loadURL(`file://${require.resolve('react-screenshots/dist/electron/index.html')}`)
  }

  /**
   * 开始截图
   */
  public async startCapture (): void {
    if (this.$win && !this.$win.isDestroyed()) {
      this.$win.close()
    }
    await this.isReady
    this.createWindow()

    // 捕捉桌面之后显示窗口
    // 避免截图窗口自己被截图
    ipcMain.once('SCREENSHOTS::CAPTURED', () => {
      if (!this.$win) return
      // linux截图存在黑屏，这里设置为false就不会出现这个问题
      this.$win.setFullScreen(true)
      this.$win.show()
      this.$win.focus()
    })
  }

  /**
   * 结束截图
   */
  public endCapture (): void {
    if (!this.$win) return
    this.$win.setSimpleFullScreen(false)
    this.$win.close()
    this.$win = null
  }

  /**
   * 初始化窗口
   */
  private createWindow (): BrowserWindow {
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
      alwaysOnTop: true,
      enableLargerThanScreen: true,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        nativeWindowOpen: false
      }
    })

    this.$win.setBrowserView(this.$view)
    this.$view.setBounds(bound)
    this.$view.webContents.send('SCREENSHOTS.sendDisplayData', display)
  }

  /**
   * 绑定ipc时间处理
   */
  private listenIpc (): void {
    /**
     * OK事件
     */
    ipcMain.on('SCREENSHOTS::OK', (e, data: OkData) => {
      const event = new Event()
      this.emit('ok', event, data)
      if (!event.defaultPrevented) {
        clipboard.writeImage(nativeImage.createFromDataURL(data.dataURL))
        this.endCapture()
      }
    })
    /**
     * CANCEL事件
     */
    ipcMain.on('SCREENSHOTS::CANCEL', () => {
      const event = new Event()
      this.emit('cancel', event)
      if (!event.defaultPrevented) {
        this.endCapture()
      }
    })

    /**
     * SAVE事件
     */
    ipcMain.on('SCREENSHOTS::SAVE', (e, data: SaveData) => {
      const event = new Event()
      this.emit('save', event, data)
      if (!event.defaultPrevented) {
        if (!this.$win) return
        const time = new Date()
        const year = time.getFullYear()
        const month = padStart0(time.getMonth() + 1)
        const date = padStart0(time.getDate())
        const hours = padStart0(time.getHours())
        const minutes = padStart0(time.getMinutes())
        const seconds = padStart0(time.getSeconds())
        const milliseconds = padStart0(time.getMilliseconds(), 3)

        this.$win.setAlwaysOnTop(false)
        dialog
          .showSaveDialog(this.$win, {
            title: '保存图片',
            defaultPath: `${year}${month}${date}${hours}${minutes}${seconds}${milliseconds}.png`
          })
          .then(({ canceled, filePath }) => {
            if (!this.$win) return
            this.$win.setAlwaysOnTop(true)
            if (canceled || !filePath) return
            fs.writeFile(
              filePath,
              Buffer.from(data.dataURL.replace(/^data:image\/\w+;base64,/, ''), 'base64'),
              (err: NodeJS.ErrnoException | null) => {
                if (err) return
                this.endCapture()
              }
            )
          })
      }
    })
  }
}
