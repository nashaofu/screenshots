import React, { PureComponent } from 'react'
import Screenshot from '@/components/Screenshot'
import image from './Battlecry.jpg'
import './app.less'

export default class App extends PureComponent {
  state = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  componentDidMount () {
    window.addEventListener('resize', () => {
      this.setState({
        width: window.innerWidth,
        height: window.innerHeight
      })
    })
  }

  render () {
    const { width, height } = this.state
    return (
      <div className="app-screenshot">
        <Screenshot image={image} width={width} height={height} />
      </div>
    )
  }
}
