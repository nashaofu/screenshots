/**
 * 如果string字符串长度小于 length 则在左侧填充字符
 * 如果超出length长度则截断超出的部分。
 * @param {unknown} string
 * @param {string} chars
 * @param {number} length
 */
export default function padStart(string: unknown, length = 0, chars = ' '): string {
  let str = String(string);
  while (str.length < length) {
    str = `${chars}${str}`;
  }
  return str;
}
