import React, { useCallback, useEffect, useState, useEffect, useState } from 'react'
import Screenshots from '../Screenshots'
import getSnapshotDataURL from './getSnapshotDataURL'
import './app.less'

export interface Display {
  id: number
  x: number
  y: number
  width: number
  height: number
  scaleFactor: number
}

export default function App (): JSX.Element {
  const [url, setUrl] = useState<string | undefined>(undefined)
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)

  const onSave = useCallback(({ viewer, dataURL }) => {
    window.screenshots.save({ viewer, dataURL })
  }, [])

  const onCancel = useCallback(() => {
    window.screenshots.cancel()
  }, [])

  const onOk = useCallback(({ dataURL, viewer }) => {
    window.screenshots.ok({ viewer, dataURL })
  }, [])

  useEffect(() => {
    const onCapture = (display: Display) => {
      getSnapshotDataURL(display).then(dataURL => {
        setUrl(dataURL)
        window.screenshots.captured()
      })
    }
    window.screenshots.on('capture', onCapture)
    // 告诉主进程页面准备完成
    window.screenshots.ready()
    return () => {
      window.screenshots.off('capture', onCapture)
    }
  }, [])

  useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    const onKeyup = ({ code }: KeyboardEvent) => {
      if (code === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('keyup', onKeyup)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keyup', onKeyup)
    }
  }, [onCancel])

  return <Screenshots url={url} width={width} height={height} onSave={onSave} onCancel={onCancel} onOk={onOk} />
}
