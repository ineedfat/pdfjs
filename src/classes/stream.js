/**
*Initialize new steam object.
*@classdesc Representing a stream object in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the
pdf has been modified (default is 0 when creating).
*/
function stream (objectNumber, generationNumber, document) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    statesTracker.call(this);
    /**
        *The content of this stream.
        *@Type [string]
        *@default []
        */
    this.content = [];
    /**
        *Specifying the dictionary part of a PDF object (e.g dictionary['SomeKey'] = 'SomeValue').
        *@Type object 
        *@default {}
        */
    this.dictionary = {};
    /**
        *The document that this page belongs to.
        *@Type pdfJS.doc
        */
    this.doc = document;

    this.activeFont = undefined;
    this.activeFontSize = 14;

    this.activeFillCS = undefined;
    this.activeStrokeCS = undefined;
}
var printDictionary = function (dict) {
    var ret = [],
        temp;
    for (temp in dict) {
        if (dict.hasOwnProperty(temp)) {
            ret.push('/'+temp + ' ' + dict[temp]);
        }
    }
    return ret.join('\n');
};

stream.prototype = Object.create(obj.prototype, {
    out: {
        value: function (buff) {
            var temp = printDictionary(this.dictionary);
            var tempContent = this.content;

            if (!(this instanceof imageXObject)) {
                tempContent = (['q']).concat(this.content);
                tempContent.push('Q');
            }

            this.body.push('<< /Length ' + (tempContent.join('\n').length));
            if (temp) {
                this.body.push(temp);
            }
            this.body.push('>>');
            this.body.push('stream');
            this.body.push.apply(this.body, tempContent);
            this.body.push('endstream');

            var ret = obj.prototype.out.apply(this, arguments); //calling obj super class out method.

            this.body = [];

            return ret;
        }
    },
    /**
        *Shortcut to pushing content to the stream (same as stream.content.push('something');
        *@param {string} args stream.push(item1, item2, . . . , itemX)
        *@return {pdfJS.stream} Return this stream object.
        *@memberof pdfJS.stream#
        *@method
        */
    push: {
        value: function (args) {
            this.validate(args);
            Array.prototype.push.apply(this.content, arguments);
            return this;
        }
    }
});
mixin(stream, textOperators);
mixin(stream, graphicOperators);
mixin(stream, statesTracker.prototype);