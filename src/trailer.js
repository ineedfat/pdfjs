(function($) {
    pdfJS.doc.prototype.putTrailer = function() {
        this.outToContent('/Size ' + (this.objectNumber + 1));
        this.outToContent('/Root ' + this.objectNumber + ' 0 R');
        this.outToContent('/Info ' + (this.objectNumber - 1) + ' 0 R');
    };
})(jQuery);