<template lang="pug">
.toolbar(:style="style")
  .toolbar-button(
    title="矩形",
    @click.stop="click('rect')"
  )
    i.scicon.icon-rect
  .toolbar-button(
    title="圆形",
    @click.stop="click('ellipse')"
  )
    i.scicon.icon-ellipse
  .toolbar-button(
    title="箭头",
    @click.stop="click('arrow')"
  )
    i.scicon.icon-arrow
  .toolbar-button(
    title="文本",
    @click.stop="click('text')"
  )
    i.scicon.icon-text
  .toolbar-button(
    title="涂鸦",
    @click.stop="click('brush')"
  )
    i.scicon.icon-brush
  .toolbar-button(
    title="撤销",
    @click.stop="click('undo')"
  )
    i.scicon.icon-undo
  .toolbar-divider
  .toolbar-button(
    title="保存",
    @click.stop="click('save')"
  )
    i.scicon.icon-save
  .toolbar-button(
    title="退出"
    @click.stop="click('cancel')"
  )
    i.scicon.icon-cancel
  .toolbar-button(
    title="完成"
    @click.stop="click('ok')"
  )
    i.scicon.icon-ok
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

<style lang="less">
@button-size: 26px;

.toolbar {
  padding: 4px;
  background-color: #fff;
  display: block;
  position: absolute;
  transform: translate3d(-100%, 5px, 0);
  border-radius: 1px;
  border: 1px solid #ddd;
  z-index: 100;
  overflow: hidden;
  user-select: none;

  &:before,
  &:after {
    content: "";
    display: table;
    float: none;
    clear: both;
  }

  &-divider {
    float: left;
    background-color: #ddd;
    width: 1px;
    height: @button-size;
    margin: 0 3px;
  }

  &-button {
    width: @button-size;
    height: @button-size;
    line-height: @button-size;
    float: left;
    color: #555;
    font-size: 18px;
    text-align: center;
    margin: 0 3px;
    cursor: pointer;

    &:not(:first-child) {
      border-left: 1px solid rgba(255, 255, 255, 0.2);
    }

    &:first-child {
      border-radius: 2px 0 0 2px;
    }

    &:last-child {
      border-radius: 0 2px 2px 0;
    }

    &:hover {
      box-shadow: 0 0 2px #666;
    }
  }
}
</style>
