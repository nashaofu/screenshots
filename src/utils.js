export const getBounds = displays => {
  return displays.reduce((size, { width, height, x, y }) => {
    if (size.width < x + width) {
      size.width = x + width
    }
    if (size.height < y + height) {
      size.height = y + height
    }
    return size
  }, { x: 0, y: 0, width: 0, height: 0 })
}
