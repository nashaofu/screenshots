<template lang="pug">
canvas.rectangle(
  :width="width",
  :height="height",
  :style="style"
)
</template>

<script>
export default {
  name: 'Rectangle',
  props: {
    bounds: {
      type: Object,
      default: () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      })
    },
    rect: {
      type: Object,
      default: () => ({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
      })
    }
  },
  data () {
    return {
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
      const width = Math.abs(this.rect.x2 - this.rect.x1)
      return width > 10 ? width : 0
    },
    height () {
      const height = Math.abs(this.rect.y2 - this.rect.y1)
      return height > 10 ? height : 0
    },
    style () {
      return {
        left: `${this.x}px`,
        top: `${this.y}px`
      }
    }
  },
  mounted () {
    this.ctx = this.$el.getContext('2d')
  },
  watch: {
    rect: {
      deep: true,
      handler () {
        if (this.ctx) {
          this.ctx.clearRect(0, 0, this.width, this.height)
        }
      }
    }
  }
}
</script>

<style lang="stylus">
.rectangle
  display block
  position absolute
  margin -2px
  border 2px dashed #fff
</style>
