/*jshint node:true, strict:false, camelcase:false */
/*global module: true */

/**
 * GruntJs configuration
 * To have some specifics tasks:
 *  - grunt clean
 *  - grunt dependencies
 *  - grunt tests
 *  - grunt reports
 *  - grunt server
 *  - grunt dist
 */
var path = require('path');

module.exports = function (grunt) {
    'use strict';

    // Define some global variables:
    var srcFolderPath = './src',
        targetFolderPath = './target',
        tempWebAppBuildPath = targetFolderPath + '/compiled-webapp';


    // Grunt configuration
    grunt.initConfig({
        // -----------------------------------------------------------------------------------
        // -- Dependencies part
        // Bower part
        'bower': {
            'install': {
                'options': {
                    // See https://github.com/yatskevich/grunt-bower-task#options
                    'targetDir': srcFolderPath + '/frameworks',
                    'verbose': true,
                    'install': true,
                    'cleanBowerDir': false,
                    'cleanTargetDir': true,
                    'bowerOptions': {
                        'forceLatest': false,
                        'production': true
                    },
                    'layout': function (type, component) {
                        if (type === '__untyped__') {
                            return component;
                        }

                        return type === 'js' ? component : path.join(component, type); // Avoid the copy of the JavaScript files into a sub folder "js"
                    }
                }
            }
        },

        // -----------------------------------------------------------------------------------
        // -- Reports part
        // JsDoc
        'jsdoc': {
            'build': {
                'src': [srcFolderPath + '/javascripts/**/*.js'],
                'options': {
                    'destination': targetFolderPath + '/jsdoc3'
                }
            }
        },

        // JsHint part
        'jshint': {
            'options': {
                'force': true,
                'reporter': 'checkstyle',
                'reporterOutput': targetFolderPath + '/report-jshint-checkstyle.xml'
            },
            'strict': {
                'src': [srcFolderPath + '/javascripts/**/*.js'],
                // See https://github.com/jshint/jshint/blob/master/examples/.jshintrc
                'jshintrc': '.jshintrc'
            }
        },

        // LessLint part
        'lesslint': {
            'options': {
                'formatters': [
                    // See https://github.com/gruntjs/grunt-contrib-csslint#formatters
                    {
                        'id': 'checkstyle-xml',
                        'dest': targetFolderPath + '/report-lesslint-checkstyle.xml'
                    }
                ]
            },
            'strict': {
                'force': true,
                'src': [srcFolderPath + '/stylesheets/**/*.less'],
                'csslint': {
                    // See https://github.com/stubbornella/csslint/wiki/Rules
                    // See too https://github.com/gruntjs/grunt-contrib-csslint#options
                    'overqualified-elements': false,
                    'fallback-colors': true,
                    'empty-rules': true,
                    'duplicate-properties': true,
                    'known-properties': true,
                    'non-link-hover': true,
                    'adjoining-classes': false,
                    'import': true,
                    'font-faces': 2,
                    'universal-selector': true,
                    'zero-units': false,
                    'floats': true,
                    'font-sizes': true,
                    'important': false
                }
            }
        },

        // -----------------------------------------------------------------------------------
        // -- Tests part
        // Karma part
        'karma': {
            'test': {
                'configFile': 'karma.conf.js',
                'runnerPort': 9999,
                'singleRun': true,
                'browsers': ['PhantomJS'],
                'reporters': ['progress', 'junit', 'coverage'],
                'junitReporter': {
                    'outputFile': targetFolderPath + '/report-test-junit.xml',
                    'suite': 'unit'
                },
                'coverageReporter': {
                    'type': 'cobertura',
                    'dir': targetFolderPath + '/coverage-reports',
                    'file': 'report-test-cobertura.xml'
                }
            }
        },

        // -----------------------------------------------------------------------------------
        // -- Live edit part

        // grunt-express will serve the files from the folders listed in `bases`
        // on specified `port` and `hostname`
        'express': {
            'all': {
                'options': {
                    'port': 9002,
                    'hostname': 'localhost',
                    'server': path.resolve(__dirname, 'livereload.js'), // Prefer using this instead of 'bases': mostly faster !
                    'livereload': true
                }
            }
        },

        // grunt-watch will monitor the projects files
        'watch': {
            'all': {
                'files': [
                    srcFolderPath + '/**/*'
                ],
                'options': {
                    'livereload': true
                }
            }
        },

        // grunt-open will open your browser at the project's URL
        'open': {
            'all': {
                // Gets the port from the connect configuration
                'path': 'http://localhost:<%= express.all.options.port%>/src/index.html'
            }
        },

        // -----------------------------------------------------------------------------------
        // -- Distribution part
        // RequireJS part
        'requirejs': {
            'build': {
                /**
                 * Configuration for the RequireJs compilation
                 * @see https://github.com/jrburke/r.js/blob/master/build/example.build.js
                 */
                'options': {
                    'appDir': srcFolderPath + '/javascripts',
                    'baseUrl': '.',
                    'mainConfigFile': srcFolderPath + '/javascripts/main.js',
                    'name': 'main',
                    'findNestedDependencies': true, // Detect require call into require / define modules and include these into the build.
                    'keepBuildDir': true,
                    'dir': tempWebAppBuildPath + '/javascripts',
                    'optimize': 'uglify2',
                    'skipDirOptimize': false,
                    'preserveLicenseComments': false,
                    'logLevel': 0,
                    'useSourceUrl': false,
                    'uglify': {
                        'toplevel': true,
                        'ascii_only': true,
                        'beautify': false,
                        'max_line_length': 10000,
                        'defines': {
                            'DEBUG': ['name', 'false']
                        },
                        'no_mangle': false // If you set to 'false', you will have some problems with angular, if you don't specify the injection. Like: function ($scope) ... insteadof ['$scope', function ($scope) ...]
                    },
                    'uglify2': {
                        'output': {
                            'beautify': false
                        },
                        'compress': {
                            'sequences': false,
                            'global_defs': {
                                'DEBUG': false
                            }
                        },
                        'warnings': true,
                        'mangle': false // If you set to 'false', you will have some problems with angular, if you don't specify the injection. Like: function ($scope) ... insteadof ['$scope', function ($scope) ...]
                    },
                    'optimizeCss': 'standard.keepLines',
                    'paths': {
                        'app/template': '../templates' // Base on the 'dir' option path. We override this path in the case we have done modifications and compression on these
                    }
                }
            }
        },

        // Less part
        // See https://github.com/less/less.js
        // See https://github.com/gruntjs/grunt-contrib-less
        'less': {
            'build': {
                'options': {
                    'compress': true,
                    'cleancss': true
                },
                'files': [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: srcFolderPath + '/stylesheets',      // Src matches are relative to this path.
                        src: ['style.less'], // Actual pattern(s) to match.
                        dest: tempWebAppBuildPath + '/stylesheets',   // Destination path prefix.
                        ext: '.css'   // Dest filepaths will have this extension.
                    }
                ]
            }
        },

        // Other parts
        'copy': {
            'build': {
                'files': [
                    {
                        'expand': true,
                        'cwd': srcFolderPath + '/',
                        'dest': tempWebAppBuildPath + '/',
                        'flatten': false,
                        'src': '**/*'
                    }
                ]
            }
        },

        'contrib-clean': {
            'options': {
                'force': true // We can clean external folders / files !!!
            },
            'all': {
                'src': [targetFolderPath]
            },
            'tests': {
                'src': [targetFolderPath + '/coverage-reports', targetFolderPath + '/report-test-junit.xml']
            },
            'reports': {
                'src': [targetFolderPath + '/jsdoc3', targetFolderPath + '/report-jshint-checkstyle.xml', targetFolderPath + '/report-lesslint-checkstyle.xml']
            },
            'build': {
                'src': [tempWebAppBuildPath]
            },
            'requirejs': {
                'src': [tempWebAppBuildPath + '/javascripts-build']
            },
            'less': {
                'src': [tempWebAppBuildPath + '/**/*.less']
            }
        },

        'htmlmin': {
            'build': {
                'options': {
                    'removeComments': true,
                    'collapseWhitespace': true,
                    'removeAttributeQuotes': true,
                    'removeCDATASectionsFromCDATA': true,
                    'removeCommentsFromCDATA': true
                },
                'files': [
                    {
                        'expand': true,
                        'cwd': srcFolderPath + '/',
                        'flatten': false,
                        'src': ['index.html', '**/*.tmpl'],
                        'dest': tempWebAppBuildPath + '/'
                    }
                ]
            }
        },

        'imagemin': {
            'build': {
                'files': [{
                    'expand': true,
                    'cwd': srcFolderPath + '/',
                    'flatten': false,
                    'src': ['**/*.{gif,jpeg,jpg,png}'],
                    'dest': tempWebAppBuildPath + '/'
                }]
            }
        },

        'svgmin': {
            'build': {
                'files': [
                    {
                        'expand': true,
                        'cwd': srcFolderPath + '/',
                        'flatten': false,
                        'src': ['**/*.svg'],
                        'dest': tempWebAppBuildPath + '/'
                    }
                ]
            }
        },

        'manifest': {
            'build': {
                'options': {
                    'basePath': tempWebAppBuildPath,
                    'network': ['*'],
                    'preferOnline': true,
                    'timestamp': true
                },
                'src': [ '**/*.{txt,html,htm,tmpl,svg,png,jpg,jpeg,gif,tiff,swf,js,json,css,otf,eot,ttf,woff}' ],
                'dest': tempWebAppBuildPath + '/manifest.appcache'
            }
        },

        'combine': {
            'build': {
                'input': tempWebAppBuildPath + '/index.html',
                'output': tempWebAppBuildPath + '/index.html',
                'tokens': [
                    {
                        'token': '<html',
                        'string': '<html manifest=manifest.appcache'
                    },
                    {
                        'token': '<script type=text/javascript charset=UTF-8 defer=defer src=./frameworks/less/less-1.3.0.js></script>',
                        'string': ' ' // Cannot set an empty character ...
                    },
                    {
                        'token': 'type=text/less',
                        'string': 'type=text/css' // Cannot set an empty character ...
                    },
                    {
                        'token': '.less',
                        'string': '.css'
                    }
                ]
            }
        },

        'uglify': {
            'build': {
                'files': [
                    {
                        'expand': true,
                        'cwd': tempWebAppBuildPath + '/',
                        'flatten': false,
                        'src': ['frameworks/**/*.js', 'nls/**/*.js'],
                        'dest': tempWebAppBuildPath
                    }
                ]
            }
        },

        'strip': {
            'build': {
                'src': tempWebAppBuildPath + '/**/*.js',
                'options': {
                    'inline': true,
                    'nodes': ['console.log', 'console.warn', 'console.error', 'console.time', 'console.timeEnd']
                }
            }
        }
    });

    // Load grunt tasks from NPM packages
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-lesslint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-svgmin');
    grunt.loadNpmTasks('grunt-manifest');
    grunt.loadNpmTasks('grunt-combine');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-strip');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-open');

    grunt.renameTask('clean', 'contrib-clean');

    // A very basic defaukt task.
    grunt.registerTask('default', 'Log some stuff.', function () {
        grunt.log.write('Logging some stuff...').ok();
    });

    // Task for cleaning all files
    grunt.registerTask('clean', [
        'contrib-clean:all'
    ]);

    // Task for the dependencies
    grunt.registerTask('dependencies', [
        'bower:install'
    ]);

    // Task for the reports
    grunt.registerTask('reports', 'Generate reports', function () {
        //http://stackoverflow.com/questions/15423851/how-do-you-make-grunt-js-not-crash-on-warnings-by-default
        // always use force when watching
        grunt.option('force', true);
        grunt.task.run([
            'contrib-clean:reports',
            'jsdoc',
            'jshint',
            'lesslint'
        ]);
    });

    // Task for the tests
    grunt.registerTask('tests', [
        'contrib-clean:tests',
        'karma'
    ]);

    // Task for the server (live reload)
    // Creates the `server` task
    grunt.registerTask('server', [
        'express',
        'open',
        'watch'
    ]);

    // Task for the distribution
    grunt.registerTask('dist', [
        // -- Clean & copy
        'contrib-clean:build',
        'copy:build',

        // -- Generate the CSS files
        'less',
        'contrib-clean:less',

        // -- Minification
        'imagemin',
        'svgmin',
        'htmlmin',

        // -- Modify some files (to remove or replace some elements)
        'combine:build',
        'strip',

        // -- Minification using RequireJs
        'requirejs',

        // -- Minify frameworks JavaScript files
        'uglify',

        // -- At last, generate the HTML5 manifest
        'manifest'
    ]);
};