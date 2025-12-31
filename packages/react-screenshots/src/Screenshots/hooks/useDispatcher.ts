import { useContext } from 'react'
import ScreenshotsContext from '../ScreenshotsContext'
import type { ScreenshotsContextDispatcher } from '../ScreenshotsContext'

export default function useDispatcher (): ScreenshotsContextDispatcher {
  const { dispatcher } = useContext(ScreenshotsContext)

  return dispatcher
}
