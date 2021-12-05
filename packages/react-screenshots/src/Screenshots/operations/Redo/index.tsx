import React, { ReactElement, useCallback } from 'react'
import ScreenshotsButton from '../../ScreenshotsButton'
import useHistory from '../../hooks/useHistory'

export default function Redo (): ReactElement {
  const [history, historyDispatcher] = useHistory()

  const onClick = useCallback(() => {
    historyDispatcher.redo()
  }, [historyDispatcher])

  return (
    <ScreenshotsButton
      title='重做'
      icon='icon-redo'
      disabled={!history.stack.length || history.stack.length - 1 === history.index}
      onClick={onClick}
    />
  )
}
