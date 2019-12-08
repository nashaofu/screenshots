import fs from 'fs'
import path from 'path'
import Events from 'events'
import { ipcMain, BrowserWindow, dialog, Rectangle } from 'electron'
import getDisplay from './getDisplay'

interface Bounds {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface CaptureData {
  dataURL: string
  bounds: Bounds
}

type OkData = CaptureData
type SaveData = CaptureData

export default class ShortcutCapture extends Events {
  // 截图窗口对象
  $win: BrowserWindow | null = null

  constructor () {
    super()
    this.listenIpc()
  }

  /**
   * 开始截图
   */
  public startCapture (): void {
    if (this.$win) this.$win.close()
    const bounds = getDisplay()
    this.$win = this.createWindow(bounds)

    this.$win.once('ready-to-show', () => {
      if (!this.$win) return
      this.$win.show()
      this.$win.focus()
    })

    // 清除simpleFullscreen状态
    this.$win.once('closed', () => {
      if (!this.$win) return
      this.$win.setSimpleFullScreen(false)
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
      title: 'shortcut-capture',
      x,
      y,
      width,
      height,
      type: 'desktop',
      useContentSize: true,
      frame: false,
      show: false,
      autoHideMenuBar: true,
      transparent:
        process.platform === 'darwin' || process.platform === 'win32',
      resizable: false,
      movable: false,
      focusable: process.platform === 'win32',
      fullscreen: true,
      // 设为true mac全屏窗口没有桌面滚动效果
      simpleFullscreen: true,
      backgroundColor: '#30000000',
      titleBarStyle: 'hidden',
      alwaysOnTop:
        process.env.NODE_ENV === 'production' || process.platform === 'darwin',
      enableLargerThanScreen: true,
      skipTaskbar: process.env.NODE_ENV === 'production',
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    })

    $win.loadURL(`file://${path.join(__dirname, './renderer/index.html')}`)
    return $win
  }

  /**
   * 绑定ipc时间处理
   */
  private listenIpc (): void {
    /**
     * OK事件
     */
    ipcMain.on('SHORTCUTCAPTURE::OK', (e, data: OkData) => {
      this.emit('ok', data)
      this.endCapture()
    })
    /**
     * CANCEL事件
     */
    ipcMain.on('SHORTCUTCAPTURE::CANCEL', () => {
      this.emit('CANCEL')
      this.endCapture()
    })

    /**
     * SAVE事件
     */
    ipcMain.on('SHORTCUTCAPTURE::SAVE', (e, data: SaveData) => {
      if (!this.$win) return
      dialog
        .showSaveDialog(this.$win, {
          title: '保存图片'
        })
        .then(({ canceled, filePath }) => {
          if (canceled || !filePath) return
          fs.writeFile(filePath, data.dataURL, { encoding: 'base64' }, (err: NodeJS.ErrnoException | null) => {
            if (err) return
            this.emit('SAVE', data, filePath)
            this.endCapture()
          })
        })
    })
  }
}
