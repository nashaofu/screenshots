import React, { ReactElement } from 'react'
import './index.less'

export interface ColorProps {
  value: string
  onChange: (value: string) => void
}

export default function ScreenshotsColor ({ value, onChange }: ColorProps): ReactElement {
  const colors = ['#ee5126', '#fceb4d', '#90e746', '#51c0fa', '#7a7a7a', '#ffffff']
  return (
    <div className='screenshots-color'>
      {colors.map(color => {
        const classNames = ['screenshots-color-item']
        if (color === value) {
          classNames.push('screenshots-color-active')
        }
        return (
          <div
            key={color}
            className={classNames.join(' ')}
            style={{ backgroundColor: color }}
            onClick={() => onChange && onChange(color)}
          />
        )
      })}
    </div>
  )
}
