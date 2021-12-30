import { useEffect } from 'react'
import useEmiter from '../hooks/useEmiter'
import { HistoryAction } from '../types'

export default function useDrawSelect (onDrawSelect: (e: HistoryAction<unknown>) => unknown): void {
  const emiter = useEmiter()

  useEffect(() => {
    emiter.on('drawselect', onDrawSelect)
    return () => {
      emiter.off('drawselect', onDrawSelect)
    }
  }, [onDrawSelect, emiter])
}
