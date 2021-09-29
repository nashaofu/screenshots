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

  constructor(props) {
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

    let lastTile = this.mosaic.history[0].tiles[this.mosaic.history[0].tiles.length - 1]

    if (!lastTile) {
      this.mosaic.history[0].tiles.push({
        x,
        y,
        size: this.size,
        color: this.getColor(x, y, this.size)
      })
    } else {
      const dx = lastTile.x - x
      const dy = lastTile.y - y
      // 减小点的个数
      let length = Math.sqrt(dx ** 2 + dy ** 2)
      const sin = -dy / length
      const cos = -dx / length

      while (length > this.size) {
        const cx = Math.floor(lastTile.x + this.size * cos)
        const cy = Math.floor(lastTile.y + this.size * sin)
        lastTile = {
          x: cx,
          y: cy,
          size: this.size,
          color: this.getColor(cx, cy, this.size)
        }
        this.mosaic.history[0].tiles.push(lastTile)
        length -= this.size
      }

      // 最后一个位置补充一块
      if (length > this.size / 2) {
        this.mosaic.history[0].tiles.push({
          x,
          y,
          size: this.size,
          color: this.getColor(x, y, this.size)
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

  getColor(x, y, size) {
    const { data, width } = this.imageData

    let x1 = Math.floor(x - size / 2)
    let y1 = Math.floor(y - size / 2)
    x1 = x1 >= 0 ? x1 : 0
    y1 = y1 >= 0 ? y1 : 0

    const rgbas = [0, 0, 0, 0]

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const index = (y1 + r) * width * 4 + (x1 + c) * 4
        const rgba = data.slice(index, index + 4)
        rgbas[0] += rgba[0]
        rgbas[1] += rgba[1]
        rgbas[2] += rgba[2]
        rgbas[3] += rgba[3]
      }
    }
    return rgbas.map(rgba => rgba / size / size)
  }

  draw = (ctx, action) => {
    const { tiles } = action
    tiles.forEach(tile => {
      const r = Math.round(tile.color[0])
      const g = Math.round(tile.color[1])
      const b = Math.round(tile.color[2])
      const a = tile.color[3] / 255

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
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

  render() {
    const { border } = this.props.context
    return <Size value={border} onChange={this.onSizeChange} />
  }
}
