import { remote } from 'electron'

export default () => {
  const point = remote.screen.getCursorScreenPoint()
  const primaryDisplay = remote.screen.getPrimaryDisplay()
  const { id, bounds, workArea, scaleFactor } = remote.screen.getDisplayNearestPoint(point)
  // win32 darwin linux平台分别处理
  const scale = process.platform === 'darwin' ? 1 : scaleFactor / primaryDisplay.scaleFactor
  const display = process.platform === 'linux' ? workArea : bounds
  return {
    id,
    scaleFactor,
    x: display.x * (scale >= 1 ? scale : 1),
    y: display.y * (scale >= 1 ? scale : 1),
    width: display.width * scale,
    height: display.height * scale
  }
}
