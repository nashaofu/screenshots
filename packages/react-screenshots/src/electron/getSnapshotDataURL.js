import { desktopCapturer } from 'electron'

export default async display => {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.width,
      height: display.height
    }
  })

  const source = sources.find(source => source.display_id === display.id.toString())

  return source.thumbnail.toDataURL()
}
