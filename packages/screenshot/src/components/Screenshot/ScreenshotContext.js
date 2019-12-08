import React from 'react'

const ScreenshotContext = React.createContext({
  image: null,
  viewer: null,
  action: null,
  width: 0,
  height: 0,
  stack: [],
  cursor: null
})

function withContext (Component) {
  return props => {
    return (
      <ScreenshotContext.Consumer>
        {context => <Component {...props} {...context} />}
      </ScreenshotContext.Consumer>
    )
  }
}

export { ScreenshotContext as default, withContext }
