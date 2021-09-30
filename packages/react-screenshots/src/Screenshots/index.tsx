import React, { ReactElement, useCallback, useRef, useState } from 'react'
import ScreenshotsContext from './ScreenshotsContext'
import ScreenshotsBackground from './ScreenshotsBackground'
import ScreenshotsCanvas from './ScreenshotsCanvas'
import ScreenshotsOperations from './ScreenshotsOperations'
import './screenshots.less'
import './icons/iconfont.less'
import { Bounds, Emiter, History } from './types'
import useGetLoadedImage from './useGetLoadedImage'

export interface ScreenshotsProps {
  url?: string
  width: number
  height: number
  className?: string
  [key: string]: unknown
}

export default function Screenshots ({ url, width, height, className, ...props }: ScreenshotsProps): ReactElement {
  const image = useGetLoadedImage(url)
  const emiterRef = useRef<Emiter>({})
  const canvasContextRef = useRef<CanvasRenderingContext2D>(null)
  const [history, setHistory] = useState<History>({
    index: -1,
    stack: []
  })
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [cursor, setCursor] = useState<string | undefined>('move')
  const [operation, setOperation] = useState<string | undefined>(undefined)

  const store = {
    url,
    width,
    height,
    image,
    emiterRef,
    canvasContextRef,
    history,
    bounds,
    cursor,
    operation
  }

  const call = useCallback(
    <T extends unknown[]>(funcName: string, ...args: T) => {
      const func = props[funcName]
      if (typeof func === 'function') {
        func(...args)
      }
    },
    [props]
  )

  const dispatcher = {
    call,
    setHistory,
    setBounds,
    setCursor,
    setOperation
  }

  const classNames = ['screenshots']

  if (className) {
    classNames.push(className)
  }

  return (
    <ScreenshotsContext.Provider value={{ store, dispatcher }}>
      <div className={classNames.join(' ')} style={{ width, height }}>
        <ScreenshotsBackground />
        <ScreenshotsCanvas ref={canvasContextRef} />
        <ScreenshotsOperations />
      </div>
    </ScreenshotsContext.Provider>
  )
}
