import React, { memo, ReactElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import useBounds from '../hooks/useBounds'
import useStore from '../hooks/useStore'
import useDisplayActive from '../hooks/useDisplayActive'
import ScreenshotsMagnifier from '../ScreenshotsMagnifier'
import { Point, Position } from '../types'
import getBoundsByPoints from './getBoundsByPoints'
import './index.less'

/**
 * 多屏截图，仅支持在一个屏幕进行圈选，圈选后在当前屏幕双击保存截图
 */

export default memo(function ScreenshotsBackground (): ReactElement | null {
  const { url, image, width, height, displayIndex } = useStore()
  const [bounds, boundsDispatcher] = useBounds()

  // 整个截图屏幕div元素
  const elRef = useRef<HTMLDivElement>(null)
  // 记录鼠标左键第一次点击的位置
  const pointRef = useRef<Point | null>(null)
  // 用来判断鼠标是否移动过
  // 如果没有移动过位置，则mouseup时不更新
  const isMoveRef = useRef<boolean>(false)
  // 鼠标移动的位置记录,放大镜坐标
  const [position, setPosition] = useState<Position | null>(null)
  const isActiveDisplay = useDisplayActive()

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
      if (!isActiveDisplay) {
        return
      }

      // e.button 鼠标左键
      if (pointRef.current || bounds || e.button !== 0) {
        return
      }
      pointRef.current = {
        x: e.clientX,
        y: e.clientY
      }
      isMoveRef.current = false
    },
    [bounds, isActiveDisplay]
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
      isMoveRef.current = true
    }

    /**
     * 第一个屏幕按鼠标左键，然后移动鼠标到第二个屏幕，
     * 这个时候放下鼠标左键仍然会触发第一个屏幕onMouseUp事件，
     * 且不会触发第一个屏幕onMouseUp事件
     */
    const onMouseUp = (e: MouseEvent) => {
      if (!pointRef.current) {
        return
      }

      // 如果 isMoveRef.current是false，说明是双击事件
      if (isMoveRef.current) {
        updateBounds(pointRef.current, {
          x: e.clientX,
          y: e.clientY
        });
        (window as any).screenshots.boundsSelectChange(Number(displayIndex))
      }
      pointRef.current = null
      isMoveRef.current = false
    }

    const onMouseOut = () => {
      setPosition(null)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mouseout', onMouseOut)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mouseout', onMouseOut)
    }
  }, [updateBounds])

  useLayoutEffect(() => {
    if (!image || bounds) {
      // 重置位置
      setPosition(null)
    }
  }, [image, bounds])

  // 没有加载完不显示图片
  if (!url || !image) {
    return null
  }

  return (
    <div ref={elRef} className='screenshots-background' onMouseDown={onMouseDown}>
      <img className='screenshots-background-image' src={url} />
      <div className='screenshots-background-mask' />
      {position && !bounds && isActiveDisplay && <ScreenshotsMagnifier x={position?.x} y={position?.y} />}
    </div>
  )
})
