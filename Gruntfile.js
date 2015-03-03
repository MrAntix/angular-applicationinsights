module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> version <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    coveralls: {
      options: {
          debug: true,
          coverageDir: 'coverage/',
          dryRun: false,
          force: false,
          recursive: true
      }
    },
    jshint: {
      all: ['src/**/*js', 'test/**/*.js']
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma-coveralls');

  
  grunt.registerTask('default', ['jshint','karma','uglify']);
  grunt.registerTask('travis',['jshint','karma','uglify','coveralls']);

};