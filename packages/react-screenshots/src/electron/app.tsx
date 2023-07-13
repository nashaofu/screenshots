import React, { useCallback, useEffect, useState } from 'react'
import Screenshots from '../Screenshots'
import { Bounds } from '../Screenshots/types'
import { Lang } from '../Screenshots/zh_CN'
import './app.less'
import BlackImg from '../web/black.png'
export interface Display {
  id: number;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function App (): JSX.Element {
  const [url, setUrl] = useState<string | undefined>(undefined)
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)
  const [display, setDisplay] = useState<Display | undefined>(undefined)
  const [lang, setLang] = useState<Lang | undefined>(undefined)
  const [boundsDisplayIndex, setBoundsDisplayIndex] = useState<number>(-1)

  // 每次有新的截图任务时，重置，不然会有缓存
  useEffect(() => {
    setBoundsDisplayIndex(-1)
  }, [url])

  const onSave = useCallback(
    async (blob: Blob | null, bounds: Bounds) => {
      if (!display || !blob) {
        return
      }
      window.screenshots.save(await blob.arrayBuffer(), { bounds, display })
    },
    [display]
  )

  const onCancel = useCallback(() => {
    window.screenshots.cancel()
  }, [])

  const onOk = useCallback(
    async (blob: Blob | null, bounds: Bounds) => {
      if (!display || !blob) {
        return
      }
      window.screenshots.ok(await blob.arrayBuffer(), { bounds, display })
    },
    [display]
  )

  useEffect(() => {
    const onSetLang = (lang: Lang) => {
      setLang(lang)
    }

    const onCapture = (
      display: Display,
      dataURL: string,
      options?: {
        enableBlackMask: boolean
      }
    ) => {
      setDisplay(display)
      console.log('options', options)
      if (options?.enableBlackMask) {
        setUrl(BlackImg)
      } else {
        setUrl(dataURL)
      }
    }

    const onReset = () => {
      setUrl(undefined)
      setDisplay(undefined)
      setBoundsDisplayIndex(-1)
      // 确保截图区域被重置
      requestAnimationFrame(() => window.screenshots.reset())
    }

    const onBoundsSelect = (index: number) => {
      setBoundsDisplayIndex(index)
    }

    window.screenshots.on('setLang', onSetLang)
    window.screenshots.on('capture', onCapture)
    window.screenshots.on('reset', onReset)
    window.screenshots.on('boundsSelectUpdate', onBoundsSelect)
    // 告诉主进程页面准备完成
    window.screenshots.ready()
    return () => {
      window.screenshots.off('capture', onCapture)
      window.screenshots.off('setLang', onSetLang)
      window.screenshots.off('reset', onReset)
      window.screenshots.off('boundsSelectUpdate', onBoundsSelect)
    }
  }, [])

  useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onCancel])

  return (
    <div className='body'>
      <Screenshots
        url={url}
        width={width}
        height={height}
        lang={lang}
        onSave={onSave}
        onCancel={onCancel}
        boundsDisplayIndex={boundsDisplayIndex}
        onOk={onOk}
      />
    </div>
  )
}
