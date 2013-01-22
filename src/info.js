(function ($) {
    pdfJS.doc.prototype.putInfo = function () {
        this.offsets[this.objectNumber] = this.contentLength;
        this.outToContent(this.objectNumber + ' 0 obj');

        this.outToContent('<<');

        this.outToContent('/Producer (PDFjs ' + PDFJS_VERSION + ')');
        if (this.documentProperties.title) {
            this.outToContent('/Title (' + pdfJS.pdfEscape(this.documentProperties.title) + ')');
        }
        if (this.documentProperties.subject) {
            this.outToContent('/Subject (' + pdfJS.pdfEscape(this.documentProperties.subject) + ')');
        }
        if (this.documentProperties.author) {
            this.outToContent('/Author (' + pdfJS.pdfEscape(this.documentProperties.author) + ')');
        }
        if (this.documentProperties.keywords) {
            this.outToContent('/Keywords (' + pdfJS.pdfEscape(this.documentProperties.keywords) + ')');
        }
        if (this.documentProperties.creator) {
            this.outToContent('/Creator (' + pdfJS.pdfEscape(this.documentProperties.creator) + ')');
        }
        var created = new Date();
        this.outToContent('/CreationDate (D:' +
            [
                created.getFullYear(),
                pdfJS.utils.padd2(created.getMonth() + 1),
                pdfJS.utils.padd2(created.getDate()),
                pdfJS.utils.padd2(created.getHours()),
                pdfJS.utils.padd2(created.getMinutes()),
                pdfJS.utils.padd2(created.getSeconds())
            ].join('') +
            ')'
        );

        this.outToContent('>>');
        this.outToContent('endobj');
        
        this.objectNumber++;

    };
})(jQuery);