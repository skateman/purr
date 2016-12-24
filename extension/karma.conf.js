// Karma configuration
// Generated on Fri Dec 23 2016 14:42:44 GMT+0100 (CET)

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      'test/common.js',
      {pattern: 'test/*Spec.js'},
      {pattern: 'src/*.js'}
    ],
    exclude: [],
    preprocessors: {
      'src/*.js': ['coverage']
    },
    reporters: ['dots', 'coverage'],
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome', 'Firefox'],
    singleRun: true,
    concurrency: Infinity
  })
}
