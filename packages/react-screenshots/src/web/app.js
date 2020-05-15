import React, { PureComponent } from 'react'
import Screenshot from '@/components/Screenshots'
import 'normalize.css'
import './app.less'
import image from './Battlecry.jpg'

export default class App extends PureComponent {
  state = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  componentDidMount () {
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resize)
  }

  resize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  onSave = ({ viewer, dataURL }) => {
    console.log('SCREENSHOTS::SAVE', dataURL, viewer)
  }

  onCancel = () => {
    console.log('SCREENSHOTS::CANCEL')
  }

  onOk = ({ dataURL, viewer }) => {
    console.log('SCREENSHOTS::OK', dataURL, viewer)
  }

  render () {
    const { width, height } = this.state
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
