/**
*Initialize new imageXObject object.
*@classdesc Representing an image object in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.stream
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*@param {int} width Width of the image to be rendered on page in pt.
*@param {int} height Height of the image to be rendered on page in pt.
*@param {int} [colorSpace=DeviceRGB] Color space of the image.
*@param {int} [bpc=8] Number of bits per color channel component.
*@param {int} [filter] Filter for decoding the image data.
*@param {object} [options] Extra options that can be set.
*/
var imageXObject = function (objectNumber, generationNumber, width, height, colorSpace, bpc, filter, options) {
    var self = this;

    stream.call(this, objectNumber, generationNumber);
    /**
        *Width of the image to be rendered on page in pt.
        *@Type int
        */
    this.width = width;
    /**
        *Height of the image to be rendered on page in pt.
        *@Type int
        */
    this.height = height;
    /**
        *Color space of the image.
        *@Type pdfJS.utils.colorSpace
        */
    this.colorSpace = colorSpace || utils.deviceRGB
    /**
        *Bits per component
        *@Type int
        *@Default 8
        */
    this.bpc = bpc || 8;
    /**
        *Decoding filter for the image data.
        *@Type pdfJS.utils.filterDecoder
        */
    this.filter = filter;

    /**
        *Name
        *@Type string
        *@Default Im1
        */
    this.name = 'Im1';
    /**
        *TODO: Extra options
        *@Type object
        *@Default {}
        */
    this.options = options || {};
};


imageXObject.prototype = Object.create(stream.prototype, {
    out: {
        value: function () {
            this.dictionary['Type'] = '/XObject';
            this.dictionary['Subtype'] = '/Image';
            this.dictionary['Width'] = this.width;
            this.dictionary['Height'] = this.height;
            this.dictionary['ColorSpace'] = '/' + this.colorSpace;
            this.dictionary['BitsPerComponent'] = this.bpc;

            if (this.filter) {
                this.dictionary['Filter'] = '/' + this.filter;
            }
            return stream.prototype.out.apply(this, arguments); //calling obj super class out method.
        }
    },
    /**
    *Graphic Operation Setter. Please see [graphicOperators]{@link pdfJS.graphicOperators} for available operations and corresponding set of operands.
    *@param {pdfJS.pageNode} pageObj Page to add image.
    *@param {int} x Translation in X direction (pt).
    *@param {int} y Translation in Y direction (pt).
    *@param {int} w Width of the image on page (pt).
    *@param {int} h Height of the image on page (pt).
    *@return {pdfJS.imageXObject#}
    *@memberof pdfJS.imageXObject#
    *@method
    */
    addImageToPage: {
        value: function (pageObj, x, y, w, h) {
            if (!w && !h) {
                w = -96;
                h = -96;
            }
            if (w < 0) {
                w = (-1) * this.width * 72 / w;
            }
            if (h < 0) {
                h = (-1) * this.height * 72 / h;
            }
            if (w === 0) {
                w = h * this.width / this.height;
            }
            if (h === 0) {
                h = w * this.height / this.width;
            }

            pageObj.currentStream.push('q');
            pageObj.currentStream.push(w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + (y + h).toFixed(2) + ' cm');
            pageObj.currentStream.push('/' + this.name + ' Do');
            pageObj.currentStream.push('Q');

            return this;
        }
    }
});
