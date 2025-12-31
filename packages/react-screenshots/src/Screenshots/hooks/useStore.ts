import { useContext } from 'react'
import ScreenshotsContext from '../ScreenshotsContext'
import type { ScreenshotsContextStore } from '../ScreenshotsContext'

export default function useStore (): ScreenshotsContextStore {
  const { store } = useContext(ScreenshotsContext)

  return store
}
