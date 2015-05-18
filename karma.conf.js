module.exports = function ( config ) {
  config.set({
    basePath: './',

    files: [
      'test-helpers.js',
      'src/**/Resource.spec.js'
    ],

    frameworks: [ 'browserify', 'mocha', 'chai' ],
    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-chai',
      'karma-phantomjs-launcher',
      'karma-browserify'
    ],

    preprocessors: {
      'src/**/*.js': [ 'browserify' ],
      '*.js': [ 'browserify' ]
    },

    browserify: {
      debug: true,
      // plugin: [ 'proxyquire-universal' ],
      transform: [ 'babelify', 'browserify-shim' ]
    },

    reporters: [ 'mocha' ],
    colors: true,
    logLevel: config.LOG_WARN,
    browsers: [ 'PhantomJS' ],
    captureTimeout: 120000,
    singleRun: true,
    autoWatch: false
  });
};

