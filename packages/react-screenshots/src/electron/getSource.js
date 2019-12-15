import { desktopCapturer, remote } from 'electron'

export default async () => {
  const $win = remote.getCurrentWindow()
  const bounds = $win.getBounds()
  const allDisplay = remote.screen.getAllDisplays()
  const display = remote.screen.getDisplayMatching(bounds)
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.size.width,
      height: display.size.height
    }
  })

  const source = sources.find(
    source => source.display_id === display.id.toString()
  )
  if (source) {
    return source
  } else {
    const index = allDisplay.findIndex(({ id }) => id === display.id)
    if (index !== -1) {
      return sources[index]
    }
  }
}
