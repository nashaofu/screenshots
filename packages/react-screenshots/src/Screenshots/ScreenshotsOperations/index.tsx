import React, { MouseEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import useBounds from '../hooks/useBounds'
import OperationButtons from '../operations'
import './index.less'
import useStore from '../hooks/useStore'
import { Bounds, Position } from '../types'

export const ScreenshotsOperationsCtx = React.createContext<Bounds | null>(null)

export default function ScreenshotsOperations (): ReactElement | null {
  const { width, height } = useStore()
  const [bounds] = useBounds()
  const [operationsRect, setOperationsRect] = useState<Bounds | null>(null)
  const [position, setPosition] = useState<Position | null>(null)

  const elRef = useRef<HTMLDivElement>(null)
  const onDoubleClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
  }, [])

  const onContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!bounds || !elRef.current) {
      return
    }

    const elRect = elRef.current.getBoundingClientRect()

    let x = bounds.x + bounds.width - elRect.width
    let y = bounds.y + bounds.height + 10

    if (x < 0) {
      x = 0
    }

    if (x > width - elRect.width) {
      x = width - elRect.width
    }

    if (y > height - elRect.height) {
      y = height - elRect.height - 10
    }

    if (position?.x !== x || position.y !== y) {
      setPosition({
        x,
        y
      })
    }

    if (
      operationsRect?.x !== elRect.x ||
      operationsRect.y !== elRect.y ||
      operationsRect.width !== elRect.width ||
      operationsRect.height !== elRect.height
    ) {
      setOperationsRect({
        x: elRect.x,
        y: elRect.y,
        width: elRect.width,
        height: elRect.height
      })
    }
  })

  if (!bounds) {
    return null
  }

  return (
    <ScreenshotsOperationsCtx.Provider value={operationsRect}>
      <div
        ref={elRef}
        className='screenshots-operations'
        style={{
          visibility: position ? 'visible' : 'hidden',
          left: position?.x,
          top: position?.y
        }}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
      >
        <div className='screenshots-operations-buttons'>
          {OperationButtons.map((OperationButton, index) => {
            if (OperationButton === '|') {
              return <div key={index} className='screenshots-operations-divider' />
            } else {
              return <OperationButton key={index} />
            }
          })}
        </div>
      </div>
    </ScreenshotsOperationsCtx.Provider>
  )
}
