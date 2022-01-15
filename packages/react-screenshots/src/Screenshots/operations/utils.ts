import { HistoryItemSource, Point } from '../types'

export function isHit <S, E> (ctx: CanvasRenderingContext2D, action: HistoryItemSource<S, E>, point: Point) {
  action.draw(ctx, action)
  const { data } = ctx.getImageData(point.x, point.y, 1, 1)
  return data.some(val => val !== 0)
}
