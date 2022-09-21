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
  rules: {
    'no-debugger': 0,
    'no-inner-declarations': 0
  },
  overrides: [
    {
      files: ['build.js', 'karma.conf.js'],
      env: {
        node: true,
        es2021: true
      }
    },
    {
      files: ['test/**/*.js'],
      env: {
        browser: true,
        es2021: true,
        mocha: true
      },
      globals: {
        assert: true
      }
    }
  ]
};
