const dpr = window.devicePixelRatio ?? 2

// 最小为2
export default dpr < 2 ? 2 : dpr
