import { screen, Rectangle } from 'electron'

export interface Display extends Rectangle {
  id: number
}

export interface BoundAndDisplay {
  bound: Rectangle
  display: Display
}

export default (): BoundAndDisplay => {
  const point = screen.getCursorScreenPoint()
  const { id, bounds, workArea, scaleFactor } = screen.getDisplayNearestPoint(point)

  // win32 darwin linux平台分别处理
  const display = process.platform === 'linux' ? workArea : bounds

  return {
    bound: {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    },
    display: {
      id,
      x: display.x * (scaleFactor >= 1 ? scaleFactor : 1),
      y: display.y * (scaleFactor >= 1 ? scaleFactor : 1),
      width: display.width * scaleFactor,
      height: display.height * scaleFactor
    }
  }
}
