module.exports = function (grunt) {
    var stripBanner = function (src, options) {

        if (!options) { options = {}; }
        var m = [];
        if (options.line) {
            // Strip // ... leading banners.
            m.push('(/{2,}[\\s\\S].*)');
        }
        if (options.block) {
            // Strips all /* ... */ block comment banners.
            m.push('(\/+\\*+[\\s\\S]*?\\*\\/+)');
        } else {
            // Strips only /* ... */ block comment banners, excluding /*! ... */.
            m.push('(\/+\\*+[^!][\\s\\S]*?\\*\\/+)');

        }
        var re = new RegExp('\s*(' + m.join('|') + ')\s*', 'g');
        src = src.replace(re, '');
        src = src.replace(/\s{2,}(\r|\n|\s){2,}$/gm, '');
        return src;
    };
    grunt.registerMultiTask('concat', 'Concatenate files.', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            separator: grunt.util.linefeed,
            banner: '',
            footer: '',
            stripBanners: false,
            process: false
        });
        // Normalize boolean options that accept options objects.
        if (typeof options.stripBanners === 'boolean' && options.stripBanners === true) { options.stripBanners = {}; }
        if (typeof options.process === 'boolean' && options.process === true) { options.process = {}; }

        // Process banner and footer.
        var banner = grunt.template.process(options.banner);
        var footer = grunt.template.process(options.footer);

        // Iterate over all src-dest file pairs.
        this.files.forEach(function (f) {
            // Concat banner + specified files + footer.
            var src = banner + f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                // Read file source.
                var src = grunt.file.read(filepath);
                // Process files as templates if requested.
                if (options.process) {
                    src = grunt.template.process(src, options.process);
                }
                // Strip banners if requested.
                if (options.stripBanners) {
                    src = stripBanner(src, options.stripBanners);
                }
                return src;
            }).join(grunt.util.normalizelf(options.separator)) + footer;

            // Write the destination file.
            grunt.file.write(f.dest, src);

            // Print a success message.
            grunt.log.writeln('File "' + f.dest + '" created.');
        });
    });

    grunt.registerMultiTask('createDocViews', 'build doc views', function () {
        grunt.log.writeln(this.file);

        var data = this.data,
            path = require('path'),
            files = grunt.file.expand(this.data.src),
            dest = grunt.template.process(data.dest),
            prefix = data.linkedPrefix;

        var regex = new RegExp('(href=")(.*?)(")', 'ig');
        var headerRegex = new RegExp('((\<\!.*\>)|(\<html.*\>)|(\<.*body\>)|(<(meta|link).*?>)|(<title.*?>.*?</title>)|(<script.*>.*?</script>)|<.*?head>)', 'igm');
        files.forEach(function (f) {
            var p = dest + '/' + path.basename(f),
                contents = grunt.file.read(f);

            contents = contents.replace(regex, '$1' + prefix + '$2$3');
            contents = contents.replace(headerRegex, '');


            grunt.file.write(p, contents);
            grunt.log.writeln('File "' + p + '" created.');
        });
    });
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        srcFiles: [
          //Polyfills
          'src/internals/pollyfills.js',

            //API calls
          'src/api/graphics.js',
          'src/api/text.js',

          //Classes
          'src/classes/obj.js',
          'src/classes/pageNode.js',
          'src/classes/pageTreeNode.js',
          'src/classes/stream.js',
          'src/classes/font.js',
          'src/classes/imageXObject.js',

          //PDF core parts
          'src/internals/core.js',
          'src/internals/catalog.js',
          'src/internals/info.js',
          'src/internals/resources.js',
          'src/internals/optionsConverter.js',

          //Supporting classes
          'src/utils.js',


          //plugins 
          'src/plugins/addImage.js',

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
                    'var PDFJS_VERSION = \'<%= pkg.version %>\';',
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
        }
    });

    

    grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');
    //grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    grunt.registerTask('debug', ['concat:debug']);

    grunt.registerTask('default', ['concat', 'uglify', 'doc']);

    grunt.registerTask('doc', ['clean', 'jsdoc', 'createDocViews']);

};