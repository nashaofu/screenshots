import {
  app,
  ipcMain,
  clipboard,
  nativeImage,
  BrowserWindow
} from 'electron'
import path from 'path'

export default class ShortcutCapture {
  constructor ({
    dirname = path.join(app.getAppPath(), 'node_modules/shortcut-capture')
  } = {}) {
    if (!app.isReady()) {
      throw new Error('Cannot be executed before app\'s ready event')
    }
    this.$win = this.initWin(dirname)
    this.onShortcutCapture()
    this.onShow()
    this.onHide()
  }

  initWin (dirname) {
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
      transparent: true,
      resizable: false,
      alwaysOnTop: process.env.NODE_ENV === 'production',
      enableLargerThanScreen: true,
      skipTaskbar: process.env.NODE_ENV === 'production',
      closable: true,
      minimizable: false,
      maximizable: false
    })

    $win.on('close', e => {
      e.preventDefault()
      $win.hide()
    })

    const URL = process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080'
      : `file://${path.join(dirname, './dist/renderer/index.html')}`

    $win.loadURL(URL)
    return $win
  }

  shortcutCapture () {
    this.$win.webContents.send('ShortcutCapture::CAPTURE')
  }

  onShortcutCapture () {
    ipcMain.on('ShortcutCapture::CAPTURE', (e, dataURL) => {
      clipboard.writeImage(nativeImage.createFromDataURL(dataURL))
    })
  }

  onShow () {
    ipcMain.on('ShortcutCapture::SHOW', (e, bounds) => {
      this.$win.show()
      this.$win.setBounds(bounds)
      this.$win.focus()
    })
  }

  onHide () {
    ipcMain.on('ShortcutCapture::HIDE', (e, bounds) => {
      this.$win.setBounds(bounds)
      // 保证页面上原有的内容被清除掉
      setTimeout(() => {
        this.$win.hide()
      }, 200)
    })
  }
}
