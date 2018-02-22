<template lang="pug">
.app(
  @keypress.esc="cancel"
)
  background(
    ref="background",
    :bounds="bounds"
  )
  rectangle(
    ref="rectangle",
    :rect="rect"
  )
  toolbar(
    :rect="rect",
    @save="save"
  )
  layer(@draw="drawRectangle")
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
import Layer from './components/Layer'
import Toolbar from './components/Toolbar'
import Rectangle from './components/Rectangle'
import Background from './components/Background'

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
      window: null,
      displays: [],
      sources: [],
      flag: false, // 鼠标拖动
      rect: { x1: 0, y1: 0, x2: 0, y2: 0 }
    }
  },
  computed: {
    bounds () {
      // if (process.env.NODE_ENV === 'development') {
      //   return this.displays[0]
      // }
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
    this.window = remote.getCurrentWindow()
    this.displays = this.getDisplays()
    this.window.setBounds(this.bounds)
    ipcRenderer.on('shortcut-capture', async () => {
      const sources = await this.getSources()
      this.drawBackground(sources)
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
              thumbnail: thumbnail.resize({
                width,
                height,
                quality: 'best'
              })
            }
          }))
        })
      })
    },
    show () {
      this.window.show()
      this.window.focus()
      this.window.setBounds(this.bounds)
      if (this.displays.length === 1) {
        this.window.setFullScreen(true)
      }
    },
    hide () {
      this.window.hide()
      this.window.setFullScreen(false)
    },
    drawBackground (sources) {
      this.$nextTick(() => {
        const ctx = this.$refs.background.ctx
        ctx.clearRect(0, 0, this.width, this.height)
        // sources = [sources[1]]
        sources.forEach(({ x, y, width, height, thumbnail }) => {
          const $img = new Image()
          const blob = new Blob([thumbnail.toPNG()], { type: 'image/png' })
          $img.src = URL.createObjectURL(blob)
          $img.addEventListener('load', () => {
            ctx.drawImage($img, 0, 0, width, height, x, y, width, height)
          })
        })
      })
    },
    drawRectangle (rect) {
      this.rect = rect
      this.$nextTick(() => {
        const ctx = this.$refs.rectangle.ctx
        const source = this.$refs.background.$el
        const { x1, y1, x2, y2 } = rect
        const x = x1 < x2 ? x1 : x2
        const y = y1 < y2 ? y1 : y2
        const width = Math.abs(x2 - x1)
        const height = Math.abs(y2 - y1)
        ctx.clearRect(0, 0, this.width, this.height)
        ctx.drawImage(source, x, y, width, height, 0, 0, width, height)
      })
    },
    cancel () {
      this.hide()
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
  position absolute
  top 0
  right 0
  bottom 0
  left 0
  cursor crosshair
  user-select none
  button
    position absolute
    top 50%
    left 50%
</style>
