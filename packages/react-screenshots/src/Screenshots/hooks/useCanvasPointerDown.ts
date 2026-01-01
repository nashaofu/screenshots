import { useEffect } from 'react';
import useEmitter from '../hooks/useEmitter';

export default function useCanvasPointerDown(
  onPointerDown: (e: PointerEvent) => unknown,
): void {
  const emitter = useEmitter();

  useEffect(() => {
    emitter.on('pointerdown', onPointerDown);
    return () => {
      emitter.off('pointerdown', onPointerDown);
    };
  }, [onPointerDown, emitter]);
}
