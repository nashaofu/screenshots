import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import ScreenshotsMagnifier from '../ScreenshotsMagnifier'
import './index.less'
import getBoundsByPoints from './getBoundsByPoints'
import { Point, Position } from '../types'
import useBounds from '../hooks/useBounds'
import useStore from '../hooks/useStore'

export default function ScreenshotsBackground (): ReactElement | null {
  const { url, width, height } = useStore()
  const [bounds, boundsDispatcher] = useBounds()

  const elRef = useRef<HTMLDivElement>(null)
  const pointRef = useRef<Point | null>(null)
  const [position, setPosition] = useState<Position | null>(null)

  const updateBounds = useCallback(
    (p1: Point, p2: Point) => {
      if (!elRef.current) {
        return
      }
      const { x, y } = elRef.current.getBoundingClientRect()

      boundsDispatcher.set(
        getBoundsByPoints(
          {
            x: p1.x - x,
            y: p1.y - y
          },
          {
            x: p2.x - x,
            y: p2.y - y
          },
          width,
          height
        )
      )
    },
    [width, height, boundsDispatcher]
  )

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // e.button 鼠标左键
      if (pointRef.current || bounds || e.button !== 0) {
        return
      }

      pointRef.current = {
        x: e.clientX,
        y: e.clientY
      }
    },
    [bounds]
  )

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (elRef.current) {
        const rect = elRef.current.getBoundingClientRect()
        if (e.clientX < rect.left || e.clientY < rect.top || e.clientX > rect.right || e.clientY > rect.bottom) {
          setPosition(null)
        } else {
          setPosition({
            x: e.clientX - rect.x,
            y: e.clientY - rect.y
          })
        }
      }

      if (!pointRef.current) {
        return
      }
      updateBounds(pointRef.current, {
        x: e.clientX,
        y: e.clientY
      })
    }

    const onMouseUp = (e: MouseEvent) => {
      if (!pointRef.current) {
        return
      }
      updateBounds(pointRef.current, {
        x: e.clientX,
        y: e.clientY
      })
      pointRef.current = null
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [updateBounds])

  if (!url) {
    return null
  }

  return (
    <div
      ref={elRef}
      className='screenshots-background'
      onMouseDown={onMouseDown}
    >
      <img className='screenshots-background-image' src={url} />
      <div className='screenshots-background-mask' />
      {position && !bounds && <ScreenshotsMagnifier x={position?.x} y={position?.y} />}
    </div>
  )
}
