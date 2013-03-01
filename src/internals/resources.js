/**
*Initialize new font object.
*@classdesc Representing font type in PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*@private
*/
var resources = function (objectNumber, generationNumber) {
    var self = this;
    obj.call(this, objectNumber, generationNumber);
    /**
        *An array of all {@link pdfJS.font} objects included this document.
        *@Type {array of [fonts]{@link pdfJS.font}}  
        */
    this.fontObjs = [];
    this.imageXObjects = [];
};

var printDictionaryElements = function (arr, prefix) {
    var ret = [],
        i, len;
    for (i = 0, len = arr.length; i < len; i++) {
        ret.push('/' + prefix + (i).toString(10) + ' ' + arr[i].objectNumber + ' ' + arr[i].generationNumber + ' R');
    }

    return ret.join('\n');
};


resources.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            // Resource dictionary
            this.body.push('<<');
            //For compatibility only.
            this.body.push('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
            this.body.push('/Font <<');
            // Do this for each font, the '1' bit is the index of the font
            this.body.push(printDictionaryElements(this.fontObjs, 'F'));
            this.body.push('>>');
            this.body.push('/XObject <<');
            this.body.push(printDictionaryElements(this.imageXObjects, 'Im'));
            this.body.push('>>');
            this.body.push('>>');

            return obj.prototype.out.apply(this, arguments); //calling obj super class out method.
        }
    }
});
