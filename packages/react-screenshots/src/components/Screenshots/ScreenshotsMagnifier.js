import React, { PureComponent } from 'react'
import { withContext } from './ScreenshotsContext'

@withContext
export default class ScreenshotsMagnifier extends PureComponent {
  state = {
    width: 120,
    height: 90,
    rgb: ''
  }

  ctx = null

  magnifyRate = 3

  constructor (props) {
    super(props)
    this.magnifierRef = React.createRef()
  }

  componentDidMount () {
    this.ctx = this.magnifierRef.current.getContext('2d')
    this.draw()
  }

  componentDidUpdate () {
    this.draw()
  }

  draw = () => {
    const { image, viewer, magnifyPoint, width, height } = this.props
    const { x, y } = magnifyPoint

    if (!image || x < 0 || y < 0 || (viewer && !viewer.resizing)) return
    const magnifyX = image.width * x / width
    const magnifyY = image.height * y / height
    const magnifyW = this.state.width
    const magnifyH = this.state.height
    const colorData = this.ctx.getImageData(magnifyW / 2, magnifyH / 2, 1, 1).data
    this.setState({
      rgb: `(${colorData[0]},${colorData[1]},${colorData[2]})`
    })
    this.ctx.clearRect(0, 0, magnifyW, magnifyH)
    this.ctx.drawImage(
      image.el,
      magnifyX - magnifyW / this.magnifyRate / 2,
      magnifyY - magnifyH / this.magnifyRate / 2,
      magnifyW / this.magnifyRate,
      magnifyH / this.magnifyRate,
      0,
      0,
      magnifyW,
      magnifyH
    )
  }

  render () {
    const { magnifyPoint } = this.props
    const { x, y } = magnifyPoint

    const left = x && (x + 5)
    const top = y && (y + 5)
    return (
      <div
        className="screenshots-magnifier"
        style={{
          transform: [`translate(${left}px, ${top}px)`]
        }}
      >
        <div className="screenshots-magnifier-canvas">
          <canvas ref={this.magnifierRef} width={this.state.width} height={this.state.height} />
          <div className="screenshots-magnifier-canvas-crosshair" />
        </div>
        <div className="screenshots-magnifier-explain">
          <div className="screenshots-magnifier-explain-rgb">RGB：{this.state.rgb}</div>
          <div className="screenshots-magnifier-explain-site">坐标：({x},{y})</div>
        </div>
      </div>
    )
  }
}
