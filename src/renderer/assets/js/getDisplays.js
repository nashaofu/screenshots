import { screen } from 'electron'

export default () => {
  const displays = screen.getAllDisplays()
  const primaryDisplay = screen.getPrimaryDisplay()

  // win32 darwin linux平台分别处理
  return displays.map(({ id, bounds, workArea, scaleFactor }) => {
    const scale = scaleFactor / primaryDisplay.scaleFactor
    const display = process.platform === 'linux' ? workArea : bounds
    const width = display.width * scale
    const height = display.height * scale
    const x1 = display.x
    const y1 = display.y
    return {
      id,
      width,
      height,
      x1,
      y1,
      x2: x1 + width,
      y2: y1 + height,
      scaleFactor
    }
  })
}
