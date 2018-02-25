import debug from 'electron-debug'
import { app } from 'electron'
import ShortcutCapture from './shortcut-capture'

debug({ showDevTools: true })

app.on('ready', () => {
  let installExtension = require('electron-devtools-installer')
  installExtension.default(installExtension.VUEJS_DEVTOOLS)
    .then(() => { })
    .catch(err => {
      console.log('Unable to install `vue-devtools`: \n', err)
    })
  const sc = new ShortcutCapture({ hotkey: 'ctrl+alt+a' })
  console.log(sc)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
