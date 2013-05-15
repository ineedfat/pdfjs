module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        srcFiles: [
          //Polyfills
          'src/internals/pollyfills.js',
          'src/internals/statesTracker.js',

            //API calls
          'src/internals/graphics.js',
          'src/internals/text.js',

          //Classes
          'src/classes/obj.js',
          'src/classes/pageNode.js',
          'src/classes/pageTreeNode.js',
          'src/classes/stream.js',
          'src/classes/font.js',
          'src/classes/imageXObject.js',
          'src/classes/docTemplate.js',
          'src/classes/ellipticalArc.js',

          //PDF cores
          'src/internals/core.js',
          'src/internals/catalog.js',
          'src/internals/info.js',
          'src/internals/resources.js',
          'src/internals/optionsConverter.js',
            
          //Supporting classes
          'src/utils.js',
          'src/internals/operators.js',
          'src/internals/operationStates.js',
          'src/internals/enums.js',
          
          //plugins 
          'src/internals/addImage.js',
            
          'src/internals/svg/svgReader.prototype.parser.js',
          'src/internals/svg/svgReader.js',
          'src/internals/svg/svgReader.utils.js',
          'src/internals/svg/svgReader.elements.js',

          'src/internals/pluginAdapter.js',

          //Public exposure
          'src/public.js'
        ],
        concat: {
            options: {
                banner: '/***********************************************\n' +
                    '* pdfJS JavaScript Library\n' +
                    '* Authors: https://github.com/ineedfat/pdfjs\n' +
                    '* License: MIT (http://www.opensource.org/licenses/mit-license.php)\n' +
                    '* Compiled At: <%= grunt.template.today("mm/dd/yyyy HH:MM") %>\n' +
                    '***********************************************/\n' +
                    '(function(_) {\n' +
                    '\'use strict\';\n' +
                    'var PDFJS_VERSION = \'<%= pkg.version %>\';\n',
                footer: '\n}(window));'
            },
            debug: {
                src: ['<%= srcFiles %>'],
                dest: '<%= pkg.name %>-<%= pkg.version %>_debug.js'
            },
            production: {
                options: { stripBanners: { block: false, line: true } },
                src: ['<%= srcFiles %>'],
                dest: '<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        jshint: {
            options: {
                camelcase: true,
                curly: true,
                forin: true,
                immed: true,
                //indent: 4,
                latedef: true,
                noarg: true,
                noempty: true,
                quotmark: 'single',
                //undef: true,
                //unused: true,
                trailing: true,
                maxdepth: 3,
                maxlen: 120,
                evil: true,
                loopfunc: true,
                boss: true,
                sub: true
            },
            all: {
                files: {
                    src: ['<%= srcFiles %>']
                }
            }
        },
        uglify: {
            build: {
                src: ['<%= pkg.name %>-<%= pkg.version %>.js'],
                dest: '<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        jsdoc : {
            dist : {
                src: ['<%= srcFiles %>', 'README.md'],
                options: {
                    destination: 'doc'
                }
            }
        },
        createDocViews: {
            data: {
                linkedPrefix: '#/docs?link=',
                dest: 'examples/views/doc/',
                src: [
                    'doc/*.html'
                ]
            }
        },
        clean: {
            buildDoc: {
                src: ["doc", "examples/views/doc"]
            }
        },
        copy: {
            main: {
                files: [
                  { src: ['<%= pkg.name %>-<%= pkg.version %>.js'], dest: 'examples/js/' }
                ]
            }
        }
    });

    
    grunt.loadTasks('gruntTasks');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');
    //grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');


    // Default task(s).
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'copy', 'doc']);
    grunt.registerTask('debug', ['jshint','concat:debug']);
    grunt.registerTask('prod', ['jshint', 'concat', 'copy']);
    grunt.registerTask('doc', ['clean', 'jsdoc', 'createDocViews']);

};