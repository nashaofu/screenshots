<template lang="pug">
.app(
  @mousedown.left="mousedown",
  @mousemove="mousemove",
  @mouseup="mouseup"
)
  background(
    ref="background",
    :bounds="bounds",
    :sources="sources"
  )
  rectangle(
    ref="rectangle",
    :bounds="bounds",
    :rect="rect"
  )
  button(@click="click") 截图
</template>

<script>
import maxBy from 'lodash/maxBy'
import {
  ipcRenderer,
  desktopCapturer,
  remote,
  screen
} from 'electron'
import Rectangle from './components/Rectangle'
import Background from './components/Background'

export default {
  name: 'App',
  components: {
    Rectangle,
    Background
  },
  data () {
    return {
      $win: null,
      displays: [],
      sources: [],
      flag: false, // 鼠标拖动
      rect: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
      }
    }
  },
  computed: {
    bounds () {
      if (process.env.NODE_ENV === 'development') {
        return this.displays[0]
      }
      return this.displays
        .reduce((size, { width, height, x, y }) => {
          if (size.width < x + width) {
            size.width = x + width
          }
          if (size.height < y + height) {
            size.height = y + height
          }
          return size
        }, { x: 0, y: 0, width: 0, height: 0 })
    }
  },
  created () {
    this.$win = remote.getCurrentWindow()
    this.displays = this.getDisplays()
    ipcRenderer.on('shortcut-capture', async () => {
      this.sources = await this.getSources()
      this.show()
    })
    ipcRenderer.emit('shortcut-capture')
  },
  methods: {
    click () {
      ipcRenderer.emit('shortcut-capture')
    },
    getDisplays () {
      return screen.getAllDisplays()
        .map(({ id, bounds, scaleFactor }) => ({
          id,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
          scaleFactor
        }))
    },
    async getSources () {
      const maxDisplay = maxBy(this.displays, display => display.width * display.height * display.scaleFactor)
      return await new Promise((resolve, reject) => {
        desktopCapturer.getSources({
          types: ['screen'],
          thumbnailSize: {
            width: maxDisplay.width,
            height: maxDisplay.height
          }
        }, (error, sources) => {
          if (error) {
            return reject(error)
          }
          resolve(sources.map(({ thumbnail }, index) => {
            const display = this.displays[index]
            // 以第一个屏幕为基准缩放
            const scale = display.scaleFactor / this.displays[0].scaleFactor
            const width = display.width * scale
            const height = display.height * scale
            return {
              x: display.x,
              y: display.y,
              width,
              height,
              thumbnail: thumbnail.toPNG()
            }
          }))
        })
      })
    },
    show () {
      this.$win.show()
      this.$win.focus()
      this.$win.setBounds(this.bounds)
      if (this.displays.length === 1) {
        this.$win.setFullScreen(true)
      }
    },
    hide () {
      this.$win.hide()
      this.$win.setFullScreen(false)
      this.$win.setBounds({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      })
    },
    mousedown (e) {
      this.drawRect = true
      this.rect = {
        x1: e.clientX,
        y1: e.clientY,
        x2: e.clientX,
        y2: e.clientY
      }
      this.draw()
    },
    mousemove (e) {
      if (this.drawRect) {
        this.rect.x2 = e.clientX
        this.rect.y2 = e.clientY
        this.draw()
      }
    },
    mouseup (e) {
      if (this.drawRect) {
        this.rect.x2 = e.clientX
        this.rect.y2 = e.clientY
      }
      this.draw()
      this.drawRect = false
      this.save()
    },
    draw () {
      this.$nextTick(() => {
        const ctx = this.$refs.rectangle.ctx
        const source = this.$refs.background.$el
        const {x1, y1, x2, y2 } = this.rect
        const x = x1 < x2 ? x1 : x2
        const y = y1 < y2 ? y1 : y2
        const width = Math.abs(x2 - x1)
        const height = Math.abs(y2 - y1)
        ctx.drawImage(source, x, y, width, height, 0, 0, width, height)
      })
    },
    save () {
      const ctx = this.$refs.rectangle.ctx
      const dataURL = ctx.canvas.toDataURL('image/png')
      ipcRenderer.send('shortcut-capture', dataURL)
    }
  }
}
</script>

<style lang="stylus">
@import "normalize.css"

.app
  color #333
  &-bg
    display block
    position absolute
    top 0
    right 0
    bottom 0
    left 0
  &-canvas
    position absolute
    top 0
    left 0
  &-toolbar
    position absolute
    top 0
    left 0
  button
    position absolute
    top 50%
    left 50%
</style>
