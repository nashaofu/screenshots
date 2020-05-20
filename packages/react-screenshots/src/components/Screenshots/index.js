import React, { PureComponent } from 'react'
import ScreenshotsViewer from './ScreenshotsViewer'
import ScreenshotsCanvas from './ScreenshotsCanvas'
import ScreenshotsMagnifier from './ScreenshotsMagnifier'
import ScreenshotsContext from './ScreenshotsContext'
import Ok from './actions/ok'
import Undo from './actions/undo'
import Save from './actions/save'
import Rect from './actions/rect'
import Brush from './actions/brush'
import Arrow from './actions/arrow'
import Cancel from './actions/cancel'
import Ellipse from './actions/ellipse'
import Text from './actions/text'
import Mosaic from './actions/mosaic'
import './icons.less'
import './screenshots.less'

export default class Screenshots extends PureComponent {
  state = {
    image: null,
    viewer: null,
    action: null,
    actions: [
      {
        key: Ellipse,
        value: {}
      },
      {
        key: Rect,
        value: {}
      },
      {
        key: Arrow,
        value: {}
      },
      {
        key: Brush,
        value: {}
      },
      {
        key: Mosaic,
        value: {}
      },
      {
        key: Text,
        value: {}
      },
      { type: 'divider' },
      {
        key: Undo,
        value: {}
      },
      {
        key: Save,
        value: {}
      },
      { type: 'divider' },
      {
        key: Cancel,
        value: {}
      },
      {
        key: Ok,
        value: {}
      }
    ],
    stack: [],
    border: 6,
    font: 23,
    color: '#ee5126',
    cursor: null,
    magnifyPoint: {},
    editPointers: []
  }

  constructor (props) {
    super(props)
    this.bodyRef = React.createRef()
  }

  componentDidMount () {
    this.getImage().then(image => {
      this.setState({ image })
    })
  }

  // 某些context不能变更
  setContext = (context, callback) => {
    if (typeof context === 'object') {
      context = { ...context }
      delete context.image
      delete context.width
      delete context.height
      this.setState(context, callback)
    } else if (typeof context === 'function') {
      this.setState((...args) => {
        const state = { ...context(...args) }
        delete state.image
        delete state.width
        delete state.height
        return state
      }, callback)
    }
  }

  onEmit = (event, ...args) => {
    const fn = this.props[event]
    if (typeof fn === 'function') fn(...args)
  }

  getImage () {
    const { image } = this.props
    return new Promise((resolve, reject) => {
      if (!image) {
        return resolve({
          el: null,
          width: 0,
          height: 0
        })
      }
      const $image = new Image()
      $image.src = image
      $image.addEventListener('load', () => {
        resolve({
          el: $image,
          width: $image.width,
          height: $image.height
        })
      })
      $image.addEventListener('error', () => {
        resolve({
          el: null,
          width: 0,
          height: 0
        })
      })
    })
  }

  onCanvasChange = ({ x1, y1, x2, y2 }) => {
    const { left, top } = this.bodyRef.current.getBoundingClientRect()

    x1 = x1 - left
    y1 = y1 - top
    x2 = x2 - left
    y2 = y2 - top
    this.setViewer({ x1, y1, x2, y2 })
  }

  onMagnifyChange = ({ x, y }) => {
    const { left, top, width, height } = this.bodyRef.current.getBoundingClientRect()

    if (x >= left && x <= left + width && y >= top && y <= top + height) {
      this.setState({
        magnifyPoint: {
          x: x - left,
          y: y - top
        }
      })
    }
  }

  onViewerChange = ({ x1, y1, x2, y2 }) => {
    this.setViewer({ x1, y1, x2, y2 })
  }

  setViewer = ({ x1, y1, x2, y2 }) => {
    const { width, height } = this.props
    const { viewer } = this.state
    const x = x1
    const y = y1

    // 交换值
    if (x1 > x2) {
      x1 = x2
      x2 = x
    }

    if (y1 > y2) {
      y1 = y2
      y2 = y
    }

    // 把图形限制在元素里面
    if (x1 < 0) {
      x1 = 0
      x2 = viewer.x2
    }

    if (x2 > width) {
      x2 = width
      x1 = viewer.x1
    }

    if (y1 < 0) {
      y1 = 0
      y2 = viewer.y2
    }

    if (y2 > height) {
      y2 = height
      y1 = viewer.y1
    }

    this.setState(state => ({
      viewer: { ...state.viewer, x1, y1, x2, y2 }
    }))
  }

  render () {
    const classNames = ['screenshots']
    const { image, viewer, action, actions, stack, border, font, color, cursor, magnifyPoint, editPointers } = this.state
    const { className, width, height } = this.props
    if (className) classNames.push(className)

    return (
      <ScreenshotsContext.Provider
        value={{
          image,
          viewer,
          width,
          height,
          action,
          actions,
          stack,
          border,
          font,
          color,
          cursor,
          magnifyPoint,
          editPointers,
          setContext: this.setContext
        }}
      >
        <div
          className={classNames.join(' ')}
          ref={this.bodyRef}
          style={{ width, height }}
        >
          <ScreenshotsCanvas onChange={this.onCanvasChange} onMagnify={this.onMagnifyChange} />
          {
            !viewer || (viewer && viewer.resizing)
              ? <ScreenshotsMagnifier />
              : null
          }
          <ScreenshotsViewer onChange={this.onViewerChange} onEmit={this.onEmit} />
        </div>
      </ScreenshotsContext.Provider>
    )
  }
}
