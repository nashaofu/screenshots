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
  // mac图片太大，导致截图窗口卡顿，并且截图窗口显示延迟很严重
  const scale = process.platform === 'darwin' ? 1 : scaleFactor

  return {
    bound: {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    },
    display: {
      id,
      x: display.x * scale,
      y: display.y * scale,
      width: display.width * scale,
      height: display.height * scale
    }
  }
}
