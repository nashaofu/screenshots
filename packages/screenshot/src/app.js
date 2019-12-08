import React, { PureComponent } from 'react'
import { ipcRenderer, remote } from 'electron'
import Screenshot from '@/components/Screenshot'
import getSource from './getSource'
import './app.less'

export default class App extends PureComponent {
  state = {
    image: null,
    width: window.innerWidth,
    height: window.innerHeight
  }

  source = null

  componentDidMount () {
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount () {
    window.addEventListener('resize', this.resize)
  }

  resize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  onSave = ({ viewer, dataURL }) => {
    ipcRenderer.send('ShortcutCapture::SAVE', dataURL, viewer)
  }

  onCancel = () => {
    ipcRenderer.send('ShortcutCapture::CANCEL')
  }

  onOk = ({ dataURL, viewer }) => {
    ipcRenderer.send('ShortcutCapture::OK', dataURL, viewer)
  }

  render () {
    const { image, width, height } = this.state
    return (
      <div className="app-screenshot">
        {image && (
          <Screenshot
            image={image}
            width={width}
            height={height}
            onSave={this.onSave}
            onCancel={this.onCancel}
            onOk={this.onOk}
          />
        )}
      </div>
    )
  }
}
