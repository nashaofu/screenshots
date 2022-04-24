import React, { ReactElement, useCallback } from 'react'
import Screenshots from '../Screenshots'
import url from './image.png'
import './app.less'
import { Bounds } from '../Screenshots/types'

export default function App (): ReactElement {
  const onSave = useCallback((blob: Blob | null, bounds: Bounds) => {
    console.log('save', blob, bounds)
    console.log(blob && URL.createObjectURL(blob))
  }, [])
  const onCancel = useCallback(() => {
    console.log('cancel')
  }, [])
  const onOk = useCallback((blob: Blob | null, bounds: Bounds) => {
    console.log('ok', blob, bounds)
    console.log(blob && URL.createObjectURL(blob))
  }, [])

  return (
    <div className='body'>
      <Screenshots
        url={url}
        width={window.innerWidth}
        height={window.innerHeight}
        lang={{
          operation_rectangle_title: 'Rectangle'
        }}
        onSave={onSave}
        onCancel={onCancel}
        onOk={onOk}
      />
    </div>
  )
}
