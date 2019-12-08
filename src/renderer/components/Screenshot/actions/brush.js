import React from 'react'
import Action from './action'
import SizeColor from '../SizeColor'

export default class Brush extends Action {
  static title = '涂鸦'

  static icon = 'screenshot-icon-brush'

  line = null

  constructor (props) {
    super(props)
    props.setContext({ cursor: 'crosshair' })
  }

  mousedown = (e, { el, ctx, context, setContext }) => {
    const { left, top } = el.getBoundingClientRect()
    const { size, color } = this.state
    this.line = {
      size,
      color,
      point: [{ x: e.clientX - left, y: e.clientY - top }],
      draw: this.draw
    }
    const { stack } = context
    stack.push(this.line)
    setContext({ stack: [...stack] })
  }

  mousemove = (e, { el, ctx, context, setContext }) => {
    if (this.line) {
      const { left, top } = el.getBoundingClientRect()
      this.line.point.push({ x: e.clientX - left, y: e.clientY - top })
      setContext({ stack: [...context.stack] })
    }
  }

  mouseup = (e, { el, ctx, context, setContext }) => {
    if (this.line) {
      this.line = null
    }
  }

  draw (ctx, { size, color, point }) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = size
    ctx.strokeStyle = color
    ctx.beginPath()
    point.forEach((it, index) => {
      if (index === 0) {
        ctx.moveTo(it.x, it.y)
      } else {
        ctx.lineTo(it.x, it.y)
      }
    })
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
