export interface RGBA {
  r: number
  g: number
  b: number
  a: number
}

export default class Color {
  static parse (cStr: string) {
    if (/^#[A-Fa-f0-9]+$/.test(cStr)) {
      const step = cStr.length === 4 ? 1 : 2
      const rgb = []
      for (let i = 0; i < 3; i++) {
        rgb.push(parseInt(cStr.substr(1 + i * step, step), 16))
      }

      return new Color({
        r: rgb[0] ?? 0,
        g: rgb[1] ?? 0,
        b: rgb[2] ?? 0,
        a: 1
      })
    }

    const rgbaStr = cStr.match(/^rgba?\((.+)\)$/)?.[1]
    if (rgbaStr) {
      const rgba = rgbaStr
        .split(',')
        .slice(0, 4)
        .map(item => parseInt(item))

      return new Color({
        r: rgba[0] ?? 0,
        g: rgba[1] ?? 0,
        b: rgba[2] ?? 0,
        a: rgba[2] ?? 1
      })
    }

    return new Color({
      r: 0,
      g: 0,
      b: 0,
      a: 0
    })
  }

  rgba: RGBA

  constructor (rgba: RGBA) {
    this.rgba = rgba
  }

  invert () {
    const rgba = {
      r: 255 - this.rgba.r,
      g: 255 - this.rgba.g,
      b: 255 - this.rgba.b,
      a: this.rgba.a
    }

    return new Color(rgba)
  }

  toString () {
    const { r, g, b, a } = this.rgba
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
}
