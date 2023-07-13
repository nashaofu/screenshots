import useStore from './useStore'

// 当前屏幕是否可以进行截图
export default function useDisplayActive () {
  const { displayIndex, boundsDisplayIndex } = useStore()
  return boundsDisplayIndex === -1 || displayIndex === boundsDisplayIndex
}
