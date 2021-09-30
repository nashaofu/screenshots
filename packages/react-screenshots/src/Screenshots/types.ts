import { MutableRefObject } from 'react'

export type CanvasContextRef = MutableRefObject<CanvasRenderingContext2D | null>

export type EmiterListener = (...args: unknown[]) => unknown

export type Emiter = Record<string, EmiterListener[]>

export type EmiterRef = MutableRefObject<Emiter>

export interface HistoryAction<T> {
  data: T
  draw: (ctx: CanvasRenderingContext2D, data: T) => void
}
export interface History {
  index: number
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
