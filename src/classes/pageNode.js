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
var pageNode = function (parent, pageOptions, objectNumber, generationNumber, contentStreams,
    repeatableStreams, templateStreams, document) {
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

    this.repeatableStreams = repeatableStreams;

    this.templateStreams = templateStreams;

    this.reservedObjectNums = [];

    this.doc = document;

    this.data = {
        pageNum: 0,
        pageTotal: function () { return self.doc.pageCount; }
    };
};
pageNode.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body = [];
            var i, l, item,
                ret = [];

            for (i = 0, l = this.templateStreams.length; i < l; i++) {
                if (!this.reservedObjectNums[i]) {
                    this.reservedObjectNums[i] = ++this.doc.objectNumber;
                }
                ret.push(this.templateStreams[i].out(this.reservedObjectNums[i], 0, this));
            }
            this.body.push('<< /Type /Page');
            this.body.push(pageOptionsConverter(this.pageOptions));
            this.body.push('/Parent ' + this.parent.objectNumber + ' ' + this.parent.generationNumber + ' R');
            this.body.push('/Contents ');

            

            //TODO: add resources page 80.
            if (this.contentStreams.length) {
                this.body.push('[');
                for (i = 0; item = this.contentStreams[i]; i++) {
                    this.body.push(item.objectNumber + ' ' + item.generationNumber + ' R');
                }
                for (i = 0; item = this.repeatableStreams[i]; i++) {
                    this.body.push(item.objectNumber + ' ' + item.generationNumber + ' R');
                }
                for (i = 0; item = this.reservedObjectNums[i]; i++) {
                    this.body.push(item + ' ' + 0 + ' R');
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




