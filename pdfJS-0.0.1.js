/***********************************************
* pdfJS JavaScript Library
* Authors: https://github.com/ineedfat/pdfjs
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 02/17/2013 19:15
***********************************************/
(function(_) {
'use strict';
/*! pdfJS.js | https://github.com/ineedfat | 2013-02-17 | iNeedFat(https://github.com/ineedfat)*/
var PDFJS_VERSION = '0.0.1';

﻿    // Size in pt of various paper formats
    var PDF_VERSION = '1.3';
    
/**
    *Initialize new document object.
    *@constructor
    *@memberof pdfJS
    *@Author Trinh Ho (https://github.com/ineedfat/pdfjs)
    *@classdesc Representing a PDF document with all the supported API calls.
    *@param {string|array} [format=letter] Paper format name or array containing width and height (e.g [width, height])
    *@param {string} [orientation=portrait] Document orientation.
    *@param {array} [margin=[18,18]] Horizontal and vertical margin in points (e.g [horizontal, vertical])
*/
    var doc = function (format, orientation, margin) {
        var self = this;
        /**
        *Positive integer representing the object number of pdf internal objects. (Becareful when
        *when modifying this property).
        *@Type int
        *@memberof pdfJS.doc#
        */
        self.objectNumber = 0; //object counter used for setting indirect object.

        /**
        *An array of all {@link pdfJS.font} objects included this document.
        *@Type {array of [fonts]{@link pdfJS.font}}  
        */
        this.fontObjs = [];

        /**
        *Current document page in context.
        *@Type {[fonts]{@link pdfJS.pageNode}}  
        */
        this.currentPage = null;
        
        /**
        *Font name map. (fontName > fontStyle > pdf internal font reference name)
        *@Type {object}  
        */
        this.fontmap = {}; 

        /**
        *General document settings
        *@property {Object} settings - Document settings
        *@property {Array}  settings.dimension - Document dimension
        *@property {Object} settings.documentProperties - Document info
        *@property {Object} settings.documentProperties.title - title
        *@property {Object} settings.documentProperties.subject - subject
        *@property {Object} settings.documentProperties.author - author
        *@property {Object} settings.documentProperties.keywords - keywords
        *@property {Object} settings.documentProperties.creator - creator
        */
        this.settings = {
            dimension: utils.paperFormat['letter'],
            documentProperties: { 'title': '', 'subject': '', 'author': '', 'keywords': '', 'creator': '' }
        };
        
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

        /**
        *Root of the Page-Tree
        *@Type {[pageTreeNode]{@link pdfJS.pageTreeNode}  
        */
        this.rootNode = new pageTreeNode(null, ++self.objectNumber, 0);

        /**
        *Current pageTreeNode in context
        *@Type {[pageTreeNode]{@link pdfJS.pageTreeNode}  
        */
        this.currentNode = this.rootNode;
        this.addStandardFonts();
        this.resObj = resources(this.fontObjs, this.newObj());
        this.infoObj = info(this.settings, this.newObj());
        this.catalogObj = catalog(this.rootNode, this.newObj());
    };
    doc.prototype = {
        /**
        *Create new pdf object for this document.
        *@memberof pdfJS.doc#
        *@return {[obj]{@link pdfJS.obj}} a newly created pdf object for this document.
        */
        newObj: function () {
            return new obj(++this.objectNumber, 0);
        },
        /**
        *Create new pdf stream for this document.
        *@memberof pdfJS.doc#
        *@return {[stream]{@link pdfJS.stream}} a newly created pdf stream for this document.
        */
        newStream: function () {
            return new stream(++this.objectNumber, 0);
        },
        /**
        *Add a new page to the document.
        *@param {number} [height] Height in pt
        *@param {number} [width] Width in pt
        *@memberof pdfJS.doc#
        *@return {[pageNode]{@link pdfJS.pageNode}}
        */
        //TODO: Add options/margin/etc
        addPage: function (height, width) {
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
        },
        /**
        *Output PDF document.
        *@memberof pdfJS.doc#
        *@param {string} type (datauristring | datauriLstring | datauri | dataurl | dataurlnewwindow)
        *@return {string} PDF data string.
        */
        output: function (type) {
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
        },
        /**
        *Add new font to document
        *@param {string} postScriptName (e.g 'Helvetica-Oblique')
        *@param {string} fontName (e.g 'HELVETICA')
        *@param {string} fontStyle (e.g 'ITALIC')
        *@param {string} [encoding='StandardEncoding'] Font encoding
        *@memberof pdfJS.doc#
        *@return {string} Reference name of font used in the PDF document internally.
        */
        addFont: function (postScriptName, fontName, fontStyle, encoding) {

            var fontKey = 'F' + (this.fontObjs.length + 1).toString(10);
            // This is FontObject 
            var fontDescription = {
                'key': fontKey,
                'PostScriptName': postScriptName,
                'fontName': fontName,
                'fontStyle': fontStyle,
                'encoding': encoding,
                'metadata': {}
            };

            this.fontObjs.push(new font(fontDescription, ++this.objectNumber, 0));

            fontName = fontName.toLowerCase();
            fontStyle = fontStyle.toLowerCase();

            if (!(this.fontmap[fontName])) {
                this.fontmap[fontName] = {}; // fontStyle is a var interpreted and converted to appropriate string. don't wrap in quotes.
            }
            this.fontmap[fontName][fontStyle] = fontKey;

            return fontKey;
        },
        /**
        *@memberof pdfJS.doc#
        *Add a list of standard fonts to document.
        */
        addStandardFonts: function () {

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
            }
            return this;
        }
    }

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
            contentBuilder.push(padd10(offsets[i].offset) + ' 00000 n ');
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
﻿//Create root pageTreeNode before calling catalog.
var catalog = function (rootNode, catalogObj) {
    catalogObj.body.push('<<');

    catalogObj.body.push('/Type /Catalog');
    catalogObj.body.push('/Pages ' + rootNode.objectNumber + ' ' + rootNode.generationNumber + ' R');

    catalogObj.body.push('/PageLayout /OneColumn');

    catalogObj.body.push('>>');

    return catalogObj;
};
﻿var info = function (settings, infoObj) {
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
﻿//Add fonts before calling resurce. 
var resources = function (fontObjs, resourceObj) {
    // Resource dictionary
    //Manually increment objectNumber
    resourceObj.body.push('<<');
    resourceObj.body.push('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
    resourceObj.body.push('/Font <<');
    // Do this for each font, the '1' bit is the index of the font
    for (var i = 0, len = fontObjs.length; i < len; i++) {
        resourceObj.body.push('/F' + (i).toString(10) + ' ' + fontObjs[i].objectNumber + ' ' + fontObjs[i].generationNumber + ' R');
    }
    resourceObj.body.push('>>');
    resourceObj.body.push('/XObject <<');
    //putXobjectDict();
    resourceObj.body.push('>>');
    resourceObj.body.push('>>');

    return resourceObj;
};
﻿var pageOptionsConverter = function (options) {
    var ret = [],
        obj;
    for (var item in options) {
        if (!options.hasOwnProperty(item))
            continue;
        obj = options[item];
        switch (item.toLowerCase()) {
            //Inheritable
            case 'mediabox':
                if (checkValidRect(obj)) {
                    ret.push('/MediaBox [' + obj.join(' ') + ']');
                }
                break;
                //Inheritable
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
                //TODO: Thumbnail Image
                break;
            case 'b':
                //TODO: B 
                /*(Optional; PDF 1.1; recommended if the page contains article beads) An 
                array of indirect references to article beads appearing on the page*/
                break;
            case 'dur':
                //TODO: Dur 
                /*(Optional; PDF 1.1) The page’s display duration (also called its advance 
                timing): the maximum length of time, in seconds, that the page will be
                displayed during presentations before the viewer application automatically
                advances to the next page*/
                break;
            case 'Trans':
                //TODO: Trans 
                break;
            case 'Annots':
                //TODO: Annots 
                break;
            case 'AA':
                //TODO: AA 
                break;
            case 'PieceInfo':
                //TODO: PieceInfo 
                break;
            case 'LastModified':
                //TODO: LastModified 
                break;
            case 'StructParents':
                //TODO: StructParents 
                break;
            case 'ID':
                //TODO: ID 
                break;
            case 'PZ':
                //TODO: PZ 
                break;
            case 'SeparationInfo':
                //TODO: SeparationInfo 
                break;
        }
    }
    return ret.join(' ');
};
﻿// this will run on <=IE9, possibly some niche browsers
// new webkit-based, FireFox, IE10 already have native version of this.
if (typeof btoa === 'undefined') {
    window.btoa = function (data) {
        // DO NOT ADD UTF8 ENCODING CODE HERE!!!!

        // UTF8 encoding encodes bytes over char code 128
        // and, essentially, turns an 8-bit binary streams
        // (that base64 can deal with) into 7-bit binary streams. 
        // (by default server does not know that and does not recode the data back to 8bit)
        // You destroy your data.

        // binary streams like jpeg image data etc, while stored in JavaScript strings,
        // (which are 16bit arrays) are in 8bit format already.
        // You do NOT need to char-encode that before base64 encoding.

        // if you, by act of fate
        // have string which has individual characters with code
        // above 255 (pure unicode chars), encode that BEFORE you base64 here.
        // you can use absolutely any approch there, as long as in the end,
        // base64 gets an 8bit (char codes 0 - 255) stream.
        // when you get it on the server after un-base64, you must 
        // UNencode it too, to get back to 16, 32bit or whatever original bin stream.

        // Note, Yes, JavaScript strings are, in most cases UCS-2 - 
        // 16-bit character arrays. This does not mean, however,
        // that you always have to UTF8 it before base64.
        // it means that if you have actual characters anywhere in
        // that string that have char code above 255, you need to
        // recode *entire* string from 16-bit (or 32bit) to 8-bit array.
        // You can do binary split to UTF16 (BE or LE)
        // you can do utf8, you can split the thing by hand and prepend BOM to it,
        // but whatever you do, make sure you mirror the opposite on
        // the server. If server does not expect to post-process un-base64
        // 8-bit binary stream, think very very hard about messing around with encoding.

        // so, long story short:
        // DO NOT ADD UTF8 ENCODING CODE HERE!!!!

        /* @preserve
        ====================================================================
        base64 encoder
        MIT, GPL
    
        version: 1109.2015
        discuss at: http://phpjs.org/functions/base64_encode
        +   original by: Tyler Akins (http://rumkin.com)
        +   improved by: Bayron Guevara
        +   improved by: Thunder.m
        +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        +   bugfixed by: Pellentesque Malesuada
        +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        +   improved by: Rafal Kukawski (http://kukawski.pl)
        +   			 Daniel Dotsenko, Willow Systems Corp, willow-systems.com
        ====================================================================
        */

        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", b64a = b64.split(''), o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            enc = "",
            tmp_arr = [];

        do { // pack three octets into four hexets
            o1 = data.charCodeAt(i++);
            o2 = data.charCodeAt(i++);
            o3 = data.charCodeAt(i++);

            bits = o1 << 16 | o2 << 8 | o3;

            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;

            // use hexets to index into b64, and append result to encoded string
            tmp_arr[ac++] = b64a[h1] + b64a[h2] + b64a[h3] + b64a[h4];
        } while (i < data.length);

        enc = tmp_arr.join('');
        var r = data.length % 3;
        return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

        // end of base64 encoder MIT, GPL
    };
}

if (typeof atob === 'undefined') {
    window.atob = function (data) {
        // http://kevin.vanzonneveld.net
        // +   original by: Tyler Akins (http://rumkin.com)
        // +   improved by: Thunder.m
        // +      input by: Aman Gupta
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Onno Marsman
        // +   bugfixed by: Pellentesque Malesuada
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
        // *     returns 1: 'Kevin van Zonneveld'
        // mozilla has this native
        // - but breaks in 2.0.0.12!
        //if (typeof this.window['atob'] == 'function') {
        //    return atob(data);
        //}
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            dec = "",
            tmp_arr = [];

        if (!data) {
            return data;
        }

        data += '';

        do { // unpack four hexets into three octets using index points in b64
            h1 = b64.indexOf(data.charAt(i++));
            h2 = b64.indexOf(data.charAt(i++));
            h3 = b64.indexOf(data.charAt(i++));
            h4 = b64.indexOf(data.charAt(i++));

            bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

            o1 = bits >> 16 & 0xff;
            o2 = bits >> 8 & 0xff;
            o3 = bits & 0xff;

            if (h3 == 64) {
                tmp_arr[ac++] = String.fromCharCode(o1);
            } else if (h4 == 64) {
                tmp_arr[ac++] = String.fromCharCode(o1, o2);
            } else {
                tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
            }
        } while (i < data.length);

        dec = tmp_arr.join('');

        return dec;
    };
}
var to8bitStream = function (text, flags) {
    /* PDF 1.3 spec:
    "For text strings encoded in Unicode, the first two bytes must be 254 followed by
    255, representing the Unicode byte order marker, U+FEFF. (This sequence conflicts
    with the PDFDocEncoding character sequence thorn ydieresis, which is unlikely
    to be a meaningful beginning of a word or phrase.) The remainder of the
    string consists of Unicode character codes, according to the UTF-16 encoding
    specified in the Unicode standard, version 2.0. Commonly used Unicode values
    are represented as 2 bytes per character, with the high-order byte appearing first
    in the string."

    In other words, if there are chars in a string with char code above 255, we
    recode the string to UCS2 BE - string doubles in length and BOM is prepended.

    HOWEVER!
    Actual *content* (body) text (as opposed to strings used in document properties etc)
    does NOT expect BOM. There, it is treated as a literal GID (Glyph ID)

    Because of Adobe's focus on "you subset your fonts!" you are not supposed to have
    a font that maps directly Unicode (UCS2 / UTF16BE) code to font GID, but you could
    fudge it with "Identity-H" encoding and custom CIDtoGID map that mimics Unicode
    code page. There, however, all characters in the stream are treated as GIDs,
    including BOM, which is the reason we need to skip BOM in content text (i.e. that
    that is tied to a font).

    To signal this "special" PDFEscape / to8bitStream handling mode,
    API.text() function sets (unless you overwrite it with manual values
    given to API.text(.., flags) )
        flags.autoencode = true
        flags.noBOM = true

    */

    /*
    `flags` properties relied upon:
    .sourceEncoding = string with encoding label. 
        "Unicode" by default. = encoding of the incoming text.
        pass some non-existing encoding name 
        (ex: 'Do not touch my strings! I know what I am doing.')
        to make encoding code skip the encoding step.
    .outputEncoding = Either valid PDF encoding name 
        (must be supported by jsPDF font metrics, otherwise no encoding)
        or a JS object, where key = sourceCharCode, value = outputCharCode
        missing keys will be treated as: sourceCharCode === outputCharCode
    .noBOM
        See comment higher above for explanation for why this is important
    .autoencode
        See comment higher above for explanation for why this is important
    */

    var i, l, undef;

    if (flags === undef) {
        flags = {};
    }

    var sourceEncoding = flags.sourceEncoding ? sourceEncoding : 'Unicode', encodingBlock, outputEncoding = flags.outputEncoding, newtext, isUnicode, ch, bch;
    // This 'encoding' section relies on font metrics format 
    // attached to font objects by, among others, 
    // "Willow Systems' standard_font_metrics plugin"
    // see jspdf.plugin.standard_font_metrics.js for format
    // of the font.metadata.encoding Object.
    // It should be something like
    //   .encoding = {'codePages':['WinANSI....'], 'WinANSI...':{code:code, ...}}
    //   .widths = {0:width, code:width, ..., 'fof':divisor}
    //   .kerning = {code:{previous_char_code:shift, ..., 'fof':-divisor},...}
    if ((flags.autoencode || outputEncoding) &&
        fonts[activeFontKey].metadata &&
        fonts[activeFontKey].metadata[sourceEncoding] &&
        fonts[activeFontKey].metadata[sourceEncoding].encoding) {
        encodingBlock = fonts[activeFontKey].metadata[sourceEncoding].encoding;

        // each font has default encoding. Some have it clearly defined.
        if (!outputEncoding && fonts[activeFontKey].encoding) {
            outputEncoding = fonts[activeFontKey].encoding;
        }

        // Hmmm, the above did not work? Let's try again, in different place.
        if (!outputEncoding && encodingBlock.codePages) {
            outputEncoding = encodingBlock.codePages[0]; // let's say, first one is the default
        }

        if (typeof outputEncoding === 'string') {
            outputEncoding = encodingBlock[outputEncoding];
        }
        // we want output encoding to be a JS Object, where
        // key = sourceEncoding's character code and 
        // value = outputEncoding's character code.
        if (outputEncoding) {
            isUnicode = false;
            newtext = [];
            for (i = 0, l = text.length; i < l; i++) {
                ch = outputEncoding[text.charCodeAt(i)];
                if (ch) {
                    newtext.push(
                        String.fromCharCode(ch)
                    )
                } else {
                    newtext.push(
                        text[i]
                    );
                }

                // since we are looping over chars anyway, might as well
                // check for residual unicodeness
                if (newtext[i].charCodeAt(0) >> 8 /* more than 255 */) {
                    isUnicode = true;
                }
            }
            text = newtext.join('');
        }
    }

    i = text.length;
    // isUnicode may be set to false above. Hence the triple-equal to undefined
    while (isUnicode === undef && i !== 0) {
        if (text.charCodeAt(i - 1) >> 8 /* more than 255 */) {
            isUnicode = true;
        }
        i--;
    }
    if (!isUnicode) {
        return text;
    } else {
        newtext = flags.noBOM ? [] : [254, 255];
        for (i = 0, l = text.length; i < l; i++) {
            ch = text.charCodeAt(i);
            bch = ch >> 8 // divide by 256
            if (bch >> 8 /* something left after dividing by 256 second time */) {
                throw new Error("Character at position " + i.toString(10) + " of string '" + text + "' exceeds 16bits. Cannot be encoded into UCS-2 BE");
            }
            newtext.push(bch);
            newtext.push(ch - (bch << 8));
        }
        return String.fromCharCode.apply(undef, newtext);
    }
};
var pdfEscape = function (text, flags) {
    // doing to8bitStream does NOT make this PDF display unicode text. For that
    // we also need to reference a unicode font and embed it - royal pain in the rear.

    // There is still a benefit to to8bitStream - PDF simply cannot handle 16bit chars,
    // which JavaScript Strings are happy to provide. So, while we still cannot display
    // 2-byte characters property, at least CONDITIONALLY converting (entire string containing) 
    // 16bit chars to (USC-2-BE) 2-bytes per char + BOM streams we ensure that entire PDF
    // is still parseable.
    // This will allow immediate support for unicode in document properties strings.
    return to8bitStream(text, flags).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
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
// simplified (speedier) replacement for sprintf's %.3f conversion  
var f3 = function (number) {
    return number.toFixed(3);
};
// simplified (speedier) replacement for sprintf's %02d
var padd2 = function (number) {
    var n = (number).toFixed(0);
    if (number < 10) return '0' + n;
    else return n;
};
// simplified (speedier) replacement for sprintf's %02d
var padd10 = function (number) {
    var n = (number).toFixed(0);
    if (n.length < 10) return new Array(11 - n.length).join('0') + n;
    else return n;
};
// simplified (speedier) replacement for sprintf's %.2f conversion
/**
@namespace
*@memberof pdfJS.
*/
var utils = {
    /**
    *@readonly
    *@enum {array of int}
    */
    paperFormat: {
        'a3': [841.89, 1190.55],
        'a4': [595.28, 841.89],
        'a5': [420.94, 595.28],
        'letter': [612, 792],
        'legal': [612, 1008]
    }
};
﻿/**
*Representing font type in PDF document.
*@constructor
*@memberof pdfJS

*/
var obj = function (objectNumber, generationNumber) {
    var self = this;

    /**
        *Positive integer representing the object number of pdf internal objects.
        *@Type int
        *@default 0
        */
    this.objectNumber = objectNumber;
    /**
        *Non-negative integer representing the generation number of pdf internal objects.
        *@Type int
        *@default 0
        */
    this.generationNumber = generationNumber;
    /**
        *The content of this obj.
        *@Type int
        *@default []
        */
    this.body = [];
};
obj.prototype = {
    /**
    *Output PDF data string for this obj.
    *@return {string}
    *@memberof pdfJS.obj#
    */
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
}
﻿/**
*Representing a page in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*/
var pageNode = function (parent, pageOptions, objectNumber, generationNumber, contentStreams, document) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    /**
        *Page Config options.
        *@Type object
        */
    this.pageOptions = pageOptions;
    /**
        *The parent pageTreeNode of this page.
        *@Type pdfJS.pageTreeNode
        */
    this.parent = parent;
    /**
        *Array of content streams (the actual content of the page).
        *@Type array[[pdfJS.stream]{@link pdfJS.stream} ]
        */
    this.contentStreams = contentStreams;
    /**
        *Current active stream in context.
        *@Type pdfJS.stream
        */
    this.currentStream = this.contentStreams[0];
    /**
        *The document that this page belongs to.
        *@Type pdfJS.doc
        */
    this.doc = document;
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

            ret.push(obj.prototype.out.apply(this, arguments)); //calling obj super class out method.

            if (this.contentStreams.length) {
                for (i = 0; item = this.contentStreams[i]; i++) {
                    ret.push(item.out());
                }
            }
            return ret.join('\n');
        }
    },
    /**
    *Graphic Operation Setter.
    *@param {string} operator Name of graphic operator.
    *@param {args . . .} operand Operator operands
    *@returns {pageNode} Return this pageNode object
    *@memberof pdfJS.pageNode#
    */
    graphic: {
        value: function (operator, operands) {
            if (this instanceof pageNode) {
                graphicOperators[operator].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            return this;
        }
    },
    /**
    *Text Operation Setter.
    *@param {string} operator Name of graphic operator.
    *@param {args . . .} operand Operator operands
    *@returns {pageNode} Return this pageNode object
    *@memberof pdfJS.pageNode#
    */
    text: {
        value: function (operator, operands) {
            if (this instanceof pageNode) {
                textOperators[operator].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            return this;
        }
    },
    /**
    *Set current stream in context by index.
    *@param {int} index index of contentStreams
    *@returns {pageNode} Return this pageNode object
    *@memberof pdfJS.pageNode#
    */
    setStream: {
        value: function (index) {
            if (index >= this.contentStreams.length)
                throw 'Invalid stream index';
            this.currentStream = this.contentStreams[index];
            return this;
        }
    }
});

﻿/**
*Representing a page-tree node in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*/
var pageTreeNode = function (parent, objectNumber, generationNumber) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    /**
        *The parent pageTreeNode of this page-tree.
        *@Type pdfJS.pageTreeNode
        */
    this.parent = parent;
    /**
        *Children of this page-tree node.
        *@type array[[pdfJS.pageTreeNode]{@link pdfJS.pageTreeNode} | [pdfJS.pageNode]{@link pdfJS.pageNode}]
        */
    this.kids = [];
};


pageTreeNode.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            var i, item;
            this.body.push(
                '<< /Type /Pages',
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

            return obj.prototype.out.apply(this, arguments); //calling obj super class out method.
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

﻿/**
*Representing a stream object in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*/
var stream = function (objectNumber, generationNumber) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    /**
        *The content of this stream.
        *@Type [string]
        *@default []
        */
    self.content = [];
};


stream.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body.push('<< /Length ' + this.content.join('\n').length + ' >>');
            this.body.push('stream');
            this.body = this.body.concat(this.content);
            this.body.push('endstream');

            return obj.prototype.out.apply(this, arguments); //calling obj super class out method.
        }
    },
    /**
        *Shortcut to pushing content to the stream (same as stream.content.push('something');
        *@param {string} args stream.push(item1, item2, . . . , itemX)
        *@returns {pdfJS.stream} Return this stream object.
        *@memberof pdfJS.stream#
        */
    push: {
        value: function (args) {
            Array.prototype.push.apply(this.content, arguments);
            return this;
        }
    }
});

﻿/**
*Representing font type in PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*/
var font = function (font, objectNumber, generationNumber) {
    var self = this;
    obj.call(this, objectNumber, generationNumber);
    /**
        *Font description object.
        *@Type object
        */
    self.description = font;
};

font.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body.push('<< /Type /Font');
            this.body.push('/Subtype /Type1');
            this.body.push('/BaseFont /' + this.description.PostScriptName);

            if (typeof font.encoding === 'string') {
                this.body.push('/Encoding /' + this.description.encoding);
            }
            this.body.push('>>');

            return obj.prototype.out.apply(this, arguments); //calling obj super class out method.
        }
    }
});

﻿doc.prototype.setGraphicsState = function (options) {
    for (var item in options) {
        if (!options.hasOwnProperty(item))
            return;
        switch (item.toLowerCase()) {
            //Setting the text font and font size
            //Expect object: {fontName: Time, fontStyle: Normal, size: 16}
            case 'font':
                var opt = options[item];
                var fontKey;
                try {
                    fontKey = this.fontmap[opt.fontName][opt.fontStyle];
                }
                catch (e) {
                    throw Error('font does not exist.');
                }

                var font = this.fonts[fontKey];
                //TODO: Search for font name from font dictionary
        }
    }
};

var graphicOperators = {
    /*
Transformation should be done in the following order: 
####Translate -> Rotate -> Scale or Skew.
*/
    transform: {
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
        }
    },
    colorSpace: function () {
    },
    color: function () {
    },
    textState: function () {
    },
    /*
    Valid Value: Non-negative number.
    A value of zero means the thinnest line a device can print/render;
    therefore setting the value to zero is a device-dependent operation, not recommended'
    */
    lineWidth: function (lineWidth) {
        this.currentStream.push(lineWidth + ' w');
    },
    lineCap: function (lineCap) {
        this.currentStream.push(lineCap + ' J');
    },
    lineJoin: function (lineJoin) {
        this.currentStream.push(lineJoin + ' j');
    },
    miterLimit: function (miterLimit) {
        this.currentStream.push(miterLimit + ' M');
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
    /*Path Controls Begin*/
    newSubPath: function (x, y) {
        if (arguments.length != 4) {
            throw 'Invalid new path parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' m');
    },
    straightLine: function (x, y) {
        if (arguments.length != 4) {
            throw 'Invalid straight line  parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' l');
    },
    bezierCurve: function () {
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
        this.currentStream.push(operator);
    },
    clip: function (asterisk) {
        this.currentStream.push('W' + (asterisk ? ' *' : ''));
    },
    noOp: function () {
        this.currentStream.push('n');
    },
    /*Path Controls END*/

    rect: function (x, y, width, height) {
        if (arguments.length != 4) {
            throw 'Invalid rectangle parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' re');
    },
    /*Color Controls Begin */
    fillColorSpace: function (name) {
        this.currentStream.push(name + ' cs')
    },
    strokeColorSpace: function (name) {
        this.currentStream.push(name + ' CS')
    },
    fillColor: function () {
        switch (arguments.length) {
            case 1:
            case 3:
            case 4:
                var args = Array.prototype.slice.call(arguments);
                this.currentStream.push(args.join(' ') + ' sc');
                break;
            default:
                throw ('Invalid color values');
                break;
        }
    },
    strokeColor: function () {
        switch (arguments.length) {
            case 1:
            case 3:
            case 4:
                var args = Array.prototype.slice.call(arguments);
                this.currentStream.push(args.join(' ') + ' SC');
                break;
            default:
                throw ('Invalid color values');
                break;
        }
    },
    grayFill: function (value) {
        this.currentStream.push(value + ' g');
    },
    grayStroke: function (value) {
        this.currentStream.push(value + ' G');
    },
    rgbFill: function () {
        if (arguments.length != 3) {
            throw 'Invalid RGB color values';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' rg');
    },
    rgbStroke: function () {
        if (arguments.length != 3) {
            throw 'Invalid RGB color values';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' RG');
    },
    cmykFill: function () {
        if (arguments.length != 4) {
            throw 'Invalid CMYK color values';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' k');
    },
    cmykStroke: function () {
        if (arguments.length != 4) {
            throw 'Invalid CMYK color values';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' K');
    }
    /*Color Controls End*/

};
﻿var textOperators = {
    beginText: function () {
        this.currentStream.push('BT');
    },
    endText: function () {
        this.currentStream.push('ET');
    },
    textPosition: function (x, y) {
        this.currentStream.push(x + ' ' + y + ' td');
    },
    textPositionWithLeading: function (x, y) {
        this.currentStream.push(x + ' ' + y + ' TD');
    },
    charSpace: function (charSpace) {
        this.currentStream.push(charSpace + ' Tc');
    },
    wordSpace: function (wordSpace) {
        this.currentStream.push(wordSpace + ' Tw');
    },
    scale: function (scale) {
        this.currentStream.push(scale + ' Tz');
    },
    leading: function (leading) {
        this.currentStream.push(leading + ' TL');
    },
    fontSize: function (fontSize) {
        this.currentStream.push(fontSize + ' Tf');
    },
    fontStyle: function (name, style, fontSize) {
        var fontKey = name && style ? this.doc.fontmap[name][style] : this.doc.fontObjs[0].description.key,
            len = arguments.length;
        this.currentStream.push('/' + fontKey);

        if (len >= 3) {
            this.text('fontSize', arguments[2]);
        }
    },
    render: function (render) {
        this.currentStream.push(render + ' Tr');
    },
    rise: function (rise) {
        this.currentStream.push(rise + ' Ts');
    },
    showText: function (textString, wordSpace, charSpace) {
        if (arguments.length === 1) {
            this.currentStream.push('(' + textString + ') Tj');
        }
        else {
            this.currentStream.push(wordSpace + ' ' + charSpace + ' (' + textString + ') "');
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

    },
    showTextln: function (textString) {
        this.currentStream.push(textString + ' \'');
    },

    textMatrix: function (a, b, c, d, e, f) {
        var args = Array.prototype.slice.call(arguments);
        if (args.length !== 6) {
            throw 'Invalid text matrix';
        }
        this.currentStream.push(args.join(' ') + ' Tm');
    },
    nextLine: function () {
        this.currentStream.push('T*');
    }
};
﻿//Public
/**
@namespace
*/
var pdfJS = {
    doc: doc,
    obj: obj, //PDF object
    pageNode: pageNode,
    pageTreeNode: pageTreeNode,
    utils: utils,
    font: font
};

_.pdfJS = pdfJS;

}(window));