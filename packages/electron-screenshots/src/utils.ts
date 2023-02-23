import { desktopCapturer, screen } from 'electron'
// var fs = require("fs");
// 定义屏幕大小
const getSize = () => {
  const { size, scaleFactor } = screen.getPrimaryDisplay()
  return {
    width: size.width * scaleFactor,
    height: size.height * scaleFactor
  }
}

export const screenCapture = async () => {
  return new Promise((resolve, reject) => {
    try {
      const sizeInfo = getSize()
      desktopCapturer.getSources({
        types: ['screen'], // 设定需要捕获的是"屏幕"，还是"窗口" 'window','screen'
        thumbnailSize: sizeInfo
      }).then(async sources => {
        console.log(sources)
        const imageData = sources[0].thumbnail.toDataURL('image/png')
        resolve(imageData)
        // fs.writeFile('test.js', imageData,() => {
        //     console.log('done')
        // })
      })
    } catch (error) {
      reject(error)
    }
  })
}
