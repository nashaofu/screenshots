import type { CanvasContextRef } from '../types';
import useStore from './useStore';

export default function useCanvasContextRef(): CanvasContextRef {
  const { canvasContextRef } = useStore();

  return canvasContextRef;
}
