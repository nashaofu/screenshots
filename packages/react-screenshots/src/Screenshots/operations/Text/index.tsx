import React, { ReactElement, useCallback, useRef, useState } from 'react'
import useBounds from '../../hooks/useBounds'
import useCanvasContextRef from '../../hooks/useCanvasContextRef'
import useCanvasMousedown from '../../hooks/useCanvasMousedown'
import useCursor from '../../hooks/useCursor'
import useHistory from '../../hooks/useHistory'
import useOperation from '../../hooks/useOperation'
import ScreenshotsButton from '../../ScreenshotsButton'
import ScreenshotsSizeColor from '../../ScreenshotsSizeColor'
import { HistoryAction, Point } from '../../types'
import TextInput from './TextInput'

export interface TextData {
  size: number
  color: string
  x: number
  y: number
  text: string
}

const sizes = {
  3: 16,
  6: 28,
  9: 42
}

function draw (ctx: CanvasRenderingContext2D, { size, color, x, y, text }) {
  ctx.fillStyle = color
  ctx.textBaseline = 'top'
  ctx.font = `${size}px serif`
  ctx.fillText(text, x, y)
}

export default function Text (): ReactElement {
  const [history, historyDispatcher] = useHistory()
  const [bounds] = useBounds()
  const [operation, operationDispatcher] = useOperation()
  const [, cursorDispatcher] = useCursor()
  const canvasContextRef = useCanvasContextRef()
  const [size, setSize] = useState(3)
  const [color, setColor] = useState('#ee5126')
  const textRef = useRef<HistoryAction<TextData> | null>(null)
  const [point, setPoint] = useState<Point | null>(null)
  const [text, setText] = useState<string>('')
  const [el, setEl] = useState(null)

  const checked = operation === 'Text'

  const onClick = useCallback(() => {
    operationDispatcher.set('Text')
    cursorDispatcher.set('default')
  }, [operationDispatcher, cursorDispatcher])

  const onTextChange = useCallback(
    (value: string) => {
      setText(value)
      if (checked && textRef.current) {
        textRef.current.data.text = value
      }
    },
    [checked]
  )

  const onMousedown = useCallback(
    (e: MouseEvent) => {
      if (!checked || !canvasContextRef.current || textRef.current) {
        return
      }
      const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()

      textRef.current = {
        data: {
          size: sizes[size],
          color,
          x: e.clientX - left,
          y: e.clientY - top,
          text: text
        },
        draw: draw
      }
      historyDispatcher.push(textRef.current)

      setPoint({
        x: e.clientX - left,
        y: e.clientY - top - sizes[size]
      })
      setEl(canvasContextRef.current.canvas.nextElementSibling)
    },
    [checked, size, color, text, canvasContextRef, historyDispatcher]
  )

  useCanvasMousedown(onMousedown)

  return (
    <>
      <ScreenshotsButton
        title='文本'
        icon='icon-text'
        checked={checked}
        onClick={onClick}
        option={<ScreenshotsSizeColor size={size} color={color} onSizeChange={setSize} onColorChange={setColor} />}
      />
      {checked && point && (
        <TextInput x={point.x} y={point.y} maxWidth={bounds.width - point.y} size={sizes[size]} color={color} value={text} onChange={onTextChange} el={el} />
      )}
    </>
  )
}
