var karma = require('karma');

/*global module:false*/
module.exports = function (grunt) {
	
  // Project configuration.
  grunt.initConfig({
    builddir: 'build',
    pkg: '<json:package.json>',
    meta: {
      banner: '/**\n' + ' * <%= pkg.description %>\n' +
      ' * @version v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      ' * @link <%= pkg.homepage %>\n' +
      ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' + ' */'
    },
    concat: {
      build: {
        src: ['<banner:meta.banner>', 'src/*.js'],
        dest: '<%= builddir %>/<%= pkg.name %>.js'
      }
    },
    min: {
      build: {
        src: ['<banner:meta.banner>', '<config:concat.build.dest>'],
        dest: '<%= builddir %>/<%= pkg.name %>.min.js'
      }
    },
    lint: {
      files: ['grunt.js', 'src/*.js', 'src/**/*.js']
    },
    watch: {
      files: ['src/**/*.js', 'src/*.js'],
      tasks: 'build test'
    }
  });

  // Default task.
  grunt.registerTask('default', 'build test');

  grunt.registerTask('build', 'build ng-videosharing-embed', function () {

    var jsBuildFiles = grunt.config('concat.build.src');
    var lessBuildFiles = [];

    if (this.args.length > 0) {

      this.args.forEach(function(moduleName) {
        var modulejs = grunt.file.expandFiles('src/*/' + moduleName + '/*.js');

        jsBuildFiles = jsBuildFiles.concat(modulejs);
      });

      grunt.config('concat.build.src', jsBuildFiles);

    } else {
      grunt.config('concat.build.src', jsBuildFiles.concat(['src/*/*.js']));
    }

    grunt.task.run('concat min');
  });
  
  grunt.registerTask('test', 'run tests', function () {
    var done = this.async();
    grunt.utils.spawn({
      cmd: process.platform === 'win32' ? 'karma.cmd' : 'karma',
      args: process.env.TRAVIS ? ['start', 'config/karma.conf.js', '--single-run', '--no-auto-watch', '--reporters=dots', '--browsers=Firefox'] : ['run']
    }, function (error, result, code) {
      if (error) {
        grunt.warn("Make sure the karma server is online: run `grunt server`.\n" +
          "Also make sure you have a browser open to http://localhost:8080/.\n" +
          error.stdout + error.stderr);
        //the karma runner somehow modifies the files if it errors(??).
        //this causes grunt's watch task to re-fire itself constantly,
        //unless we wait for a sec
        setTimeout(done, 1000);
      } else {
        grunt.log.write(result.stdout);
        done();
      }
    });
  });
  
  // single run test
  grunt.registerTask('test-c9', 'run test on cloud9 ide', function () {
    //Mark the task as async but never call done, so the server stays up
    var done = this.async();
    grunt.utils.spawn({
      cmd: process.platform === 'win32' ? 'karma.cmd' : 'karma',
      args: ['start', 'config/karma.conf.c9.js', '--single-run', '--no-auto-watch', '--reporters=dots', '--browsers=PhantomJS']
    }, function (error, result, code) {
      if (error) {
        grunt.warn("Make sure the karma server is online: run `grunt server`.\n" +
          "Also make sure you have a browser open to http://localhost:8080/.\n" +
          error.stdout + error.stderr);
        //the karma runner somehow modifies the files if it errors(??).
        //this causes grunt's watch task to re-fire itself constantly,
        //unless we wait for a sec
        setTimeout(done, 1000);
      } else {
        grunt.log.write(result.stdout);
        done();
      }
    });

  });

};