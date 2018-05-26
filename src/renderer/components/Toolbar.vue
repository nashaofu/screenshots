<template lang="pug">
.toolbar(:style="style")
  //- .toolbar-button(
  //-   title="涂鸦",
  //-   @click.stop="click('brush')"
  //- )
  //-   i.iconfont-brush
  //- .toolbar-button(
  //-   title="撤销",
  //-   @click.stop="click('revoke')"
  //- )
  //-   i.iconfont-revoke
  .toolbar-button(
    title="退出",
    @click.stop="click('cancel')"
  )
    i.iconfont-cancel
  .toolbar-button(
    title="完成",
    @click.stop="click('done')"
  )
    i.iconfont-done
</template>

<script>
export default {
  name: 'Toolbar',
  props: {
    rect: {
      type: Object,
      default: () => ({ x1: 0, y1: 0, x2: 0, y2: 0 })
    }
  },
  computed: {
    x () {
      return this.rect.x1 > this.rect.x2 ? this.rect.x1 : this.rect.x2
    },
    y () {
      return this.rect.y1 > this.rect.y2 ? this.rect.y1 : this.rect.y2
    },
    style () {
      const dx = Math.abs(this.rect.x2 - this.rect.x1)
      const dy = Math.abs(this.rect.y2 - this.rect.y1)
      return {
        left: `${this.x}px`,
        top: `${this.y}px`,
        visibility: dx && dy ? 'visible' : 'hidden'
      }
    }
  },
  methods: {
    click (cmd) {
      return this.$emit('click', cmd)
    }
  }
}
</script>

<style lang="stylus">
$button-size = 26px
.toolbar
  width $button-size * 2 + 2px
  height 28px
  background-color rgba(0,0,0,0.9)
  display block
  position absolute
  transform translate3d(-100%, 10px, 0)
  border-radius 2px
  border 1px solid rgba(255,255,255,0.1)
  z-index 100
  overflow hidden
  box-shadow 0 0 7px rgba(255,255,255,0.2)
  &:before,
  &:after
    content ""
    display table
    float none
    clear both
  &-button
    width $button-size
    height $button-size
    line-height $button-size
    float left
    color #fff
    font-size 18px
    text-align center
    cursor pointer
    &:not(:first-child)
      border-left 1px solid rgba(255,255,255,0.2)
    &:first-child
      border-radius 2px 0 0 2px
    &:last-child
      border-radius 0 2px 2px 0
    &:hover
      background-color rgba(0,0,0,0.95)
    &:active
      background-color rgba(0,0,0,1)
</style>
