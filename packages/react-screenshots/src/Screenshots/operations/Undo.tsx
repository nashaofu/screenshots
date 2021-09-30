import React, { ReactElement, useCallback } from 'react'
import ScreenshotsButton from '../ScreenshotsButton'
import useHistory from '../hooks/useHistory'

export default function UndoButton (): ReactElement {
  const [history, historyDispatcher] = useHistory()

  const onClick = useCallback(() => {
    historyDispatcher.undo()
  }, [historyDispatcher])

  return <ScreenshotsButton title='撤销' icon='icon-undo' disabled={history.index === -1} onClick={onClick} />
}
