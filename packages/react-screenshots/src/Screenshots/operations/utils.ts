import { HistoryAction, Point } from '../types'

export function isHit <T> (ctx: CanvasRenderingContext2D, action: HistoryAction<T>, point: Point) {
  action.draw(ctx, action.data)
  const { data } = ctx.getImageData(point.x, point.y, 1, 1)
  return data.some(val => val !== 0)
}
