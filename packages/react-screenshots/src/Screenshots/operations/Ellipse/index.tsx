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
import { HistoryItemEdit, HistoryItemSource, HistoryItemType } from '../../types'
import { isHit } from '../utils'

export interface EllipseData {
  size: number
  color: string
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface EllipseEditData {
  x1: number
  y1: number
  x2: number
  y2: number
}

function draw (ctx: CanvasRenderingContext2D, action: HistoryItemSource<EllipseData, EllipseEditData>) {
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

  const distance = action.editHistory.reduce(
    (distance, { data }) => ({
      x: distance.x + data.x2 - data.x1,
      y: distance.y + data.y2 - data.y1
    }),
    { x: 0, y: 0 }
  )

  const x = (x1 + x2) / 2 + distance.x
  const y = (y1 + y2) / 2 + distance.y
  const rx = (x2 - x1) / 2
  const ry = (y2 - y1) / 2
  const k = 0.5522848
  // 水平控制点偏移量
  const ox = rx * k
  // 垂直控制点偏移量
  const oy = ry * k
  // 从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
  ctx.beginPath()
  ctx.moveTo(x - rx, y)
  ctx.bezierCurveTo(x - rx, y - oy, x - ox, y - ry, x, y - ry)
  ctx.bezierCurveTo(x + ox, y - ry, x + rx, y - oy, x + rx, y)
  ctx.bezierCurveTo(x + rx, y + oy, x + ox, y + ry, x, y + ry)
  ctx.bezierCurveTo(x - ox, y + ry, x - rx, y + oy, x - rx, y)
  ctx.closePath()
  ctx.stroke()
}

export default function Ellipse (): ReactElement {
  const [history, historyDispatcher] = useHistory()
  const [operation, operationDispatcher] = useOperation()
  const [, cursorDispatcher] = useCursor()
  const canvasContextRef = useCanvasContextRef()
  const [size, setSize] = useState(3)
  const [color, setColor] = useState('#ee5126')
  const ellipseRef = useRef<HistoryItemSource<EllipseData, EllipseEditData> | null>(null)
  const ellipseEditRef = useRef<HistoryItemEdit<EllipseEditData, EllipseData> | null>(null)

  const checked = operation === 'Ellipse'

  const selectEllipse = useCallback(() => {
    if (checked) {
      return
    }
    operationDispatcher.set('Ellipse')
    cursorDispatcher.set('crosshair')
  }, [checked, operationDispatcher, cursorDispatcher])

  const onDrawSelect = useCallback(
    (action: HistoryItemSource<unknown, unknown>, e: MouseEvent) => {
      if (action.name !== 'Ellipse') {
        return
      }

      selectEllipse()

      ellipseEditRef.current = {
        type: HistoryItemType.EDIT,
        data: {
          x1: e.clientX,
          y1: e.clientY,
          x2: e.clientX,
          y2: e.clientY
        },
        source: action as HistoryItemSource<EllipseData, EllipseEditData>
      }

      historyDispatcher.select(action)
    },
    [selectEllipse, historyDispatcher]
  )

  const onMousedown = useCallback(
    (e: MouseEvent) => {
      if (!checked || !canvasContextRef.current || ellipseRef.current) {
        return
      }

      const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()
      const x = e.clientX - left
      const y = e.clientY - top
      ellipseRef.current = {
        name: 'Ellipse',
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

      if (ellipseEditRef.current && ellipseEditRef.current.source.isSelected) {
        ellipseEditRef.current.data.x2 = e.clientX
        ellipseEditRef.current.data.y2 = e.clientY
        if (history.top !== ellipseEditRef.current) {
          ellipseEditRef.current.source.editHistory.push(ellipseEditRef.current)
          historyDispatcher.push(ellipseEditRef.current)
        } else {
          historyDispatcher.set(history)
        }
      } else if (ellipseRef.current) {
        const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()
        ellipseRef.current.data.x2 = e.clientX - left
        ellipseRef.current.data.y2 = e.clientY - top

        if (history.top !== ellipseRef.current) {
          historyDispatcher.push(ellipseRef.current)
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

    ellipseRef.current = null
    ellipseEditRef.current = null
  }, [checked])

  useDrawSelect(onDrawSelect)
  useCanvasMousedown(onMousedown)
  useCanvasMousemove(onMousemove)
  useCanvasMouseup(onMouseup)

  return (
    <ScreenshotsButton
      title='椭圆'
      icon='icon-ellipse'
      checked={checked}
      onClick={selectEllipse}
      option={<ScreenshotsSizeColor size={size} color={color} onSizeChange={setSize} onColorChange={setColor} />}
    />
  )
}
