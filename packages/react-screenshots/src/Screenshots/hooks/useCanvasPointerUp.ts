import { useEffect } from "react";
import useEmitter from "../hooks/useEmitter";

export default function useCanvasPointerUp(
  onPointerUp: (e: PointerEvent) => unknown
): void {
  const emitter = useEmitter();

  useEffect(() => {
    emitter.on("pointerup", onPointerUp);
    return () => {
      emitter.off("pointerup", onPointerUp);
    };
  }, [onPointerUp, emitter]);
}
