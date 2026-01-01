import { useEffect } from 'react';
import useEmitter from '../hooks/useEmitter';

export default function useCanvasPointerMove(
  onPointerMove: (e: PointerEvent) => unknown,
): void {
  const emitter = useEmitter();

  useEffect(() => {
    emitter.on('pointermove', onPointerMove);
    return () => {
      emitter.off('pointermove', onPointerMove);
    };
  }, [onPointerMove, emitter]);
}
