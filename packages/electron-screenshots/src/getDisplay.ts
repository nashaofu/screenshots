import { Rectangle, screen } from 'electron'

export interface Display extends Rectangle {
  id: number
}

export default (): Display => {
  const point = screen.getCursorScreenPoint()
  const { id, bounds } = screen.getDisplayNearestPoint(point)

  return {
    id,
    x: Math.floor(bounds.x),
    y: Math.floor(bounds.y),
    width: Math.floor(bounds.width),
    height: Math.floor(bounds.height)
  }
}
