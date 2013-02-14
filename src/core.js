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
    
    pdfJS.doc = function (format, orientation, margin) {
        var self = this;
        self.objectNumber = 0; //object counter used for setting indirect object.
        self.fontObjs = [];
        
        self.fontmap = {}; // mapping structure fontName > fontStyle > font key - performance layer. See addFont()
        self.objectMap = {};
        //General document setting should get set here.
        self.settings = {
            dimension: pdfJS.paperFormat['letter'],
            documentProperties: { 'title': '', 'subject': '', 'author': '', 'keywords': '', 'creator': '' }
        };
        
        self.pageCount = 0;
        //Determine page dimensions.
        if (typeof format === 'string') {
            self.settings.dimension = pdfJS.paperFormat[format.toLowerCase()];
        } else if (typeof format === 'object' && typeof format[0] === 'number' && format[1] === 'number') {
            self.settings.dimension = format.slice().splice(0, 2);
        }
        
        if (typeof orientation === 'string' && orientation.toLowerCase() === 'landscape') {
            var temp = self.settings.dimension[0];
            self.settings.dimension[0] = self.settings.dimension[1];
            self.settings.dimension[1] = temp;
        }
        self.currentNode = self.rootNode = new pdfJS.pageTreeNode(null, ++self.objectNumber, 0);
        self.currentPage = null;
        /////////////////
        this.addStandardFonts();
        self.resObj = this.resources();
        self.infoObj = this.info();
        self.catalogObj = this.catalog();
    };
    pdfJS.doc.prototype.newObj = function () {
        return new pdfJS.obj(++this.objectNumber, 0);
    }
    pdfJS.doc.prototype.newStream = function () {
        return new pdfJS.stream(++this.objectNumber, 0);
    }
    pdfJS.doc.prototype.addPage = function (height, width) {
        this.pageCount++;
        this.currentPage = new pdfJS.pageNode(
            this.currentNode,
            { mediabox: [0, 0, width || this.settings.dimension[0], height || this.settings.dimension[1]] },
            ++this.objectNumber,
            0,
            this.newStream()
            );
        this.currentNode.kids.push(this.currentPage);
        return this;
    };
    pdfJS.doc.prototype.buildPageTreeNodes = function (node) {
        var self = this,
            ret = [node.out()], i, item;
        
        for (i = 0; item = node.kids[i]; i++) {
            if (item instanceof pdfJS.pageTreeNode) {
                ret.push(this.buildPageTreeNodes(item));
                continue
            }
            ret.push(item.out());
        }
        return ret.join('\n');
    };
    pdfJS.doc.prototype.buildFonts = function () {
        var i, font,
            ret = [];
        for (i = 0; font = this.fontObjs[i]; i++) {
            ret.push(font.out());
        }
        return ret.join('\n');
    };
    pdfJS.doc.prototype.getOffsets = function (data) {
        if (typeof data !== 'string') {
            throw 'getOffsets expects a string input';
        }

        var ret = [],
            genRegex = /\d+(?=\sobj)/,
            objRegex = /^\d+/,
            matches,i,match;
        //let's search the string for all object declaration. 
        matches = data.match(/\d+\s\d+\sobj/gim)

        for (i = 0; match = matches[i]; i++) {
            ret.push({
                objNum: parseInt(objRegex.exec(match)),
                genNum: parseInt(genRegex.exec(match)),
                offset: data.indexOf(match)
            });
        }

        return ret;
    }
    pdfJS.doc.prototype.buildDocument = function () {
        var contentBuilder = [],
            i;
        
        //Write header
        contentBuilder.push('%PDF-' + PDF_VERSION);

        contentBuilder.push(this.buildPageTreeNodes(this.rootNode));

        contentBuilder.push(this.buildFonts());

        contentBuilder.push(this.resObj.out());

        contentBuilder.push(this.infoObj.out());
        
        contentBuilder.push(this.catalogObj.out());
        
        var body = contentBuilder.join('\n');
        var offsets = this.getOffsets(body);
        
        offsets = offsets.sort(function (a, b) {
            return a.objectNumber - b.objectNumber;
        });
        var offsetsLength = offsets.length;
        // Cross-ref
        var o = body.length;
        contentBuilder.push('xref');
        contentBuilder.push('0 ' + (offsetsLength + 1));
        contentBuilder.push('0000000000 65535 f ');
        for (i = 0; i < offsetsLength; i++) {
            contentBuilder.push(pdfJS.utils.padd10(offsets[i].offset) + ' 00000 n ');
        }
        
        // Trailer
        contentBuilder.push('trailer');
        contentBuilder.push('<<');
        contentBuilder.push('/Size ' + (offsetsLength + 1));
        contentBuilder.push('/Root ' + this.catalogObj.objectNumber + ' 0 R');
        contentBuilder.push('/Info ' + this.infoObj.objectNumber + ' 0 R');
        contentBuilder.push('>>');
        contentBuilder.push('startxref');
        contentBuilder.push(o);

        contentBuilder.push('%%EOF');
        
        
        console.log(contentBuilder.join('\n'));
        return contentBuilder.join('\n');
    };
    
    pdfJS.doc.prototype.output = function (type, options) {
        
        switch (type) {
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
                return this.buildDocument();
        }
    };
})(jQuery);