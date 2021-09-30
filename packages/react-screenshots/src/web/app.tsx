import React, { ReactElement, useCallback } from 'react'
import Screenshots from '../Screenshots'
import url from './Battlecry.jpg'
import './app.less'

export default function App (): ReactElement {
  const onSave = useCallback((viewer, dataURL) => {
    console.log('SCREENSHOTS:save', dataURL, viewer)
  }, [])
  const onCancel = useCallback(() => {
    console.log('SCREENSHOTS:cancel')
  }, [])
  const onOk = useCallback((dataURL, viewer) => {
    console.log('SCREENSHOTS:ok', dataURL, viewer)
  }, [])

  return (
    <div className='body'>
      <Screenshots
        url={url}
        width={window.innerWidth / 2}
        height={window.innerHeight / 2}
        onSave={onSave}
        onCancel={onCancel}
        onOk={onOk}
      />
      <Screenshots
        url={url}
        width={window.innerWidth / 2}
        height={window.innerHeight / 2}
        onSave={onSave}
        onCancel={onCancel}
        onOk={onOk}
      />
      <Screenshots
        url={url}
        width={window.innerWidth / 2}
        height={window.innerHeight / 2}
        onSave={onSave}
        onCancel={onCancel}
        onOk={onOk}
      />
      <Screenshots
        url={url}
        width={window.innerWidth / 2}
        height={window.innerHeight / 2}
        onSave={onSave}
        onCancel={onCancel}
        onOk={onOk}
      />
    </div>
  )
}
