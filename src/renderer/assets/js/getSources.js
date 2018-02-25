import { desktopCapturer } from 'electron'

export default displays => {
  return Promise.all(displays.map(async (display, index) => {
    return await new Promise((resolve, reject) => {
      desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: display.width,
          height: display.width
        }
      }, (error, sources) => {
        if (error) {
          return reject(error)
        }
        resolve({
          x: display.x,
          y: display.y,
          width: display.width,
          height: display.height,
          thumbnail: sources[index].thumbnail
        })
      })
    })
  }))
}
