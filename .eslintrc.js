module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  globals: {
    PI: 'readonly',
    sin: 'readonly',
    cos: 'readonly',
    atan2: 'readonly'
  },
  rules: {
    'no-debugger': 0,
    'no-inner-declarations': 0
  },
  overrides: [
    {
      files: ['build.js'],
      env: {
        node: true,
        es2021: true
      }
    }
  ]
}
