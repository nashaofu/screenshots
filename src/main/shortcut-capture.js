import path from 'path'
import Events from 'events'
import { app, ipcMain, clipboard, nativeImage, BrowserWindow } from 'electron'

export default class ShortcutCapture extends Events {
  // 截图窗口对象
  $win = null
  // 插件目录
  dirname = undefined

  /**
   * dirname 本插件所在目录位置
   * isUseClipboard是否把内容写入到剪切板
   * @param {*} params
   */
  constructor ({ dirname = path.join(app.getAppPath(), 'node_modules/shortcut-capture'), isUseClipboard = true } = {}) {
    super()
    if (!app.isReady()) throw new Error("Cannot be executed before app's ready event")
    this.dirname = dirname
    this.onShortcutCapture(isUseClipboard)
    this.onShow()
    this.onHide()
  }

  /**
   * 初始化窗口
   */
  initWin () {
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
      menu: false,
      autoHideMenuBar: true,
      transparent: process.platform === 'darwin' || process.platform === 'win32',
      resizable: false,
      movable: false,
      focusable: false,
      fullscreen: true,
      // 设为true mac全屏窗口没有桌面滚动效果
      simpleFullscreen: true,
      backgroundColor: '#30000000',
      titleBarStyle: 'hidden',
      alwaysOnTop: process.env.NODE_ENV === 'production' || process.platform === 'darwin',
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

    const URL =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : `file://${path.join(this.dirname, './dist/renderer/index.html')}`

    $win.loadURL(URL)
    return $win
  }

  /**
   * 调用截图
   */
  shortcutCapture () {
    if (this.$win) this.$win.close()
    this.$win = this.initWin()
  }

  /**
   * 绑定截图确定后的时间回调
   * @param {*} isUseClipboard
   */
  onShortcutCapture (isUseClipboard) {
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
  onShow () {
    ipcMain.on('ShortcutCapture::SHOW', (e, bounds) => {
      if (!this.$win) return
      this.$win.show()
      this.$win.setBounds(bounds)
      this.$win.focus()
      this.$win.on('show', () => {
        this.$win.setBounds(bounds)
        this.$win.focus()
      })
    })
  }

  /**
   * 绑定窗口隐藏事件
   */
  onHide () {
    ipcMain.on('ShortcutCapture::HIDE', (e, bounds) => {
      if (!this.$win) return
      this.$win.hide()
      this.$win.setSimpleFullScreen(false)
      this.$win.close()
      this.$win = null
    })
  }
}
