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
  const { id, bounds, workArea } = screen.getDisplayNearestPoint(point)

  // https://github.com/nashaofu/screenshots/issues/98
  Object.keys(bounds).forEach(key => {
    bounds[key] = Math.floor(bounds[key])
  })

  Object.keys(workArea).forEach(key => {
    workArea[key] = Math.floor(workArea[key])
  })

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
    }
  }
}
