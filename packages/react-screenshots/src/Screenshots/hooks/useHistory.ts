import { useCallback } from 'react'
import { History, HistoryAction } from '../types'
import useDispatcher from './useDispatcher'
import useStore from './useStore'

export interface HistoryDispatcher {
  push: <T>(action: HistoryAction<T>) => void
  pop: () => void
  undo: () => void
  redo: () => void
  set: (history: History) => void
  reset: () => void
}

export type HistoryValueDispatcher = [History, HistoryDispatcher]

export default function useHistory (): HistoryValueDispatcher {
  const { history } = useStore()
  const { setHistory } = useDispatcher()

  const push = useCallback(
    <T>(action: HistoryAction<T>) => {
      const { index, stack } = history

      stack.splice(index + 1)
      stack.push(action)

      setHistory?.({
        index: stack.length - 1,
        stack: stack
      })
    },
    [history, setHistory]
  )

  const pop = useCallback(() => {
    const { stack } = history

    stack.pop()

    setHistory?.({
      index: stack.length - 1,
      stack: stack
    })
  }, [history, setHistory])

  const undo = useCallback(() => {
    const { index, stack } = history

    setHistory?.({
      index: index <= 0 ? -1 : index - 1,
      stack
    })
  }, [history, setHistory])

  const redo = useCallback(() => {
    const { index, stack } = history

    setHistory?.({
      index: index >= stack.length - 1 ? stack.length - 1 : index + 1,
      stack: stack
    })
  }, [history, setHistory])

  const set = useCallback(
    (history: History) => {
      setHistory?.({ ...history })
    },
    [setHistory]
  )

  const reset = useCallback(() => {
    setHistory?.({
      index: -1,
      stack: []
    })
  }, [setHistory])

  return [
    {
      index: history.index,
      stack: history.stack
    },
    {
      push,
      pop,
      undo,
      redo,
      set,
      reset
    }
  ]
}
