import type { Dispatch, SetStateAction } from 'react';
import React from 'react';
import type { Bounds, CanvasContextRef, EmitterRef, History } from './types';
import type { Lang } from './zh_CN';
import zhCN from './zh_CN';

export interface ScreenshotsContextStore {
  url?: string;
  image: HTMLImageElement | null;
  width: number;
  height: number;
  lang: Lang;
  emitterRef: EmitterRef;
  canvasContextRef: CanvasContextRef;
  history: History;
  bounds: Bounds | null;
  cursor?: string;
  operation?: string;
}

export interface ScreenshotsContextDispatcher {
  call?: <T>(funcName: string, ...args: T[]) => void;
  setHistory?: Dispatch<SetStateAction<History>>;
  setBounds?: Dispatch<SetStateAction<Bounds | null>>;
  setCursor?: Dispatch<SetStateAction<string | undefined>>;
  setOperation?: Dispatch<SetStateAction<string | undefined>>;
}

export interface ScreenshotsContextValue {
  store: ScreenshotsContextStore;
  dispatcher: ScreenshotsContextDispatcher;
}

export default React.createContext<ScreenshotsContextValue>({
  store: {
    url: undefined,
    image: null,
    width: 0,
    height: 0,
    lang: zhCN,
    emitterRef: { current: {} },
    canvasContextRef: { current: null },
    history: {
      index: -1,
      stack: [],
    },
    bounds: null,
    cursor: 'move',
    operation: undefined,
  },
  dispatcher: {
    call: undefined,
    setHistory: undefined,
    setBounds: undefined,
    setCursor: undefined,
    setOperation: undefined,
  },
});
