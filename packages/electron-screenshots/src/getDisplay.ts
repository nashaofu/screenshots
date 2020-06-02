import { screen, Rectangle } from 'electron'

export interface Display extends Rectangle {
  id: number
}

export default (): Display => {
  const point = screen.getCursorScreenPoint()
  const { id, bounds, workArea, scaleFactor } = screen.getDisplayNearestPoint(
    point
  )

  if (process.platform === 'darwin') {
    return {
      id,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    }
  }

  // win32 darwin linux平台分别处理
  const display = process.platform === 'linux' ? workArea : bounds
  return {
    id,
    x: display.x * (scaleFactor >= 1 ? scaleFactor : 1),
    y: display.y * (scaleFactor >= 1 ? scaleFactor : 1),
    width: display.width * scaleFactor,
    height: display.height * scaleFactor
  }
}
