<template lang="pug">
.rectangle(
  :style="style",
)
  canvas(
    ref="canvas"
    :width="width"
    :height="height"
    @mousedown.left="mousedown($event, 'm')"
  )
  //- 边框
  .rectangle-border.rectangle-border-n
  .rectangle-border.rectangle-border-e
  .rectangle-border.rectangle-border-s
  .rectangle-border.rectangle-border-w
  //- 拖拽点
  .rectangle-pointer.rectangle-pointer-n(@mousedown.left="mousedown($event, 'n')")
  .rectangle-pointer.rectangle-pointer-ne(@mousedown.left="mousedown($event, 'ne')")
  .rectangle-pointer.rectangle-pointer-e(@mousedown.left="mousedown($event, 'e')")
  .rectangle-pointer.rectangle-pointer-se(@mousedown.left="mousedown($event, 'se')")
  .rectangle-pointer.rectangle-pointer-s(@mousedown.left="mousedown($event, 's')")
  .rectangle-pointer.rectangle-pointer-sw(@mousedown.left="mousedown($event, 'sw')")
  .rectangle-pointer.rectangle-pointer-w(@mousedown.left="mousedown($event, 'w')")
  .rectangle-pointer.rectangle-pointer-nw(@mousedown.left="mousedown($event, 'nw')")

</template>

<script>
export default {
  name: 'Rectangle',
  props: {
    rect: {
      type: Object,
      default: () => ({ x1: 0, y1: 0, x2: 0, y2: 0 })
    }
  },
  data () {
    return {
      is: null,
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
    window.addEventListener('mousemove', this.mousemove)
    window.addEventListener('mouseup', this.mouseup)
  },
  destroyed () {
    window.removeEventListener('mousemove', this.mousemove)
    window.removeEventListener('mouseup', this.mouseup)
  },
  methods: {
    mousedown (e, is) {
      this.is = is
      this.point = { x: e.clientX, y: e.clientY }
      this.oRect = this.rect
      this.switch(e)
    },
    mousemove (e) {
      this.switch(e)
    },
    mouseup (e) {
      this.switch(e)
      this.is = null
    },
    switch (e) {
      switch (this.is) {
        case 'm':
          this.shift(e)
          break
        case 'n':
        case 'ne':
        case 'e':
        case 'se':
        case 's':
        case 'sw':
        case 'w':
        case 'nw':
          this.resize(e)
          break
        default:
          break
      }
    },
    shift (e) {
      let x = e.clientX - this.point.x
      let y = e.clientY - this.point.y
      let { x1, y1, x2, y2 } = this.oRect
      x1 += x
      y1 += y
      x2 += x
      y2 += y
      this.$emit('shift', { x1, y1, x2, y2 })
    },
    resize (e) {
      let x = e.clientX - this.point.x
      let y = e.clientY - this.point.y
      let { x1, y1, x2, y2 } = this.oRect
      switch (this.is) {
        case 'n':
          y1 += y
          break
        case 'ne':
          y1 += y
          x2 += x
          break
        case 'e':
          x2 += x
          break
        case 'se':
          x2 += x
          y2 += y
          break
        case 's':
          y2 += y
          break
        case 'sw':
          x1 += x
          y2 += y
          break
        case 'w':
          x1 += x
          break
        case 'nw':
          x1 += x
          y1 += y
          break
        default:
          return
      }
      this.$emit('resize', { x1, y1, x2, y2 })
    }
  }
}
</script>

<style lang="less">
@border: 1px dotted #fff;
@pointer-size: 8px;
@pointer-bg: rgba(0, 0, 0, 0.9);
@pointer-border: 1px solid #fff;

.rectangle {
  display: block;
  position: absolute;
  z-index: 100;
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.2);

  canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    cursor: move;
  }

  &-border {
    position: absolute;

    &-n {
      top: 0;
      right: 0;
      left: 0;
      border-top: @border;
    }

    &-e {
      top: 0;
      right: 0;
      bottom: 0;
      border-right: @border;
    }

    &-s {
      right: 0;
      bottom: 0;
      left: 0;
      border-bottom: @border;
    }

    &-w {
      top: 0;
      bottom: 0;
      left: 0;
      border-left: @border;
    }
  }

  &-pointer {
    width: @pointer-size;
    height: @pointer-size;
    background-color: @pointer-bg;
    border: @pointer-border;

    &-n, &-ne, &-e, &-se, &-s, &-sw, &-w, &-nw {
      position: absolute;
      transform: translate3d(-50%, -50%, 0);
    }

    &-n,
    &-s {
      cursor: n-resize;
    }

    &-e,
    &-w {
      cursor: e-resize;
    }

    &-ne {
      cursor: ne-resize;
    }

    &-se {
      cursor: nw-resize;
    }

    &-sw {
      cursor: ne-resize;
    }

    &-nw {
      cursor: nw-resize;
    }

    &-n {
      top: 0;
      left: 50%;
    }

    &-ne {
      top: 0;
      left: 100%;
    }

    &-e {
      top: 50%;
      left: 100%;
    }

    &-se {
      top: 100%;
      left: 100%;
    }

    &-s {
      top: 100%;
      left: 50%;
    }

    &-sw {
      top: 100%;
      left: 0;
    }

    &-w {
      top: 50%;
      left: 0;
    }

    &-nw {
      top: 0;
      left: 0;
    }
  }
}
</style>
