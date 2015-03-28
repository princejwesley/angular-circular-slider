module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        mangle: true,
        sourceMap: false,
        preserveComments: 'some',
      },
      dynamic_mappings: {
        files: [{
          src: 'src/js/angular-circular-slider.js',
          dest: 'dist/js/angular-circular-slider.min.js',
        }, ],
      },
    },

    autoprefixer: {

      options: {
        diff: false,
        map: false,
        browsers: ['> 1%', 'last 5 versions', 'Firefox ESR', 'Opera 12.1']
      },
      prefixed_css: {
        src: 'src/css/angular-circular-slider.css',
        dest: 'dist/css/angular-circular-slider.min.css',
      },

    },
    jshint: {
      all: ['Gruntfile.js', 'src/*.js'],
      options: {
        multistr: true
      }
    },
    cssmin: {
      my_target: {
        options: {
          keepSpecialComments: "*"
        },
        files: [{
          src: 'dist/css/angular-circular-slider.min.css',
          dest: 'dist/css/angular-circular-slider.min.css',
          ext: '.min.css'
        }]
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify', 'autoprefixer', 'cssmin']);

};
