export default class Action {
  constructor (props) {
    this.props = props
  }

  setUndoPriority (context) {
    return Math.max.apply(null, [...context.stack.map(t => t.history[0].undoPriority), 0]) + 1
  }

  emit (event, ...args) {
    this.props.emit(event, ...args)
  }
}
