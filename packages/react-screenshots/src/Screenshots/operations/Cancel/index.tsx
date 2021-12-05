import React, { ReactElement, useCallback } from 'react'
import useCall from '../../hooks/useCall'
import useReset from '../../hooks/useReset'
import ScreenshotsButton from '../../ScreenshotsButton'

export default function Cancel (): ReactElement {
  const call = useCall()
  const reset = useReset()

  const onClick = useCallback(() => {
    call('onCancel')
    reset()
  }, [call, reset])

  return <ScreenshotsButton title='取消' icon='icon-cancel' onClick={onClick} />
}
