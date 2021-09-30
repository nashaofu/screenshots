import { ipcRenderer } from 'electron'
import React, { useCallback, useEffect, useState } from 'react'
import Screenshots from '../Screenshots'
import useUrl from './useUrl'
import './app.less'

export default function App (): JSX.Element {
  const url = useUrl()
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)

  const onSave = useCallback(({ viewer, dataURL }) => {
    ipcRenderer.send('SCREENSHOTS::SAVE', { viewer, dataURL })
  }, [])

  const onCancel = useCallback(() => {
    ipcRenderer.send('SCREENSHOTS::CANCEL')
  }, [])

  const onOk = useCallback(({ dataURL, viewer }) => {
    ipcRenderer.send('SCREENSHOTS::OK', { viewer, dataURL })
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
    // 告诉主进程页面准备完成
    ipcRenderer.send('SCREENSHOTS::DOM-READY')
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keyup', onKeyup)
    }
  }, [onCancel])

  return <Screenshots url={url} width={width} height={height} onSave={onSave} onCancel={onCancel} onOk={onOk} />
}
