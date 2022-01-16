import { RectangleData, RectangleEditData } from '.'
import { HistoryItemSource } from '../../types'
import { drawDragCircle } from '../utils'

export default function draw (
  ctx: CanvasRenderingContext2D,
  action: HistoryItemSource<RectangleData, RectangleEditData>
) {
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

  const x = x1 + distance.x
  const y = y1 + distance.y
  const width = x2 - x1
  const height = y2 - y1

  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.stroke()

  if (action.isSelected) {
    ctx.lineWidth = 1
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#ffffff'

    drawDragCircle(ctx, x, y)
    drawDragCircle(ctx, x + width / 2, y)
    drawDragCircle(ctx, x + width, y)
    drawDragCircle(ctx, x + width, y + height / 2)
    drawDragCircle(ctx, x + width, y + height)
    drawDragCircle(ctx, x + width / 2, y + height)
    drawDragCircle(ctx, x, y + height)
    drawDragCircle(ctx, x, y + height / 2)
  }
}
