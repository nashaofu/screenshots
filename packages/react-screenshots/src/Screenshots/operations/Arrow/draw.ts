import { ArrowData, ArrowEditData } from '.'
import { HistoryItemSource } from '../../types'
import { drawDragCircle } from '../utils'

export default function draw (ctx: CanvasRenderingContext2D, action: HistoryItemSource<ArrowData, ArrowEditData>) {
  let { size, color, x1, x2, y1, y2 } = action.data
  ctx.lineCap = 'round'
  ctx.lineJoin = 'bevel'
  ctx.lineWidth = size
  ctx.strokeStyle = color

  const distance = action.editHistory.reduce(
    (distance, { data }) => ({
      x: distance.x + data.x2 - data.x1,
      y: distance.y + data.y2 - data.y1
    }),
    { x: 0, y: 0 }
  )

  x1 += distance.x
  x2 += distance.x
  y1 += distance.y
  y2 += distance.y

  const dx = x2 - x1
  const dy = y2 - y1
  // 箭头头部长度
  const length = size * 3
  const angle = Math.atan2(dy, dx)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.lineTo(x2 - length * Math.cos(angle - Math.PI / 6), y2 - length * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - length * Math.cos(angle + Math.PI / 6), y2 - length * Math.sin(angle + Math.PI / 6))
  ctx.stroke()

  if (action.isSelected) {
    drawDragCircle(ctx, x1, y1)
    drawDragCircle(ctx, x2, y2)
  }
}
