import { desktopCapturer } from 'electron'

export default (displays, bounds) => {
  let dx = bounds.x
  let dy = bounds.y
  displays.forEach(display => {
    if (dx > display.x) {
      dx = display.x
    }
    if (dy > display.y) {
      dy = display.y
    }
  })
  /**
   * 每一个屏幕截一张图是为了让每一张图片都尽可能的清晰
   * 图片经过缩放之后质量损失非常大
   */
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
          x: display.x - dx,
          y: display.y - dy,
          width: display.width,
          height: display.height,
          thumbnail: sources[index].thumbnail
        })
      })
    })
  }))
}
