/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            banner: '/*! <%= pkg.title %> | <%= pkg.homepage %> | ' +
              '<%= grunt.template.today("yyyy-mm-dd") %> | <%= pkg.author.name %>(<%= pkg.author.url %>)*/\nvar PDFJS_VERSION = \'<%= pkg.version %>\';'
        },
        lint: {
            files: [
              //PDF core parts
              '../src/internals/core.js',
              '../src/internals/catalog.js',
              '../src/internals/info.js',
              '../src/internals/resources.js',
              '../src/internals/optionsConverter.js',

              //Supporting classes
              '../src/utils.js',

              //Classes
              '../src/classes/obj.js',
              '../src/classes/pageNode.js',
              '../src/classes/pageTreeNode.js',
              '../src/classes/stream.js',
              '../src/classes/font.js',

              //API calls
              '../src/api/graphics.js',
              '../src/api/text.js',

              //Public exposure
              '../src/public.js',
            ]
        },
        concat: {
            dist: {
                src: ['<banner>', '<config:lint.files>'],
                dest: '../<%= pkg.name %>-<%= pkg.version %>.js'
            },
        },
        min: {
            dist: {
                src: ['<banner>', '<config:lint.files>'],
                dest: '../<%= pkg.name %>-<%= pkg.version %>.min.js'
            },
        },
        watch: {
            cj: {
                files: '<config:lint.files>',
                tasks: 'concat min'
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {
                jQuery: true,
                pdfJS: true
            }
        },
        wrap: {
            data: {
                banner: '/***********************************************\n' +
                    '* pdfJS JavaScript Library\n' +
                    '* Authors: https://github.com/ineedfat/pdfjs\n' +
                    '* License: MIT (http://www.opensource.org/licenses/mit-license.php)\n' +
                    '* Compiled At: <%= grunt.template.today("mm/dd/yyyy HH:MM") %>\n' +
                    '***********************************************/',
                header: '(function(_) {\n' +
                    '\'use strict\';',
                footer: '\n}(window));',
                dest: '..',
                src: [
                    '../<%= pkg.name %>-<%= pkg.version %>.js',
                    '../<%= pkg.name %>-<%= pkg.version %>.min.js'
                    
                ]
            }
        },
        uglify: {}
    });


    grunt.registerMultiTask('wrap', 'wrap file with header and footer', function () {
        var data = this.data,
            path = require('path'),
            banner = data.banner ? grunt.template.process(data.banner) : '',
            header = data.header || '',
            footer = data.footer || '',
            files = grunt.file.expandFiles(this.file.src),
            dest = grunt.template.process(data.dest),
            sep = grunt.utils.linefeed;

        files.forEach(function (f) {
            var p = dest + '/' + path.basename(f),
                contents = grunt.file.read(f);

            grunt.file.write(p, banner + sep + header + sep + contents + sep + footer);
            grunt.log.writeln('File "' + p + '" created.');
        });
    });

    // by default only concat cj files
    grunt.registerTask('default', 'concat min wrap');

};