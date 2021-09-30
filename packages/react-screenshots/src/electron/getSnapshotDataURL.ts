import { desktopCapturer } from 'electron'
import { Display } from './useUrl'

export default async (display: Display, scaleFactor: number): Promise<string | undefined> => {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.width,
      height: display.height
    }
  })

  let source
  // Linux系统上，screen.getDisplayNearestPoint 返回的 Display 对象的 id 和 这儿 source 对象上的 display_id(Linux上，这个值是空字符串) 或 id 的中间部分，都不一致
  // 但是，如果只有一个显示器的话，其实不用判断，直接返回就行
  if (sources.length === 1) {
    source = sources[0]
  } else {
    source = sources.find(source => {
      return source.display_id === display.id.toString() || source.id.startsWith(`screen:${display.id}:`)
    })
  }

  if (!source) {
    console.error(sources)
    console.error(display)
    throw new Error('没有获取到截图数据')
  }

  return source?.thumbnail.toDataURL({
    scaleFactor
  })
}
