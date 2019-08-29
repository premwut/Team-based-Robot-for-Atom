module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    "quotes": ["error", "double"],
    "comma-dangle": ["error", "always-multiline"],
    "camelcase": [0, {"properties": "never"}],
  },
  globals: {}
}
