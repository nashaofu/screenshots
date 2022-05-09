import debug from 'electron-debug'
import { app, globalShortcut } from 'electron'
import Screenshots from './screenshots'

app.whenReady().then(() => {
  const screenshots = new Screenshots({
    lang: {
      operation_rectangle_title: '矩形2323'
    },
    logger: (...args: unknown[]) => console.log(args)
  })
  globalShortcut.register('ctrl+shift+a', () => {
    screenshots.startCapture()
    screenshots.$view.webContents.openDevTools()
  })
  // 点击确定按钮回调事件
  screenshots.on('ok', (e, buffer, bounds) => {
    console.log('capture', buffer, bounds)
  })
  // 点击取消按钮回调事件
  screenshots.on('cancel', () => {
    console.log('capture', 'cancel1')
    screenshots.setLang({
      operation_ellipse_title: 'ellipse',
      operation_rectangle_title: 'rectangle'
    })
  })
  screenshots.on('cancel', e => {
    // 执行了preventDefault
    // 点击取消不会关闭截图窗口
    e.preventDefault()
    console.log('capture', 'cancel2')
  })
  // 点击保存按钮回调事件
  screenshots.on('save', (e, buffer, bounds) => {
    console.log('capture', buffer, bounds)
  })
  debug({ showDevTools: true, devToolsMode: 'undocked' })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
