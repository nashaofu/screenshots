import { useContext } from 'react';
import type { ScreenshotsContextDispatcher } from '../ScreenshotsContext';
import ScreenshotsContext from '../ScreenshotsContext';

export default function useDispatcher(): ScreenshotsContextDispatcher {
  const { dispatcher } = useContext(ScreenshotsContext);

  return dispatcher;
}
