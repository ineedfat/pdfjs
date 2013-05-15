'use strict';

module.exports = function (grunt) {
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
};
