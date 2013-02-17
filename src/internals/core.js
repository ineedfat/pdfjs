    // Size in pt of various paper formats
    var PDF_VERSION = '1.3';
    
    var doc = function (format, orientation, margin) {
        var self = this;
        this.objectNumber = 0; //object counter used for setting indirect object.
        this.fontObjs = [];
        this.currentPage = null;
        
        this.fontmap = {}; // mapping structure fontName > fontStyle > font key - performance layer. See addFont()
        this.objectMap = {};

        //General document setting should get set here.
        this.settings = {
            dimension: utils.paperFormat['letter'],
            documentProperties: { 'title': '', 'subject': '', 'author': '', 'keywords': '', 'creator': '' }
        };
        
        this.pageCount = 0;
        //Determine page dimensions.
        if (typeof format === 'string') {
            self.settings.dimension = utils.paperFormat[format.toLowerCase()];
        } else if (typeof format === 'object' && typeof format[0] === 'number' && format[1] === 'number') {
            self.settings.dimension = format.slice().splice(0, 2);
        }
        
        if (typeof orientation === 'string' && orientation.toLowerCase() === 'landscape') {
            var temp = self.settings.dimension[0];
            self.settings.dimension[0] = self.settings.dimension[1];
            self.settings.dimension[1] = temp;
        }

        this.currentNode = self.rootNode = new pageTreeNode(null, ++self.objectNumber, 0);
        this.addStandardFonts();
        this.resObj = resources(this.fontObjs, this.newObj());
        this.infoObj = info(this.settings, this.newObj());
        this.catalogObj = catalog(this.rootNode, this.newObj());
    };

    doc.prototype.newObj = function () {
        return new obj(++this.objectNumber, 0);
    }

    doc.prototype.newStream = function () {
        return new stream(++this.objectNumber, 0);
    }

    doc.prototype.addPage = function (height, width) {
        this.pageCount++;
        this.currentPage = new pageNode(
            this.currentNode,
            { mediabox: [0, 0, width || this.settings.dimension[0], height || this.settings.dimension[1]] },
            ++this.objectNumber,
            0,
            [this.newStream()],
            this
            );
        this.currentNode.kids.push(this.currentPage);
        return this;
    };
    
    doc.prototype.output = function (type, options) {
        var content = [
            buildPageTreeNodes(this.rootNode),
            buildFonts(this.fontObjs),
            this.resObj.out(),
            this.infoObj.out(),
            this.catalogObj.out()
        ].join('\n');
        
        var pdf = buildDocument(content,this.catalogObj,this.infoObj);
        switch (type) {
            case 'datauristring':
            case 'dataurlstring':
                return 'data:application/pdf;base64,' + btoa(pdf);
            case 'datauri':
            case 'dataurl':
                document.location.href = 'data:application/pdf;base64,' + btoa(pdf); break;
                break;
            case 'dataurlnewwindow':
                window.open('data:application/pdf;base64,' + btoa(pdf));
                break;
            default:
                return pdf;
        }
    };

    doc.prototype.addFont = function (PostScriptName, fontName, fontStyle, encoding) {

        var fontKey = 'F' + (this.fontObjs.length + 1).toString(10);
        // This is FontObject 
        var fontDescription = {
            'key': fontKey,
            'PostScriptName': PostScriptName,
            'fontName': fontName,
            'fontStyle': fontStyle,
            'encoding': encoding,
            'metadata': {}
        };

        this.fontObjs.push(new font(fontDescription, ++this.objectNumber, 0));
        this.addToFontDictionary(fontKey, fontName, fontStyle);

        return fontKey;
    };

    doc.prototype.addStandardFonts = function () {

        var HELVETICA = "helvetica",
            TIMES = "times",
            COURIER = "courier",
            NORMAL = "normal",
            BOLD = "bold",
            ITALIC = "italic",
            BOLD_ITALIC = "bolditalic",
            encoding = 'StandardEncoding',
            standardFonts = [
                ['Helvetica', HELVETICA, NORMAL],
                ['Helvetica-Bold', HELVETICA, BOLD],
                ['Helvetica-Oblique', HELVETICA, ITALIC],
                ['Helvetica-BoldOblique', HELVETICA, BOLD_ITALIC],
                ['Courier', COURIER, NORMAL],
                ['Courier-Bold', COURIER, BOLD],
                ['Courier-Oblique', COURIER, ITALIC],
                ['Courier-BoldOblique', COURIER, BOLD_ITALIC],
                ['Times-Roman', TIMES, NORMAL],
                ['Times-Bold', TIMES, BOLD],
                ['Times-Italic', TIMES, ITALIC],
                ['Times-BoldItalic', TIMES, BOLD_ITALIC]
            ];

        var i, l, fontKey, parts;
        for (i = 0, l = standardFonts.length; i < l; i++) {
            fontKey = this.addFont(standardFonts[i][0], standardFonts[i][1], standardFonts[i][2], encoding);
            // adding aliases for standard fonts, this time matching the capitalization
            parts = standardFonts[i][0].split('-');
            this.addToFontDictionary(fontKey, parts[0], parts[1] || '');
        }
    };

    doc.prototype.addToFontDictionary = function (fontKey, fontName, fontStyle) {
        // this is mapping structure for quick font key lookup.
        // returns the KEY of the font (ex: "F1") for a given pair of font name and type (ex: "Arial". "Italic")
        if (!(this.fontmap[fontName])) {
            this.fontmap[fontName] = {}; // fontStyle is a var interpreted and converted to appropriate string. don't wrap in quotes.
        }
        this.fontmap[fontName][fontStyle] = fontKey;
    };

    var getOffsets = function (data) {
        if (typeof data !== 'string') {
            throw 'getOffsets expects a string input';
        }

        var ret = [],
            genRegex = /\d+(?=\sobj)/,
            objRegex = /^\d+/,
            matches, i, match;
        //let's search the string for all object declaration in data. 
        matches = data.match(/\d+\s\d+\sobj/gim)

        for (i = 0; match = matches[i]; i++) {
            ret.push({
                objNum: parseInt(objRegex.exec(match)),
                genNum: parseInt(genRegex.exec(match)),
                offset: data.indexOf(match)
            });
        }

        return ret;
    };

    var buildPageTreeNodes = function (node) {
        var self = this,
            ret = [node.out()], i, item;
        
        for (i = 0; item = node.kids[i]; i++) {
            if (item instanceof pageTreeNode) {
                ret.push(buildPageTreeNodes(item));
                continue
            }
            ret.push(item.out());
        }
        return ret.join('\n');
    };

    var buildFonts = function (fontObjs) {
        var i, font,
            ret = [];
        for (i = 0; font = fontObjs[i]; i++) {
            ret.push(font.out());
        }
        return ret.join('\n');
    };

    var buildDocument = function (content, catalog, info) {
        var i,
            contentBuilder = [
                '%PDF-' + PDF_VERSION, //header
                content
            ];
        
        var body = contentBuilder.join('\n');
        var o = body.length;
        var offsets = getOffsets(body);
        var objectCount = offsets.length;

        //sorting from low to high object numbers
        offsets = offsets.sort(function (a, b) {
            return a.objectNumber - b.objectNumber;
        });

        // Cross-ref
        contentBuilder.push('xref');
        contentBuilder.push('0 ' + (objectCount + 1));
        contentBuilder.push('0000000000 65535 f ');
        for (i = 0; i < objectCount; i++) {
            contentBuilder.push(utils.padd10(offsets[i].offset) + ' 00000 n ');
        }
        
        // Trailer
        contentBuilder.push('trailer');
        contentBuilder.push('<<');
        contentBuilder.push('/Size ' + (objectCount + 1));
        contentBuilder.push('/Root ' + catalog.objectNumber + ' 0 R');
        contentBuilder.push('/Info ' + info.objectNumber + ' 0 R');
        contentBuilder.push('>>');
        contentBuilder.push('startxref');
        contentBuilder.push(o);

        contentBuilder.push('%%EOF');
        
        
        console.log(contentBuilder.join('\n'));
        return contentBuilder.join('\n');
    };