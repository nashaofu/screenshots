import debug from 'electron-debug'
import { app, globalShortcut } from 'electron'
import ShortcutCapture from './shortcut-capture'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

app.on('ready', () => {
  installExtension(VUEJS_DEVTOOLS).catch(err => {
    console.log('Unable to install `vue-devtools`: \n', err)
  })
  const sc = new ShortcutCapture()
  globalShortcut.register('ctrl+shift+a', () => sc.startCapture())
  sc.on('ok', ({ bounds }) => console.log('capture', bounds))
  sc.on('cancel', () => console.log('capture', 'cancel'))
  sc.on('save', ({ bounds }) => console.log('capture', bounds))
  debug({ showDevTools: true, devToolsMode: 'undocked' })
})

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })
