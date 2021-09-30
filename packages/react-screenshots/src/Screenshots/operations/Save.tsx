import React, { ReactElement, useCallback } from 'react'
import useBounds from '../hooks/useBounds'
import useCall from '../hooks/useCall'
import useCanvasContextRef from '../hooks/useCanvasContextRef'
import useReset from '../hooks/useReset'
import ScreenshotsButton from '../ScreenshotsButton'

export default function SaveButton (): ReactElement {
  const canvasContextRef = useCanvasContextRef()
  const [bounds] = useBounds()
  const call = useCall()
  const reset = useReset()

  const onClick = useCallback(() => {
    if (!canvasContextRef.current) {
      return
    }
    canvasContextRef.current.canvas.toBlob(blob => {
      call('onSave', blob, bounds)
      reset()
    }, 'image/png')
  }, [canvasContextRef, bounds, call, reset])

  return <ScreenshotsButton title='保存' icon='icon-save' onClick={onClick} />
}
