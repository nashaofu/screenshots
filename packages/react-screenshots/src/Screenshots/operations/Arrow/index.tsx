import React, { ReactElement, useCallback, useRef, useState } from 'react'
import ScreenshotsButton from '../../ScreenshotsButton'
import ScreenshotsSizeColor from '../../ScreenshotsSizeColor'
import useCanvasMousedown from '../../hooks/useCanvasMousedown'
import useCanvasMousemove from '../../hooks/useCanvasMousemove'
import useCanvasMouseup from '../../hooks/useCanvasMouseup'
import { HistoryAction } from '../../types'
import useCursor from '../../hooks/useCursor'
import useOperation from '../../hooks/useOperation'
import useHistory from '../../hooks/useHistory'
import useCanvasContextRef from '../../hooks/useCanvasContextRef'

export interface ArrowData {
  size: number
  color: string
  x1: number
  x2: number
  y1: number
  y2: number
}

function draw (ctx: CanvasRenderingContext2D, { size, color, x1, x2, y1, y2 }: ArrowData) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'bevel'
  ctx.lineWidth = size
  ctx.strokeStyle = color
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
}

export default function Arrow (): ReactElement {
  const [, cursorDispatcher] = useCursor()
  const [operation, operationDispatcher] = useOperation()
  const [history, historyDispatcher] = useHistory()
  const canvasContextRef = useCanvasContextRef()
  const [size, setSize] = useState(3)
  const [color, setColor] = useState('#ee5126')
  const arrowRef = useRef<HistoryAction<ArrowData> | null>(null)

  const checked = operation === 'Arrow'

  const onClick = useCallback(() => {
    operationDispatcher.set('Arrow')
    cursorDispatcher.set('default')
  }, [operationDispatcher, cursorDispatcher])

  const onMousedown = useCallback(
    (e: MouseEvent) => {
      if (!checked || arrowRef.current || !canvasContextRef.current) {
        return
      }

      const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()
      arrowRef.current = {
        data: {
          size,
          color,
          x1: e.clientX - left,
          y1: e.clientY - top,
          x2: e.clientX - left,
          y2: e.clientY - top
        },
        draw
      }
      historyDispatcher.push(arrowRef.current)
    },
    [checked, color, size, canvasContextRef, historyDispatcher]
  )

  const onMousemove = useCallback(
    (e: MouseEvent) => {
      if (!checked || !arrowRef.current || !canvasContextRef.current) {
        return
      }

      const { left, top, width, height } = canvasContextRef.current.canvas.getBoundingClientRect()
      let x = e.clientX - left
      let y = e.clientY - top
      if (x < 0) {
        x = 0
      }
      if (x > width) {
        x = width
      }
      if (y < 0) {
        y = 0
      }
      if (y > height) {
        y = height
      }

      arrowRef.current.data.x2 = x
      arrowRef.current.data.y2 = y
      historyDispatcher.set(history)
    },
    [checked, history, canvasContextRef, historyDispatcher]
  )

  const onMouseup = useCallback(() => {
    if (!checked) {
      return
    }

    if (arrowRef.current) {
      arrowRef.current = null
    }
  }, [checked])

  useCanvasMousedown(onMousedown)
  useCanvasMousemove(onMousemove)
  useCanvasMouseup(onMouseup)

  return (
    <ScreenshotsButton
      title='箭头'
      icon='icon-arrow'
      checked={checked}
      onClick={onClick}
      option={<ScreenshotsSizeColor size={size} color={color} onSizeChange={setSize} onColorChange={setColor} />}
    />
  )
}
