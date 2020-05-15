import React, { PureComponent } from 'react'
import { withContext } from './ScreenshotsContext'

@withContext
export default class ScreenshotsViewerBar extends PureComponent {
  state = {
    x: 0,
    y: 0
  }

  get option () {
    const { action } = this.props
    if (!action) return null
    if (typeof action.render !== 'function') return null
    return (
      <div className="screenshots-viewer-bar-options">{action.render()}</div>
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
    const { action, actions, viewer, stack } = this.props
    return (
      <div
        className="screenshots-viewer-bar"
        ref={this.barRef}
        style={{
          display: viewer && !viewer.resizing && !viewer.moving ? 'block' : 'none',
          left: x,
          top: y
        }}
      >
        <div className="screenshots-viewer-bar-container">
          <div className="screenshots-viewer-bar-icons">
            {actions.map((item, index) => {
              const { type, key } = item
              if (type === 'divider') {
                return (
                  <div key={index} className="screenshots-viewer-bar-divider" />
                )
              } else {
                const classNames = ['screenshots-viewer-bar-button']
                const { title, icon } = key
                if (action instanceof key) {
                  classNames.push('screenshots-viewer-bar-button-active')
                }
                if (title === '撤销' && !stack.length) {
                  classNames.push('screenshots-viewer-bar-button-disabled')
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
        <div className="screenshots-viewer-bar-container">{this.option}</div>
      </div>
    )
  }
}
