<template lang="pug">
.app
  background(
    ref="background",
    :bounds="bounds"
  )
  rectangle(
    ref="rectangle",
    :rect="rect",
    :bounds="bounds",
    @shift="shift"
    @resize="resize"
  )
  toolbar(
    :rect="rect",
    @click="click"
  )
  layer(@draw="draw")
</template>

<script>
import { ipcRenderer, screen } from 'electron'
import Layer from './components/Layer'
import Toolbar from './components/Toolbar'
import Rectangle from './components/Rectangle'
import Background from './components/Background'

import getSource from './assets/js/getSource'
import getDisplay from './assets/js/getDisplay'

export default {
  name: 'App',
  components: {
    Layer,
    Toolbar,
    Rectangle,
    Background
  },
  data () {
    return {
      display: getDisplay(),
      source: null,
      rect: { x1: 0, y1: 0, x2: 0, y2: 0 }
    }
  },
  computed: {
    bounds () {
      return {
        x: this.display.x,
        y: this.display.y,
        width: this.display.width,
        height: this.display.height
      }
    },
    width () {
      return this.bounds.width
    },
    height () {
      return this.bounds.height
    }
  },
  mounted () {
    this.init()
    window.addEventListener('keydown', this.keydown)
    screen.on('display-metrics-changed', this.displayMetricsChanged)
  },
  destroyed () {
    window.removeEventListener('keydown', this.keydown)
    screen.off('display-metrics-changed', this.displayMetricsChanged)
  },
  methods: {
    async init () {
      this.source = await getSource(this.display)
      this.drawBackground(this.source)
      this.show()
    },
    show () {
      ipcRenderer.send('ShortcutCapture::SHOW', this.bounds)
    },
    hide () {
      ipcRenderer.send('ShortcutCapture::HIDE', this.bounds)
    },
    drawBackground ({ x, y, width, height, thumbnail }) {
      // 确保dom更新后再更新canvas
      this.$nextTick(() => {
        const ctx = this.$refs.background.ctx
        ctx.clearRect(0, 0, this.width, this.height)
        const $img = new Image()
        const blob = new Blob([thumbnail.toPNG()], { type: 'image/png' })
        $img.src = URL.createObjectURL(blob)
        $img.addEventListener('load', () => {
          ctx.drawImage($img, 0, 0, width, height, x, y, width, height)
        })
      })
    },
    drawRectangle (rect) {
      if (!this.source) return
      this.rect = this.getRect(rect)
      // 确保dom更新后再更新canvas
      this.$nextTick(() => {
        const { x1, y1, x2, y2 } = this.rect
        const ctx = this.$refs.rectangle.ctx
        const width = x2 - x1
        const height = y2 - y1
        ctx.clearRect(0, 0, this.width, this.height)
        ctx.drawImage(this.$refs.background.$el, x1, y1, width, height, 0, 0, width, height)
      })
    },
    /**
     * 画矩形
     */
    draw (rect) {
      this.drawRectangle(rect)
    },
    /**
     * 移动矩形
     */
    shift (rect) {
      this.drawRectangle(rect)
    },
    /**
     * 改变举行形状
     */
    resize (rect) {
      this.drawRectangle(rect)
    },
    /**
     * 修正矩形坐标
     */
    getRect ({ x1, y1, x2, y2 }) {
      let x = x1
      let y = y1
      if (x1 > x2) {
        x1 = x2
        x2 = x
      }
      if (y1 > y2) {
        y1 = y2
        y2 = y
      }
      const width = x2 - x1
      const height = y2 - y1
      if (x1 < 0) {
        x1 = 0
        x2 = width
      }
      if (x2 > this.width) {
        x2 = this.width
        x1 = this.width - width
      }

      if (y1 < 0) {
        y1 = 0
        y2 = height
      }
      if (y2 > this.height) {
        y2 = this.height
        y1 = this.height - height
      }
      return { x1, y1, x2, y2 }
    },
    displayMetricsChanged () {
      this.display = getDisplay()
    },
    keydown (e) {
      const { x1, y1, x2, y2 } = this.rect
      const is = Math.abs(x2 - x1) >= 7 && Math.abs(y2 - y1) >= 7
      switch (e.keyCode) {
        case 13:
          if (is) this.done()
          break
        case 27:
          if (is) {
            this.rect = { x1: 0, y1: 0, x2: 0, y2: 0 }
          } else {
            this.hide()
          }
          break
        default:
          break
      }
    },
    click (cmd) {
      switch (cmd) {
        case 'cancel':
          this.cancel()
          break
        case 'done':
          this.done()
          break
        default:
          break
      }
    },
    cancel () {
      this.hide()
    },
    done () {
      const ctx = this.$refs.rectangle.ctx
      const dataURL = ctx.canvas.toDataURL('image/png')
      ipcRenderer.send('ShortcutCapture::CAPTURE', dataURL, this.rect)
      this.hide()
    }
  }
}
</script>

<style lang="less">
@import "normalize.css";
@import "./assets/css/iconfont.less";

* {
  box-sizing: border-box;
}

html,
body,
.app {
  -webkit-app-region: no-drag;
  user-select: none;
  overflow: hidden;
}

.app {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  cursor: crosshair;
}
</style>
