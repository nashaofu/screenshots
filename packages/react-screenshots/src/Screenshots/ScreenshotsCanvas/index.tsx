import React, {
  forwardRef,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef
} from 'react'
import useBounds from '../hooks/useBounds'
import dpr from '../dpr'
import getPoints from './getPoints'
import getBoundsByPoints from './getBoundsByPoints'
import { Bounds, HistoryItemType, Point } from '../types'
import useEmiter from '../hooks/useEmiter'
import useHistory from '../hooks/useHistory'
import useCursor from '../hooks/useCursor'
import useOperation from '../hooks/useOperation'
import useStore from '../hooks/useStore'
import './index.less'
import isPointInDraw from './isPointInDraw'

const borders = ['top', 'right', 'bottom', 'left']

export enum ResizePoints {
  ResizeTop = 'top',
  ResizetopRight = 'top-right',
  ResizeRight = 'right',
  ResizeRightBottom = 'right-bottom',
  ResizeBottom = 'bottom',
  ResizeBottomLeft = 'bottom-left',
  ResizeLeft = 'left',
  ResizeLeftTop = 'left-top',
  Move = 'move'
}

const resizePoints = [
  ResizePoints.ResizeTop,
  ResizePoints.ResizetopRight,
  ResizePoints.ResizeRight,
  ResizePoints.ResizeRightBottom,
  ResizePoints.ResizeBottom,
  ResizePoints.ResizeBottomLeft,
  ResizePoints.ResizeLeft,
  ResizePoints.ResizeLeftTop
]

export default forwardRef<CanvasRenderingContext2D>(function ScreenshotsCanvas (props, ref): ReactElement | null {
  const { image, width, height } = useStore()

  const emiter = useEmiter()
  const [history] = useHistory()
  const [cursor] = useCursor()
  const [bounds, boundsDispatcher] = useBounds()
  const [operation] = useOperation()

  const resizeOrMoveRef = useRef<string>()
  const pointRef = useRef<Point | null>(null)
  const boundsRef = useRef<Bounds | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  const draw = useCallback(() => {
    if (!image || !bounds || !ctxRef.current) {
      return
    }

    const rx = image.naturalWidth / width
    const ry = image.naturalHeight / height

    const ctx = ctxRef.current
    ctx.imageSmoothingEnabled = true
    // 设置太高，图片会模糊
    ctx.imageSmoothingQuality = 'low'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, bounds.width, bounds.height)
    ctx.drawImage(
      image,
      bounds.x * rx,
      bounds.y * ry,
      bounds.width * rx,
      bounds.height * ry,
      0,
      0,
      bounds.width,
      bounds.height
    )

    history.stack.slice(0, history.index + 1).forEach(item => {
      if (item.type === HistoryItemType.Source) {
        item.draw(ctx, item)
      }
    })
  }, [image, width, height, bounds, ctxRef, history])

  const onMouseDown = useCallback(
    (e: React.MouseEvent, resizeOrMove: string) => {
      if (e.button !== 0 || !bounds) {
        return
      }
      if (!operation) {
        resizeOrMoveRef.current = resizeOrMove
        pointRef.current = {
          x: e.clientX,
          y: e.clientY
        }
        boundsRef.current = {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height
        }
      } else {
        const draw = isPointInDraw(bounds, canvasRef.current, history, e.nativeEvent)
        if (draw) {
          emiter.emit('drawselect', draw, e.nativeEvent)
        } else {
          emiter.emit('mousedown', e.nativeEvent)
        }
      }
    },
    [bounds, operation, emiter, history]
  )

  const updateBounds = useCallback(
    (e: MouseEvent) => {
      if (!resizeOrMoveRef.current || !pointRef.current || !boundsRef.current || !bounds) {
        return
      }
      const points = getPoints(e, resizeOrMoveRef.current, pointRef.current, boundsRef.current)
      boundsDispatcher.set(getBoundsByPoints(points[0], points[1], bounds, width, height, resizeOrMoveRef.current))
    },
    [width, height, bounds, boundsDispatcher]
  )

  useLayoutEffect(() => {
    if (!image || !bounds || !canvasRef.current) {
      ctxRef.current = null
      return
    }

    if (!ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d')
    }

    draw()
  }, [image, bounds, draw])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!operation) {
        if (!resizeOrMoveRef.current || !pointRef.current || !boundsRef.current) {
          return
        }
        updateBounds(e)
      } else {
        emiter.emit('mousemove', e)
      }
    }

    const onMouseUp = (e: MouseEvent) => {
      if (!operation) {
        if (!resizeOrMoveRef.current || !pointRef.current || !boundsRef.current) {
          return
        }
        updateBounds(e)
        resizeOrMoveRef.current = undefined
        pointRef.current = null
        boundsRef.current = null
      } else {
        emiter.emit('mouseup', e)
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [updateBounds, operation, emiter])

  // 放到最后，保证ctxRef.current存在
  useImperativeHandle<CanvasRenderingContext2D | null, CanvasRenderingContext2D | null>(ref, () => ctxRef.current)

  if (!bounds) {
    return null
  }

  return (
    <div
      className='screenshots-canvas'
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height
      }}
    >
      <canvas
        ref={canvasRef}
        width={bounds.width * dpr}
        height={bounds.height * dpr}
        style={{
          width: bounds.width,
          height: bounds.height
        }}
      />
      <div
        className='screenshots-canvas-body'
        style={{
          cursor
        }}
        onMouseDown={e => onMouseDown(e, 'move')}
      />
      {borders.map(border => {
        return <div key={border} className={`screenshots-canvas-border-${border}`} />
      })}
      {resizePoints.map(resizePoint => {
        return (
          <div
            key={resizePoint}
            className={`screenshots-canvas-point-${resizePoint}`}
            onMouseDown={e => onMouseDown(e, resizePoint)}
          />
        )
      })}
    </div>
  )
})
