import React, { ReactElement, useEffect, useRef, FocusEvent, useState, useLayoutEffect, RefObject } from 'react'
import { createPortal } from 'react-dom'
import './index.less'

export interface TextInputProps {
  x: number
  y: number
  maxWidth: number
  maxHeight: number
  size: number
  color: string
  value: string
  onChange: (value: string) => unknown
  onBlur: (e: FocusEvent<HTMLTextAreaElement>) => unknown
}

function useTextWidth (text: string, textareaRef: RefObject<HTMLTextAreaElement>) {
  const [textWidth, setTextWidth] = useState(0)

  useLayoutEffect(() => {
    if (textareaRef.current) {
      const el = document.createElement('span')
      const style = window.getComputedStyle(textareaRef.current)

      const keys = ['font', 'line-height', 'letter-spacing', 'padding']

      keys.forEach(key => {
        el.style.setProperty(key, style.getPropertyValue(key))
      })

      el.style.setProperty('visibility', 'hidden')
      el.style.setProperty('white-space', 'pre')

      el.appendChild(document.createTextNode(text))
      document.body.appendChild(el)
      const rect = el.getBoundingClientRect()
      document.body.removeChild(el)
      setTextWidth(rect.width)
    } else {
      setTextWidth(0)
    }
  }, [text, textareaRef])
  return textWidth
}

export default function ScreenshotsTextarea ({
  x,
  y,
  maxWidth,
  maxHeight,
  size,
  color,
  value,
  onChange,
  onBlur
}: TextInputProps): ReactElement {
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const textWidth = useTextWidth(value, textareaRef)
  const getPopoverEl = () => {
    if (!popoverRef.current) {
      popoverRef.current = document.createElement('div')
    }
    return popoverRef.current
  }

  useEffect(() => {
    if (popoverRef.current) {
      document.body.appendChild(popoverRef.current)
      textareaRef.current?.focus()
    }
    return () => {
      popoverRef.current?.remove()
    }
  }, [])

  return createPortal(
    <div
      className='screenshots-textarea'
      style={{
        left: x,
        top: y,
        width: textWidth,
        height: value.split('\n').length * size,
        maxWidth,
        maxHeight
      }}
    >
      <textarea
        ref={textareaRef}
        className='screenshots-textarea-input'
        style={{
          color,
          fontSize: size,
          lineHeight: `${size}px`
        }}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        onBlur={e => onBlur && onBlur(e)}
      />
    </div>,
    getPopoverEl()
  )
}
