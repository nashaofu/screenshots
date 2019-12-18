import React, { useEffect, useRef } from 'react'
import Action from './action'
import SizeColor from '../SizeColor'
import ReactDOM from 'react-dom'

function RenderTextarea ({ x, y, value, color, size, onChange }) {
  const textareaEl = useRef(null)
  useEffect(() => {
    console.dir(textareaEl.current)
    textareaEl.current.focus()
  })
  return (
    <textarea
      ref={textareaEl}
      className="screenshots-textarea"
      style={{ left: x, top: y, color, fontSize: size * 3 }}
      value={value}
      onBlur={onChange}
    />
  )
}

export default class Text extends Action {
  static title = '文本'

  static icon = 'screenshots-icon-text'

  text = null

  $textarea = null

  constructor (props) {
    super(props)
    props.setContext({ cursor: 'default' })
  }

  mousedown = (e, { el, ctx, context, setContext }) => {
    const { left, top } = el.getBoundingClientRect()
    const { size, color } = this.state
    this.text = {
      size,
      color,
      x: e.clientX - left,
      y: e.clientY - top,
      value: '',
      draw: this.draw
    }
    const { stack } = context
    stack.push(this.text)
    setContext({ stack: [...stack] })
  }

  mouseup = (e, { el, viewer, ctx, context, setContext }) => {
    if (this.text) {
      this.$textarea = document.createElement('div')
      viewer.appendChild(this.$textarea)
      ReactDOM.render(
        <RenderTextarea {...this.text} onChange={this.onTextChange} />,
        this.$textarea
      )
    }
  }

  draw (ctx, { size, color, x, y, value }) {
    ctx.fillStyle = color
    ctx.textBaseline = 'top'
    ctx.font = `${size * 4}px serif`
    ctx.fillText(value, x, y)
  }

  onTextChange = e => {
    this.text.value = e.target.value
    const { stack } = this.props.context
    this.props.setContext({ stack: [...stack] })
    ReactDOM.render(
      <RenderTextarea {...this.text} onChange={this.onTextChange} />,
      this.$textarea
    )
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
