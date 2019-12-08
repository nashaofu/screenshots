import path from 'path'
import Events from 'events'
import {
  ipcMain,
  clipboard,
  nativeImage,
  BrowserWindow,
  IpcMainEvent
} from 'electron'

export default class ShortcutCapture extends Events {
  // 截图窗口对象
  $win: BrowserWindow|null = null

  /**
   * isUseClipboard是否把内容写入到剪切板
   * @param {*} params
   */
  constructor ({ isUseClipboard = true } = {}) {
    super()
    this.onShortcutCapture(isUseClipboard)
    this.onShow()
    this.onHide()
  }

  /**
   * 初始化窗口
   */
  initWin (): BrowserWindow {
    const $win = new BrowserWindow({
      title: 'shortcut-capture',
      width: 0,
      height: 0,
      x: 0,
      y: 0,
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

    // 清除simpleFullscreen状态
    $win.on('close', () => $win.setSimpleFullScreen(false))
    $win.loadURL(`file://${path.join(__dirname, './renderer/index.html')}`)
    return $win
  }

  /**
   * 调用截图
   */
  shortcutCapture (): void {
    if (this.$win) this.$win.close()
    this.$win = this.initWin()
  }

  /**
   * 绑定截图确定后的时间回调
   * @param {*} isUseClipboard
   */
  onShortcutCapture (isUseClipboard: boolean): void {
    ipcMain.on('ShortcutCapture::CAPTURE', (e, dataURL, bounds) => {
      if (isUseClipboard) {
        clipboard.writeImage(nativeImage.createFromDataURL(dataURL))
      }
      this.emit('capture', { dataURL, bounds })
    })
  }

  /**
   * 绑定窗口显示事件
   */
  onShow (): void {
    ipcMain.on('ShortcutCapture::SHOW', (e, bounds) => {
      if (!this.$win) return
      this.$win.show()
      this.$win.setBounds(bounds)
      this.$win.focus()
      this.$win.on('show', () => {
        if (this.$win) {
          this.$win.setBounds(bounds)
          this.$win.focus()
        }
      })
    })
  }

  /**
   * 绑定窗口隐藏事件
   */
  onHide (): void {
    ipcMain.on('ShortcutCapture::HIDE', (e: IpcMainEvent, bounds) => {
      if (!this.$win) return
      this.$win.hide()
      this.$win.setSimpleFullScreen(false)
      this.$win.close()
      this.$win = null
    })
  }
}
