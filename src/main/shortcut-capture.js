import { app, ipcMain, clipboard, nativeImage, BrowserWindow } from 'electron'
import path from 'path'
import Events from 'events'

export default class ShortcutCapture extends Events {
  $win = null
  dirname = undefined
  constructor ({ dirname = path.join(app.getAppPath(), 'node_modules/shortcut-capture'), isUseClipboard = true } = {}) {
    super()
    if (!app.isReady()) throw new Error("Cannot be executed before app's ready event")
    this.dirname = dirname
    this.onShortcutCapture(isUseClipboard)
    this.onShow()
    this.onHide()
  }

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
      transparent: process.platform === 'darwin' || process.platform === 'win32',
      resizable: false,
      alwaysOnTop: process.env.NODE_ENV === 'production' || process.platform === 'darwin',
      enableLargerThanScreen: true,
      skipTaskbar: process.env.NODE_ENV === 'production',
      closable: process.env.NODE_ENV !== 'production',
      minimizable: false,
      maximizable: false
    })

    const URL =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : `file://${path.join(this.dirname, './dist/renderer/index.html')}`

    $win.loadURL(URL)
    return $win
  }

  shortcutCapture () {
    this.$win = this.initWin()
  }

  onShortcutCapture (isUseClipboard) {
    ipcMain.on('ShortcutCapture::CAPTURE', (e, dataURL, bound) => {
      if (isUseClipboard) {
        clipboard.writeImage(nativeImage.createFromDataURL(dataURL))
      }
      this.emit('capture', { dataURL, bound })
    })
  }

  onShow () {
    ipcMain.on('ShortcutCapture::SHOW', (e, bounds) => {
      if (!this.$win) return
      this.$win.show()
      this.$win.setBounds(bounds)
      this.$win.focus()
    })
  }

  onHide () {
    ipcMain.on('ShortcutCapture::HIDE', (e, bounds) => {
      if (!this.$win) return
      this.$win.close()
      this.$win = null
    })
  }
}
