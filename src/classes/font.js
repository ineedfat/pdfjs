/**
*Initialize new font object.
*@classdesc Representing font type in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {object} font
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*/
var font = function (font, objectNumber, generationNumber) {
    var self = this;
    obj.call(this, objectNumber, generationNumber);
    /**
        *Font description object.
        *@Type object
        */
    this.description = font;
};

font.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body.push('<< /Type /Font');
            this.body.push('/Subtype /Type1');
            this.body.push('/BaseFont /' + this.description.postScriptName);

            if (typeof this.description.encoding === 'string') {
                this.body.push('/Encoding /' + this.description.encoding);
            }
            this.body.push('>>');

            return obj.prototype.out.apply(this, arguments); //calling obj super class out method.
        }
    }
});
