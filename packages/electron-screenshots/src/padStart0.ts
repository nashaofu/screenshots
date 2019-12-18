/**
 * 如果string字符串长度小于 length 则在左侧填充字符
 * 如果超出length长度则截断超出的部分。
 * @param {number} num
 * @param {number} len
 */
export default (num: number, len = 2): string => {
  let str = String(num)
  while (str.length < len) {
    str = `0${str}`
  }
  return str
}
