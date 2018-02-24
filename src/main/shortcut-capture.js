import {
  ipcMain,
  clipboard,
  nativeImage,
  BrowserWindow,
  globalShortcut
} from 'electron'

export default class ShortcutCapture {
  constructor ({
    winTitle = 'shortcut capture',
    hotkey
  } = {}) {
    this.$win = this.initWin(winTitle)
    this.hotkey = this.registerHotkey(hotkey) ? hotkey : null
    this.onShortcutCapture()
  }

  initWin (winTitle) {
    const $win = new BrowserWindow({
      title: winTitle,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      useContentSize: true,
      frame: false,
      show: false,
      menu: false,
      transparent: true,
      resizable: false,
      alwaysOnTop: process.env.NODE_ENV === 'production',
      skipTaskbar: true,
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
    this.$win.webContents.send('shortcut-capture')
  }

  onShortcutCapture () {
    ipcMain.on('shortcut-capture', (e, dataURL) => {
      clipboard.writeImage(nativeImage.createFromDataURL(dataURL))
    })
  }
}
