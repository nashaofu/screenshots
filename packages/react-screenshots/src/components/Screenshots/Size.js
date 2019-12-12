import React from 'react'

export default ({ value, onChange }) => {
  const sizes = [3, 6, 9]
  return (
    <div className="screenshots-size">
      {sizes.map(size => {
        const classNames = ['screenshots-size-item']
        if (size === value) {
          classNames.push('screenshots-size-active')
        }
        return (
          <div
            key={size}
            className={classNames.join(' ')}
            onClick={() => onChange && onChange(size)}
          >
            <div
              className="screenshots-size-pointer"
              style={{
                width: size * 1.8,
                height: size * 1.8
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
