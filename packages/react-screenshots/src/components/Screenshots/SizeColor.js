import React from 'react'
import Size from './Size'
import Color from './Color'

export default ({ size, color, isFont, onSizeChange, onColorChange }) => {
  return (
    <div className="screenshots-sizecolor">
      <Size isFont={isFont} value={size} onChange={onSizeChange} />
      <Color value={color} onChange={onColorChange} />
    </div>
  )
}
