import React from 'react'
import Action from './action'
import SizeColor from '../SizeColor'

export default class Arrow extends Action {
  static title = '箭头'

  static type = 'arrow'

  static icon = 'screenshots-icon-arrow'

  arrow = null
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

  get EditPointersResize () {
    return {
      start: (x, y, x1, y1, x2, y2) => ({ x1: x, y1: y, x2, y2 }),
      end: (x, y, x1, y1, x2, y2) => ({ x1, y1, x2: x, y2: y })
    }
  }

  constructor (props) {
    super(props)
    props.setContext({ cursor: 'crosshair' })
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
      this.arrow = {
        type: 'arrow',
        history: [
          {
            size: border,
            color,
            x1: x,
            y1: y,
            x2: x,
            y2: y,
            path: new Path2D()
          }
        ],
        draw: this.draw,
        ready: true
      }
    } else {
      this.isEdit = true
      this.arrow = context.stack[this.inStroke.index]
      this.setEditPointers(this.arrow.history[0])
      this.onSizeChange(this.arrow.history[0].size)
      this.onColorChange(this.arrow.history[0].color)

      const record = { ...this.arrow.history[0], path: new Path2D(), ready: true } // 新增一条待进栈的记录
      this.arrow.history.unshift(record)

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
      if (this.arrow.ready) {
        delete this.arrow.ready
        this.arrow.history[0].undoPriority = this.setUndoPriority(context)
        context.stack.push(this.arrow)
      }

      if (x < 0) x = 0
      if (y < 0) y = 0
      if (x > width) x = width
      if (y > height) y = height
      const recent = this.arrow.history[0]
      recent.x2 = x
      recent.y2 = y
      setContext({ stack: [...context.stack] })
    } else {
      const { action, index } = pointInStroke

      if (this.drag.isDown) { // 拖拽画图
        const last = this.arrow.history[1]
        const now = this.arrow.history[0]
        delete now.ready // 使用记录
        const translateX = x - this.drag.point.x
        const translateY = y - this.drag.point.y
        now.x1 = last.x1 + translateX
        now.y1 = last.y1 + translateY
        now.x2 = last.x2 + translateX
        now.y2 = last.y2 + translateY
        this.setEditPointers(now)
        return
      }

      if (this.resize.isDown) { // resize画图
        const now = this.arrow.history[0]
        delete now.ready // 使用记录
        const resize = this.EditPointersResize[this.resize.name]
        const { x1, y1, x2, y2 } = resize(x, y, now.x1, now.y1, now.x2, now.y2)
        now.x1 = x1
        now.y1 = y1
        now.x2 = x2
        now.y2 = y2
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
      this.arrow = null
      this.isNew = false
    } else {
      // 路径操作的取消
      if (this.todo) {
        if (this.arrow.history[0].ready) {
          this.arrow.history.shift()
        }
        this.arrow.history[0].undoPriority = this.setUndoPriority(context)

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
    const { size, color, x1, x2, y1, y2 } = action
    ctx.lineCap = 'round'
    ctx.lineJoin = 'butt'
    ctx.fillStyle = color
    ctx.strokeStyle = color
    const path = new Path2D()
    const dx = x2 - x1
    const dy = y2 - y1

    // 等边三角形边和高
    const hypotenuse = Math.sqrt(dx * dx + dy * dy)
    const side = hypotenuse > size * 10 ? size * 3 : hypotenuse / 3.5 // 缩放
    const height = side / 2 * Math.sqrt(3)
    const arcCenter = {
      x: x2 + Math.sqrt(height * height * dx * dx / (dx * dx + dy * dy)) * (x2 > x1 ? -1 : 1),
      y: y2 + Math.sqrt(height * height * dy * dy / (dx * dx + dy * dy)) * (y2 > y1 ? -1 : 1)
    }
    // const arcRadius = Math.sqrt(side / 2)
    const arcRadius = side / 4
    const angle = Math.atan2(dy, dx)
    const PVAngle = angle + Math.PI / 2

    path.arc(x1, y1, size / 4, PVAngle, PVAngle + Math.PI)
    path.arc(arcCenter.x, arcCenter.y, arcRadius, PVAngle + Math.PI, PVAngle)
    ctx.fill(path)

    path.moveTo(x2, y2)
    path.lineTo(
      x2 - side * Math.cos(angle + Math.PI / 6),
      y2 - side * Math.sin(angle + Math.PI / 6)
    )
    path.lineTo(
      x2 - side * Math.cos(angle - Math.PI / 6),
      y2 - side * Math.sin(angle - Math.PI / 6)
    )
    path.closePath()
    ctx.lineWidth = 1
    ctx.stroke(path)
    ctx.fill(path)

    action.path = path
  }

  setEditPointers = record => {
    let editPointers = []
    if (record) {
      let { size, color, x1, x2, y1, y2 } = record
      size = size === 3 ? 6 : size
      editPointers = [
        {
          name: 'start',
          x: x1,
          y: y1,
          cursor: 'nesw-resize',
          size,
          color
        },
        {
          name: 'end',
          x: x2,
          y: y2,
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
      if (this.arrow.history[0][type] === value) return
      const { context } = this.props
      const record = {
        ...this.arrow.history[0],
        path: new Path2D(),
        undoPriority: this.setUndoPriority(context)
      }
      record[type] = value
      this.arrow.history.unshift(record)
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
