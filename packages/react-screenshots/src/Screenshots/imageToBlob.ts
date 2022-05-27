export interface TargetSize {
  width: number
  height: number
}

// 加载完成的图片转换为 blob
export default function imageToBlob (image: HTMLImageElement, { width, height }: TargetSize): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!image.complete) {
      return reject(new Error('image is not fully loaded'))
    }

    const $canvas = document.createElement('canvas')
    const targetWidth = width * window.devicePixelRatio
    const targetHeight = height * window.devicePixelRatio
    $canvas.width = targetWidth
    $canvas.height = targetHeight

    const ctx = $canvas.getContext('2d')
    if (!ctx) {
      return reject(new Error('convert image to blob fail'))
    }

    ctx.imageSmoothingEnabled = true
    // 设置太高，图片会模糊
    ctx.imageSmoothingQuality = 'low'

    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, targetWidth, targetHeight)
    $canvas.toBlob(blob => {
      if (!blob) {
        return reject(new Error('canvas toBlob fail'))
      }
      resolve(blob)
    }, 'image/png')
  })
}
