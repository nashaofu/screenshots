import React, { ReactElement, useCallback } from 'react'
import useBounds from '../../hooks/useBounds'
import useCall from '../../hooks/useCall'
import useCanvasContextref from '../../hooks/useCanvasContextRef'
import useHistory from '../../hooks/useHistory'
import useReset from '../../hooks/useReset'
import ScreenshotsButton from '../../ScreenshotsButton'

export default function Ok (): ReactElement {
  const canvasContextRef = useCanvasContextref()
  const [, historyDispatcher] = useHistory()
  const call = useCall()
  const [bounds] = useBounds()
  const reset = useReset()

  const onClick = useCallback(() => {
    if (!canvasContextRef.current) {
      return
    }
    historyDispatcher.clearSelect()
    setTimeout(() => {
      canvasContextRef.current.canvas.toBlob(blob => {
        call('onOk', blob, bounds)
        reset()
      }, 'image/png')
    })
  }, [canvasContextRef, historyDispatcher, call, bounds, reset])

  return <ScreenshotsButton title='确定' icon='icon-ok' onClick={onClick} />
}
