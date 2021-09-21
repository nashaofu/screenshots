import { screen, Rectangle } from 'electron'

export interface Display extends Rectangle {
  id: number
}

export interface BoundAndDisplay {
  bound: Rectangle
  display: Display
  scaleFactor: number
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
      x: display.x,
      y: display.y,
      width: display.width,
      height: display.height
    },
    scaleFactor
  }
}
