var pdfJS = {};

(function ($) {
    // Size in pt of various paper formats
    var PDF_VERSION = '1.3';
    
    pdfJS.paperFormat = {
        'a3': [841.89, 1190.55],
        'a4': [595.28, 841.89],
        'a5': [420.94, 595.28],
        'letter': [612, 792],
        'legal': [612, 1008]
    };
    
    pdfJS.doc = function (format, orientation) {
        var self = this;
        self.plugins = {};
        self.objectNumber = 0;
        self.pages = [];
        self.currentPage = -1;
        self.fonts = {};
        self.activeFontKey = null;
        self.activeFontSize = 16;
        self.fontmap = {}; // mapping structure fontName > fontStyle > font key - performance layer. See addFont()
        self.documentProperties = { 'title': '', 'subject': '', 'author': '', 'keywords': '', 'creator': '' };
        self.docContent = [];
        self.contentLength = 0;
        self.offsets = [];
        self.fontmap = {}; // mapping structure fontName > fontStyle > font key - performance layer. See addFont()
        self.settings = {
            dimensions: pdfJS.paperFormat['letter'],
            lineWidth: 0.200025 // 2mm
        };
        
        //Determine page navigation.
        if (typeof format === 'string') {
            self.settings.dimensions = pdfJS.paperFormat[format.toLowerCase()];
        } else if (typeof format === 'object' && typeof format[0] === 'number' && format[1] === 'number') {
            self.settings.dimensions = format.slice().splice(0, 2);
        }
        
        if (typeof orientation === 'string' && orientation.toLowerCase() === 'landscape') {
            var temp = self.settings.dimensions[0];
            self.settings.dimensions[0] = self.settings.dimensions[1];
            self.settings.dimensions[1] = temp;
        }

        this.addFonts();
        this.activeFontKey = 'F1';
        this.addPage();

    };
    pdfJS.doc.prototype.addPage = function () {
        this.currentPage++;
        this.pages[this.currentPage] = [];
        // Set line width
        this.out(pdfJS.utils.f2(this.settings.lineWidth) + ' w');
    };
    pdfJS.doc.prototype.outToContent = function(string) {
        this.docContent.push(string);
        this.contentLength += string.length + 1;
    };
    
    pdfJS.doc.prototype.out = function (string) {
        this.outToPage(this.currentPage, string);
    };
    pdfJS.doc.prototype.outToPage = function (page, string) {
        if (typeof page !== 'number') {
            throw ('Invalid Page. Expect integer');
        }
        if (page >= this.pages.length) {
            throw ('Page does not exist');
        }
        this.pages[this.currentPage].push(string);
    };
    
    pdfJS.doc.prototype.newObj = function() {
        this.offsets[this.objectNumber] = this.contentLength;
        this.out(this.objectNumber + ' 0 obj');
        this.objectNumber++;
        return this.objectNumber - 1;
    };

    pdfJS.doc.prototype.putStream = function(str) {
        this.out('stream');
        this.out(str);
        this.out('endstream');
    };
    
    pdfJS.doc.prototype.buildDocument = function () {
        this.docContent = [];
        this.contentLength = 0;
        this.offsets = [];
        this.objectNumber = 0;
        //Write header
        this.outToContent('%PDF-' + PDF_VERSION);

        this.putPages();

        this.putResources();

        this.putInfo();
        
        this.putCatalog();
        
        // Cross-ref
        var o = this.contentLength;
        this.outToContent('xref');
        this.outToContent('0 ' + (this.objectNumber + 1));
        this.outToContent('0000000000 65535 f ');
        for (var i = 0; i < this.objectNumber; i++) {
            this.outToContent(pdfJS.utils.padd10(this.offsets[i]) + ' 00000 n ');
        }
        
        // Trailer
        this.outToContent('trailer');
        this.outToContent('<<');
        this.putTrailer();
        this.outToContent('>>');
        this.outToContent('startxref');
        this.outToContent(o);

        this.outToContent('%%EOF');

        console.log(this.docContent.join('\n'));
        return this.docContent.join('\n');
    };
    
    pdfJS.doc.prototype.output = function (type, options) {
        var undef
        switch (type) {
            case undef:
                return this.buildDocument();
            case 'datauristring':
            case 'dataurlstring':
                return 'data:application/pdf;base64,' + btoa(this.buildDocument());
            case 'datauri':
            case 'dataurl':
                document.location.href = 'data:application/pdf;base64,' + btoa(this.buildDocument()); break;
                break;
            case 'dataurlnewwindow':
                window.open('data:application/pdf;base64,' + btoa(this.buildDocument()));
                break;
            default:
                throw new Error('Output type "' + type + '" is not supported.');
        }
        // @TODO: Add different output options
    };
})(jQuery);