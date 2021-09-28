import dpr from '../dpr'
import { desktopCapturer } from 'electron'

export default async (display, scaleFactor) => {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: 0,
      height: 0
    }
  })

  const source = sources.find(source => source.display_id === display.id.toString())

  if (!source) {
    throw new Error('没有获取到输入源')
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
        minWidth: display.width,
        maxWidth: display.width * scaleFactor,
        minHeight: display.height,
        maxHeight: display.height * scaleFactor
      }
    }
  })

  return new Promise((resolve, reject) => {
    const $video = document.createElement('video')

    $video.setAttribute('autoplay', true)
    $video.setAttribute('muted', true)
    $video.setAttribute('playsinline', true)

    $video.addEventListener('loadeddata', () => {
      const $canvas = document.createElement('canvas')

      $canvas.width = $video.videoWidth * dpr
      $canvas.height = $video.videoHeight * dpr

      const ctx = $canvas.getContext('2d')

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.drawImage($video, 0, 0, $video.videoWidth, $video.videoHeight)

      stream.getTracks().forEach(item => item.stop())
      resolve($canvas.toDataURL('image/png'))
    })
    $video.srcObject = stream
  })
}
