import { MutableRefObject } from 'react'

export type CanvasContextRef = MutableRefObject<CanvasRenderingContext2D | null>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EmiterListener = (...args: any) => unknown

export type Emiter = Record<string, EmiterListener[]>

export type EmiterRef = MutableRefObject<Emiter>

export interface Point {
  x: number
  y: number
}
export interface HistoryAction<T> {
  action: string
  data: T
  draw: (ctx: CanvasRenderingContext2D, data: T) => void
  isHit?: (ctx: CanvasRenderingContext2D, action: HistoryAction<T>, point: Point) => boolean
}
export interface History {
  index: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stack: HistoryAction<any>[]
}

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export type Position = Point
