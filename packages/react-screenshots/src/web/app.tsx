import React, { ReactElement, useCallback } from 'react'
import Screenshots from '../Screenshots'
import url from './image.jpg'
import './app.less'
import { Bounds } from '../Screenshots/types'

export default function App (): ReactElement {
  const onSave = useCallback((blob: Blob, bounds: Bounds) => {
    console.log('save', blob, bounds)
    console.log(URL.createObjectURL(blob))
  }, [])
  const onCancel = useCallback(() => {
    console.log('cancel')
  }, [])
  const onOk = useCallback((blob: Blob, bounds: Bounds) => {
    console.log('ok', blob, bounds)
    console.log(URL.createObjectURL(blob))
  }, [])

  return (
    <div className='body'>
      <Screenshots
        url={url}
        width={window.innerWidth}
        height={window.innerHeight}
        lang={{
          magnifier_coordinate_label: 'Coor',
          operation_ok_title: 'Ok',
          operation_cancel_title: 'Cancel',
          operation_save_title: 'Save',
          operation_redo_title: 'Redo',
          operation_undo_title: 'Undo',
          operation_mosaic_title: 'Mosaic',
          operation_text_title: 'Text',
          operation_brush_title: 'Brush',
          operation_arrow_title: 'Arrow',
          operation_ellipse_title: 'Ellipse',
          operation_rectangle_title: 'Rectangle'
        }}
        onSave={onSave}
        onCancel={onCancel}
        onOk={onOk}
      />
    </div>
  )
}
