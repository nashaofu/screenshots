import React from 'react'

export default ({ value, onChange }) => {
  const sizes = [3, 6, 9]
  return (
    <div className="screenshot-size">
      {sizes.map(size => {
        const classNames = ['screenshot-size-item']
        if (size === value) {
          classNames.push('screenshot-size-active')
        }
        return (
          <div
            key={size}
            className={classNames.join(' ')}
            onClick={() => onChange && onChange(size)}
          >
            <div
              className="screenshot-size-pointer"
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
