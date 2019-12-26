import {
  dialog,
  ipcMain,
  Rectangle,
  clipboard,
  nativeImage,
  BrowserWindow
} from 'electron'
import fs from 'fs'
import Event from './event'
import Events from 'events'
import padStart0 from './padStart0'
import getDisplay from './getDisplay'

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

  constructor () {
    super()
    this.listenIpc()
  }

  /**
   * 开始截图
   */
  public startCapture (): void {
    if (this.$win) this.$win.close()
    const display = getDisplay()
    this.$win = this.createWindow(display)
    ipcMain.once('SCREENSHOTS::DOM-READY', () => {
      if (!this.$win) return
      this.$win.webContents.send('SCREENSHOTS::SEND-DISPLAY-DATA', display)
    })

    // 捕捉桌面之后显示窗口
    // 避免截图窗口自己被截图
    ipcMain.once('SCREENSHOTS::CAPTURED', () => {
      if (!this.$win) return
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
  private createWindow ({ x, y, width, height }: Rectangle): BrowserWindow {
    const $win = new BrowserWindow({
      title: 'screenshots',
      x,
      y,
      width,
      height,
      type: 'desktop',
      useContentSize: true,
      frame: false,
      show: false,
      autoHideMenuBar: true,
      transparent: true,
      resizable: false,
      movable: false,
      focusable: true,
      fullscreen: true,
      // 设为true mac全屏窗口没有桌面滚动效果
      simpleFullscreen: true,
      backgroundColor: '#30000000',
      titleBarStyle: 'hidden',
      alwaysOnTop: true,
      enableLargerThanScreen: true,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    })

    $win.loadURL(
      `file://${require.resolve('react-screenshots/dist/index.html')}`
    )
    return $win
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
              Buffer.from(
                data.dataURL.replace(/^data:image\/\w+;base64,/, ''),
                'base64'
              ),
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
