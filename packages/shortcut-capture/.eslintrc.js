module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    es6: true,
    node: true,
    commonjs: true
  },
  extends: ['standard', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/member-delimiter-style': 0
  }
}
