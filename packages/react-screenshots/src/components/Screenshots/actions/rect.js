import React from 'react'
import Action from './action'
import SizeColor from '../SizeColor'

export default class Rect extends Action {
  static title = '矩形'

  static icon = 'screenshots-icon-rect'

  rect = null

  constructor (props) {
    super(props)
    props.setContext({ cursor: 'crosshair' })
  }

  mousedown = (e, { el, ctx, context, setContext }) => {
    const { left, top } = el.getBoundingClientRect()
    const { size, color } = this.state
    this.rect = {
      size,
      color,
      x1: e.clientX - left,
      y1: e.clientY - top,
      x2: e.clientX - left,
      y2: e.clientY - top,
      draw: this.draw
    }
    const { stack } = context
    stack.push(this.rect)
    setContext({ stack: [...stack] })
  }

  mousemove = (e, { el, ctx, context, setContext }) => {
    if (this.rect) {
      const { left, top, width, height } = el.getBoundingClientRect()
      let x = e.clientX - left
      let y = e.clientY - top
      if (x < 0) x = 0
      if (y < 0) y = 0
      if (x > width) x = width
      if (y > height) y = height
      this.rect.x2 = x
      this.rect.y2 = y
      setContext({ stack: [...context.stack] })
    }
  }

  mouseup = (e, { el, ctx, context, setContext }) => {
    if (this.rect) {
      this.rect = null
    }
  }

  draw (ctx, { size, color, x1, x2, y1, y2 }) {
    ctx.lineCap = 'butt'
    ctx.lineJoin = 'miter'
    ctx.lineWidth = size
    ctx.strokeStyle = color
    if (x1 > x2) {
      const x = x1
      x1 = x2
      x2 = x
    }
    if (y1 > y2) {
      const y = y1
      y1 = y2
      y2 = y
    }
    ctx.beginPath()
    ctx.rect(x1, y1, x2 - x1, y2 - y1)
    ctx.stroke()
  }

  onSizeChange = size => {
    this.setState({
      size
    })
  }

  onColorChange = color => {
    this.setState({
      color
    })
  }

  render () {
    const { size, color } = this.state
    return (
      <SizeColor
        size={size}
        color={color}
        onSizeChange={this.onSizeChange}
        onColorChange={this.onColorChange}
      />
    )
  }
}
