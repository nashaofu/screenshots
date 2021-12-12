import React, { ReactElement, useCallback, useRef, useState } from 'react'
import useCanvasContextRef from '../../hooks/useCanvasContextRef'
import useCanvasMousedown from '../../hooks/useCanvasMousedown'
import useCursor from '../../hooks/useCursor'
import useHistory from '../../hooks/useHistory'
import useOperation from '../../hooks/useOperation'
import ScreenshotsButton from '../../ScreenshotsButton'
import ScreenshotsSizeColor from '../../ScreenshotsSizeColor'
import { HistoryAction } from '../../types'
import ScreenshotsTextarea from '../../ScreenshotsTextarea'
import useBounds from '../../hooks/useBounds'

export interface TextData {
  size: number
  color: string
  fontFamily: string
  x: number
  y: number
  text: string
}

export interface TextareaBounds {
  x: number
  y: number
  maxWidth: number
  maxHeight: number
}

const sizes: Record<number, number> = {
  3: 18,
  6: 32,
  9: 46
}

function draw (ctx: CanvasRenderingContext2D, { size, color, fontFamily, x, y, text }: TextData) {
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.font = `${size}px ${fontFamily}`

  text.split('\n').forEach((item, index) => {
    ctx.fillText(item, x, y + index * size)
  })
}

export default function Text (): ReactElement {
  const [, historyDispatcher] = useHistory()
  const [bounds] = useBounds()
  const [operation, operationDispatcher] = useOperation()
  const [, cursorDispatcher] = useCursor()
  const canvasContextRef = useCanvasContextRef()
  const [size, setSize] = useState(3)
  const [color, setColor] = useState('#ee5126')
  const textRef = useRef<HistoryAction<TextData> | null>(null)
  const [textareaBounds, setTextareaBounds] = useState<TextareaBounds | null>(null)
  const [text, setText] = useState<string>('')

  const checked = operation === 'Text'

  const onClick = useCallback(() => {
    operationDispatcher.set('Text')
    cursorDispatcher.set('default')
  }, [operationDispatcher, cursorDispatcher])

  const onSizeChange = useCallback((size: number) => {
    if (textRef.current) {
      textRef.current.data.size = sizes[size]
    }
    setSize(size)
  }, [])

  const onColorChange = useCallback(color => {
    if (textRef.current) {
      textRef.current.data.color = color
    }
    setColor(color)
  }, [])

  const onTextareaChange = useCallback(
    (value: string) => {
      setText(value)
      if (checked && textRef.current) {
        textRef.current.data.text = value
      }
    },
    [checked]
  )

  const onTextareaBlur = useCallback(() => {
    if (textRef.current && textRef.current.data.text) {
      historyDispatcher.push(textRef.current)
    }
    textRef.current = null
    setText('')
    setTextareaBounds(null)
  }, [historyDispatcher])

  const onMousedown = useCallback(
    (e: MouseEvent) => {
      if (!checked || !canvasContextRef.current || textRef.current || !bounds) {
        return
      }
      const { left, top } = canvasContextRef.current.canvas.getBoundingClientRect()
      const fontFamily = window.getComputedStyle(canvasContextRef.current.canvas).fontFamily
      const x = e.clientX - left
      const y = e.clientY - top

      textRef.current = {
        data: {
          size: sizes[size],
          color,
          fontFamily,
          x,
          y,
          text: ''
        },
        draw: draw
      }

      setTextareaBounds({
        x: e.clientX,
        y: e.clientY,
        maxWidth: bounds.width - x,
        maxHeight: bounds.height - y
      })
    },
    [checked, size, color, bounds, canvasContextRef]
  )

  useCanvasMousedown(onMousedown)

  return (
    <>
      <ScreenshotsButton
        title='文本'
        icon='icon-text'
        checked={checked}
        onClick={onClick}
        option={
          <ScreenshotsSizeColor size={size} color={color} onSizeChange={onSizeChange} onColorChange={onColorChange} />
        }
      />
      {checked && textareaBounds && (
        <ScreenshotsTextarea
          x={textareaBounds.x}
          y={textareaBounds.y}
          maxWidth={textareaBounds.maxWidth}
          maxHeight={textareaBounds.maxHeight}
          size={sizes[size]}
          color={color}
          value={text}
          onChange={onTextareaChange}
          onBlur={onTextareaBlur}
        />
      )}
    </>
  )
}
