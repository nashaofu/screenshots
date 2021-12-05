import React, { ReactElement, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import useStore from '../../hooks/useStore'

export interface TextInputProps {
  size: number
  color: string
  value: string
  onChange: (value: string) => unknown
}

export default function TextInput ({ x, y, size, color, value, onChange, maxWidth, el }: TextInputProps): ReactElement {
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const getPopoverEl = () => {
    if (!popoverRef.current) {
      popoverRef.current = document.createElement('div')
    }
    return popoverRef.current
  }

  useEffect(() => {
    if (el && popoverRef.current) {
      el.appendChild(popoverRef.current)
      textareaRef.current?.focus()
    }
    return () => {
      popoverRef.current?.remove()
    }
  }, [el])

  return createPortal(
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        border: '2px solid #39f',
        maxWidth: maxWidth
      }}
    >
      <div
        ref={textareaRef}
        value={value}
        contentEditable
        onChange={e => onChange(e.target.value)}
        style={{
          color,
          lineHeight: `${size}px`,
          fontSize: size,
          backgroundColor: 'transparent',
          border: 'none',
          resize: 'none',
          outline: 'none',
          padding: 6
        }}
        rows={value.split('\n').length + 1}
      />
    </div>,
    getPopoverEl()
  )
}
