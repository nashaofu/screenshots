import React, { PureComponent } from 'react'
import { withContext } from './ScreenshotContext'

@withContext
export default class ScreenshotViewerBar extends PureComponent {
  state = {
    x: 0,
    y: 0
  }

  get option () {
    const { action } = this.props
    if (!action) return null
    if (typeof action.render !== 'function') return null
    return (
      <div className="screenshot-viewer-bar-options">{action.render()}</div>
    )
  }

  constructor (props) {
    super(props)
    this.barRef = React.createRef()
  }

  componentDidMount () {
    this.setPosition()
  }

  componentDidUpdate () {
    this.setPosition()
  }

  setPosition () {
    const { viewer, height } = this.props
    if (!viewer) return
    const { x2, y2 } = viewer
    const { x, y } = this.state
    const { offsetWidth, offsetHeight } = this.barRef.current
    let x1 = x2 - offsetWidth
    let y1 = y2 + 10
    if (x1 < 0) {
      x1 = 0
    }
    if (y1 > height - offsetHeight) {
      y1 = y2 - offsetHeight - 10
    }
    if (x === x1 && y === y1) return
    this.setState({
      x: x1,
      y: y1
    })
  }

  onClick = Action => {
    if (!Action) return
    this.props.onAction(Action)
  }

  render () {
    const { x, y } = this.state
    const { action, actions } = this.props
    return (
      <div
        className="screenshot-viewer-bar"
        ref={this.barRef}
        style={{
          left: x,
          top: y
        }}
      >
        <div className="screenshot-viewer-bar-container">
          <div className="screenshot-viewer-bar-icons">
            {actions.map((item, index) => {
              const { type, key } = item
              if (type === 'divider') {
                return (
                  <div key={index} className="screenshot-viewer-bar-divider" />
                )
              } else {
                const classNames = ['screenshot-viewer-bar-button']
                const { title, icon } = key
                if (action instanceof key) {
                  classNames.push('screenshot-viewer-bar-button-active')
                }
                return (
                  <div
                    key={index}
                    className={classNames.join(' ')}
                    title={title}
                    onClick={() => this.onClick(key)}
                  >
                    <i className={icon} />
                  </div>
                )
              }
            })}
          </div>
        </div>
        <div className="screenshot-viewer-bar-container">{this.option}</div>
      </div>
    )
  }
}
