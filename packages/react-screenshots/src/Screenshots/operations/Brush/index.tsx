import type { ReactElement } from 'react';
import { useCallback, useRef, useState } from 'react';
import useCanvasContextRef from '../../hooks/useCanvasContextRef';
import useCanvasPointerDown from '../../hooks/useCanvasPointerDown';
import useCanvasPointerMove from '../../hooks/useCanvasPointerMove';
import useCanvasPointerUp from '../../hooks/useCanvasPointerUp';
import useCursor from '../../hooks/useCursor';
import useDrawSelect from '../../hooks/useDrawSelect';
import useHistory from '../../hooks/useHistory';
import useLang from '../../hooks/useLang';
import useOperation from '../../hooks/useOperation';
import ScreenshotsButton from '../../ScreenshotsButton';
import ScreenshotsSizeColor from '../../ScreenshotsSizeColor';
import type { HistoryItemEdit, HistoryItemSource, Point } from '../../types';
import { HistoryItemType } from '../../types';
import { isHit } from '../utils';
import draw from './draw';

export interface BrushData {
  size: number;
  color: string;
  points: Point[];
}

export interface BrushEditData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function Brush(): ReactElement {
  const lang = useLang();
  const [, cursorDispatcher] = useCursor();
  const [operation, operationDispatcher] = useOperation();
  const canvasContextRef = useCanvasContextRef();
  const [history, historyDispatcher] = useHistory();
  const [size, setSize] = useState(3);
  const [color, setColor] = useState('#ee5126');
  const brushRef = useRef<HistoryItemSource<BrushData, BrushEditData> | null>(
    null,
  );
  const brushEditRef = useRef<HistoryItemEdit<BrushEditData, BrushData> | null>(
    null,
  );

  const checked = operation === 'Brush';

  const selectBrush = useCallback(() => {
    operationDispatcher.set('Brush');
    cursorDispatcher.set('default');
  }, [operationDispatcher, cursorDispatcher]);

  const onSelectBrush = useCallback(() => {
    if (checked) {
      return;
    }
    selectBrush();
    historyDispatcher.clearSelect();
  }, [checked, selectBrush, historyDispatcher]);

  const onDrawSelect = useCallback(
    (action: HistoryItemSource<unknown, unknown>, e: PointerEvent) => {
      if (action.name !== 'Brush') {
        return;
      }

      selectBrush();

      brushEditRef.current = {
        type: HistoryItemType.Edit,
        data: {
          x1: e.clientX,
          y1: e.clientY,
          x2: e.clientX,
          y2: e.clientY,
        },
        source: action as HistoryItemSource<BrushData, BrushEditData>,
      };

      historyDispatcher.select(action);
    },
    [selectBrush, historyDispatcher],
  );

  const onPointerDown = useCallback(
    (e: PointerEvent): void => {
      if (!checked || brushRef.current || !canvasContextRef.current) {
        return;
      }

      const { left, top } =
        canvasContextRef.current.canvas.getBoundingClientRect();

      brushRef.current = {
        name: 'Brush',
        type: HistoryItemType.Source,
        data: {
          size,
          color,
          points: [
            {
              x: e.clientX - left,
              y: e.clientY - top,
            },
          ],
        },
        editHistory: [],
        draw,
        isHit,
      };
    },
    [checked, canvasContextRef, size, color],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent): void => {
      if (!checked || !canvasContextRef.current) {
        return;
      }

      if (brushEditRef.current) {
        brushEditRef.current.data.x2 = e.clientX;
        brushEditRef.current.data.y2 = e.clientY;
        if (history.top !== brushEditRef.current) {
          brushEditRef.current.source.editHistory.push(brushEditRef.current);
          historyDispatcher.push(brushEditRef.current);
        } else {
          historyDispatcher.set(history);
        }
      } else if (brushRef.current) {
        const { left, top } =
          canvasContextRef.current.canvas.getBoundingClientRect();

        brushRef.current.data.points.push({
          x: e.clientX - left,
          y: e.clientY - top,
        });

        if (history.top !== brushRef.current) {
          historyDispatcher.push(brushRef.current);
        } else {
          historyDispatcher.set(history);
        }
      }
    },
    [checked, history, canvasContextRef, historyDispatcher],
  );

  const onPointerUp = useCallback((): void => {
    if (!checked) {
      return;
    }

    if (brushRef.current) {
      historyDispatcher.clearSelect();
    }

    brushRef.current = null;
    brushEditRef.current = null;
  }, [checked, historyDispatcher]);

  useDrawSelect(onDrawSelect);
  useCanvasPointerDown(onPointerDown);
  useCanvasPointerMove(onPointerMove);
  useCanvasPointerUp(onPointerUp);

  return (
    <ScreenshotsButton
      title={lang.operation_brush_title}
      icon="icon-brush"
      checked={checked}
      onClick={onSelectBrush}
      option={
        <ScreenshotsSizeColor
          size={size}
          color={color}
          onSizeChange={setSize}
          onColorChange={setColor}
        />
      }
    />
  );
}
