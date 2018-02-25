import { screen } from 'electron'

export default () => {
  const displays = screen.getAllDisplays()
  const primaryDisplay = screen.getPrimaryDisplay()
  return displays.map(({ id, bounds, scaleFactor }) => {
    const scale = scaleFactor / primaryDisplay.scaleFactor
    return {
      id,
      width: bounds.width * scale,
      height: bounds.height * scale,
      x: bounds.x,
      y: bounds.y,
      scaleFactor
    }
  })
}
