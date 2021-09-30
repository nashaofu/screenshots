import React, { ReactElement, useCallback } from 'react'
import useBounds from '../hooks/useBounds'
import useCall from '../hooks/useCall'
import useCanvasContextref from '../hooks/useCanvasContextRef'
import useReset from '../hooks/useReset'
import ScreenshotsButton from '../ScreenshotsButton'

export default function OkButton (): ReactElement {
  const canvasContextRef = useCanvasContextref()
  const call = useCall()
  const [bounds] = useBounds()
  const reset = useReset()

  const onClick = useCallback(() => {
    if (!canvasContextRef.current) {
      return
    }
    canvasContextRef.current.canvas.toBlob(blob => {
      call('onOk', blob, bounds)
      reset()
    }, 'image/png')
  }, [canvasContextRef, call, bounds, reset])

  return <ScreenshotsButton title='确定' icon='icon-ok' onClick={onClick} />
}
