var utiles = {
    evalEditorDocCode: function(codeString) {
        var regex = /var\s+(.+).*=.*new.+pdfJS.doc\(.*\)/m;
        var matches = codeString.match(regex);

        if (!matches || matches.length < 2){
            return;
        }
        var docVar = matches[1];

        var sb = [];
        
        sb.push('var ret = (function() {', codeString, '\n return ', docVar, '; })()');
        var closedEvalCode = sb.join(' ');
        try {
            eval(closedEvalCode);
        }
        catch (e) {
            console.log(e);
            return;
        }

        return ret;
    }
};