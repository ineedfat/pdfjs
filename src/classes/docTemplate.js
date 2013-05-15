/**
*Initialize new template object.
*@classdesc Representing a template object in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {doc} document defining the number of time the pdf
has been modified (default is 0 when creating).
*/
var docTemplate = function (document) {
    this.templateContent = [];
    stream.call(this, 0, 0, document);
};

docTemplate.prototype = Object.create(stream.prototype, {
    out: {
        value: function (objectNumber, generationNumber, page) {
            var replaceRegex, value,
                    templateString = this.templateContent.join('\n');

            this.objectNumber = objectNumber;
            this.generationNumber = generationNumber;
            if (page.data) {
                for (var name in page.data) {
                    if (page.data.hasOwnProperty(name)) {
                        replaceRegex = new RegExp('{{' + name + '}}', 'g');
                        value = page.data[name];
                        templateString = templateString.replace(replaceRegex, value);
                    }
                }
            }
            this.content = [templateString];
            //calling stream super class out method.
            return stream.prototype.out.apply(this, arguments);
        }
    },
    push: {
        value: function (args) {
            Array.prototype.push.apply(this.templateContent, arguments);
            return this;
        }
    }
});