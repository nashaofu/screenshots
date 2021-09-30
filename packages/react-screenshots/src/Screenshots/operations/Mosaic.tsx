import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import ScreenshotsButton from '../ScreenshotsButton'
import ScreenshotsSize from '../ScreenshotsSize'
import useCanvasMousedown from '../hooks/useCanvasMousedown'
import useCanvasMousemove from '../hooks/useCanvasMousemove'
import useCanvasMouseup from '../hooks/useCanvasMouseup'
import { HistoryAction } from '../types'
import useOperation from '../hooks/useOperation'
import useCursor from '../hooks/useCursor'
import useStore from '../hooks/useStore'
import useBounds from '../hooks/useBounds'
import useHistory from '../hooks/useHistory'
import useCanvasContextRef from '../hooks/useCanvasContextRef'

export interface MosaicTile {
  x: number
  y: number
  color: number[]
}

export interface Mosaic {
  size: number
  tiles: MosaicTile[]
}

function getColor (x: number, y: number, size: number, imageData: ImageData): number[] {
  if (!imageData) {
    return [0, 0, 0, 0]
  }
  const { data, width } = imageData

  let x1 = Math.floor(x - size / 2)
  let y1 = Math.floor(y - size / 2)
  x1 = x1 >= 0 ? x1 : 0
  y1 = y1 >= 0 ? y1 : 0

  const rgbas = [0, 0, 0, 0]

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const index = (y1 + r) * width * 4 + (x1 + c) * 4
      const rgba = data.slice(index, index + 4)
      rgbas[0] += rgba[0]
      rgbas[1] += rgba[1]
      rgbas[2] += rgba[2]
      rgbas[3] += rgba[3]
    }
  }
  return rgbas.map(rgba => rgba / size / size)
}

function draw (ctx: CanvasRenderingContext2D, mosaic: Mosaic) {
  mosaic.tiles.forEach(tile => {
    const r = Math.round(tile.color[0])
    const g = Math.round(tile.color[1])
    const b = Math.round(tile.color[2])
    const a = tile.color[3] / 255

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
    ctx.fillRect(tile.x - mosaic.size / 2, tile.y - mosaic.size / 2, mosaic.size, mosaic.size)
  })
}

export default function MosaicButton (): ReactElement {
  const { image, width, height } = useStore()
  const [operation, operationDispatcher] = useOperation()
  const canvasContextRef = useCanvasContextRef()
  const [history, historyDispatcher] = useHistory()
  const [bounds] = useBounds()
  const [, cursorDispatcher] = useCursor()
  const [size, setSize] = useState(3)
  const imageDataRef = useRef<ImageData | null>(null)
  const mosaicRef = useRef<HistoryAction<Mosaic> | null>(null)

  const checked = operation === 'MosaicButton'

  const onClick = useCallback(() => {
    if (checked) {
      return
    }
    operationDispatcher.set('MosaicButton')
    cursorDispatcher.set('crosshair')
  }, [checked, operationDispatcher, cursorDispatcher])

  useEffect(() => {
    if (!bounds || !image || !checked) {
      return
    }

    const $canvas = document.createElement('canvas')

    const canvasContext = $canvas.getContext('2d')

    if (!canvasContext) {
      return
    }

    $canvas.width = bounds.width
    $canvas.height = bounds.height

    const rx = image.naturalWidth / width
    const ry = image.naturalHeight / height

    canvasContext.drawImage(
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

    imageDataRef.current = canvasContext.getImageData(0, 0, bounds.width, bounds.height)
  }, [width, height, bounds, image, checked])

  useCanvasMousedown(
    (e: MouseEvent): void => {
      if (!checked || mosaicRef.current || !imageDataRef.current || !canvasContextRef.current) {
        return
      }

      const rect = canvasContextRef.current.canvas.getBoundingClientRect()
      const x = e.clientX - rect.x
      const y = e.clientY - rect.y
      const mosaicSize = size * 2
      mosaicRef.current = {
        data: {
          size: mosaicSize,
          tiles: [
            {
              x,
              y,
              color: getColor(x, y, mosaicSize, imageDataRef.current)
            }
          ]
        },
        draw
      }

      historyDispatcher.push(mosaicRef.current)
    },
    [historyDispatcher]
  )

  useCanvasMousemove(
    (e: MouseEvent): void => {
      if (!checked || !mosaicRef.current || !canvasContextRef.current || !imageDataRef.current) {
        return
      }

      const rect = canvasContextRef.current.canvas.getBoundingClientRect()
      const x = e.clientX - rect.x
      const y = e.clientY - rect.y

      const mosaicSize = mosaicRef.current.data.size
      const mosaicTiles = mosaicRef.current.data.tiles

      let lastTile = mosaicTiles[mosaicTiles.length - 1]

      if (!lastTile) {
        mosaicTiles.push({
          x,
          y,
          color: getColor(x, y, mosaicSize, imageDataRef.current)
        })
      } else {
        const dx = lastTile.x - x
        const dy = lastTile.y - y
        // 减小点的个数
        let length = Math.sqrt(dx ** 2 + dy ** 2)
        const sin = -dy / length
        const cos = -dx / length

        while (length > mosaicSize) {
          const cx = Math.floor(lastTile.x + mosaicSize * cos)
          const cy = Math.floor(lastTile.y + mosaicSize * sin)
          lastTile = {
            x: cx,
            y: cy,
            color: getColor(cx, cy, mosaicSize, imageDataRef.current)
          }
          mosaicTiles.push(lastTile)
          length -= mosaicSize
        }

        // 最后一个位置补充一块
        if (length > mosaicSize / 2) {
          mosaicTiles.push({
            x,
            y,
            color: getColor(x, y, mosaicSize, imageDataRef.current)
          })
        }
      }

      historyDispatcher.set(history)
    },
    [history, historyDispatcher]
  )

  useCanvasMouseup((): void => {
    if (!checked) {
      return
    }

    if (mosaicRef.current) {
      mosaicRef.current = null
    }
  })

  return (
    <ScreenshotsButton
      title='马赛克'
      icon='icon-mosaic'
      checked={checked}
      onClick={onClick}
      option={<ScreenshotsSize value={size} onChange={setSize} />}
    />
  )
}
