import React from 'react'
import Action from './action'
import SizeColor from '../SizeColor'

export default class Arrow extends Action {
  static title = '箭头'

  static icon = 'screenshots-icon-arrow'

  arrow = null

  constructor (props) {
    super(props)
    props.setContext({ cursor: 'crosshair' })
  }

  mousedown = (e, { el, ctx, context, setContext }) => {
    const { left, top } = el.getBoundingClientRect()
    const { size, color } = this.state
    this.arrow = {
      size,
      color,
      x1: e.clientX - left,
      y1: e.clientY - top,
      x2: e.clientX - left,
      y2: e.clientY - top,
      draw: this.draw
    }
    const { stack } = context
    stack.push(this.arrow)
    setContext({ stack: [...stack] })
  }

  mousemove = (e, { el, ctx, context, setContext }) => {
    if (this.arrow) {
      const { left, top, width, height } = el.getBoundingClientRect()
      let x = e.clientX - left
      let y = e.clientY - top
      if (x < 0) x = 0
      if (y < 0) y = 0
      if (x > width) x = width
      if (y > height) y = height
      this.arrow.x2 = x
      this.arrow.y2 = y
      setContext({ stack: [...context.stack] })
    }
  }

  mouseup = (e, { el, ctx, context, setContext }) => {
    if (this.arrow) {
      this.arrow = null
    }
  }

  draw (ctx, { size, color, x1, x2, y1, y2 }) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'bevel'
    ctx.lineWidth = size
    ctx.strokeStyle = color
    const dx = x2 - x1
    const dy = y2 - y1
    // 箭头头部长度
    const length = size * 3
    const angle = Math.atan2(dy, dx)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(
      x2 - length * Math.cos(angle - Math.PI / 6),
      y2 - length * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - length * Math.cos(angle + Math.PI / 6),
      y2 - length * Math.sin(angle + Math.PI / 6)
    )
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
