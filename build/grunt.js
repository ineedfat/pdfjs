/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            banner: '/*! <%= pkg.title %> | <%= pkg.homepage %> | ' +
              '<%= grunt.template.today("yyyy-mm-dd") %> | <%= pkg.author.name %>(<%= pkg.author.url %>)*/\nvar PDFJS_VERSION = <%= pkg.version %>'
        },
        lint: {
            files: [
              '../src/core.js',
              '../src/catalog.js',
              '../src/font.js',
              '../src/info.js',
              '../src/resources.js',
              //'../src/trailer.js',
              '../src/utils.js',

              //Classes
              '../src/class/obj.js',
              '../src/class/pageNode.js',
              '../src/class/pageTreeNode.js',
              '../src/class/stream.js'

            ]
        },
        concat: {
            dist: {
                src: ['<banner>', '<config:lint.files>'],
                dest: '../<%= pkg.name %>.js'
            },
        },
        min: {
            dist: {
                src: ['<banner>', '<config:lint.files>'],
                dest: '../<%= pkg.name %>.min.js'
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
        uglify: {}
    });

    // by default only concat cj files
    grunt.registerTask('default', 'concat min');

};