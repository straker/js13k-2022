module.exports = function (config) {
  config.set({
    basePath: '',
    singleRun: false,
    autoWatch: true,
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      // src files
      {
        pattern: 'node_modules/zod/lib/index.mjs',
        type: 'module',
        included: false
      },
      { pattern: 'src/**/*.mjs', type: 'module', included: false },
      { pattern: 'src/**/*.js', type: 'module', included: false },

      // test files
      { pattern: 'test/*.js', type: 'module' },
      { pattern: 'test/**/*.spec.js', type: 'module' }
    ],
    browsers: ['ChromeHeadless'],
    reporters: ['mocha'],
    client: {
      mocha: {
        timeout: 4000,
        reporter: 'html'
      }
    }
  });
};
