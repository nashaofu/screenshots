import { Rectangle, screen } from 'electron'
import screenshot from 'screenshot-desktop'

export interface Display extends Rectangle {
  id: number
  index?: number
}

// screenId: id, // screenshot.listDisplays() 获取到的id是库作者赋值，通过screen获取到的id是electron屏幕id
export const getAllDisplays = async () => {
  const displays = screen.getAllDisplays()
  const listDisplays = await screenshot.listDisplays()
  return displays.map(({ bounds, id }, index) => {
    return {
      screenId: id,
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
