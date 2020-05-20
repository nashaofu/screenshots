import React, { PureComponent } from 'react'

export default class ScreenshotsViewerEditPoint extends PureComponent {
  constructor (props) {
    super(props)
    this.textareaRef = React.createRef()
  }

  componentDidMount () {
    if (!this.props.value) {
      this.textareaEl.current.focus()
    }
  }

  componentDidUpdate () {
    if (!this.props.value) {
      this.textareaEl.current.focus()
    }
  }

  render () {
    const { x, y, size, color, value, cursor, onBlur } = this.props
    return (
      <>
        <div
          ref={this.textareaRef}
          className="screenshots-textarea"
          contentEditable="true"
          spellCheck="false"
          style={{
            transform: [`translate(${x - 12}px, ${y - 11}px)`], // 12, 11是试出来的~~，64字体以上有一点点偏移
            color,
            fontSize: size,
            cursor
          }}
          defaultValue={value}
          onBlur={onBlur}
        />
      </>
    )
  }
}
