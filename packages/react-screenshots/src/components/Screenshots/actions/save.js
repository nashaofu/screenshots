import Action from './action'

export default class Save extends Action {
  static title = '保存'

  static icon = 'screenshots-icon-save'

  constructor (props) {
    super(props)
    const { el, context, setContext } = props
    this.emit('onSave', {
      viewer: { ...context.viewer },
      dataURL: el.toDataURL('image/png')
    })
    setContext({
      viewer: null,
      action: null,
      stack: [],
      state: {},
      cursor: null
    })
  }
}
