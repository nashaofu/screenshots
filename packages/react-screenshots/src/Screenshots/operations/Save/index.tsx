import React, { ReactElement, useCallback } from 'react'
import useBounds from '../../hooks/useBounds'
import useCall from '../../hooks/useCall'
import useCanvasContextRef from '../../hooks/useCanvasContextRef'
import useHistory from '../../hooks/useHistory'
import useReset from '../../hooks/useReset'
import ScreenshotsButton from '../../ScreenshotsButton'

export default function Save (): ReactElement {
  const canvasContextRef = useCanvasContextRef()
  const [, historyDispatcher] = useHistory()
  const [bounds] = useBounds()
  const call = useCall()
  const reset = useReset()

  const onClick = useCallback(() => {
    if (!canvasContextRef.current) {
      return
    }
    historyDispatcher.clearSelect()
    setTimeout(() => {
      canvasContextRef.current.canvas.toBlob(blob => {
        call('onSave', blob, bounds)
        reset()
      }, 'image/png')
    })
  }, [canvasContextRef, historyDispatcher, bounds, call, reset])

  return <ScreenshotsButton title='保存' icon='icon-save' onClick={onClick} />
}
