import debug from 'electron-debug'
import { app, globalShortcut } from 'electron'
import Screenshots from './screenshots'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

app.on('ready', () => {
  installExtension(VUEJS_DEVTOOLS).catch(err => {
    console.log('Unable to install `vue-devtools`: \n', err)
  })
  const screenshots = new Screenshots()
  globalShortcut.register('ctrl+shift+a', () => screenshots.startCapture())
  screenshots.on('ok', ({ bounds }) => console.log('capture', bounds))
  screenshots.on('cancel', () => console.log('capture', 'cancel'))
  screenshots.on('save', ({ bounds }) => console.log('capture', bounds))
  debug({ showDevTools: true, devToolsMode: 'undocked' })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
