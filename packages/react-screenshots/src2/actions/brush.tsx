import React from 'react'
import Action from './action'
import SizeColor from '../SizeColor'

export default class Brush extends Action {
  static title = '涂鸦'

  static type = 'brush'

  static icon = 'screenshots-icon-brush'

  brush = null
  isNew = false
  isEdit = false
  todo = null

  inStroke = {
    is: false,
    index: -1
  }

  drag = {
    isDown: false,
    point: null
  }

  resize = {
    isDown: false,
    name: ''
  }

  constructor (props) {
    super(props)
    props.setContext({ cursor: 'crosshair' })
  }

  get EditPointersResize () {
    return {
      start: (x, y, point) => {
        point.unshift({ x, y })
        return point
      },
      end: (x, y, point) => {
        point.push({ x, y })
        return point
      }
    }
  }

  beforeUnMount () {
    this.props.setContext({ editPointers: [] })
  }

  mousedown = (e, { el, ctx, context, setContext }) => {
    const { left, top } = el.getBoundingClientRect()
    const { border, color } = context
    const x = e.clientX - left
    const y = e.clientY - top

    if (!this.inStroke.is) {
      if (this.isEdit) {
        this.isEdit = false
        this.setEditPointers()
      }
      // 新增一条待进栈的路径
      this.isNew = true
      this.brush = {
        type: 'brush',
        history: [
          {
            size: border,
            color,
            point: [{ x, y }],
            path: new Path2D()
          }
        ],
        draw: this.draw,
        ready: true
      }
    } else {
      this.isEdit = true
      this.brush = context.stack[this.inStroke.index]
      this.setEditPointers(this.brush.history[0])
      this.onSizeChange(this.brush.history[0].size)
      this.onColorChange(this.brush.history[0].color)

      const record = {
        ...this.brush.history[0],
        point: [...this.brush.history[0].point],
        path: new Path2D(),
        ready: true
      } // 新增一条待进栈的记录
      this.brush.history.unshift(record)

      // resize准备
      if (this.todo === 'resize') {
        this.resize.isDown = true
      }

      // 拖拽准备
      if (this.todo === 'drag') {
        setContext({ cursor: 'grabbing' })
        this.drag.isDown = true
        this.drag.point = { x, y }
      }
    }
  }

  mousemove = (e, { el, ctx, context, setContext }, pointInStroke) => {
    const { left, top, width, height } = el.getBoundingClientRect()
    let x = e.clientX - left
    let y = e.clientY - top

    if (this.isNew) {
      // 开始move以后再推进栈
      if (this.brush.ready) {
        delete this.brush.ready
        this.brush.history[0].undoPriority = this.setUndoPriority(context)
        context.stack.push(this.brush)
      }

      if (x < 0) x = 0
      if (y < 0) y = 0
      if (x > width) x = width
      if (y > height) y = height
      const recent = this.brush.history[0]
      recent.point.push({ x, y })
      setContext({ stack: [...context.stack] })
    } else {
      const { action, index } = pointInStroke

      if (this.drag.isDown) { // 拖拽画图
        const last = this.brush.history[1]
        const now = this.brush.history[0]
        delete now.ready // 使用记录
        const translateX = x - this.drag.point.x
        const translateY = y - this.drag.point.y
        now.point = last.point.map(t => ({
          x: t.x + translateX,
          y: t.y + translateY
        }))
        this.setEditPointers(now)
        return
      }

      if (this.resize.isDown) { // resize画图
        const now = this.brush.history[0]
        delete now.ready // 使用记录
        const resize = this.EditPointersResize[this.resize.name]
        const point = resize(x, y, now.point)
        now.point = point
        this.setEditPointers(now)
        return
      }

      if (action) { // 鼠标触摸路径
        this.inStroke.is = true
        this.inStroke.index = index
        // 赋值todo
        if (this.isEdit) {
          // 找编辑点
          const hit = context.editPointers.find(t => {
            const assertX = x >= (t.x - t.size) && x <= (t.x + t.size)
            const assertY = y >= (t.y - t.size) && y <= (t.y + t.size)
            return assertX && assertY
          })
          if (hit) {
            this.todo = 'resize'
            setContext({ cursor: hit.cursor })
            this.resize.name = hit.name
            return
          }
        }
        this.todo = 'drag'
        setContext({ cursor: 'grab' })
      } else {
        this.inStroke.is = false
        this.todo = null
        setContext({ cursor: 'crosshair' })
      }
    }
  }

  mouseup = (e, { el, ctx, context, setContext }) => {
    if (this.isNew) { // 初次绘制取消
      this.brush = null
      this.isNew = false
    } else {
      // 路径操作的取消
      if (this.todo) {
        if (this.brush.history[0].ready) {
          this.brush.history.shift()
        }
        this.brush.history[0].undoPriority = this.setUndoPriority(context)

        if (this.resize.isDown) {
          this.resize.isDown = false
        }

        if (this.drag.isDown) {
          this.drag.isDown = false
          setContext({ cursor: 'grab' })
        }
      }
    }
  }

  draw (ctx, action) {
    const { size, color, point } = action
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = size
    ctx.strokeStyle = color
    const path = new Path2D()
    point.forEach((it, index) => {
      if (index === 0) {
        path.moveTo(it.x, it.y)
      } else {
        path.lineTo(it.x, it.y)
      }
    })
    ctx.stroke(path)
    action.path = path
  }

  setEditPointers = record => {
    let editPointers = []
    if (record) {
      let { size, color, point } = record
      size = size === 3 ? 6 : size
      editPointers = [
        {
          name: 'start',
          x: point[0].x,
          y: point[0].y,
          cursor: 'nesw-resize',
          size,
          color
        },
        {
          name: 'end',
          x: point[point.length - 1].x,
          y: point[point.length - 1].y,
          cursor: 'nesw-resize',
          size,
          color
        }
      ]
    }
    this.props.setContext({ editPointers })
  }

  onSizeChange = size => {
    this.props.setContext({
      border: size
    })
    this.props.context.border = size
    this.sizeColorEdit('size', size)
  }

  onColorChange = color => {
    this.props.setContext({
      color
    })
    this.props.context.color = color
    this.sizeColorEdit('color', color)
  }

  sizeColorEdit = (type, value) => {
    if (this.isEdit) {
      if (this.brush.history[0][type] === value) return
      const { context } = this.props
      const record = {
        ...this.brush.history[0],
        path: new Path2D(),
        undoPriority: this.setUndoPriority(context)
      }
      record[type] = value
      this.brush.history.unshift(record)
      this.setEditPointers(record)
    }
  }

  render () {
    const { border, color } = this.props.context
    return (
      <SizeColor
        size={border}
        color={color}
        onSizeChange={this.onSizeChange}
        onColorChange={this.onColorChange}
      />
    )
  }
}
