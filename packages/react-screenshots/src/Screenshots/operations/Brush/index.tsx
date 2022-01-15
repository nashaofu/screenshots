import React, { ReactElement, useCallback, useRef, useState } from 'react'
import useCanvasMousedown from '../../hooks/useCanvasMousedown'
import useCanvasMousemove from '../../hooks/useCanvasMousemove'
import useCanvasMouseup from '../../hooks/useCanvasMouseup'
import ScreenshotsButton from '../../ScreenshotsButton'
import ScreenshotsSizeColor from '../../ScreenshotsSizeColor'
import useCursor from '../../hooks/useCursor'
import useOperation from '../../hooks/useOperation'
import useHistory from '../../hooks/useHistory'
import useCanvasContextRef from '../../hooks/useCanvasContextRef'
import { HistoryItemEdit, HistoryItemSource, HistoryItemType, Point } from '../../types'
import useDrawSelect from '../../hooks/useDrawSelect'
import { isHit } from '../utils'

export interface BrushData {
  size: number
  color: string
  points: Point[]
}

export interface BrushEditData {
  x1: number
  y1: number
  x2: number
  y2: number
}

function draw (ctx: CanvasRenderingContext2D, action: HistoryItemSource<BrushData, BrushEditData>): void {
  const { size, color, points } = action.data
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = size
  ctx.strokeStyle = color

  const { x, y } = action.editHistory.reduce(
    (distance, { data }) => ({
      x: distance.x + data.x2 - data.x1,
      y: distance.y + data.y2 - data.y1
    }),
    { x: 0, y: 0 }
  )

  ctx.beginPath()
  points.forEach((item, index) => {
    if (index === 0) {
      ctx.moveTo(item.x + x, item.y + y)
    } else {
      ctx.lineTo(item.x + x, item.y + y)
    }
  })

  ctx.stroke()
}

export default function Brush (): ReactElement {
  const [, cursorDispatcher] = useCursor()
  const [operation, operationDispatcher] = useOperation()
  const canvasContextRef = useCanvasContextRef()
  const [history, historyDispatcher] = useHistory()
  const [size, setSize] = useState(3)
  const [color, setColor] = useState('#ee5126')
  const brushRef = useRef<HistoryItemSource<BrushData, BrushEditData> | null>(null)
  const brushEditRef = useRef<HistoryItemEdit<BrushEditData, BrushData> | null>(null)

  const checked = operation === 'Brush'

  const selectBrush = useCallback(() => {
    if (checked) {
      return
    }
    operationDispatcher.set('Brush')
    cursorDispatcher.set('default')
  }, [checked, operationDispatcher, cursorDispatcher])

  const onDrawSelect = useCallback(
    (action: HistoryItemSource<unknown, unknown>, e: MouseEvent) => {
      if (action.name !== 'Brush') {
        return
      }

      selectBrush()

      brushEditRef.current = {
        type: HistoryItemType.EDIT,
        data: {
          x1: e.clientX,
          y1: e.clientY,
          x2: e.clientX,
          y2: e.clientY
        },
        source: action as HistoryItemSource<BrushData, BrushEditData>
      }

      historyDispatcher.select(action)
    },
    [selectBrush, historyDispatcher]
  )

  const onMousedown = useCallback(
    (e: MouseEvent): void => {
      if (!checked || brushRef.current || !canvasContextRef.current) {
        return
      }

      const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()

      brushRef.current = {
        name: 'Brush',
        type: HistoryItemType.SOURCE,
        data: {
          size: size,
          color: color,
          points: [
            {
              x: e.clientX - left,
              y: e.clientY - top
            }
          ]
        },
        isSelected: false,
        editHistory: [],
        draw,
        isHit
      }
    },
    [checked, canvasContextRef, size, color]
  )

  const onMousemove = useCallback(
    (e: MouseEvent): void => {
      if (!checked || !canvasContextRef.current) {
        return
      }

      if (brushEditRef.current && brushEditRef.current.source.isSelected) {
        brushEditRef.current.data.x2 = e.clientX
        brushEditRef.current.data.y2 = e.clientY
        if (history.top !== brushEditRef.current) {
          brushEditRef.current.source.editHistory.push(brushEditRef.current)
          historyDispatcher.push(brushEditRef.current)
        } else {
          historyDispatcher.set(history)
        }
      } else if (brushRef.current) {
        const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()

        brushRef.current.data.points.push({
          x: e.clientX - left,
          y: e.clientY - top
        })

        if (history.top !== brushRef.current) {
          historyDispatcher.push(brushRef.current)
        } else {
          historyDispatcher.set(history)
        }
      }
    },
    [checked, history, canvasContextRef, historyDispatcher]
  )

  const onMouseup = useCallback((): void => {
    if (!checked) {
      return
    }

    brushRef.current = null
    brushEditRef.current = null
  }, [checked])

  useDrawSelect(onDrawSelect)
  useCanvasMousedown(onMousedown)
  useCanvasMousemove(onMousemove)
  useCanvasMouseup(onMouseup)

  return (
    <ScreenshotsButton
      title='画笔'
      icon='icon-brush'
      checked={checked}
      onClick={selectBrush}
      option={<ScreenshotsSizeColor size={size} color={color} onSizeChange={setSize} onColorChange={setColor} />}
    />
  )
}
