import { useCallback } from 'react';
import type { EmitterListener } from '../types';
import useStore from './useStore';

export interface EmitterDispatcher {
  on: (event: string, listener: EmitterListener) => void;
  off: (event: string, listener: EmitterListener) => void;
  emit: (event: string, ...args: unknown[]) => void;
  reset: () => void;
}

export default function useEmitter(): EmitterDispatcher {
  const { emitterRef } = useStore();

  const on = useCallback(
    (event: string, listener: EmitterListener) => {
      const emitter = emitterRef.current;
      if (Array.isArray(emitter[event])) {
        emitter[event].push(listener);
      } else {
        emitter[event] = [listener];
      }
    },
    [emitterRef],
  );

  const off = useCallback(
    (event: string, listener: EmitterListener) => {
      const emitter = emitterRef.current;
      if (Array.isArray(emitter[event])) {
        const index = emitter[event].indexOf(listener);
        if (index !== -1) {
          emitter[event].splice(index, 1);
        }
      }
    },
    [emitterRef],
  );

  const emit = useCallback(
    (event: string, ...args: unknown[]) => {
      const emitter = emitterRef.current;

      if (Array.isArray(emitter[event])) {
        emitter[event].forEach((listener) => {
          listener(...args);
        });
      }
    },
    [emitterRef],
  );

  const reset = useCallback(() => {
    emitterRef.current = {};
  }, [emitterRef]);

  return {
    on,
    off,
    emit,
    reset,
  };
}
