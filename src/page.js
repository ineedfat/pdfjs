(function($) {
    pdfJS.doc.prototype.putPages = function () {
        var n, len, p;
        for (n = 0, len = this.pages.length; n < len; n++) {
            
            this.offsets[this.objectNumber] = this.contentLength;
            this.outToContent(this.objectNumber + ' 0 obj');
            this.objectNumber++;
            
            this.outToContent('<</Type /Page');
            this.outToContent('/Parent 1 0 R');
            this.outToContent('/Resources 2 0 R');
            this.outToContent('/Contents ' + (this.objectNumber + 1) + ' 0 R>>');
            this.outToContent('endobj');

            // Page content
            p = this.pages[n].join('\n');
            
            this.offsets[this.objectNumber] = this.contentLength;
            this.outToContent(this.objectNumber + ' 0 obj');
            this.objectNumber++;
            
            this.outToContent('<</Length ' + p.length + '>>');
            this.outToContent('stream');
            this.outToContent(p);
            this.outToContent('endstream');
            this.outToContent('endobj');
        }

        this.outToContent('1 0 obj');
        this.outToContent('<</Type /Pages');
        var kids = '/Kids [';
        for (n = 0, len = this.pages.length; n < len; n++) {
            kids += (3 + 2 * n) + ' 0 R ';
        }
        this.outToContent(kids + ']');
        this.outToContent('/Count ' + this.pages.length);
        this.outToContent('/MediaBox [0 0 ' + pdfJS.utils.f2(this.settings.dimensions[0]) + ' ' + pdfJS.utils.f2(this.settings.dimensions[1]) + ']');
        this.outToContent('>>');
        this.outToContent('endobj');
    };
})(jQuery);