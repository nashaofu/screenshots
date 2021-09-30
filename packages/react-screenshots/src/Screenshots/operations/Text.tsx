import React, { ReactElement } from 'react'
import ScreenshotsButton from '../ScreenshotsButton'

function Button (): ReactElement {
  return <ScreenshotsButton title='文本' icon='icon-text' />
}

export default class Text {
  static Button = Button
}
