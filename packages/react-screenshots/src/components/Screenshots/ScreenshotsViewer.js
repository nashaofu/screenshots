import React, { PureComponent } from 'react'
import { withContext } from './ScreenshotsContext'
import ScreenshotsViewerBar from './ScreenshotsViewerBar'

@withContext
export default class ScreenshotsViewer extends PureComponent {
  // 画布对象上下文
  ctx = null

  // move和resize的标志
  actionType = null

  // 鼠标起始位置
  point = null

  // 保存初始的viewer数据
  viewer = null

  constructor (props) {
    super(props)
    this.viewerRef = React.createRef()
    this.canvasRef = React.createRef()
  }

  get size () {
    const { viewer } = this.props
    if (!viewer) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
    } else {
      const { x1, y1, x2, y2 } = viewer
      return {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1
      }
    }
  }

  get cursor () {
    if (this.props.cursor) {
      return this.props.cursor
    }

    if (this.props.action) {
      return 'default'
    }

    return 'move'
  }

  get pointers () {
    const pointers = [
      'top',
      'top-right',
      'right',
      'right-bottom',
      'bottom',
      'bottom-left',
      'left',
      'left-top'
    ]
    const { action } = this.props
    return action ? [] : pointers
  }

  get actionArgs () {
    const {
      image,
      viewer,
      width,
      height,
      stack,
      action,
      actions,
      cursor
    } = this.props
    return {
      viewer: this.viewerRef.current,
      el: this.canvasRef.current,
      ctx: this.ctx,
      context: {
        image,
        viewer,
        width,
        height,
        stack,
        action,
        actions,
        cursor
      },
      setContext: this.props.setContext,
      emit: this.props.onEmit
    }
  }

  componentDidMount () {
    this.ctx = this.canvasRef.current.getContext('2d')
    this.draw()
    window.addEventListener('mousemove', this.onMousemove)
    window.addEventListener('mouseup', this.onMouseup)
  }

  componentWillUnmount () {
    window.removeEventListener('mousemove', this.onMousemove)
    window.removeEventListener('mouseup', this.onMouseup)
  }

  componentDidUpdate () {
    this.draw()
  }

  draw = () => {
    const { image, width, height, stack } = this.props
    if (!image) return
    const { x, y, width: w, height: h } = this.size
    const rx = image.width / width
    const ry = image.height / height
    this.ctx.clearRect(0, 0, w, h)
    this.ctx.drawImage(image.el, x * rx, y * ry, w * rx, h * ry, 0, 0, w, h)
    stack.forEach(item => item.draw(this.ctx, item))
  }

  onMousedown = (e, type) => {
    const { viewer, action } = this.props
    if (!viewer) return
    if (!action) {
      if (!type || e.button !== 0) return
      this.actionType = type
      this.point = { x: e.clientX, y: e.clientY }
      this.viewer = { ...this.props.viewer }
    } else {
      if (typeof action.mousedown === 'function') {
        action.mousedown(e, this.actionArgs)
      }
    }
  }

  onMousemove = e => {
    const { viewer, action } = this.props
    if (!viewer) return
    if (!action) {
      if (this.actionType === 'move') {
        this.move(e)
      } else if (this.actionType) {
        this.resize(e)
      }
    } else {
      if (typeof action.mousemove === 'function') {
        action.mousemove(e, this.actionArgs)
      }
    }
  }

  onMouseup = e => {
    const { viewer, action } = this.props
    if (!viewer) return
    if (!action) {
      if (this.actionType) {
        this.actionType = null
        this.point = null
        this.viewer = null
      }
    } else {
      if (typeof action.mouseup === 'function') {
        action.mouseup(e, this.actionArgs)
      }
    }
  }

  move = e => {
    if (!this.viewer) return
    const x = e.clientX - this.point.x
    const y = e.clientY - this.point.y
    const { x1, y1, x2, y2 } = this.viewer
    this.props.onChange({
      x1: x1 + x,
      y1: y1 + y,
      x2: x2 + x,
      y2: y2 + y
    })
  }

  resize = e => {
    if (!this.viewer) return
    const x = e.clientX - this.point.x
    const y = e.clientY - this.point.y
    let { x1, y1, x2, y2 } = this.viewer
    switch (this.actionType) {
      case 'top':
        y1 += y
        break
      case 'top-right':
        x2 += x
        y1 += y
        break
      case 'right':
        x2 += x
        break
      case 'right-bottom':
        x2 += x
        y2 += y
        break
      case 'bottom':
        y2 += y
        break
      case 'bottom-left':
        x1 += x
        y2 += y
        break
      case 'left':
        x1 += x
        break
      case 'left-top':
        x1 += x
        y1 += y
        break
      default:
        return
    }
    this.props.onChange({
      x1,
      y1,
      x2,
      y2
    })
  }

  onAction = Action => {
    this.props.setContext({
      action: new Action(this.actionArgs)
    })
  }

  render () {
    const { x, y, width, height } = this.size
    return (
      <div
        className="screenshots-viewer"
        style={{
          display: this.props.viewer ? 'block' : 'none'
        }}
      >
        <div
          ref={this.viewerRef}
          className="screenshots-viewer-body"
          style={{
            left: x,
            top: y,
            width,
            height
          }}
        >
          <canvas ref={this.canvasRef} width={width} height={height} />
          <div
            className="screenshots-viewer-border"
            style={{
              cursor: this.cursor
            }}
            onMouseDown={e => this.onMousedown(e, 'move')}
          />
          {this.pointers.map(pointer => {
            return (
              <div
                key={pointer}
                className={`screenshots-viewer-pointer-${pointer}`}
                onMouseDown={e => this.onMousedown(e, pointer)}
              />
            )
          })}
        </div>
        <ScreenshotsViewerBar onAction={this.onAction} />
      </div>
    )
  }
}
