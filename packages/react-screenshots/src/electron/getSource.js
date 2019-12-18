import { desktopCapturer, remote } from 'electron'

export default async display => {
  const allDisplay = remote.screen.getAllDisplays()
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.width,
      height: display.height
    }
  })

  let source = sources.find(source => source.display_id === display.id.toString())
  if (!source) {
    const index = allDisplay.findIndex(({ id }) => id === display.id)
    if (index !== -1) {
      source = sources[index]
    }
  }
  return source
}
