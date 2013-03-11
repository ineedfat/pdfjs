/***********************************************
* pdfJS JavaScript Library
* Authors: https://github.com/ineedfat/pdfjs
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 03/10/2013 21:34
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
        this.push('1 0 0 1 ' + tx + ' ' + ty + ' cm');
    },
    scale: function (sx, sy) {
        this.push(sx + ' 0 0 ' + sy + ' 0 0 cm');
    },
    rotate: function (theta) {
        var cos = Math.cos(theta),
            sin = Math.sin(theta);
        this.push(cos + ' ' + sin + ' -' + sin + ' ' + cos + ' 0 0 cm');
    },
    skew: function (alphaX, betaY) {
        this.push('1 ' + Math.tan(alphaX) + ' ' + Math.tan(betaY) + ' 1 0 0 cm');
    },
    lineWidth: function (width) {
        this.push(width + ' w');
    },
    lineCap: function (capStyle) {
        this.push(capStyle + ' J');
    },
    lineJoin: function (joinStyle) {
        this.push(joinStyle + ' j');
    },
    miterLimit: function (limit) {
        this.push(limit + ' M');
    },
    dashPattern: function (dashArray, dashPhase) {
        this.push(dashArray + ' ' + dashPhase + ' d');
    },
    renderingIntent: function (intent) {
        this.push(intent + ' ri');
    },
    strokeAdjustment: function () {
    },
    pushState: function () {
        this.push('q');
    },
    popState: function () {
        this.push('Q');
    },
    moveTo: function (x, y) {
        if (arguments.length != 4) {
            throw 'Invalid new path parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.push(args.join(' ') + ' m');
    },
    lineTo: function (x, y) {
        if (arguments.length != 4) {
            throw 'Invalid straight line  parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.push(args.join(' ') + ' l');
    },
    bezierCurve: function (x1, y1, x2, y2, x3, y3) {
        var args = Array.prototype.slice.call(arguments);
        switch (arguments.length) {
            case 4:
                this.push(args.join(' ') + ' v');
                break;
            case 5:
                this.push(args.slice(0, 4).join(' ') + ' y');
                break;
            case 6:
                this.push(args.join(' ') + ' c');
                break;
            default:
                throw 'Invalid bezier curve parameters';
        }
    },
    close: function () {
        this.push('h');
    },
    paintPath: function (operator) {
        if (operator) {
            this.push(operator);
        } else {
            this.push('B');
        }
    },
    strokePath: function () {
        this.push('S');
    },
    fillPath: function () {
        this.push('F');
    },
    clip: function (asterisk) {
        this.push('W' + (asterisk ? ' *' : ''));
    },
    rect: function (x, y, width, height) {
        if (arguments.length != 4) {
            throw 'Invalid rectangle parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.push(args.join(' ') + ' re');
    },
    fillColor: function (colorValue1, colorValue2, colorValue3) {
        switch (arguments.length) {
            case 1:
                if (this.activeFillCS !== 'DeviceGray') {
                    this.push('/DeviceGray cs');
                    this.activeFillCS = 'DeviceGray';
                }
                break;
            case 3:
                if (this.activeFillCS !== 'DeviceRGB') {
                    this.push('/DeviceRGB cs');
                    this.activeFillCS = 'DeviceRGB';
                }
                break;
            default:
                throw ('Invalid color values');
        }
        var args = Array.prototype.slice.call(arguments);
        this.push(args.join(' ') + ' sc');
    },
    strokeColor: function (colorValue1, colorValue2, colorValue3) {
        switch (arguments.length) {
            case 1:
                if (this.activeStrokeCS !== 'DeviceGray') {
                    this.push('/DeviceGray CS');
                    this.activeStrokeCS = 'DeviceGray';
                }
                break;
            case 3:
                if (this.activeStrokeCS !== 'DeviceRGB') {
                    this.push('/DeviceRGB CS');
                    this.activeStrokeCS = 'DeviceRGB';
                }
            default:
                throw ('Invalid color values');
        }

        var args = Array.prototype.slice.call(arguments);
        this.push(args.join(' ') + ' SC');
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

        this.push('q');
        this.push(w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + (y + h).toFixed(2) + ' cm');
        this.push('/' + imgXObj.name + ' Do');
        this.push('Q');

        return this;
    }
};

var textOperators = {
    beginText: function (name, style, size) {
        this.push('BT');
        this.fontStyle(name, style, size);
    },
    endText: function () {
        this.push('ET');
        this.activeFont = undefined;
    },
    textPosition: function (x, y) {
        this.push(x + ' ' + y + ' Td');
    },
    charSpace: function (charSpace) {
        this.push(charSpace + ' Tc');
    },
    wordSpace: function (wordSpace) {
        this.push(wordSpace + ' Tw');
    },
    scaleText: function (scale) {
        this.push(scale + ' Tz');
    },
    leading: function (val) {
        this.push(val + ' TL');
    },
    fontSize: function (size) {
        this.push('/' + this.activeFont.description.key + ' ' + size + ' Tf');
        this.activeFontSize = size;
    },
    fontStyle: function (name, style, fontSize) {
        this.activeFont = this.doc.resObj.getFont(name, style) || this.doc.resObj.fontObjs[0];
        var fontKey = this.activeFont.description.key;
        this.push('/' + fontKey + ' ' + (fontSize || this.activeFontSize) + ' Tf');
        if (fontSize) {
            this.activeFontSize = fontSize;
        }
    },
    renderMode: function (mode) {
        this.push(render + ' Tr');
    },
    rise: function (rise) {
        this.push(rise + ' Ts');
    },
    print: function (textString, wordSpace, charSpace) {
        if (arguments.length === 1) {
            this.push('(' +
                this.activeFont.charactersEncode(sanitize(textString)) + ') Tj');
        }
        else {
            this.push(wordSpace + ' ' + charSpace + ' (' +
                this.activeFont.charactersEncode(sanitize(textString)) + ') "');
        }
    },
    println: function (textString) {
        this.push('T*');
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
        this.push(arr.join(' ') + ' TJ');

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

var pageNode = function (parent, pageOptions, objectNumber, generationNumber, contentStreams,
    repeatableStreams, templateStreams, document) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    this.pageOptions = pageOptions;
    this.parent = parent;
    this.contentStreams = contentStreams;
    this.currentStream = this.contentStreams[0];

    this.repeatableStreams = repeatableStreams;

    this.templateStreams = templateStreams;

    this.reservedObjectNums = [];

    this.doc = document;

    this.data = {pageNum: 0};
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
            this.body = [];
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


var stream = function (objectNumber, generationNumber, document) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    this.content = [];
    this.dictionary = {};
    this.doc = document;

    this.activeFont = undefined;
    this.activeFontSize = 14;

    this.activeFillCS = undefined;
    this.activeStrokeCS = undefined;
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
            this.body = [];
            var temp = printDictionary(this.dictionary);
            var tempContent = this.content;

            if (!(this instanceof imageXObject)) {
                tempContent = (['q']).concat(this.content);
                tempContent.push('Q');
            }
            this.body.push('<< /Length ' + (tempContent.join('\n').length));
            if (temp) {
                this.body.push(temp);
            }
            this.body.push('>>');
            this.body.push('stream');
            this.body = this.body.concat(tempContent);
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
mixin(stream, textOperators);
mixin(stream, graphicOperators);

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
            this.body = [];
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


var docTemplate = function (document) {
    var self = this;

    this.templateContent = [];
    stream.call(this, 0, 0, document);
};

docTemplate.prototype = Object.create(stream.prototype, {
    out: {
        value: function (objectNumber, generationNumber, page) {
            var i, l, replaceRegex, value,
                    templateString = this.templateContent.join('\n');

            this.objectNumber = objectNumber;
            this.generationNumber = generationNumber;
            if (page.data) {
                for (var name in page.data) {
                    if (page.data.hasOwnProperty(name)) {
                        replaceRegex = new RegExp('\{\{' + name + '\}\}', 'g');
                        value = page.data[name];
                        templateString = templateString.replace(replaceRegex, value);
                    }
                }
            }
            this.content = [templateString];
            return stream.prototype.out.apply(this, arguments); 
        }
    },
    push: {
        value: function (args) {
            Array.prototype.push.apply(this.templateContent, arguments);
            return this;
        }
    }
});

    var PDF_VERSION = '1.3';
    var doc = function (format, orientation, margin) {
        var self = this;
        this.pageCount = 0;

        this.repeatableElements = [];
        this.templateStreams = [];
        this.activeAsync = 0;
        this.objectNumber = 0;
        this.currentPage = null;
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
            return new stream(++this.objectNumber, 0, this);
        },
        addPage: function (height, width, options) {
            this.pageCount++;
            this.currentPage = new pageNode(
                this.currentNode,
                options || { mediabox: [0, 0, width || this.settings.dimension[0], height || this.settings.dimension[1]] },
                ++this.objectNumber,
                0,
                [this.newStream()],
                this.repeatableElements,
                this.templateStreams,
                this
            );
            this.currentPage.data.pageNum = this.pageCount;
            this.currentNode.kids.push(this.currentPage);

            return this.currentPage;
        },
        output: function(type) {

            var content = removeEmptyElement([
                buildPageTreeNodes(this.rootNode),
                buildObjs(this.resObj.fontObjs),
                buildObjs(this.resObj.imageXObjects),
                buildObjs(this.repeatableElements),
                this.resObj.out(),
                this.infoObj.out(),
                this.catalogObj.out()
            ]).join('\n');

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
                    ['Times-BoldItalic', TIMES, BOLD_ITALIC],
                    ['Symbol', 'symbol', NORMAL],
                    ['ZapfDingbats', 'zapfdingbats', NORMAL],
                ];

            for (var i = 0, l = standardFonts.length; i < l; i++) {
                this.addFont(standardFonts[i][0], standardFonts[i][1], standardFonts[i][2], encoding);
            }
            return this;
        },
        addRepeatableElement: function () {
            var element = this.newStream();
            this.repeatableElements.push(element);
            return element;
        },
        addRepeatableTemplate: function () {
            var template = new docTemplate(this);
            this.templateStreams.push(template);
            return template;
        }
    };

    var getOffsets = function (data) {
        if (typeof data !== 'string') {
            throw 'getOffsets expects a string input';
        }

        var ret = [],
            genRegex = /\d+(?=\sobj)/,
            objRegex = /^\d+/,
            matches, i, match,
            searchRegex;
        matches = data.match(/\d+\s\d+\sobj/gim)

        for (i = 0; match = matches[i]; i++) {
            searchRegex = new RegExp('[^\\d]' + match.replace(/\s+/g, '\\s+'));
            ret.push({
                objNum: parseInt(objRegex.exec(match)),
                genNum: parseInt(genRegex.exec(match)),
                offset: data.search(searchRegex)
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
            return a.objNum - b.objNum;
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
        ret.push('/' + prefix + (i + 1).toString(10) + ' ' + arr[i].objectNumber + ' ' +
            arr[i].generationNumber + ' R');
    }

    return ret.join('\n');
};
resources.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body = [];
            this.body.push('<<');
            this.body.push('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
            this.body.push('/Font <<');
            this.body.push(printDictionaryElements(this.fontObjs, 'F'));
            this.body.push('>>');

            var xImgObjs = printDictionaryElements(this.imageXObjects, 'Im')
            if (xImgObjs) {
                this.body.push('/XObject <<');
                this.body.push(xImgObjs);
                this.body.push('>>');
            }
            this.body.push('>>');

            return obj.prototype.out.apply(this, arguments); 
        }
    },
    getFont: {
        value: function (name, style) {
            if (typeof name === 'string') {
                for (var i = 0, font; font = this.fontObjs[i]; i++) {
                    if (font.description.key.toLowerCase() === name.toLowerCase()) {
                        return font;
                    }
                    if (typeof style === 'string') {
                        if (font.description.fontName.toLowerCase() === name.toLowerCase() &&
                            font.description.fontStyle.toLowerCase() === style.toLowerCase()) {
                            return font;
                        }
                    }
                }
            }
            return undefined;
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

var removeEmptyElement = function (arr) {
    var i, l, value, ret = [];
    for (i = 0, l = arr.length; i < l; i++) {
        value = arr[i];
        if (value) {
            ret.push(value);
        }
    }
    return ret;
}

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
            addRepeatableElement: function () {
                return pdf.addRepeatableElement.apply(pdf, arguments);
            },
            addRepeatableTemplate: function () {
                return pdf.addRepeatableTemplate.apply(pdf, arguments);
            },
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