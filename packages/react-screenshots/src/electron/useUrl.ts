import { useEffect, useState } from 'react'
import getSnapshotDataURL from './getSnapshotDataURL'
import { ipcRenderer, Rectangle, IpcRendererEvent } from 'electron'

export interface Display extends Rectangle {
  id: number
}

export default function useUrl (): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined)
  useEffect(() => {
    const onSendDisplayData = (e: IpcRendererEvent, display: Display, scaleFactor: number) => {
      getSnapshotDataURL(display, scaleFactor).then(dataURL => {
        setUrl(dataURL)
        // 捕捉完桌面后通知主进程
        ipcRenderer.send('SCREENSHOTS::CAPTURED')
      })
    }

    ipcRenderer.on('SCREENSHOTS::SEND-DISPLAY-DATA', onSendDisplayData)
    return () => {
      ipcRenderer.off('SCREENSHOTS::SEND-DISPLAY-DATA', onSendDisplayData)
    }
  }, [])

  return url
}
