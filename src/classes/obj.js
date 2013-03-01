/**
*Initialize new PDf speical object.
*@classdesc Representing font type in PDF document.
*@constructor
*@memberof pdfJS
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*/
var obj = function (objectNumber, generationNumber) {
    var self = this;

    /**
        *Positive integer representing the object number of pdf internal objects.
        *@Type int
        *@default 0
        */
    this.objectNumber = objectNumber;
    /**
        *Non-negative integer representing the generation number of pdf internal objects.
        *@Type int
        *@default 0
        */
    this.generationNumber = generationNumber;
    /**
        *The content of this obj.
        *@Type int
        *@default []
        */
    this.body = [];
};
obj.prototype = {
    /**
    *Output PDF data string for this obj.
    *@return {string}
    *@memberof pdfJS.obj#
    */
    out: function () {
        var self = this,
            sb = [];

        sb.push(this.objectNumber + ' ' + this.generationNumber + ' obj');
        sb = sb.concat(this.body);
        sb.push('endobj');

        return sb.join('\n')
    },
    body: [],
    objectNumber: 0,
    generationNumber: 0
};