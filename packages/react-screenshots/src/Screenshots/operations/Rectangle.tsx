import React, { ReactElement, useCallback, useState } from 'react'
import useCursor from '../hooks/useCursor'
import useOperation from '../hooks/useOperation'
import ScreenshotsButton from '../ScreenshotsButton'
import ScreenshotsSizeColor from '../ScreenshotsSizeColor'

export default function RectangleButton (): ReactElement {
  const [operation, operationDispatcher] = useOperation()
  const [, cursorDispatcher] = useCursor()
  const checked = operation === 'RectangleButton'
  const [size, setSize] = useState(3)
  const [color, setColor] = useState('#ee5126')

  const onClick = useCallback(() => {
    operationDispatcher.set('RectangleButton')
    cursorDispatcher.set('default')
  }, [operationDispatcher, cursorDispatcher])

  return (
    <ScreenshotsButton
      title='矩形'
      icon='icon-rectangle'
      checked={checked}
      onClick={onClick}
      option={<ScreenshotsSizeColor size={size} color={color} onSizeChange={setSize} onColorChange={setColor} />}
    />
  )
}
