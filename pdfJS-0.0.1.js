/***********************************************
* pdfJS JavaScript Library
* Authors: https://github.com/ineedfat/pdfjs
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 03/08/2013 13:56
***********************************************/
(function(_) {
'use strict';
var PDFJS_VERSION = '0.0.1';if (!Object.create) {
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() { }
        F.prototype = o;
        return new F();
    };
}

var mixin = function(inherting, iObj) {
    for (var prop in iObj) {
        if (iObj.hasOwnProperty(prop)) {
            inherting.prototype[prop] = iObj[prop];
        }
    }
};


var graphicOperators = {
    translate: function (tx, ty) {
        this.currentStream.push('1 0 0 1 ' + tx + ' ' + ty + ' cm');
    },
    scale: function (sx, sy) {
        this.currentStream.push(sx + ' 0 0 ' + sy + ' 0 0 cm');
    },
    rotate: function (theta) {
        var cos = Math.cos(theta),
            sin = Math.sin(theta);
        this.currentStream.push(cos + ' ' + sin + ' -' + sin + ' ' + cos + ' 0 0 cm');
    },
    skew: function (alphaX, betaY) {
        this.currentStream.push('1 ' + Math.tan(alphaX) + ' ' + Math.tan(betaY) + ' 1 0 0 cm');
    },
    lineWidth: function (width) {
        this.currentStream.push(width + ' w');
    },
    lineCap: function (capStyle) {
        this.currentStream.push(capStyle + ' J');
    },
    lineJoin: function (joinStyle) {
        this.currentStream.push(joinStyle + ' j');
    },
    miterLimit: function (limit) {
        this.currentStream.push(limit + ' M');
    },
    dashPattern: function (dashArray, dashPhase) {
        this.currentStream.push(dashArray + ' ' + dashPhase + ' d');
    },
    renderingIntent: function (intent) {
        this.currentStream.push(intent + ' ri');
    },
    strokeAdjustment: function () {
    },
    pushState: function () {
        this.currentStream.push('q');
    },
    popState: function () {
        this.currentStream.push('Q');
    },
    moveTo: function (x, y) {
        if (arguments.length != 4) {
            throw 'Invalid new path parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' m');
    },
    lineTo: function (x, y) {
        if (arguments.length != 4) {
            throw 'Invalid straight line  parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' l');
    },
    bezierCurve: function (x1, y1, x2, y2, x3, y3) {
        var args = Array.prototype.slice.call(arguments);
        switch (arguments.length) {
            case 4:
                this.currentStream.push(args.join(' ') + ' v');
                break;
            case 5:
                this.currentStream.push(args.slice(0, 4).join(' ') + ' y');
                break;
            case 6:
                this.currentStream.push(args.join(' ') + ' c');
                break;
            default:
                throw 'Invalid bezier curve parameters';
                break;
        }
    },
    close: function () {
        this.currentStream.push('h');
    },
    paintPath: function (operator) {
        if (operator) {
            this.currentStream.push(operator);
        } else {
            this.currentStream.push('B');
        }
    },
    strokePath: function () {
        this.currentStream.push('S');
    },
    fillPath: function () {
        this.currentStream.push('F');
    },
    clip: function (asterisk) {
        this.currentStream.push('W' + (asterisk ? ' *' : ''));
    },
    rect: function (x, y, width, height) {
        if (arguments.length != 4) {
            throw 'Invalid rectangle parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' re');
    },
    fillColor: function (colorValue1, colorValue2, colorValue3, colorValue4) {
        switch (arguments.length) {
            case 1:
                this.currentStream.push('DeviceGray cs');
                break;
            case 3:
                this.currentStream.push('DeviceRGB cs');
                break;
            case 4:
                this.currentStream.push('DeviceCMYK cs');
                break;
            default:
                throw ('Invalid color values');
        }

        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' sc');
    },
    strokeColor: function (colorValue1, colorValue2, colorValue3, colorValue4) {
        switch (arguments.length) {
            case 1:
                this.currentStream.push('DeviceGray CS');
                break;
            case 3:
                this.currentStream.push('DeviceRGB CS');
                break;
            case 4:
                this.currentStream.push('DeviceCMYK CS');
                break;
            default:
                throw ('Invalid color values');
        }

        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' SC');
    },
    addImage: function (imgXObj, x, y, w, h) {
        if (!w && !h) {
            w = -96;
            h = -96;
        }
        if (w < 0) {
            w = (-1) * imgXObj.width * 72 / w;
        }
        if (h < 0) {
            h = (-1) * imgXObj.height * 72 / h;
        }
        if (w === 0) {
            w = h * imgXObj.width / imgXObj.height;
        }
        if (h === 0) {
            h = w * imgXObj.height / imgXObj.width;
        }

        this.currentStream.push('q');
        this.currentStream.push(w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + (y + h).toFixed(2) + ' cm');
        this.currentStream.push('/' + imgXObj.name + ' Do');
        this.currentStream.push('Q');

        return this;
    }
};

var textOperators = {
    beginText: function (name, style, size) {
        this.currentStream.push('BT');
        this.fontStyle(name, style, size);
    },
    endText: function () {
        this.currentStream.push('ET');
        this.activeFont = undefined;
    },
    textPosition: function (x, y) {
        this.currentStream.push(x + ' ' + y + ' Td');
    },
    charSpace: function (charSpace) {
        this.currentStream.push(charSpace + ' Tc');
    },
    wordSpace: function (wordSpace) {
        this.currentStream.push(wordSpace + ' Tw');
    },
    scaleText: function (scale) {
        this.currentStream.push(scale + ' Tz');
    },
    leading: function (val) {
        this.currentStream.push(val + ' TL');
    },
    fontSize: function (size) {
        this.currentStream.push(size + ' Tf');
    },
    fontStyle: function (name, style, fontSize) {
        this.activeFont = this.doc.resObj.getFont(name, style) || this.doc.resObj.fontObjs[0];
        var fontKey = this.activeFont.description.key;
        this.currentStream.push('/' + fontKey);

        if (typeof fontSize === 'number') {
            this.fontSize(arguments[2]);
        }
    },
    renderMode: function (mode) {
        this.currentStream.push(render + ' Tr');
    },
    rise: function (rise) {
        this.currentStream.push(rise + ' Ts');
    },
    print: function (textString, wordSpace, charSpace) {
        if (arguments.length === 1) {
            this.currentStream.push('(' +
                this.activeFont.charactersEncode(sanitize(textString)) + ') Tj');
        }
        else {
            this.currentStream.push(wordSpace + ' ' + charSpace + ' (' +
                this.activeFont.charactersEncode(sanitize(textString)) + ') "');
        }
    },
    println: function (textString) {
        this.currentStream.push('T*');
        if (textString) {
            this.print(textString);
        }
    },
    showArrayText: function (arr) {
        var i; len, temp;
        for (i = 0, len = arr.length; I < len; i++) {
            temp = arr[i];
            if (typeof temp === 'string') {
                arr[i] = '(' + temp + ')';
            }
        }
        this.currentStream.push(arr.join(' ') + ' TJ');

    }
};


var obj = function (objectNumber, generationNumber) {
    var self = this;
    this.objectNumber = objectNumber;
    this.generationNumber = generationNumber;
    this.body = [];
};
obj.prototype = {
    out: function () {
        var self = this,
            sb = [];

        sb.push(this.objectNumber + ' ' + this.generationNumber + ' obj');
        sb = sb.concat(this.body);
        sb.push('endobj');

        return sb.join('\n')
    },
    body: [],
    objectNumber: 0,
    generationNumber: 0
};

var pageNode = function (parent, pageOptions, objectNumber, generationNumber, contentStreams, document) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    this.pageOptions = pageOptions;
    this.parent = parent;
    this.contentStreams = contentStreams;
    this.currentStream = this.contentStreams[0];
    this.doc = document;

    this.activeFont;
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

            ret.push(obj.prototype.out.apply(this, arguments));
            if (this.contentStreams.length) {
                for (i = 0; item = this.contentStreams[i]; i++) {
                    ret.push(item.out());
                }
            }
            return ret.join('\n');
        }
    },
    setStream: {
        value: function (index) {
            if (index >= this.contentStreams.length)
                throw 'Invalid stream index';
            this.currentStream = this.contentStreams[index];
            return this;
        }
    }
});
mixin(pageNode, textOperators);
mixin(pageNode, graphicOperators);

var pageTreeNode = function (parent, objectNumber, generationNumber, options) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    this.parent = parent;
    this.kids = [];
    this.options = options;
};
pageTreeNode.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            var i, item;
            this.body.push(
                '<< /Type /Pages',
                pageTreeOptionsConverter(this.options),
                '/Kids [');
            for (i = 0; item = this.kids[i]; i++) {
                this.body.push(item.objectNumber + ' ' + item.generationNumber + ' R');
            }
            this.body.push(']');

            this.body.push('/Count ' + walkPageTree(this));

            if (this.parent) {
                this.body.push('/Parent ' + this.parent.objectNumber + ' ' + this.parent.generationNumber + ' R');
            }

            this.body.push('>>');

            return obj.prototype.out.apply(this, arguments); 
        }
    }
});

var walkPageTree = function (pageTree) {
    var count = 0,
        i, item;

    for (i = 0; item = pageTree.kids[i]; i++) {
        if (item instanceof pageNode) {
            count++;
        } else {
            count += walkPageTree(item);
        }
    }
    return count;
};


var stream = function (objectNumber, generationNumber) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    this.content = [];
    this.dictionary = {};
};
var printDictionary = function (dict) {
    var ret = [],
        temp;
    for (temp in dict) {
        if (dict.hasOwnProperty(temp)) {
            ret.push('/'+temp + ' ' + dict[temp]);
        }
    }
    return ret.join('\n');
};

stream.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body.push('<< /Length ' + this.content.join('\n').length);
            this.body.push(printDictionary(this.dictionary));
            this.body.push(' >>');
            this.body.push('stream');
            this.body = this.body.concat(this.content);
            this.body.push('endstream');

            return obj.prototype.out.apply(this, arguments); 
        }
    },
    push: {
        value: function (args) {
            Array.prototype.push.apply(this.content, arguments);
            return this;
        }
    }
});


var font = function (font, objectNumber, generationNumber) {
    var self = this;
    obj.call(this, objectNumber, generationNumber);
    this.description = font;
};

font.codePages = {
    "WinAnsiEncoding": {
        "338": 140, "339": 156, "352": 138, "353": 154, "376": 159, "381": 142,
        "382": 158, "402": 131, "710": 136, "732": 152, "8211": 150, "8212": 151, "8216": 145,
        "8217": 146, "8218": 130, "8220": 147, "8221": 148, "8222": 132, "8224": 134, "8225": 135,
        "8226": 149, "8230": 133, "8240": 137, "8249": 139, "8250": 155, "8364": 128, "8482": 153
    }
};

font.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body.push('<< /Type /Font');
            this.body.push('/Subtype /Type1');
            this.body.push('/BaseFont /' + this.description.postScriptName);

            if (typeof this.description.encoding === 'string') {
                this.body.push('/Encoding /' + this.description.encoding);
            }
            this.body.push('>>');

            return obj.prototype.out.apply(this, arguments); 
        }
    },
    charactersEncode: {
        value: function (str) {
            var newStr = [],
                i, len, charCode, isUnicode, hByte, lByte,
                outputEncoding = this.description.encoding;

            if (typeof outputEncoding === 'string') {
                outputEncoding = font.codePages[outputEncoding];
            }

            if (!outputEncoding) {
                return str;
            }

            for (i = 0, len = str.length; i < len; i++) {
                charCode = str.charCodeAt(i);
                if (charCode >> 8) {
                    isUnicode = true;
                }
                charCode = outputEncoding[charCode];
                if (charCode) {
                    newStr.push(String.fromCharCode(charCode));
                }
                else {
                    newStr.push(str[i]);
                }
            }

            if (isUnicode) {
                var unicodeStr = [];
                for (i = 0, len = newStr.length; i < len; i++) {
                    charCode = text.charCodeAt(i);
                    hByte = charCode >> 8;
                    lByte = charCode - hByte;
                    if (hByte >> 8) {
                        throw 'Character exceeds 16bits: ' + text[i];
                    }
                    unicodeStr.push(hByte, lByte);
                }
                return String.fromCharCode.apply(null, unicodeStr);
            } else {
                return newStr.join('');
            }
        }
    }
});


var imageXObject = function (objectNumber, generationNumber, width, height, colorSpace, bpc, filter, options) {
    var self = this;

    stream.call(this, objectNumber, generationNumber);
    this.width = width;
    this.height = height;
    this.colorSpace = colorSpace || utils.deviceRGB
    this.bpc = bpc || 8;
    this.filter = filter;
    this.name = 'Im1';
    this.options = options || {};
};
imageXObject.prototype = Object.create(stream.prototype, {
    out: {
        value: function () {
            this.dictionary['Type'] = '/XObject';
            this.dictionary['Subtype'] = '/Image';
            this.dictionary['Width'] = this.width;
            this.dictionary['Height'] = this.height;
            this.dictionary['ColorSpace'] = '/' + this.colorSpace;
            this.dictionary['BitsPerComponent'] = this.bpc;

            if (this.filter) {
                this.dictionary['Filter'] = '/' + this.filter;
            }
            return stream.prototype.out.apply(this, arguments); 
        }
    }
});


    var PDF_VERSION = '1.3';
    var doc = function (format, orientation, margin) {
        var self = this;
        this.activeAsync = 0;
        this.objectNumber = 0;
        this.currentPage = null;
        this.fontmap = {};
        this.settings = {
            dimension: utils.paperFormat['letter'],
            documentProperties: { 'title': '', 'subject': '', 'author': '', 'keywords': '', 'creator': '' }
        };
        if (typeof format === 'string') {
            self.settings.dimension = utils.paperFormat[format.toLowerCase()];
        } else {
            self.settings.dimension = format.slice().splice(0, 2);
        }
        if (orientation.toLowerCase() === 'landscape') {
            var temp = self.settings.dimension[0];
            self.settings.dimension[0] = self.settings.dimension[1];
            self.settings.dimension[1] = temp;
        }
        this.resObj = new resources(++this.objectNumber, 0);
        this.rootNode = new pageTreeNode(null, ++self.objectNumber, 0,
             {
                 mediabox: [0, 0, this.settings.dimension[0], this.settings.dimension[1]],
                 resources: this.resObj
             });
        this.currentNode = this.rootNode;
        this.infoObj = info(this.settings, this.newObj());
        this.catalogObj = catalog(this.rootNode, this.newObj());
        this.addStandardFonts();
    };
    doc.prototype = {
        objNumber: function(val) {
            if (val) {
                this.objectNumber = value;
            }
            return val;
        },
        page: function(val) {
            if (val) {
                this.objectNumber = value;
            }
            return val;
        },
        newObj: function() {
            return new obj(++this.objectNumber, 0);
        },
        newStream: function() {
            return new stream(++this.objectNumber, 0);
        },
        addPage: function(height, width, options) {
            this.currentPage = new pageNode(
                this.currentNode,
                options || { mediabox: [0, 0, width || this.settings.dimension[0], height || this.settings.dimension[1]] },
                ++this.objectNumber,
                0,
                [this.newStream()],
                this
            );
            this.currentNode.kids.push(this.currentPage);

            return this.currentPage;
        },
        output: function(type) {

            var content = [
                buildPageTreeNodes(this.rootNode),
                buildObjs(this.resObj.fontObjs),
                buildObjs(this.resObj.imageXObjects),
                this.resObj.out(),
                this.infoObj.out(),
                this.catalogObj.out()
            ].join('\n');

            var pdf = buildDocument(content, this.catalogObj, this.infoObj);
            switch (type) {
            case 'datauristring':
            case 'dataurlstring':
                return 'data:application/pdf;base64,' + btoa(pdf);
            case 'datauri':
            case 'dataurl':
                document.location.href = 'data:application/pdf;base64,' + btoa(pdf);
                break;
                break;
            case 'dataurlnewwindow':
                window.open('data:application/pdf;base64,' + btoa(pdf));
                break;
            default:
                return pdf;
            }
        },
        outputAsync: function(type, callback) {
            var self = this;
            var t = window.setInterval(function() {
                if (self.activeAsync === 0) {
                    window.clearInterval(t);
                    callback(self.output(type));
                }
            }, 50);
        },
        addFont: function(postScriptName, fontName, fontStyle, encoding) {

            var fontKey = 'F' + (this.resObj.fontObjs.length + 1).toString(10);
            var fontDescription = {
                key: fontKey,
                postScriptName: postScriptName,
                fontName: fontName,
                fontStyle: fontStyle,
                encoding: encoding,
                metadata: {}
            };

            this.resObj.fontObjs.push(new font(fontDescription, ++this.objectNumber, 0));

            fontName = fontName.toLowerCase();
            fontStyle = fontStyle.toLowerCase();

            if (!(this.fontmap[fontName])) {
                this.fontmap[fontName] = {}; 
            }
            this.fontmap[fontName][fontStyle] = fontKey;

            return fontKey;
        },
        addStandardFonts: function() {

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

            for (var i = 0, l = standardFonts.length; i < l; i++) {
                this.addFont(standardFonts[i][0], standardFonts[i][1], standardFonts[i][2], encoding);
            }
            return this;
        }
    };

    var getOffsets = function (data) {
        if (typeof data !== 'string') {
            throw 'getOffsets expects a string input';
        }

        var ret = [],
            genRegex = /\d+(?=\sobj)/,
            objRegex = /^\d+/,
            matches, i, match;
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

    var buildObjs = function (objs) {
        var i, obj,
            ret = [];
        for (i = 0; obj = objs[i]; i++) {
            ret.push(obj.out());
        }
        return ret.join('\n');
    };

    var buildDocument = function (content, catalog, info) {
        var i,
            contentBuilder = [
                '%PDF-' + PDF_VERSION, 
                content
            ];
        var body = contentBuilder.join('\n');
        var o = body.length;
        var offsets = getOffsets(body);
        var objectCount = offsets.length;
        offsets = offsets.sort(function (a, b) {
            return a.objectNumber - b.objectNumber;
        });
        contentBuilder.push('xref');
        contentBuilder.push('0 ' + (objectCount + 1));
        contentBuilder.push('0000000000 65535 f ');
        for (i = 0; i < objectCount; i++) {
            contentBuilder.push(padd10(offsets[i].offset) + ' 00000 n ');
        }
        contentBuilder.push('trailer');
        contentBuilder.push('<<');
        contentBuilder.push('/Size ' + (objectCount + 1));
        contentBuilder.push('/Root ' + catalog.objectNumber + ' 0 R');
        contentBuilder.push('/Info ' + info.objectNumber + ' 0 R');
        contentBuilder.push('>>');
        contentBuilder.push('startxref');
        contentBuilder.push(o);

        contentBuilder.push('%%EOF');
        return contentBuilder.join('\n');
    };

var catalog = function (rootNode, catalogObj) {
    catalogObj.body = [];
    catalogObj.body.push('<<');

    catalogObj.body.push('/Type /Catalog');
    catalogObj.body.push('/Pages ' + rootNode.objectNumber + ' ' + rootNode.generationNumber + ' R');

    catalogObj.body.push('/PageLayout /OneColumn');

    catalogObj.body.push('>>');

    return catalogObj;
};
var info = function (settings, infoObj) {
    infoObj.body = [];
    infoObj.body.push('<<');

    infoObj.body.push('/Producer (PDFjs ' + PDFJS_VERSION + ')');
    if (settings.documentProperties.title) {
        infoObj.body.push('/Title (' + pdfEscape(settings.documentProperties.title) + ')');
    }
    if (settings.documentProperties.subject) {
        infoObj.body.push('/Subject (' + pdfEscape(settings.documentProperties.subject) + ')');
    }
    if (settings.documentProperties.author) {
        infoObj.body.push('/Author (' + pdfEscape(settings.documentProperties.author) + ')');
    }
    if (settings.documentProperties.keywords) {
        infoObj.body.push('/Keywords (' + pdfEscape(settings.documentProperties.keywords) + ')');
    }
    if (settings.documentProperties.creator) {
        infoObj.body.push('/Creator (' + pdfEscape(settings.documentProperties.creator) + ')');
    }
    var created = new Date();
    infoObj.body.push('/CreationDate (D:' +
        [
            created.getFullYear(),
            padd2(created.getMonth() + 1),
            padd2(created.getDate()),
            padd2(created.getHours()),
            padd2(created.getMinutes()),
            padd2(created.getSeconds())
        ].join('') +
        ')'
    );

    infoObj.body.push('>>');

    return infoObj;

};

var resources = function (objectNumber, generationNumber) {
    var self = this;
    obj.call(this, objectNumber, generationNumber);
    this.fontObjs = [];
    this.imageXObjects = [];
};

var printDictionaryElements = function (arr, prefix) {
    var ret = [],
        i, len;
    for (i = 0, len = arr.length; i < len; i++) {
        ret.push('/' + prefix + (i +1).toString(10) + ' ' + arr[i].objectNumber + ' ' + arr[i].generationNumber + ' R');
    }

    return ret.join('\n');
};
resources.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body.push('<<');
            this.body.push('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
            this.body.push('/Font <<');
            this.body.push(printDictionaryElements(this.fontObjs, 'F'));
            this.body.push('>>');
            this.body.push('/XObject <<');
            this.body.push(printDictionaryElements(this.imageXObjects, 'Im'));
            this.body.push('>>');
            this.body.push('>>');

            return obj.prototype.out.apply(this, arguments); 
        }
    },
    getFont: {
        value: function (name, style) {
            for (var i = 0, font; font = this.fontObjs[i]; i++) {
                if (font.description.key === name) {
                    return font;
                }

                if (font.description.fontName === name && font.description.fontStyle === style) {
                    return font;
                }
            }
            return null;
        }
    }
});

var pageOptionsConverter = function (options) {
    var ret = [],
        obj;
    for (var item in options) {
        if (!options.hasOwnProperty(item))
            continue;
        obj = options[item];
        switch (item.toLowerCase()) {
            case 'resources':
                if (obj instanceof resources) {
                    ret.push('/Resources ' + obj.objectNumber + ' ' + obj.generationNumber + ' R');
                }
                else if (typeof obj === 'string') {
                    ret.push(obj);
                } else {
                    throw 'Invalid Resources!';
                }
                break;
            case 'mediabox':
                if (checkValidRect(obj)) {
                    ret.push('/MediaBox [' + obj.join(' ') + ']');
                }
                break;
            case 'cropbox':
                if (checkValidRect(obj)) {
                    ret.push('/CropBox [' + obj.join(' ') + ']');
                }
                break;
            case 'bleedbox':
                if (checkValidRect(obj)) {
                    ret.push('/BleedBox [' + obj.join(' ') + ']');
                }
                break;
            case 'trimbox':
                if (checkValidRect(obj)) {
                    ret.push('/TrimBox [' + obj.join(' ') + ']');
                }
                break;
            case 'artbox':
                if (checkValidRect(obj)) {
                    ret.push('/ArtBox [' + obj.join(' ') + ']');
                }
                break;
            case 'rotate':
                if (typeof obj === 'number' && obj % 90 === 0) {
                    ret.push('/Rotate ' + obj);
                }
                break;
            case 'thumb':
                break;
            case 'b':
                break;
            case 'dur':
                break;
            case 'Trans':
                break;
            case 'Annots':
                break;
            case 'AA':
                break;
            case 'PieceInfo':
                break;
            case 'LastModified':
                break;
            case 'StructParents':
                break;
            case 'ID':
                break;
            case 'PZ':
                break;
            case 'SeparationInfo':
                break;
        }
    }
    return ret.join('\n');
};
var pageTreeOptionsConverter = function (options) {
    var ret = [],
        obj;
    for (var item in options) {
        if (!options.hasOwnProperty(item))
            continue;
        obj = options[item];
        switch (item.toLowerCase()) {
            case 'resources':
                if (obj instanceof resources) {
                    ret.push('/Resources ' + obj.objectNumber + ' ' + obj.generationNumber + ' R');
                }
                else if (typeof obj === 'string') {
                    ret.push(obj);
                } else {
                    throw 'Invalid Resources!';
                }
                break;
            case 'mediabox':
                if (checkValidRect(obj)) {
                    ret.push('/MediaBox [' + obj.join(' ') + ']');
                }
                break;
            case 'cropbox':
                if (checkValidRect(obj)) {
                    ret.push('/CropBox [' + obj.join(' ') + ']');
                }
                break;
            case 'rotate':
                if (typeof obj === 'number' && obj % 90 === 0) {
                    ret.push('/Rotate ' + obj);
                }
                break;
        }
    }
    return ret.join('\n');
};
var sanitizeRegex = /((\(|\)|\\))/ig;
var sanitize = function(text) {
    return text.replace(sanitizeRegex, '\\$1');
};

var checkValidRect = function (rect) {
    if (!rect || typeof rect !== 'object' || rect.length !== 4) {
        console.warn('Invalid Rect');
        return false;
    }
    for (var i = 0; i < 4; i++) {
        if (typeof rect[i] !== 'number') {
            console.warn('Invalid Rect');
            return false;
        }
    }
    return true;
};
var f = function (number) {
    return number.toFixed(2);
}

var f3 = function (number) {
    return number.toFixed(3);
};

var padd2 = function (number) {
    var n = (number).toFixed(0);
    if (number < 10) return '0' + n;
    else return n;
};

var padd10 = function (number) {
    var n = (number).toFixed(0);
    if (n.length < 10) return new Array(11 - n.length).join('0') + n;
    else return n;
};
var utils = {
    paperFormat: {
        a3: [841.89, 1190.55],
        a4: [595.28, 841.89],
        a5: [420.94, 595.28],
        letter: [612, 792],
        legal: [612, 1008]
    },
    lineCapStyle: {
        buttCap: 0,
        roundCap: 1,
        projectinSquareCap: 2
    },
    lineJoinStyle: {
        miterJoin: 0,
        roundJoin: 1,
        bevelJoin: 2
    },
    renderingIntentOption: {
        absoluteColorimetric: 'AbsoluteColorimetric',
        relativeColorimetric: 'RelativeColorimetric',
        saturation: 'Saturation',
        perceptual: 'Perceptual'
    },
    pathPaintingOption: {
        bigS: 'S',
        smallS: 's',
        smallF: 'f',
        fStar: 'f*',
        bigB: 'B',
        bigBStar: 'B*',
        smallB: 'b',
        smallBStar: 'b*',
        n: 'n'
    },
    colorSpace: {
        deviceGray: 'DeviceGray',
        deviceRGB: 'DeviceRGB',
        deviceCMYK: 'DeviceCMYK'
    },
    textMode: {
        fillText: 0,
        strokeText: 1,
        fillStrokeText: 2,
        invisibleText: 3,
        fillClipText: 4,
        strokeClipText: 5,
        fillStrokeClipText: 6,
        clipText: 7
    }

};
doc.prototype.newImage = function (imageData, crossOrigin, resources) {
    var newImage = new imageXObject(++this.objectNumber, 0, 0, 0, utils.colorSpace.deviceRGB, 8, 'DCTDecode');

    analyzeImage.call(this, imageData, newImage, resources || this.resObj, crossOrigin, this);

    return newImage;
};

var analyzeImage = function (image) {
    if (image instanceof HTMLImageElement) {
        processImage.apply(this, [image].concat(Array.prototype.slice.call(arguments, 1, 3)));
    } else if (typeof image === 'string') {
        processImageSource.apply(this, [image].concat(Array.prototype.slice.call(arguments, 1)));
    } else if (image instanceof HTMLCanvasElement) {
        processCanvas.apply(this, [image].concat(Array.prototype.slice.call(arguments, 1, 3)));
    } else {
        throw 'Invalid Image Type';
    }
};

var processImageSource = function (imgSrc, imgXObj, resources, crossOrigin, doc) {
    var img = new Image();
    img.onload = function (e) {
        doc.activeAsync--;
        processImage.call(this, img, imgXObj, resources);
    };
    if (crossOrigin) {
        img.crossOrigin = 'anonymous';
    }
    doc.activeAsync++;
    img.src = imgSrc;
};

var processImage = function (img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    if (!ctx) {
        throw ('addImage requires canvas to be supported by browser.');
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    processCanvas.apply(this, [canvas].concat(Array.prototype.slice.call(arguments, 1)));
};

var processCanvas = function (canvas, imgXObj, resources) {

    var imageData = canvas.toDataURL('image/jpeg');
    var imageInfo = processImageData(imageData, 'jpeg');

    imgXObj.content.push(imageInfo.data);
    imgXObj.name = 'Im' + (resources.imageXObjects.length + 1);
    imgXObj.width = imageInfo.width;
    imgXObj.height = imageInfo.height;
    resources.imageXObjects.push(imgXObj);
};

var processImageData = function (imageData, format) {
    var ret = {
        width: 0,
        height: 0,
        data: ''
    },
        temp;
    format = format.toLowerCase();
    if (imageData.substring(0, 23) === 'data:image/jpeg;base64,') {
        imageData = atob(imageData.replace('data:image/jpeg;base64,', ''));
        format = 'jpeg';
    }
    try {
        if (format == 'jpeg' || !format) {
            temp = getJpegSize(imageData);
            ret.width = temp[0];
            ret.height = temp[1];
        }
    } catch (e) {
        console.log('Image is not JPEG');
    }

    ret.data = imageData;
    return ret;
};
var getJpegSize = function (imgData) {
    var width, height;
    if (!imgData.charCodeAt(0) === 0xff ||
        !imgData.charCodeAt(1) === 0xd8 ||
        !imgData.charCodeAt(2) === 0xff ||
        !imgData.charCodeAt(3) === 0xe0 ||
        !imgData.charCodeAt(6) === 'J'.charCodeAt(0) ||
        !imgData.charCodeAt(7) === 'F'.charCodeAt(0) ||
        !imgData.charCodeAt(8) === 'I'.charCodeAt(0) ||
        !imgData.charCodeAt(9) === 'F'.charCodeAt(0) ||
        !imgData.charCodeAt(10) === 0x00) {
        throw new Error('getJpegSize requires a binary jpeg file');
    }
    var blockLength = imgData.charCodeAt(4) * 256 + imgData.charCodeAt(5);
    var i = 4, len = imgData.length;
    while (i < len) {
        i += blockLength;
        if (imgData.charCodeAt(i) !== 0xff) {
            throw new Error('getJpegSize could not find the size of the image');
        }
        if (imgData.charCodeAt(i + 1) === 0xc0) {
            height = imgData.charCodeAt(i + 5) * 256 + imgData.charCodeAt(i + 6);
            width = imgData.charCodeAt(i + 7) * 256 + imgData.charCodeAt(i + 8);
            return [width, height];
        } else {
            i += 2;
            blockLength = imgData.charCodeAt(i) * 256 + imgData.charCodeAt(i + 1)
        }
    }
};


var pdfJS = {
    doc: function (format, orientation, margin) {
        var pdf = new doc(format, orientation, margin);
        return {
            objNum: function() {
                pdf.objNumber.apply(pdf, arguments);
            },
            currentPage: function () { return pdf.page.apply(pdf, arguments); },
            createObj: function () { return pdf.newObj.apply(pdf, arguments); },
            createStream: function () { return pdf.newStream.apply(pdf, arguments); },
            addPage: function () { return pdf.addPage.apply(pdf, arguments); },
            root: function () { return pdf.rootNode.apply(pdf, arguments); },
            output: function () { return pdf.output.apply(pdf, arguments); },
            outputAsync: function () { return pdf.outputAsync.apply(pdf, arguments); },
            addFont: function () { return pdf.addFont.apply(pdf, arguments); },
            newImage: function () { return pdf.newImage.apply(pdf, arguments); }
        };
    },
    obj: obj,
    pageTreeNode: pageTreeNode,
    utils: utils,
};

_.pdfJS = pdfJS;
}(window));