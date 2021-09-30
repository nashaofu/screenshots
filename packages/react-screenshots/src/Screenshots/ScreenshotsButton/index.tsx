import React, { ReactElement, ReactNode, useCallback } from 'react'
import ScreenshotsOption from '../ScreenshotsOption'
import './index.less'

export interface ScreenshotsButtonProps {
  title: string
  icon: string
  checked?: boolean
  disabled?: boolean
  option?: ReactNode
  onClick?: (e: PointerEvent) => unknown
}

export default function ScreenshotsButton ({
  title,
  icon,
  checked,
  disabled,
  option,
  onClick
}: ScreenshotsButtonProps): ReactElement {
  const classNames = ['screenshots-button']

  const onButtonClick = useCallback(
    e => {
      if (disabled || !onClick) {
        return
      }
      onClick(e)
    },
    [disabled, onClick]
  )

  if (checked) {
    classNames.push('screenshots-button-checked')
  }
  if (disabled) {
    classNames.push('screenshots-button-disabled')
  }

  return (
    <ScreenshotsOption open={checked} content={option}>
      <div className={classNames.join(' ')} title={title} onClick={onButtonClick}>
        <span className={icon} />
      </div>
    </ScreenshotsOption>
  )
}
