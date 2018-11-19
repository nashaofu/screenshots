import debug from 'electron-debug'
import { app, globalShortcut } from 'electron'
import ShortcutCapture from './shortcut-capture'
console.log(require('electron'))
debug({ showDevTools: 'undocked' })

app.on('ready', () => {
  let installExtension = require('electron-devtools-installer')
  installExtension.default(installExtension.VUEJS_DEVTOOLS)
    .then(() => { })
    .catch(err => {
      console.log('Unable to install `vue-devtools`: \n', err)
    })
  const sc = new ShortcutCapture()
  globalShortcut.register('ctrl+shift+a', () => sc.shortcutCapture())
  console.log(sc)
  sc.on('capture', (a, e) => console.log('eeee', e))
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
