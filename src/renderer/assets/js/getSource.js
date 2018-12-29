import { desktopCapturer, screen } from 'electron'

export default display => {
  return new Promise((resolve, reject) => {
    desktopCapturer.getSources(
      {
        types: ['screen'],
        thumbnailSize: {
          width: display.width,
          height: display.width
        }
      },
      (error, sources) => {
        if (error) return reject(error)
        const index = screen.getAllDisplays().findIndex(({ id }) => id === display.id)
        if (index === -1) return reject(new Error(`Not find display ${display.id} source`))
        resolve({
          x: 0,
          y: 0,
          width: display.width,
          height: display.height,
          thumbnail: sources[index].thumbnail
        })
      }
    )
  })
}
