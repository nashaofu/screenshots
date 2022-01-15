import React, { ReactElement, useCallback, useRef, useState } from 'react'
import useCanvasContextRef from '../../hooks/useCanvasContextRef'
import useCanvasMousedown from '../../hooks/useCanvasMousedown'
import useCanvasMousemove from '../../hooks/useCanvasMousemove'
import useCanvasMouseup from '../../hooks/useCanvasMouseup'
import useCursor from '../../hooks/useCursor'
import useDrawSelect from '../../hooks/useDrawSelect'
import useHistory from '../../hooks/useHistory'
import useOperation from '../../hooks/useOperation'
import ScreenshotsButton from '../../ScreenshotsButton'
import ScreenshotsSizeColor from '../../ScreenshotsSizeColor'
import { HistoryItemSource, HistoryItemEdit, HistoryItemType } from '../../types'
import { isHit } from '../utils'

export interface RectangleData {
  size: number
  color: string
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface RectangleEditData {
  x1: number
  y1: number
  x2: number
  y2: number
}

function draw (ctx: CanvasRenderingContext2D, action: HistoryItemSource<RectangleData, RectangleEditData>) {
  let { size, color, x1, y1, x2, y2 } = action.data
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

  const { x, y } = action.editHistory.reduce(
    (distance, { data }) => ({
      x: distance.x + data.x2 - data.x1,
      y: distance.y + data.y2 - data.y1
    }),
    { x: 0, y: 0 }
  )

  ctx.beginPath()
  ctx.rect(x1 + x, y1 + y, x2 - x1, y2 - y1)
  ctx.stroke()
}

export default function Rectangle (): ReactElement {
  const [history, historyDispatcher] = useHistory()
  const [operation, operationDispatcher] = useOperation()
  const [, cursorDispatcher] = useCursor()
  const canvasContextRef = useCanvasContextRef()
  const [size, setSize] = useState(3)
  const [color, setColor] = useState('#ee5126')
  const rectangleRef = useRef<HistoryItemSource<RectangleData, RectangleEditData> | null>(null)
  const rectangleEditRef = useRef<HistoryItemEdit<RectangleEditData, RectangleData> | null>(null)

  const checked = operation === 'Rectangle'

  const selectRectangle = useCallback(() => {
    if (checked) {
      return
    }
    operationDispatcher.set('Rectangle')
    cursorDispatcher.set('crosshair')
  }, [checked, operationDispatcher, cursorDispatcher])

  const onDrawSelect = useCallback(
    (action: HistoryItemSource<unknown, unknown>, e: MouseEvent) => {
      if (action.name !== 'Rectangle') {
        return
      }

      selectRectangle()

      rectangleEditRef.current = {
        type: HistoryItemType.EDIT,
        data: {
          x1: e.clientX,
          y1: e.clientY,
          x2: e.clientX,
          y2: e.clientY
        },
        source: action as HistoryItemSource<RectangleData, RectangleEditData>
      }

      historyDispatcher.select(action)
    },
    [selectRectangle, historyDispatcher]
  )

  const onMousedown = useCallback(
    (e: MouseEvent) => {
      if (!checked || !canvasContextRef.current || rectangleRef.current) {
        return
      }

      const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()
      const x = e.clientX - left
      const y = e.clientY - top
      rectangleRef.current = {
        name: 'Rectangle',
        type: HistoryItemType.SOURCE,
        data: {
          size,
          color,
          x1: x,
          y1: y,
          x2: x,
          y2: y
        },
        isSelected: false,
        editHistory: [],
        draw,
        isHit
      }
    },
    [checked, size, color, canvasContextRef]
  )

  const onMousemove = useCallback(
    (e: MouseEvent) => {
      if (!checked || !canvasContextRef.current) {
        return
      }

      if (rectangleEditRef.current && rectangleEditRef.current.source.isSelected) {
        rectangleEditRef.current.data.x2 = e.clientX
        rectangleEditRef.current.data.y2 = e.clientY
        if (history.top !== rectangleEditRef.current) {
          rectangleEditRef.current.source.editHistory.push(rectangleEditRef.current)
          historyDispatcher.push(rectangleEditRef.current)
        } else {
          historyDispatcher.set(history)
        }
      } else if (rectangleRef.current) {
        const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()
        const rectangleData = rectangleRef.current.data
        rectangleData.x2 = e.clientX - left
        rectangleData.y2 = e.clientY - top

        if (history.top !== rectangleRef.current) {
          historyDispatcher.push(rectangleRef.current)
        } else {
          historyDispatcher.set(history)
        }
      }
    },
    [checked, canvasContextRef, history, historyDispatcher]
  )

  const onMouseup = useCallback(() => {
    if (!checked) {
      return
    }

    rectangleRef.current = null
    rectangleEditRef.current = null
  }, [checked])

  useDrawSelect(onDrawSelect)
  useCanvasMousedown(onMousedown)
  useCanvasMousemove(onMousemove)
  useCanvasMouseup(onMouseup)

  return (
    <ScreenshotsButton
      title='矩形'
      icon='icon-rectangle'
      checked={checked}
      onClick={selectRectangle}
      option={<ScreenshotsSizeColor size={size} color={color} onSizeChange={setSize} onColorChange={setColor} />}
    />
  )
}
