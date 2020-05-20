import React, { PureComponent } from 'react'
import { withContext } from './ScreenshotsContext'

@withContext
export default class ScreenshotsCanvas extends PureComponent {
  // 画布对象上下文
  ctx = null

  is = false

  point = null

  constructor (props) {
    super(props)
    this.canvasRef = React.createRef()
  }

  componentDidMount () {
    this.ctx = this.canvasRef.current.getContext('2d')
    this.draw()
    window.addEventListener('mousemove', this.onMousemove)
    window.addEventListener('mouseup', this.onMouseup)
  }

  componentDidUpdate () {
    this.draw()
  }

  componentWillUnmount () {
    window.removeEventListener('mousemove', this.onMousemove)
    window.removeEventListener('mouseup', this.onMouseup)
  }

  draw = () => {
    const { image, width, height } = this.props
    if (!image) return
    this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)

    this.ctx.clearRect(0, 0, width, height)
    this.ctx.drawImage(
      image.el,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      width,
      height
    )
  }

  onMousedown = e => { // 初始viewer框
    const { viewer } = this.props
    if (viewer || e.button !== 0) return // e.button 鼠标左键
    this.props.setContext({
      viewer: null,
      action: null,
      stack: [],
      state: {},
      cursor: null
    })
    this.is = true
    this.point = { x: e.clientX, y: e.clientY }
    this.props.setContext(state => ({
      viewer: { ...state.viewer, resizing: true }
    }))
    this.update(e)
  }

  onMousemove = e => {
    const { viewer } = this.props
    if (!viewer || (viewer && viewer.resizing)) {
      this.props.onMagnify({
        x: e.clientX,
        y: e.clientY
      })
    }
    if (!this.is) return
    this.update(e)
  }

  onMouseup = (e) => {
    if (this.is) {
      this.update(e)
      this.is = false
      this.props.setContext(state => ({
        viewer: { ...state.viewer, resizing: false }
      }))
    }
  }

  update = (e) => {
    const { x, y } = this.point
    this.props.onChange({
      x1: x,
      y1: y,
      x2: e.clientX,
      y2: e.clientY
    })
  }

  render () {
    const { width, height } = this.props
    return (
      <div className="screenshots-canvas" onMouseDown={this.onMousedown}>
        <canvas
          ref={this.canvasRef}
          width={width * devicePixelRatio}
          height={height * devicePixelRatio}
          style={{
            width,
            height
          }}
        />
        <div className="screenshots-canvas-mask" />
      </div>
    )
  }
}
