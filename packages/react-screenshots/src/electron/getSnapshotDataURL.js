import { desktopCapturer } from 'electron'

export default async display => {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.width,
      height: display.height
    }
  })

  const source = sources.find(source => {
    return source.display_id === display.id.toString() || source.id.startsWith(`screen:${display.id}:`)
  })

  if (!source) {
    console.error(sources)
    console.error(display)
    throw new Error('没有获取到截图数据')
  }

  return source.thumbnail.toDataURL()
}
