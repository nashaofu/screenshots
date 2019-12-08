module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  env: {
    es6: true,
    node: true,
    browser: true,
    commonjs: true
  },
  extends: ['standard', 'standard-react'],
  plugins: ['react-hooks'],
  rules: {
    'react/prop-types': 0,
    'react/jsx-handler-names': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-quotes': ['error', 'prefer-double'],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
