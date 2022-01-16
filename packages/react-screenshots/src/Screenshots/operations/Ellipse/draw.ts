import { EllipseData, EllipseEditData } from '.'
import { HistoryItemSource } from '../../types'
import { drawDragCircle } from '../utils'

export default function draw (ctx: CanvasRenderingContext2D, action: HistoryItemSource<EllipseData, EllipseEditData>) {
  let { size, color, x1, y1, x2, y2 } = action.data
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'miter'
  ctx.lineWidth = size
  ctx.strokeStyle = color

  if (x1 > x2) {
    [x1, x2] = [x2, x1]
  }
  if (y1 > y2) {
    [y1, y2] = [y2, y1]
  }

  const distance = action.editHistory.reduce(
    (distance, { data }) => ({
      x: distance.x + data.x2 - data.x1,
      y: distance.y + data.y2 - data.y1
    }),
    { x: 0, y: 0 }
  )

  const x = (x1 + x2) / 2 + distance.x
  const y = (y1 + y2) / 2 + distance.y
  const rx = (x2 - x1) / 2
  const ry = (y2 - y1) / 2
  const k = 0.5522848
  // 水平控制点偏移量
  const ox = rx * k
  // 垂直控制点偏移量
  const oy = ry * k
  // 从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
  ctx.beginPath()
  ctx.moveTo(x - rx, y)
  ctx.bezierCurveTo(x - rx, y - oy, x - ox, y - ry, x, y - ry)
  ctx.bezierCurveTo(x + ox, y - ry, x + rx, y - oy, x + rx, y)
  ctx.bezierCurveTo(x + rx, y + oy, x + ox, y + ry, x, y + ry)
  ctx.bezierCurveTo(x - ox, y + ry, x - rx, y + oy, x - rx, y)
  ctx.closePath()
  ctx.stroke()

  if (action.isSelected) {
    ctx.lineWidth = 1
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#ffffff'

    ctx.beginPath()
    ctx.rect(x - rx, y - ry, rx * 2, ry * 2)
    ctx.stroke()

    drawDragCircle(ctx, x, y - ry)
    drawDragCircle(ctx, x + rx, y - ry)
    drawDragCircle(ctx, x + rx, y)
    drawDragCircle(ctx, x + rx, y + ry)
    drawDragCircle(ctx, x, y + ry)
    drawDragCircle(ctx, x - rx, y + ry)
    drawDragCircle(ctx, x - rx, y)
    drawDragCircle(ctx, x - rx, y - ry)
  }
}
