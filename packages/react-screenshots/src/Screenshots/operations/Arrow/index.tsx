import React, { ReactElement, useCallback, useRef, useState } from 'react'
import ScreenshotsButton from '../../ScreenshotsButton'
import ScreenshotsSizeColor from '../../ScreenshotsSizeColor'
import useCanvasMousedown from '../../hooks/useCanvasMousedown'
import useCanvasMousemove from '../../hooks/useCanvasMousemove'
import useCanvasMouseup from '../../hooks/useCanvasMouseup'
import { HistoryItemEdit, HistoryItemSource, HistoryItemType } from '../../types'
import useCursor from '../../hooks/useCursor'
import useOperation from '../../hooks/useOperation'
import useHistory from '../../hooks/useHistory'
import useCanvasContextRef from '../../hooks/useCanvasContextRef'
import { isHit } from '../utils'
import useDrawSelect from '../../hooks/useDrawSelect'

export interface ArrowData {
  size: number
  color: string
  x1: number
  x2: number
  y1: number
  y2: number
}

export interface ArrowEditData {
  x1: number
  x2: number
  y1: number
  y2: number
}

function draw (ctx: CanvasRenderingContext2D, action: HistoryItemSource<ArrowData, ArrowEditData>) {
  let { size, color, x1, x2, y1, y2 } = action.data
  ctx.lineCap = 'round'
  ctx.lineJoin = 'bevel'
  ctx.lineWidth = size
  ctx.strokeStyle = color

  const { x, y } = action.editHistory.reduce(
    (distance, { data }) => ({
      x: distance.x + data.x2 - data.x1,
      y: distance.y + data.y2 - data.y1
    }),
    { x: 0, y: 0 }
  )

  x1 += x
  x2 += x
  y1 += y
  y2 += y

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
  const arrowRef = useRef<HistoryItemSource<ArrowData, ArrowEditData> | null>(null)
  const arrowEditRef = useRef<HistoryItemEdit<ArrowEditData, ArrowData> | null>(null)

  const checked = operation === 'Arrow'

  const selectArrow = useCallback(() => {
    operationDispatcher.set('Arrow')
    cursorDispatcher.set('default')
  }, [operationDispatcher, cursorDispatcher])

  const onDrawSelect = useCallback(
    (action: HistoryItemSource<unknown, unknown>, e: MouseEvent) => {
      if (action.name !== 'Arrow') {
        return
      }

      selectArrow()

      arrowEditRef.current = {
        type: HistoryItemType.EDIT,
        data: {
          x1: e.clientX,
          y1: e.clientY,
          x2: e.clientX,
          y2: e.clientY
        },
        source: action as HistoryItemSource<ArrowData, ArrowEditData>
      }

      historyDispatcher.select(action)
    },
    [selectArrow, historyDispatcher]
  )

  const onMousedown = useCallback(
    (e: MouseEvent) => {
      if (!checked || arrowRef.current || !canvasContextRef.current) {
        return
      }

      const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()
      arrowRef.current = {
        name: 'Arrow',
        type: HistoryItemType.SOURCE,
        data: {
          size,
          color,
          x1: e.clientX - left,
          y1: e.clientY - top,
          x2: e.clientX - left,
          y2: e.clientY - top
        },
        isSelected: false,
        editHistory: [],
        draw,
        isHit
      }
    },
    [checked, color, size, canvasContextRef]
  )

  const onMousemove = useCallback(
    (e: MouseEvent) => {
      if (!checked || !canvasContextRef.current) {
        return
      }
      if (arrowEditRef.current && arrowEditRef.current.source.isSelected) {
        arrowEditRef.current.data.x2 = e.clientX
        arrowEditRef.current.data.y2 = e.clientY
        if (history.top !== arrowEditRef.current) {
          arrowEditRef.current.source.editHistory.push(arrowEditRef.current)
          historyDispatcher.push(arrowEditRef.current)
        } else {
          historyDispatcher.set(history)
        }
      } else if (arrowRef.current) {
        const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()

        arrowRef.current.data.x2 = e.clientX - left
        arrowRef.current.data.y2 = e.clientY - top

        if (history.top !== arrowRef.current) {
          historyDispatcher.push(arrowRef.current)
        } else {
          historyDispatcher.set(history)
        }
      }
    },
    [checked, history, canvasContextRef, historyDispatcher]
  )

  const onMouseup = useCallback(() => {
    if (!checked) {
      return
    }

    arrowRef.current = null
    arrowEditRef.current = null
  }, [checked])

  useDrawSelect(onDrawSelect)
  useCanvasMousedown(onMousedown)
  useCanvasMousemove(onMousemove)
  useCanvasMouseup(onMouseup)

  return (
    <ScreenshotsButton
      title='箭头'
      icon='icon-arrow'
      checked={checked}
      onClick={selectArrow}
      option={<ScreenshotsSizeColor size={size} color={color} onSizeChange={setSize} onColorChange={setColor} />}
    />
  )
}
