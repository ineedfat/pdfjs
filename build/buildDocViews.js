/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        docViews: {
            data: {
                linkedPrefix: '#/docs?link=',
                dest: '../examples/views/doc/',
                src: [
                    '../doc/*.html',
                ]
            }
        }
    });

    grunt.registerMultiTask('docViews', 'build doc views', function () {
        var data = this.data,
            path = require('path'),
            files = grunt.file.expandFiles(this.file.src),
            dest = grunt.template.process(data.dest),
            prefix = data.linkedPrefix;
        grunt.log.writeln('got here' + files.length);

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

    grunt.registerTask('default', ['docViews']);

};