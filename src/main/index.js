import { app, BrowserWindow } from 'electron'
let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:8080`
  : `file://${__dirname}/index.html`

function createWindow () {
  console.log(2312212)
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
