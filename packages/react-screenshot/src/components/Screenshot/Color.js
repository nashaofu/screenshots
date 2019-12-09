import React from 'react'

export default ({ value, onChange }) => {
  const colors = [
    '#ee5126',
    '#51c0fa',
    '#90e746',
    '#fceb4d',
    '#7a7a7a',
    '#ffffff'
  ]
  return (
    <div className="screenshot-color">
      {colors.map(color => {
        const classNames = ['screenshot-color-item']
        if (color === value) {
          classNames.push('screenshot-color-active')
        }
        return (
          <div
            key={color}
            className={classNames.join(' ')}
            style={{ backgroundColor: color }}
            onClick={() => onChange && onChange(color)}
          >
            <div className="screenshot-color-hook">
              <div className="screenshot-color-hook-symbol" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
