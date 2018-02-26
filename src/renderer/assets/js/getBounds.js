export default displays => {
  console.log(displays)
  return displays.reduce((size, { x1, y1, x2, y2 }) => {
    if (size.x > x1) {
      size.x = x1
    }
    if (size.y > y1) {
      size.y = y1
    }
    if (size.width < x2 - size.x) {
      size.width = x2 - size.x
    }
    if (size.height < y2 - size.y) {
      size.height = y2 - size.y
    }
    return size
  }, { x: 0, y: 0, width: 0, height: 0 })
}
