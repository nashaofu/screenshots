import { Rectangle, screen } from 'electron'
import screenshot from 'screenshot-desktop'

export interface Display extends Rectangle {
  id: number
  index?: number
}

export const getAllDisplays = async () => {
  const displays = screen.getAllDisplays()
  const listDisplays = await screenshot.listDisplays()
  return displays.map(({ bounds }, index) => {
    return {
      id: listDisplays[index].id,
      index,
      x: Math.floor(bounds.x),
      y: Math.floor(bounds.y),
      width: Math.floor(bounds.width),
      height: Math.floor(bounds.height)
    }
  })
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
