import React, { ReactElement, useCallback } from 'react'
import Screenshots from '../Screenshots'
import { Bounds } from '../Screenshots/types'
import './app.less'
import imageUrl from './image.png'

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
        url={imageUrl}
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
