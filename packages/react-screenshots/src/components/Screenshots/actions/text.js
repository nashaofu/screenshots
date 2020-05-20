import React, { useEffect, useRef } from 'react'
import Action from './action'
import SizeColor from '../SizeColor'
import ReactDOM from 'react-dom'

function RenderTextarea ({ x, y, size, color, value, cursor, onFocus, onBlur, onMouseDown }) {
  const textareaRef = useRef(null)
  useEffect(() => {
    if (!value) {
      textareaRef.current.focus()
    }
  })
  return (
    <div
      ref={textareaRef}
      className="screenshots-textarea"
      contentEditable="true"
      spellCheck="false"
      style={{
        transform: [`translate(${x - 12}px, ${y - 11}px)`], // 12, 11是试出来的~~，64字体以上有一点点偏移
        cursor,
        color,
        fontSize: size
      }}
      onMouseDown={onMouseDown}
      onFocus={onFocus}
      onBlur={onBlur}
      suppressContentEditableWarning
    >
      {value}
    </div>
  )
}

export default class Text extends Action {
  static title = '文本'

  static type = 'text'

  static icon = 'screenshots-icon-text'

  text = null
  $textarea = null
  isFocus = false
  isNew = false
  canBlur = false

  mouseDownTimer = null

  inStroke = {
    is: false,
    index: -1
  }

  drag = {
    isDown: false,
    done: false, // 用于mouseup判断 是否移动了
    point: null,
    textWrap: null
  }

  constructor (props) {
    super(props)
    props.setContext({ cursor: 'default' })
  }

  beforeUnMount () {
    if (this.$textarea && !this.isFocus) {
      this.props.viewer.removeChild(this.$textarea)
      this.$textarea = null
      if (this.text.canDraw === false) {
        this.text.canDraw = true
        this.draw(this.props.ctx, this.text.history[0], this.text) // 针对ok和save重新绘制一下
      }
      this.text = null
    } else if (this.$textarea && this.isFocus) {
      this.canBlur = true
      this.$textarea.firstChild.blur()
    }
  }

  mousedown = (e, { el, viewer, ctx, context, setContext }) => {
    const { left, top, width, height } = el.getBoundingClientRect()
    const { font, color } = context
    const x = e.clientX - left
    const y = e.clientY - top

    if (!this.text) {
      if (!this.inStroke.is) {
        this.isNew = true
        this.text = {
          type: 'text',
          history: [
            {
              size: font,
              color,
              x,
              y,
              value: ''
            }
          ],
          undoCB: this.undoCB,
          canDraw: true,
          draw: this.draw
        }

        const textWrap = document.createElement('div')
        viewer.appendChild(textWrap)
        ReactDOM.render(
          <RenderTextarea
            {...this.text.history[0]}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onMouseDown={this.onTextMouseDown}
          />,
          textWrap
        )
        this.$textarea = textWrap
      } else {
        this.text = context.stack[this.inStroke.index]
        this.text.canDraw = false

        const textWrap = document.createElement('div')
        viewer.appendChild(textWrap)
        ReactDOM.render(
          <RenderTextarea
            {...this.text.history[0]}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onMouseDown={this.onTextMouseDown}
            cursor="grabbing"
          />,
          textWrap
        )
        this.$textarea = textWrap

        const record = { ...this.text.history[0], ready: true } // 新增一条待进栈的记录
        this.text.history.unshift(record)

        this.drag.isDown = true
        this.drag.textWrap = textWrap
        this.drag.point = { x, y }

        setContext({ stack: [...context.stack] })
      }
    } else {
      if (this.isFocus === false) {
        this.canBlur = true
        this.$textarea.firstChild.focus() // fuck???
      } else {
        if (x > 0 && x < width && y > 0 && y < height) {
          this.canBlur = true
        }
      }
    }
  }

  mousemove = (e, { el, viewer, ctx, context, setContext }, pointInStroke) => {
    const { left, top } = el.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top

    const { action, index } = pointInStroke

    if (this.drag.isDown) { // 拖拽text
      const last = this.text.history[1]
      const now = this.text.history[0]
      const translateX = x - this.drag.point.x
      const translateY = y - this.drag.point.y
      delete now.ready // 使用记录
      now.x = last.x + translateX
      now.y = last.y + translateY

      const { left, top, width, height } = e.target.getBoundingClientRect()
      now.domClientRect = { left, top, width, height }
      ReactDOM.render(
        <RenderTextarea
          {...this.text.history[0]}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          onMouseDown={this.onTextMouseDown}
          cursor="grabbing"
        />,
        this.drag.textWrap
      )
      this.drag.done = true
      return
    }

    if (action) {
      this.inStroke.is = true
      this.inStroke.index = index
      setContext({ cursor: 'grab' })
    } else {
      this.inStroke.is = false
      setContext({ cursor: 'default' })
    }
  }

  mouseup = (e, { el, viewer, ctx, context, setContext }) => {
    if (this.text) {
      if (this.text.history[0].ready) { // 框未拖动
        this.text.history.shift()
      }
      if (this.drag.isDown) {
        this.drag.isDown = false
        if (this.drag.done) {
          this.drag.done = false
          this.text.history[0].undoPriority = this.setUndoPriority(context)
        }
        ReactDOM.render(
          <RenderTextarea
            {...this.text.history[0]}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onMouseDown={this.onTextMouseDown}
            cursor="grab"
          />,
          this.drag.textWrap
        )
      }
    }
  }

  draw = (ctx, { size, color, x, y, value }, { canDraw }) => {
    if (canDraw === false) {
      return
    }
    const textArr = value.split('')
    let textRender = ''
    let _y = y - 2
    let line = 1
    const textDraw = (ctx, value, x, y) => {
      ctx.lineWidth = 5
      ctx.strokeStyle = '#ccc'
      ctx.strokeText(value, x, y)
      ctx.lineWidth = 4
      ctx.strokeStyle = '#fff'
      ctx.strokeText(value, x, y)
      ctx.fillText(value, x, y)
    }
    const areaWidth = 300 - 20

    ctx.fillStyle = color
    ctx.textBaseline = 'top'
    ctx.font = `${size}px Microsoft YaHei`

    textArr.forEach(t => {
      const cur = textRender + t
      const metricsWidth = ctx.measureText(cur).width
      if (metricsWidth >= areaWidth) {
        textDraw(ctx, textRender, x, _y)
        textRender = t
        _y += size // 先粗糙处理，行高计算参考https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
        line = line + 1
      } else {
        textRender = cur
      }
    })
    textDraw(ctx, textRender, x, _y)
  }

  onTextMouseDown = e => {
    if (!this.isFocus) {
      if (!this.mouseDownTimer) {
        this.mouseDownTimer = setTimeout(() => {
          this.mouseDownTimer = null
        }, 300)
        const { el } = this.props
        const { left, top } = el.getBoundingClientRect()
        const x = e.clientX - left
        const y = e.clientY - top
        const record = { ...this.text.history[0], ready: true } // 新增一条待进栈的记录
        this.text.history.unshift(record)

        this.drag.isDown = true
        this.drag.point = { x, y }
        e.preventDefault()
      } else {
        this.mouseDownTimer = null
        e.preventDefault()
        ReactDOM.render(
          <RenderTextarea
            {...this.text.history[0]}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onMouseDown={this.onTextMouseDown}
            cursor="text"
          />,
          this.drag.textWrap
        )
        const dom = e.target
        var range = document.createRange()
        var sel = window.getSelection()
        range.setStart(dom.childNodes[0], dom.innerText.length)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
        dom.focus()
      }
    }
  }

  onFocus = e => {
    this.isFocus = true
  }

  onBlur = e => {
    const dom = e.target

    if (!this.canBlur) { // canBlur由mousedown控制
      dom.focus()
      return
    }
    const { viewer, context, setContext } = this.props
    const { left, top, width, height } = dom.getBoundingClientRect()

    this.isFocus = false
    if (this.isNew === true) {
      // 新增
      if (e.target.innerText) {
        this.text.history[0].value = e.target.innerText
        this.text.history[0].domClientRect = { left, top, width, height }
        this.text.history[0].undoPriority = this.setUndoPriority(context)

        const { stack } = context
        stack.push(this.text)
        setContext({ stack: [...stack] })
      }
      this.isNew = false
    } else {
      // 编辑
      if (e.target.innerText) {
        this.text.canDraw = true
        const record = { ...this.text.history[0] } // 新增一条待进栈的记录
        if (record.value !== e.target.innerText) { // 值改变了
          this.text.history.unshift(record)
        }

        this.text.history[0].value = e.target.innerText
        this.text.history[0].domClientRect = { left, top, width, height }
        this.text.history[0].undoPriority = this.setUndoPriority(context)
      } else {
        context.stack.splice(this.inStroke.index, 1)
      }
      const { stack } = context
      setContext({ stack: [...stack] })
    }
    viewer.removeChild(dom.parentNode)
    this.$textarea = null
    this.text = null
    this.canBlur = false
  }

  undoCB = (priority, action) => {
    const { viewer } = this.props
    if (action.$textarea && !action.isFocus && action.text === priority) {
      if (priority.history.length) {
        ReactDOM.render(
          <RenderTextarea
            {...priority.history[0]}
            onBlur={action.onBlur}
            onFocus={action.onFocus}
            onMouseDown={action.onTextMouseDown}
            cursor="grabbing"
          />,
          action.drag.textWrap
        )
      } else {
        viewer.removeChild(action.$textarea)
        action.$textarea = null
        action.text = null
      }
    }
  }

  onSizeChange = size => {
    this.props.setContext({
      font: +size
    })
    this.props.context.font = +size
    this.sizeColorEdit('size', +size)
  }

  onColorChange = color => {
    this.props.setContext({
      color
    })
    this.props.context.color = color
    this.sizeColorEdit('color', color)
  }

  sizeColorEdit = (type, value) => {
    if (this.$textarea) {
      const { context } = this.props
      if (this.text.history[0][type] === value) return
      const cursor = this.isFocus ? 'text' : 'grab'
      if (this.text.history[0].value) {
        const record = {
          ...this.text.history[0],
          undoPriority: this.setUndoPriority(context)
        }
        record[type] = value
        this.text.history.unshift(record)
      } else {
        this.text.history[0][type] = value
      }
      ReactDOM.render(
        <RenderTextarea
          {...this.text.history[0]}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          onMouseDown={this.onTextMouseDown}
          cursor={cursor}
        />,
        this.$textarea
      )
    }
  }

  render () {
    const { font, color } = this.props.context
    return (
      <SizeColor
        isFont
        size={font}
        color={color}
        onSizeChange={this.onSizeChange}
        onColorChange={this.onColorChange}
      />
    )
  }
}
