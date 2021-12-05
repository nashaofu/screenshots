import React, { ReactElement, useCallback, useRef, useState } from 'react'
import useCanvasContextRef from '../hooks/useCanvasContextRef'
import useCanvasMousedown from '../hooks/useCanvasMousedown'
import useCanvasMousemove from '../hooks/useCanvasMousemove'
import useCanvasMouseup from '../hooks/useCanvasMouseup'
import useCursor from '../hooks/useCursor'
import useHistory from '../hooks/useHistory'
import useOperation from '../hooks/useOperation'
import ScreenshotsButton from '../ScreenshotsButton'
import ScreenshotsSizeColor from '../ScreenshotsSizeColor'
import { HistoryAction } from '../types'

export interface Rectangle {
  size: number
  color: string
  x1: number
  y1: number
  x2: number
  y2: number
}

function draw (ctx: CanvasRenderingContext2D, { size, color, x1, y1, x2, y2 }: Rectangle) {
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

  ctx.beginPath()
  ctx.rect(x1, y1, x2 - x1, y2 - y1)
  ctx.stroke()
}

export default function RectangleButton (): ReactElement {
  const [history, historyDispatcher] = useHistory()
  const [operation, operationDispatcher] = useOperation()
  const [, cursorDispatcher] = useCursor()
  const canvasContextRef = useCanvasContextRef()
  const [size, setSize] = useState(3)
  const [color, setColor] = useState('#ee5126')
  const rectangleRef = useRef<HistoryAction<Rectangle> | null>(null)

  const checked = operation === 'RectangleButton'

  const onClick = useCallback(() => {
    operationDispatcher.set('RectangleButton')
    cursorDispatcher.set('crosshair')
  }, [operationDispatcher, cursorDispatcher])

  const onMousedown = useCallback(
    (e: MouseEvent) => {
      if (!checked || !canvasContextRef.current || rectangleRef.current) {
        return
      }

      const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()
      const x = e.clientX - left
      const y = e.clientY - top
      rectangleRef.current = {
        data: {
          size,
          color,
          x1: x,
          y1: y,
          x2: x,
          y2: y
        },
        draw
      }
      historyDispatcher.push(rectangleRef.current)
    },
    [checked, size, color, canvasContextRef, historyDispatcher]
  )

  const onMousemove = useCallback(
    (e: MouseEvent) => {
      if (!checked || !canvasContextRef.current || !rectangleRef.current) {
        return
      }
      const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()
      const rectangleData = rectangleRef.current.data
      rectangleData.x2 = e.clientX - left
      rectangleData.y2 = e.clientY - top

      historyDispatcher.set(history)
    },
    [checked, canvasContextRef, history, historyDispatcher]
  )

  const onMouseup = useCallback(() => {
    if (!checked) {
      return
    }

    if (rectangleRef.current) {
      rectangleRef.current = null
    }
  }, [checked])

  useCanvasMousedown(onMousedown)
  useCanvasMousemove(onMousemove)
  useCanvasMouseup(onMouseup)

  return (
    <ScreenshotsButton
      title='矩形'
      icon='icon-rectangle'
      checked={checked}
      onClick={onClick}
      option={<ScreenshotsSizeColor size={size} color={color} onSizeChange={setSize} onColorChange={setColor} />}
    />
  )
}
