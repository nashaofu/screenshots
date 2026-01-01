import type { MouseEvent, ReactElement } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import composeImage from './composeImage';
import './icons/iconfont.less';
import './screenshots.less';
import ScreenshotsBackground from './ScreenshotsBackground';
import ScreenshotsCanvas from './ScreenshotsCanvas';
import ScreenshotsContext from './ScreenshotsContext';
import ScreenshotsOperations from './ScreenshotsOperations';
import type { Bounds, Emitter, History } from './types';
import useGetLoadedImage from './useGetLoadedImage';
import type { Lang } from './zh_CN';
import zhCN from './zh_CN';

export interface ScreenshotsProps {
  url?: string;
  width: number;
  height: number;
  lang?: Partial<Lang>;
  className?: string;
  [key: string]: unknown;
}

export default function Screenshots({
  url,
  width,
  height,
  lang,
  className,
  ...props
}: ScreenshotsProps): ReactElement {
  const propsRef = useRef(props);
  propsRef.current = props;
  const image = useGetLoadedImage(url);
  const canvasContextRef = useRef<CanvasRenderingContext2D>(null);
  const emitterRef = useRef<Emitter>({});
  const [history, setHistory] = useState<History>({
    index: -1,
    stack: [],
  });
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [cursor, setCursor] = useState<string | undefined>('move');
  const [operation, setOperation] = useState<string | undefined>(undefined);

  const store = {
    url,
    width,
    height,
    image,
    lang: {
      ...zhCN,
      ...lang,
    },
    emitterRef,
    canvasContextRef,
    history,
    bounds,
    cursor,
    operation,
  };

  const call = useCallback(
    <T extends unknown[]>(funcName: string, ...args: T) => {
      const func = propsRef.current[funcName];
      if (typeof func === 'function') {
        func(...args);
      }
    },
    [],
  );

  const dispatcher = {
    call,
    setHistory,
    setBounds,
    setCursor,
    setOperation,
  };

  const classNames = ['screenshots'];

  if (className) {
    classNames.push(className);
  }

  const reset = useCallback(() => {
    emitterRef.current = {};
    setHistory({
      index: -1,
      stack: [],
    });
    setBounds(null);
    setCursor('move');
    setOperation(undefined);
  }, []);

  const onDoubleClick = useCallback(
    async (e: MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0 || !image) {
        return;
      }
      if (bounds && canvasContextRef.current) {
        composeImage({
          image,
          width,
          height,
          history,
          bounds,
        }).then((blob) => {
          call('onOk', blob, bounds);
          reset();
        });
      } else {
        const targetBounds = {
          x: 0,
          y: 0,
          width,
          height,
        };
        composeImage({
          image,
          width,
          height,
          history,
          bounds: targetBounds,
        }).then((blob) => {
          call('onOk', blob, targetBounds);
          reset();
        });
      }
    },
    [image, history, bounds, width, height, call, reset],
  );

  const onContextMenu = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button !== 2) {
        return;
      }
      e.preventDefault();
      call('onCancel');
      reset();
    },
    [call, reset],
  );

  // url变化，重置截图区域
  // biome-ignore lint/correctness/useExhaustiveDependencies: useLayoutEffect only cares about url
  useLayoutEffect(() => {
    reset();
  }, [url]);

  return (
    <ScreenshotsContext.Provider value={{ store, dispatcher }}>
      <div
        className={classNames.join(' ')}
        style={{ width, height }}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
      >
        <ScreenshotsBackground />
        <ScreenshotsCanvas ref={canvasContextRef} />
        <ScreenshotsOperations />
      </div>
    </ScreenshotsContext.Provider>
  );
}
