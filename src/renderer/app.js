import React, { PureComponent } from 'react'
import { ipcRenderer, remote } from 'electron'
import Screenshot from '@/components/Screenshot'
import getSource from './getSource'
import getDisplay from './getDisplay'
import './app.less'

export default class App extends PureComponent {
  state = {
    image: null,
    width: window.innerWidth,
    height: window.innerHeight
  }

  source = null
  display = getDisplay()

  componentDidMount () {
    ipcRenderer.send('ShortcutCapture::READY', this.display)
    getSource(this.display).then((source) => {
      this.source = source
      const blob = new Blob([this.source.thumbnail.toPNG()], { type: 'image/png' })
      this.setState({
        width: window.innerWidth,
        height: window.innerHeight,
        image: URL.createObjectURL(blob)
      })
    })
    window.addEventListener('resize', this.resize)
    remote.screen.on('display-metrics-changed', this.displayMetricsChanged)
  }

  componentWillUnmount () {
    window.addEventListener('resize', this.resize)
    remote.screen.off('display-metrics-changed', this.displayMetricsChanged)
  }

  resize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  displayMetricsChanged = () => {
    this.display = getDisplay()
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
