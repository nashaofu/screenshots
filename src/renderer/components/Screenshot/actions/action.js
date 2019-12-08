export default class Action {
  constructor (props) {
    this.props = props
  }

  get state () {
    const {
      context: { actions }
    } = this.props
    const index = actions.findIndex(({ key }) => this instanceof key)
    if (index === -1) return
    return actions[index].value
  }

  setState (state) {
    const {
      context: { actions },
      setContext
    } = this.props
    const index = actions.findIndex(({ key }) => this instanceof key)
    if (index === -1) return
    actions[index].value = {
      ...actions[index].value,
      ...state
    }
    setContext({
      actions: [...actions]
    })
  }

  emit (event, ...args) {
    this.props.emit(event, ...args)
  }
}
