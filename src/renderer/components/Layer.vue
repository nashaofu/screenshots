<template lang="pug">
.layer(@mousedown.left="mousedown")
</template>

<script>
export default {
  name: 'Layer',
  data () {
    return {
      is: false,
      point: { x: 0, y: 0 }
    }
  },
  mounted () {
    window.addEventListener('mousemove', this.mousemove)
    window.addEventListener('mouseup', this.mouseup)
  },
  destroyed () {
    window.removeEventListener('mousemove', this.mousemove)
    window.removeEventListener('mouseup', this.mouseup)
  },
  methods: {
    mousedown (e) {
      this.is = true
      this.point = { x: e.clientX, y: e.clientY }
      this.draw(e)
    },
    mousemove (e) {
      if (this.is) {
        this.draw(e)
      }
    },
    mouseup (e) {
      if (this.is) {
        this.draw(e)
      }
      this.is = false
    },
    draw (e) {
      let { x, y } = this.point
      const x2 = e.clientX
      const y2 = e.clientY
      if (Math.abs(x2 - x) >= 7 && Math.abs(y2 - y) >= 7) {
        this.$emit('draw', { x1: x, y1: y, x2, y2 })
      }
    }
  }
}
</script>

<style lang="less">
.layer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 70;
}
</style>
