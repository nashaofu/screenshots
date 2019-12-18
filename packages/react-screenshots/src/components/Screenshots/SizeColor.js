import React from 'react'
import Size from './Size'
import Color from './Color'

export default ({ size, color, onSizeChange, onColorChange }) => {
  return (
    <div className="screenshots-sizecolor">
      <Size value={size} onChange={onSizeChange} />
      <Color value={color} onChange={onColorChange} />
    </div>
  )
}
