// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt)
{

    'use strict';
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app', dist: 'dist'
    };
    require('grunt-connect-proxy');
    grunt.loadNpmTasks('grunt-connect-proxy');
    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'], tasks: ['wiredep']
            }, js: {
                files: ['<%= yeoman.app %>/**/*.js'], tasks: [], options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            }, jsTest: {
                files: ['test/spec/**/*.js'], tasks: ['newer:jshint:test', 'karma']
            }, styles: {
                files: ['<%= yeoman.app %>/css/**/*.css'], tasks: ['newer:copy:styles', 'autoprefixer']
            }, gruntfile: {
                files: ['Gruntfile.js']
            }, livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }, files: ['<%= yeoman.app %>/**/*.html', '.tmp/styles/{,*/}*.css', '<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}']
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9001, // Change this to '0.0.0.0' to access the server from outside.
                hostname: '*',
                livereload: 35730
            },
            proxies: [
                {
                    context: ['/EvoconReportingServer'],
                    host: 'ec2-54-171-253-111.eu-west-1.compute.amazonaws.com',
                    port: 9080,
                    changeOrigin:true,
                    https: false,
                    headers: {
                        'Authorization': 'Token token',
                        'host': 'ec2-54-171-253-111.eu-west-1.compute.amazonaws.com',
                        'Content-Type':'application/json'
                    }
                }
            ],

            livereload: {
                options: {
                    open: true, middleware: function (connect)
                    {
                        return [connect.static('.tmp'),
                                connect().use('/bower_components', connect.static('./bower_components')),
                                connect.static(appConfig.app),
                                require('grunt-connect-proxy/lib/utils').proxyRequest];
                    }
                }
            }, test: {
                options: {
                    port: 9001, middleware: function (connect)
                    {
                        return [connect.static('.tmp'),
                                connect.static('test'),
                                connect().use('/bower_components', connect.static('./bower_components')),
                                connect.static(appConfig.app)];
                    }
                }
            }, dist: {
                options: {
                    open: true, base: '<%= yeoman.dist %>'
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            }, all: {
                src: ['Gruntfile.js', '<%= yeoman.app %>/scripts/{,*/}*.js']
            }, test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                }, src: ['test/spec/{,*/}*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                            dot: true, src: ['.tmp', '<%= yeoman.dist %>/{,*/}*', '!<%= yeoman.dist %>/.git*']
                        }]
            }, server: '.tmp'
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            }, dist: {
                files: [{
                            expand: true, cwd: '.tmp/styles/', src: '{,*/}*.css', dest: '.tmp/styles/'
                        }]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            options: {
//        cwd: '<%= yeoman.app %>'
            }, app: {
                src: ['<%= yeoman.app %>/index.html'], ignorePath: /\.\.\//
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: ['<%= yeoman.dist %>/scripts/{,*/}*.js',
                      '<%= yeoman.dist %>/styles/{,*/}*.css',
                      '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                      '<%= yeoman.dist %>/styles/fonts/*']
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                            expand: true,
                            dot: true,
                            cwd: '<%= yeoman.app %>',
                            dest: '<%= yeoman.dist %>',
                            src: ['*.{ico,png,txt}', '.htaccess', '*.html', 'views/{,*/}*.html', 'images/{,*/}*.{webp}', 'fonts/*']
                        },
                        {
                            expand: true,
                            cwd: '.tmp/images',
                            dest: '<%= yeoman.dist %>/images',
                            src: ['generated/*']
                        },
                        {
                            expand: true,
                            cwd: 'bower_components/bootstrap/dist',
                            src: 'fonts/*',
                            dest: '<%= yeoman.dist %>'
                        }]
            }, styles: {
                expand: true, cwd: '<%= yeoman.app %>/css', dest: '.tmp/styles/', src: '{,*/}*.css'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: ['copy:styles'], test: ['copy:styles'], dist: ['copy:styles']
        },

        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js', singleRun: true
            }
        }
    });


    grunt.registerTask('serve', 'Compile then start a connect web server', function (target)
    {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive', 'configureProxies:server']);
        }
        grunt.task.run(['clean:server', 'wiredep', 'concurrent:server','configureProxies:server','autoprefixer', 'connect:livereload', 'watch']);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target)
    {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', ['clean:server', 'concurrent:test', 'autoprefixer', 'connect:test', 'karma']);

    grunt.registerTask('build', ['clean:dist', 'wiredep', 'concurrent:dist', 'autoprefixer', 'copy:dist', 'filerev']);

    grunt.registerTask('default', ['newer:jshint', 'test', 'build']);
};
