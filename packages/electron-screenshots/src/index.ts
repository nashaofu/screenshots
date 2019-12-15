import debug from 'electron-debug'
import { app, globalShortcut } from 'electron'
import Screenshots from './screenshots'

app.on('ready', () => {
  const screenshots = new Screenshots()
  globalShortcut.register('ctrl+shift+a', () => screenshots.startCapture())
  screenshots.on('ok', (e, { viewer }) => {
    console.log('capture', viewer)
  })
  screenshots.on('cancel', () => {
    console.log('capture', 'cancel1')
  })
  screenshots.on('cancel', e => {
    e.preventDefault()
    console.log('capture', 'cancel2')
  })
  screenshots.on('save', (e, { viewer }) => {
    console.log('capture', viewer)
  })
  debug({ showDevTools: true, devToolsMode: 'undocked' })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
