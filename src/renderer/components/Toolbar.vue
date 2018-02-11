<template lang="pug">
.toolbar(
  :style="style",
  @click="$emit('save')"
) 确定
</template>

<script>
export default {
  name: 'Toolbar',
  props: {
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
  computed: {
    x () {
      return this.rect.x1
    },
    y () {
      return this.rect.y1
    },
    style () {
      return {
        left: `${this.x}px`,
        top: `${this.y}px`
      }
    }
  }
}
</script>

<style lang="stylus">
.toolbar
  background-color #fff
  display block
  position absolute
  z-index 100
</style>
