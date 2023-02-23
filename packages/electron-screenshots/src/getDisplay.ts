import { Rectangle, screen } from 'electron'

export interface Display extends Rectangle {
  id: number
  scaleFactor: number
}

export default (): Display => {
  const point = screen.getCursorScreenPoint()
  const { id, bounds, scaleFactor } = screen.getDisplayNearestPoint(point)

  // https://github.com/nashaofu/screenshots/issues/98
  return {
    id,
    x: Math.floor(bounds.x),
    y: Math.floor(bounds.y),
    width: Math.floor(bounds.width),
    height: Math.floor(bounds.height),
    scaleFactor
  }
}
