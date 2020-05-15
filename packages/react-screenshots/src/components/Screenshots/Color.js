import React from 'react'

export default ({ value, onChange }) => {
  const colors = [
    '#ee5126',
    '#fceb4d',
    '#90e746',
    '#51c0fa',
    '#7a7a7a',
    '#ffffff'
  ]
  return (
    <div className="screenshots-color">
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
          >
            <div className="screenshots-color-hook">
              <div className="screenshots-color-hook-symbol" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
