import React from 'react'
import Action from './action'
import Size from '../Size'

// inspired by https://github.com/zhengsk/image-masaic
export default class Mosaic extends Action {
  static title = '马赛克'

  static type = 'mosaic'

  static icon = 'screenshots-icon-mosaic'

  mosaic = null
  size = 10

  constructor (props) {
    super(props)
    const { context } = props
    const { viewer, image, width, height } = context
    const $canvas = document.createElement('canvas')
    const { x1, y1, x2, y2 } = viewer
    const vw = x2 - x1
    const vh = y2 - y1

    $canvas.width = vw
    $canvas.height = vh

    const rx = image.width / width
    const ry = image.height / height

    const ctx = $canvas.getContext('2d')

    ctx.drawImage(image.el, x1 * rx, y1 * ry, vw * rx, vh * ry, 0, 0, vw, vh)

    this.imageData = ctx.getImageData(0, 0, vw, vh)
    this.ctx = ctx
    props.setContext({ cursor: 'crosshair' })
  }

  mousedown = (e, { el, ctx, context, setContext }) => {
    const { border } = context

    this.mosaic = {
      type: 'mosaic',
      history: [
        {
          size: border,
          tiles: []
        }
      ],
      draw: this.draw,
      ready: true
    }
  }

  mousemove = (e, { el, ctx, context, setContext }) => {
    if (!this.mosaic) {
      return
    }
    const { left, top } = el.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top

    // 开始move以后再推进栈
    if (this.mosaic.ready) {
      this.mosaic.ready = false
      this.mosaic.history[0].undoPriority = this.setUndoPriority(context)
      context.stack.push(this.mosaic)
    }

    const lastTile = this.mosaic.history[0].tiles[this.mosaic.history[0].tiles.length - 1]

    if (!lastTile) {
      this.mosaic.history[0].tiles.push({
        x,
        y,
        size: this.size
      })
    } else {
      const dx = lastTile.x - x
      const dy = lastTile.y - y
      // 减小点的个数
      const length = Math.sqrt(dx ** 2 + dy ** 2)
      if (length > this.size) {
        this.mosaic.history[0].tiles.push({
          x: Math.floor(x + dx / 2),
          y: Math.floor(y + dy / 2),
          size: this.size
        })

        this.mosaic.history[0].tiles.push({
          x,
          y,
          size: this.size
        })
      }
    }

    setContext({ stack: [...context.stack] })
  }

  mouseup = (e, { el, ctx, context, setContext }) => {
    if (this.mosaic) {
      this.mosaic = null
    }
  }

  draw = (ctx, action) => {
    const { tiles } = action
    tiles.forEach(tile => {
      const { data, width } = this.imageData

      const index = tile.y * width * 4 + tile.x * 4

      const color = data.slice(index, index + 4)

      ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`

      ctx.fillRect(tile.x - tile.size / 2, tile.y - tile.size / 2, tile.size, tile.size)
    })
  }

  onSizeChange = size => {
    this.props.setContext({
      border: size
    })
    const sizes = {
      3: 6,
      6: 10,
      9: 14
    }
    this.props.context.border = size
    this.size = sizes[size]
  }

  render () {
    const { border } = this.props.context
    return <Size value={border} onChange={this.onSizeChange} />
  }
}
