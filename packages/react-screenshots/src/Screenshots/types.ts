import { MutableRefObject } from 'react'

export type CanvasContextRef = MutableRefObject<CanvasRenderingContext2D | null>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EmiterListener = (...args: any) => unknown

export type Emiter = Record<string, EmiterListener[]>

export type EmiterRef = MutableRefObject<Emiter>

export interface HistoryAction<T> {
  data: T
  draw: (ctx: CanvasRenderingContext2D, data: T) => void
}
export interface History {
  index: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stack: HistoryAction<any>[]
}

export interface Point {
  x: number
  y: number
}

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export type Position = Point
