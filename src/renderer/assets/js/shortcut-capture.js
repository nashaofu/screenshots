import {
  screen,
  remote,
  webFrame,
  ipcRenderer,
  desktopCapturer
} from 'electron'
import maxBy from 'lodash/maxBy'

export default class ShortcutCapture {
  constructor ({
    $bg,
    $rect,
    $toolbar
  }) {
    this.$bg = $bg
    this.$rect = $rect
    this.$toolbar = $toolbar
    this.bgCtx = this.$bg.getContext('2d')
    this.rectCtx = this.$rect.getContext('2d')
    this.rect = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0
    }

    this.setZoomLevel()
    this.onShortcutCapture()
    ipcRenderer.emit('shortcut-capture')
    this.onScreen()
    this.onMouseEvents()
    this.initView()
  }

  get $win () {
    return remote.getCurrentWindow()
  }

  get displays () {
    return screen.getAllDisplays()
      .map(({ id, bounds, scaleFactor }) => ({
        id,
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        scaleFactor
      }))
  }

  get bounds () {
    if (process.env.NODE_ENV === 'development') {
      return this.displays[0]
    }
    return this.displays
      .reduce((size, { width, height, x, y }) => {
        if (size.width < x + width) {
          size.width = x + width
        }
        if (size.height < y + height) {
          size.height = y + height
        }
        return size
      }, { width: 0, height: 0, x: 0, y: 0 })
  }

  setZoomLevel () {
    // 设置缩放限制
    webFrame.setZoomFactor(100)
    webFrame.setZoomLevel(0)
    webFrame.setVisualZoomLevelLimits(1, 1)
  }

  onShortcutCapture () {
    ipcRenderer.on('shortcut-capture', async () => {
      const capturer = await this.getCapturer()
      this.drawBg(capturer)
      this.show()
    })
  }

  onScreen () {
    screen.on('display-added', () => this.$win.setBounds(this.bounds))
    screen.on('display-removed', () => this.$win.setBounds(this.bounds))
    screen.on('display-metrics-changed', () => this.$win.setBounds(this.bounds))
  }

  initView () {
    this.$bg.width = this.bounds.width
    this.$bg.height = this.bounds.height
    this.$rect.width = 0
    this.$rect.height = 0
  }

  async getCapturer () {
    const displays = this.displays
    const maxDisplay = maxBy(displays, display => display.width * display.height * display.scaleFactor)
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
        sources = sources.map(({ thumbnail }, index) => {
          const display = displays[index]
          // 以第一个屏幕为基准缩放
          const scale = display.scaleFactor / displays[0].scaleFactor
          const width = display.width * scale
          const height = display.height * scale
          return {
            x: display.x,
            y: display.y,
            width,
            height,
            thumbnail: thumbnail.toPNG()
          }
        })
        resolve(sources)
      })
    })
  }

  show () {
    this.$win.show()
    this.$win.focus()
    this.$win.setBounds(this.bounds)
    if (this.displays.length === 1) {
      this.$win.setFullScreen(true)
    }
  }

  hide () {
    this.$win.hide()
    this.$win.setFullScreen(false)
    this.$win.setBounds({
      x: 0,
      y: 0,
      width: 0,
      height: 0
    })
  }

  drawBg (capturer) {
    this.bgCtx.clearRect(0, 0, this.$bg.width, this.$bg.height)
    capturer.forEach(({ x, y, width, height, thumbnail }) => {
      const $img = new Image()
      const blob = new Blob([thumbnail], { type: 'image/png' })
      $img.src = URL.createObjectURL(blob)

      $img.addEventListener('load', () => {
        this.bgCtx.drawImage($img, x, y, width, height, x, y, width, height)
      })
    })
  }

  onMouseEvents () {
    let drawRectFlag = false
    window.addEventListener('mousedown', e => {
      // 鼠标左键
      if (e.button === 0) {
        return
      }
      drawRectFlag = true
      this.rect = {
        x1: e.clientX,
        y1: e.clientY,
        x2: e.clientX,
        y2: e.clientY
      }
      this.drawRect()
    })
    window.addEventListener('mousemove', e => {
      if (!drawRectFlag) {
        return
      }
      this.rect.x2 = e.clientX
      this.rect.y2 = e.clientY
      this.drawRect()
    })
    window.addEventListener('mouseup', e => {
      if (!drawRectFlag) {
        return
      }
      this.rect.x2 = e.clientX
      this.rect.y2 = e.clientY
      drawRectFlag = false
      this.drawRect()
    })
  }

  drawRect () {
    const { x1, y1, x2, y2 } = this.rect
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)

    // 清空绘图区域
    this.rectCtx.clearRect(0, 0, this.$rect.width, this.$rect.height)
  }

  drawImage (start, end, isShowToobar) {
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)
    let style = {}
    if (end.y > start.y) {
      style.top = start.y + 'px'
    } else {
      style.bottom = window.innerHeight - start.y + 'px'
    }
    if (end.x > start.x) {
      style.left = start.x + 'px'
    } else {
      style.right = window.innerWidth - start.x + 'px'
    }
    ['left', 'right', 'top', 'bottom'].forEach(key => {
      this.$canvas.style[key] = ''
      this.$toolbar.style[key] = ''
    })

    Object.keys(style).forEach(key => {
      this.$canvas.style[key] = style[key]
    })
    const toolbarWidth = this.$toolbar.offsetWidth
    const toolbarHeight = this.$toolbar.offsetHeight
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    // 清空绘图区域
    this.ctx.clearRect(0, 0, windowWidth, windowHeight)

    if (width <= 2 || height <= 2) {
      this.$canvas.width = 0
      this.$canvas.height = 0
      this.$canvas.style.visibility = 'hidden'
      this.$toolbar.style.visibility = 'hidden'
      return
    } else {
      this.$canvas.width = width
      this.$canvas.height = height
      this.$canvas.style.visibility = 'visible'
      if (!isShowToobar) {
        this.$toolbar.style.visibility = 'hidden'
      } else {
        this.$toolbar.style.visibility = 'visible'
      }
    }
    const x = start.x < end.x ? start.x : end.x
    const y = start.y < end.y ? start.y : end.y
    let left = x + width - toolbarWidth
    let top = y + height + 7
    if (left < 0) {
      left = 0
    }
    if (left + toolbarWidth > windowWidth) {
      left = windowWidth - toolbarWidth
    }
    this.$toolbar.style.left = left + 'px'
    if (top + toolbarHeight > windowHeight) {
      top = y - toolbarHeight
    }
    if (top < 0) {
      top = 0
    }
    this.$toolbar.style.top = top + 'px'
    const $bg = document.querySelector('#bg')
    this.ctx.drawImage($bg.querySelectorAll('img')[0], x, y, width, height, 0, 0, width, height)
  }

  cancel () {
    window.addEventListener('keydown', e => {
      if (e.keyCode === 27) {
        this.drawImage({ x: 0, y: 0 }, { x: 0, y: 0 })
        this.$window.hide()
      }
    })
  }

  cancelDraw () {
    const $cancel = document.querySelector('#cancel')
    $cancel.addEventListener('mousedown', e => {
      e.stopPropagation()
    })
    $cancel.addEventListener('click', e => {
      e.stopPropagation()
      this.drawImage({ x: 0, y: 0 }, { x: 0, y: 0 })
    })
  }

  checkDraw () {
    const $check = document.querySelector('#check')
    $check.addEventListener('mousedown', e => {
      e.stopPropagation()
    })
    $check.addEventListener('click', e => {
      e.stopPropagation()
      const dataURL = this.ctx.canvas.toDataURL('image/png')
      ipcRenderer.send('shortcut-capture', dataURL)
      this.drawImage({ x: 0, y: 0 }, { x: 0, y: 0 })
      this.$window.hide()
    })
  }
}
