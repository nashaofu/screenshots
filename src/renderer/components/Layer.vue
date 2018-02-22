<template lang="pug">
.layer(@mousedown.left="mousedown")
</template>

<script>
export default {
  name: 'Layer',
  data () {
    return {
      drawRect: false,
      rect: { x1: 0, y1: 0, x2: 0, y2: 0 }
    }
  },
  created () {
    window.addEventListener('mousemove', e => this.mousemove(e))
    window.addEventListener('mouseup', e => this.mouseup(e))
  },
  methods: {
    mousedown (e) {
      this.drawRect = true
      this.rect = {
        x1: e.clientX,
        y1: e.clientY,
        x2: e.clientX,
        y2: e.clientY
      }
      this.$emit('draw', this.rect)
    },
    mousemove (e) {
      if (this.drawRect) {
        this.rect.x2 = e.clientX
        this.rect.y2 = e.clientY
        this.$emit('draw', this.rect)
      }
    },
    mouseup (e) {
      if (this.drawRect) {
        this.rect.x2 = e.clientX
        this.rect.y2 = e.clientY
      }
      this.$emit('draw', this.rect)
      this.drawRect = false
    }
  }
}
</script>

<style lang="stylus">
.layer
  position absolute
  top 0
  right 0
  bottom 0
  left 0
  background-color rgba(0, 0, 0, 0.1)
  z-index 70
</style>
