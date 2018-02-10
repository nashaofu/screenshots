<template lang="pug">
canvas.background(
  :width="width",
  :height="height"
)
</template>

<script>
export default {
  name: 'Background',
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
    sources: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      ctx: null
    }
  },
  computed: {
    width () {
      return this.bounds.width
    },
    height () {
      return this.bounds.height
    }
  },
  mounted () {
    this.ctx = this.$el.getContext('2d')
  },
  watch: {
    sources: {
      deep: true,
      handler () {
        this.draw()
      }
    }
  },
  methods: {
    draw () {
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.sources.forEach(({ x, y, width, height, thumbnail }) => {
        const $img = new Image()
        const blob = new Blob([thumbnail], { type: 'image/png' })
        $img.src = URL.createObjectURL(blob)

        $img.addEventListener('load', () => {
          this.ctx.drawImage($img, x, y, width, height, x, y, width, height)
        })
      })
    }
  }
}
</script>

<style lang="stylus">
.background
  display block
  position absolute
  top 0
  right 0
  bottom 0
  left 0
  cursor pointer
</style>
