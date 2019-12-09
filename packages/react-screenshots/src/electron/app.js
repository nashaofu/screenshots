import { ipcRenderer } from 'electron'
import React, { PureComponent } from 'react'
import Screenshot from '@/components/Screenshot'
import getSource from './getSource'
import 'normalize.css'
import './app.less'

export default class App extends PureComponent {
  state = {
    image: null,
    width: window.innerWidth,
    height: window.innerHeight
  }

  componentDidMount () {
    getSource()
      .then(({ thumbnail }) => {
        this.setState({ image: thumbnail.toDataURL() })
      })
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
    ipcRenderer.send('SCREENSHOTS::SAVE', { viewer, dataURL })
  }

  onCancel = () => {
    ipcRenderer.send('SCREENSHOTS::CANCEL')
  }

  onOk = ({ dataURL, viewer }) => {
    ipcRenderer.send('SCREENSHOTS::OK', { viewer, dataURL })
  }

  render () {
    const { image, width, height } = this.state
    if (!image) return null
    return (
      <Screenshot
        image={image}
        width={width}
        height={height}
        onSave={this.onSave}
        onCancel={this.onCancel}
        onOk={this.onOk}
      />
    )
  }
}
