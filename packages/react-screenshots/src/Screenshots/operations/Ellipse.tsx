import React, { ReactElement, useCallback, useState } from 'react'
import useCursor from '../hooks/useCursor'
import useOperation from '../hooks/useOperation'
import ScreenshotsButton from '../ScreenshotsButton'
import ScreenshotsSizeColor from '../ScreenshotsSizeColor'

export default function EllipseButton (): ReactElement {
  const [operation, operationDispatcher] = useOperation()
  const [, cursorDispatcher] = useCursor()
  const checked = operation === 'EllipseButton'
  const [size, setSize] = useState(3)
  const [color, setColor] = useState('#ee5126')

  const onClick = useCallback(() => {
    operationDispatcher.set('EllipseButton')
    cursorDispatcher.set('default')
  }, [operationDispatcher, cursorDispatcher])

  return (
    <ScreenshotsButton
      title='椭圆'
      icon='icon-ellipse'
      checked={checked}
      onClick={onClick}
      option={<ScreenshotsSizeColor size={size} color={color} onSizeChange={setSize} onColorChange={setColor} />}
    />
  )
}
