(function ($) {
    pdfJS.doc.prototype.putResourceDictionary = function() {
        this.outToContent('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
        this.outToContent('/Font <<');
        // Do this for each font, the '1' bit is the index of the font
        for (var fontKey in this.fonts) {
            if (this.fonts.hasOwnProperty(fontKey)) {
                this.outToContent('/' + fontKey + ' ' + this.fonts[fontKey].objectNumber + ' 0 R');
            }
        }
        this.outToContent('>>');
        this.outToContent('/XObject <<');
        //putXobjectDict();
        this.outToContent('>>');
    };
    pdfJS.doc.prototype.putResources = function() {
        this.putFonts();
        // Resource dictionary
        this.offsets[this.objectNumber] = this.contentLength;
        this.outToContent('2 0 obj');
        this.outToContent('<<');
        this.putResourceDictionary();
        this.outToContent('>>');
        this.outToContent('endobj');
    };
})();