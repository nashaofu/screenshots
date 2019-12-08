import Action from './action'

export default class Ok extends Action {
  static title = '确定'

  static icon = 'screenshot-icon-ok'

  constructor (props) {
    super(props)
    const { setContext } = props
    setContext({
      viewer: null,
      action: null,
      stack: [],
      state: {},
      cursor: null
    })
  }
}
