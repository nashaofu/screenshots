import { Display } from './electron/app'
import { Bounds } from './Screenshots/types'

type ScreenshotsListener = (...args: never[]) => void

interface GlobalScreenshots {
  ready: () => void
  capture: (display: Display) => Promise<string>
  captured: () => void
  save: (arrayBuffer: ArrayBuffer, bounds: Bounds) => void
  cancel: () => void
  ok: (arrayBuffer: ArrayBuffer, bounds: Bounds) => void
  on: (channel: string, fn: ScreenshotsListener) => void
  off: (channel: string, fn: ScreenshotsListener) => void
}

declare global {
  interface Window {
    screenshots: GlobalScreenshots
  }
}
