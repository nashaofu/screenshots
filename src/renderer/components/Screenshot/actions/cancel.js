export default class Cancel {
  static title = '取消'

  static icon = 'screenshot-icon-cancel'

  constructor ({ el, ctx, setContext }) {
    setContext({
      viewer: null,
      action: null,
      stack: [],
      state: {},
      cursor: null
    })
  }
}
