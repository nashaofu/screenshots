import { useContext } from 'react';
import type { ScreenshotsContextStore } from '../ScreenshotsContext';
import ScreenshotsContext from '../ScreenshotsContext';

export default function useStore(): ScreenshotsContextStore {
  const { store } = useContext(ScreenshotsContext);

  return store;
}
