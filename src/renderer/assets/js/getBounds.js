export default displays => {
  return displays.reduce((size, { x, y, width, height }) => {
    const w = x + width - size.x
    const h = y + height - size.y
    if (size.x > x) {
      size.x = x
    }
    if (size.y > y) {
      size.y = y
    }
    if (size.width < w) {
      size.width = w
    }
    if (size.height < h) {
      size.height = h
    }
    return size
  }, { x: 0, y: 0, width: 0, height: 0 })
}
