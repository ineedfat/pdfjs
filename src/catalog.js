(function($) {
    pdfJS.doc.prototype.putCatalog = function () {
        this.offsets[this.objectNumber] = this.contentLength;
        this.outToContent(this.objectNumber + ' 0 obj');
        this.outToContent('<<');
        
        this.outToContent('/Type /Catalog');
        this.outToContent('/Pages 1 0 R');
        // @TODO: Add zoom and layout modes
        this.outToContent('/OpenAction [3 0 R /FitH null]');
        this.outToContent('/PageLayout /OneColumn');

        this.outToContent('>>');
        this.outToContent('endobj');
    };
})();