import React, { ReactElement, useCallback } from 'react'
import useBounds from '../../hooks/useBounds'
import useCall from '../../hooks/useCall'
import useCanvasContextRef from '../../hooks/useCanvasContextRef'
import useHistory from '../../hooks/useHistory'
import useLang from '../../hooks/useLang'
import useReset from '../../hooks/useReset'
import ScreenshotsButton from '../../ScreenshotsButton'

export default function Save (): ReactElement {
  const lang = useLang()
  const canvasContextRef = useCanvasContextRef()
  const [, historyDispatcher] = useHistory()
  const [bounds] = useBounds()
  const call = useCall()
  const reset = useReset()

  const onClick = useCallback(() => {
    historyDispatcher.clearSelect()
    setTimeout(() => {
      if (!canvasContextRef.current) {
        return
      }
      canvasContextRef.current.canvas.toBlob(blob => {
        call('onSave', blob, bounds)
        reset()
      }, 'image/png')
    })
  }, [canvasContextRef, historyDispatcher, bounds, call, reset])

  return <ScreenshotsButton title={lang.operation_save_title} icon='icon-save' onClick={onClick} />
}
