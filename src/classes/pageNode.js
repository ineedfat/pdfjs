/**
*Initialize new pageNode object.
*@classdesc Representing a page in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {pdfJS.pageTreeNode} parent Parent pageTreeNode of this page.
*@param {pageOptions} pageOptions for this page.
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*@param {array[pdfJS.stream]} contentStreams Array of stream object that populate the page.
*@param {pdf.doc} document The document that own this page.
*/
var pageNode = function (parent, pageOptions, objectNumber, generationNumber, contentStreams, document) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    /**
        *Page Config options.
        *@Type object
        */
    this.pageOptions = pageOptions;
    /**
        *The parent pageTreeNode of this page.
        *@Type pdfJS.pageTreeNode
        */
    this.parent = parent;
    /**
        *Array of content streams (the actual content of the page).
        *@Type array[[pdfJS.stream]{@link pdfJS.stream} ]
        */
    this.contentStreams = contentStreams;
    /**
        *Current active stream in context.
        *@Type pdfJS.stream
        */
    this.currentStream = this.contentStreams[0];
    /**
        *The document that this page belongs to.
        *@Type pdfJS.doc
        */
    this.doc = document;
};
pageNode.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            var i, item,
                ret = [];

            this.body.push('<< /Type /Page');
            this.body.push(pageOptionsConverter(this.pageOptions));
            this.body.push('/Parent ' + this.parent.objectNumber + ' ' + this.parent.generationNumber + ' R');
            this.body.push('/Contents ');

            if (this.contentStreams.length) {
                this.body.push('[');
                for (i = 0; item = this.contentStreams[i]; i++) {
                    this.body.push(item.objectNumber + ' ' + item.generationNumber + ' R');
                }
                this.body.push(']');
            }

            this.body.push('>>');

            ret.push(obj.prototype.out.apply(this, arguments)); //calling obj super class out method.

            if (this.contentStreams.length) {
                for (i = 0; item = this.contentStreams[i]; i++) {
                    ret.push(item.out());
                }
            }
            return ret.join('\n');
        }
    },
    /**
    *Graphic Operation Setter. Please see [graphicOperators]{@link pdfJS.graphicOperators} for available operations and corresponding set of operands.
    *@param {string} operator Name of graphic operator.
    *@param {args} operand Operator operands (op1, op2, . . . opX)
    *@return {pageNode}
    *@memberof pdfJS.pageNode#
    *@method
    */
    graphic: {
        value: function (operator, operands) {
            if (this instanceof pageNode) {
                graphicOperators[operator].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            return this;
        }
    },
    /**
    *Text Operation Setter. Please see [textOperators]{@link pdfJS.textOperators} for available operations and corresponding set of operands.
    *@param {string} operator Name of graphic operator.
    *@param {args . . .} operand Operator operands
    *@return {pageNode} Return this pageNode object
    *@memberof pdfJS.pageNode#
    *@method
    */
    text: {
        value: function (operator, operands) {
            if (this instanceof pageNode) {
                textOperators[operator].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            return this;
        }
    },
    /**
    *Set current stream in context by index.
    *@param {int} index index of contentStreams
    *@return {pageNode} Return this pageNode object
    *@memberof pdfJS.pageNode#
    *@method
    */
    setStream: {
        value: function (index) {
            if (index >= this.contentStreams.length)
                throw 'Invalid stream index';
            this.currentStream = this.contentStreams[index];
            return this;
        }
    }
});
