import { ipcRenderer } from 'electron'
import React, { PureComponent } from 'react'
import Screenshot from '@/components/Screenshots'
import getSourceDataURL from './getSourceDataURL'
import 'normalize.css'
import './app.less'

export default class App extends PureComponent {
  state = {
    image: null,
    width: window.innerWidth,
    height: window.innerHeight
  }

  componentDidMount () {
    // 告诉主进程页面准备完成
    ipcRenderer.send('SCREENSHOTS::DOM-READY')
    window.addEventListener('resize', this.resize)
    window.addEventListener('keyup', this.onKeyUp)
    ipcRenderer.on('SCREENSHOTS::SEND-DISPLAY-DATA', this.getSource)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('keyup', this.onKeyUp)
    ipcRenderer.off('SCREENSHOTS::SEND-DISPLAY-DATA', this.getSource)
  }

  getSource = (e, display) => {
    getSourceDataURL(display).then(dataURL => {
      // 捕捉完桌面后通知主进程
      ipcRenderer.send('SCREENSHOTS::CAPTURED')
      this.setState({ image: dataURL })
    })
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

  onKeyUp = ({ code }) => {
    if (code === 'Escape') {
      this.onCancel()
    }
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
