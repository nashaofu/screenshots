import { useCallback } from 'react';
import useBounds from './useBounds';
import useCursor from './useCursor';
import useEmitter from './useEmitter';
import useHistory from './useHistory';
import useOperation from './useOperation';

export type ResetDispatcher = () => void;

export default function useReset(): ResetDispatcher {
  const emitter = useEmitter();
  const [, boundsDispatcher] = useBounds();
  const [, cursorDispatcher] = useCursor();
  const [, historyDispatcher] = useHistory();
  const [, operatioDispatcher] = useOperation();

  const reset = useCallback(() => {
    emitter.reset();
    historyDispatcher.reset();
    boundsDispatcher.reset();
    cursorDispatcher.reset();
    operatioDispatcher.reset();
  }, [
    emitter,
    historyDispatcher,
    boundsDispatcher,
    cursorDispatcher,
    operatioDispatcher,
  ]);

  return reset;
}
