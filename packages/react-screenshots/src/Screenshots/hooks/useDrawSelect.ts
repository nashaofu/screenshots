import { useEffect } from 'react';
import useEmitter from '../hooks/useEmitter';
import type { HistoryItemSource } from '../types';

export default function useDrawSelect(
  onDrawSelect: (
    action: HistoryItemSource<unknown, unknown>,
    e: PointerEvent,
  ) => unknown,
): void {
  const emitter = useEmitter();

  useEffect(() => {
    emitter.on('drawselect', onDrawSelect);
    return () => {
      emitter.off('drawselect', onDrawSelect);
    };
  }, [onDrawSelect, emitter]);
}
