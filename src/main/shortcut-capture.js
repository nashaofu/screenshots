import {
  app,
  ipcMain,
  clipboard,
  nativeImage,
  BrowserWindow,
  globalShortcut
} from 'electron'

export default class ShortcutCapture {
  constructor ({ hotkey } = {}) {
    if (!app.isReady()) {
      throw new Error('Cannot be executed before app\'s ready event')
    }
    this.$win = this.initWin()
    this.hotkey = this.registerHotkey(hotkey) ? hotkey : null
    this.onShortcutCapture()
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
      : `file://${__dirname}/renderer/index.html`

    $win.loadURL(URL)
    return $win
  }

  /**
   * 注册快捷键
   * @param {String} hotkey
   * @return {Boolean} 返回注册结果
   */
  registerHotkey (hotkey) {
    if (typeof hotkey !== 'string') {
      return false
    }
    if (globalShortcut.isRegistered(hotkey)) {
      return false
    }

    // 解除原有的快捷键
    if (this.hotkey) {
      globalShortcut.unregister(hotkey)
    }
    // 注册全局快捷键
    globalShortcut.register(hotkey, () => this.shortcutCapture())
    this.hotkey = hotkey
    return true
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
