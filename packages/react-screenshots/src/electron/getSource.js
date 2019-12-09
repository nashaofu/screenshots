import { desktopCapturer, remote } from 'electron'

export default async () => {
  const $win = remote.getCurrentWindow()
  const bounds = $win.getBounds()
  const display = remote.screen.getDisplayMatching(bounds)
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.size.width,
      height: display.size.height
    }
  })
  return sources.find(source => source.display_id === display.id.toString())
}
