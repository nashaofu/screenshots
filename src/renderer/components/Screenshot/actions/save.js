export default class Save {
  static title = '保存'

  static icon = 'screenshot-icon-save'

  constructor ({ el, ctx, context, setContext }) {
    const a = document.createElement('a')
    a.href = el.toDataURL('image/png')
    a.download = 'screenshot.png'
    a.rel = 'noopener'
    try {
      a.dispatchEvent(new MouseEvent('click'))
    } catch (e) {
      const evt = document.createEvent('MouseEvents')
      evt.initMouseEvent(
        'click',
        true,
        true,
        window,
        0,
        0,
        0,
        80,
        20,
        false,
        false,
        false,
        false,
        0,
        null
      )
      a.dispatchEvent(evt)
    }
    setContext({
      viewer: null,
      action: null,
      stack: [],
      state: {},
      cursor: null
    })
  }
}
