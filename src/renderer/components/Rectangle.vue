<template lang="pug">
.rectangle(
  :style="style",
)
  canvas(
    ref="canvas"
    :width="width"
    :height="height"
    @mousedown.left="mousedown"
  )
  //- 边框
  .rectangle-border.rectangle-border-top
  .rectangle-border.rectangle-border-right
  .rectangle-border.rectangle-border-bottom
  .rectangle-border.rectangle-border-left
  //- 拖拽点
  .rectangle-pointer.rectangle-pointer-top-center
  .rectangle-pointer.rectangle-pointer-top-right
  .rectangle-pointer.rectangle-pointer-right-center
  .rectangle-pointer.rectangle-pointer-right-bottom
  .rectangle-pointer.rectangle-pointer-bottom-center
  .rectangle-pointer.rectangle-pointer-bottom-left
  .rectangle-pointer.rectangle-pointer-left-center
  .rectangle-pointer.rectangle-pointer-left-top

</template>

<script>
export default {
  name: 'Rectangle',
  props: {
    rect: {
      type: Object,
      default: () => ({ x1: 0, y1: 0, x2: 0, y2: 0 })
    },
    bounds: {
      type: Object,
      default: () => ({ x: 0, y: 0, width: 0, height: 0 })
    }
  },
  data () {
    return {
      is: false,
      point: { x: 0, y: 0 },
      oRect: { x1: 0, y1: 0, x2: 0, y2: 0 },
      ctx: null
    }
  },
  computed: {
    x () {
      const { x1, x2 } = this.rect
      return x1 < x2 ? x1 : x2
    },
    y () {
      const { y1, y2 } = this.rect
      return y1 < y2 ? y1 : y2
    },
    width () {
      return Math.abs(this.rect.x2 - this.rect.x1)
    },
    height () {
      return Math.abs(this.rect.y2 - this.rect.y1)
    },
    boundsWidth () {
      return this.bounds.width
    },
    boundsHeight () {
      return this.bounds.height
    },
    style () {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        left: `${this.x}px`,
        top: `${this.y}px`,
        visibility: this.width && this.height ? 'visible' : 'hidden'
      }
    }
  },
  mounted () {
    this.ctx = this.$refs.canvas.getContext('2d')
    window.addEventListener('mousemove', e => this.mousemove(e))
    window.addEventListener('mouseup', e => this.mouseup(e))
  },
  methods: {
    mousedown (e) {
      this.is = true
      this.point = { x: e.clientX, y: e.clientY }
      this.oRect = this.rect
      this.shift(e)
    },
    mousemove (e) {
      if (this.is) {
        this.shift(e)
      }
    },
    mouseup (e) {
      if (this.is) {
        this.shift(e)
      }
      this.is = false
    },
    shift (e) {
      const x = e.clientX - this.point.x
      const y = e.clientY - this.point.y
      let { x1, y1, x2, y2 } = this.oRect
      const width = Math.abs(this.rect.x2 - this.rect.x1)
      const height = Math.abs(this.rect.y2 - this.rect.y1)
      x1 += x
      y1 += y
      x2 += x
      y2 += y
      if (x1 < x2) {
        if (x1 < 0) {
          x1 = 0
          x2 = width
        }
        if (x2 > this.boundsWidth) {
          x2 = this.boundsWidth
          x1 = this.boundsWidth - width
        }
      }
      if (x2 < x1) {
        if (x2 < 0) {
          x2 = 0
          x1 = this.oRect.x1 - this.oRect.x2
        }
        if (x1 > this.boundsWidth) {
          x1 = this.boundsWidth
          x2 = this.boundsWidth - width
        }
      }

      if (y1 < y2) {
        if (y1 < 0) {
          y1 = 0
          y2 = height
        }
        if (y2 > this.boundsHeight) {
          y2 = this.boundsHeight
          y1 = this.boundsHeight - height
        }
      }
      if (y2 < y1) {
        if (y2 < 0) {
          y2 = 0
          y1 = this.oRect.y1 - this.oRect.y2
        }
        if (y1 > this.boundsHeight) {
          y1 = this.boundsHeight
          y2 = this.boundsHeight - height
        }
      }
      this.$emit('shift', { x1, y1, x2, y2 })
    }
  }
}
</script>

<style lang="stylus">
$border = 1px dotted rgba(255,255,255,0.9)
$pointer-size = 8px
$pointer-bg = rgba(0,0,0,0.3)
$pointer-border = 1px solid #fff
.rectangle
  display block
  position absolute
  z-index 100
  canvas
    width 100%
    height 100%
    position absolute
    top 0
    right 0
    bottom 0
    left 0
    cursor move
  &-border
    position absolute
    &-top
      top 0
      right 0
      left 0
      border-top $border
    &-right
      top 0
      right 0
      bottom 0
      border-right $border
    &-bottom
      right 0
      bottom 0
      left 0
      border-bottom $border
    &-left
      top 0
      bottom 0
      left 0
      border-left $border
  &-pointer
    width $pointer-size
    height $pointer-size
    background-color $pointer-bg
    border $pointer-border
    &-top-center,
    &-top-right,
    &-right-center,
    &-right-bottom,
    &-bottom-center,
    &-bottom-left,
    &-left-center,
    &-left-top
      position absolute
      transform translate3d(-50%, -50%, 0)
    &-top-center,
    &-bottom-center
      cursor n-resize
    &-right-center,
    &-left-center
      cursor e-resize
    &-top-right
      cursor ne-resize
    &-right-bottom
      cursor nw-resize
    &-bottom-left
      cursor ne-resize
    &-left-top
      cursor nw-resize

    &-top-center
      top 0
      left 50%
    &-top-right
      top 0
      left 100%
    &-right-center
      top 50%
      left 100%
    &-right-bottom
      top 100%
      left 100%
    &-bottom-center
      top 100%
      left 50%
    &-bottom-left
      top 100%
      left 0
    &-left-center
      top 50%
      left 0
    &-left-top
      top 0
      left 0
</style>
