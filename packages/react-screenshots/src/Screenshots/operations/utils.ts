import { HistoryItemSource, Point } from '../types'

export function drawDragCircle (ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.lineWidth = 1
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#ffffff'

  ctx.beginPath()
  ctx.arc(x, y, 4, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
}

export function isHit <S, E> (ctx: CanvasRenderingContext2D, action: HistoryItemSource<S, E>, point: Point) {
  action.draw(ctx, action)
  const { data } = ctx.getImageData(point.x, point.y, 1, 1)
  return data.some(val => val !== 0)
}
