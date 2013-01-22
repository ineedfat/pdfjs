/*! pdfJS.js | https://github.com/ineedfat | 2013-01-22 | iNeedFat(https://github.com/ineedfat)*/
var PDFJS_VERSION = 0.01

﻿var pdfJS = {};

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
﻿(function($) {
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
﻿(function ($) {

    pdfJS.doc.prototype.addFont = function(PostScriptName, fontName, fontStyle, encoding) {
        var fontKey = 'F' + (pdfJS.utils.getObjectLength(this.fonts) + 1).toString(10);

        // This is FontObject 
        var font = this.fonts[fontKey] = {
            'id': fontKey
            // , 'objectNumber':   will be set by putFont()
            ,
            'PostScriptName': PostScriptName,
            'fontName': fontName,
            'fontStyle': fontStyle,
            'encoding': encoding,
            'metadata': {}
        };

        this.addToFontDictionary(fontKey, fontName, fontStyle);


        return fontKey;
    };

    pdfJS.doc.prototype.addToFontDictionary = function(fontKey, fontName, fontStyle) {
        // this is mapping structure for quick font key lookup.
        // returns the KEY of the font (ex: "F1") for a given pair of font name and type (ex: "Arial". "Italic")
        var undef;
        if (this.fontmap[fontName] === undef) {
            this.fontmap[fontName] = {}; // fontStyle is a var interpreted and converted to appropriate string. don't wrap in quotes.
        }
        this.fontmap[fontName][fontStyle] = fontKey;
    };
    pdfJS.doc.prototype.addFonts = function() {

        var HELVETICA = "helvetica", TIMES = "times", COURIER = "courier", NORMAL = "normal", BOLD = "bold", ITALIC = "italic", BOLD_ITALIC = "bolditalic", encoding = 'StandardEncoding', standardFonts = [
            ['Helvetica', HELVETICA, NORMAL], ['Helvetica-Bold', HELVETICA, BOLD], ['Helvetica-Oblique', HELVETICA, ITALIC], ['Helvetica-BoldOblique', HELVETICA, BOLD_ITALIC], ['Courier', COURIER, NORMAL], ['Courier-Bold', COURIER, BOLD], ['Courier-Oblique', COURIER, ITALIC], ['Courier-BoldOblique', COURIER, BOLD_ITALIC], ['Times-Roman', TIMES, NORMAL], ['Times-Bold', TIMES, BOLD], ['Times-Italic', TIMES, ITALIC], ['Times-BoldItalic', TIMES, BOLD_ITALIC]
        ];

        var i, l, fontKey, parts;
        for (i = 0, l = standardFonts.length; i < l; i++) {
            fontKey = this.addFont(
                standardFonts[i][0], standardFonts[i][1], standardFonts[i][2], encoding
            );

            // adding aliases for standard fonts, this time matching the capitalization
            parts = standardFonts[i][0].split('-');
            this.addToFontDictionary(fontKey, parts[0], parts[1] || '');
        }
    };
    pdfJS.doc.prototype.getFont = function(fontName, fontStyle) {
        var key, undef

        if (fontName === undef) {
            fontName = this.fonts[activeFontKey]['fontName'];
        }
        if (fontStyle === undef) {
            fontStyle = this.fonts[activeFontKey]['fontStyle'];
        }

        try {
            key = this.fontmap[fontName][fontStyle]; // returns a string like 'F3' - the KEY corresponding tot he font + type combination.
        } catch(e) {
            key = undef;
        }
        if (!key) {
            throw new Error("Unable to look up font label for font '" + fontName + "', '" + fontStyle + "'. Refer to getFontList() for available fonts.");
        }

        return key;
    };
    pdfJS.doc.prototype.putFonts = function () {
        for (var fontKey in this.fonts) {
            if (this.fonts.hasOwnProperty(fontKey)) {
                this.putFont(this.fonts[fontKey]);
            }
        }
    };
    pdfJS.doc.prototype.putFont = function (font) {
        font.objectNumber = this.newObj();
        this.outToContent('<</BaseFont/' + font.PostScriptName + '/Type/Font');
        if (typeof font.encoding === 'string') {
            this.outToContent('/Encoding/' + font.encoding);
        }
        this.outToContent('/Subtype/Type1>>');
        this.outToContent('endobj');
    };
})(jQuery);
﻿(function ($) {


    pdfJS.doc.prototype.putInfo = function () {
        this.offsets[this.objectNumber] = this.contentLength;
        this.outToContent(this.objectNumber + ' 0 obj');

        this.outToContent('<<');

        this.outToContent('/Producer (PDFjs ' + PDFJS_VERSION + ')');
        if (this.documentProperties.title) {
            this.outToContent('/Title (' + pdfJS.pdfEscape(this.documentProperties.title) + ')');
        }
        if (this.documentProperties.subject) {
            this.outToContent('/Subject (' + pdfJS.pdfEscape(this.documentProperties.subject) + ')');
        }
        if (this.documentProperties.author) {
            this.outToContent('/Author (' + pdfJS.pdfEscape(this.documentProperties.author) + ')');
        }
        if (this.documentProperties.keywords) {
            this.outToContent('/Keywords (' + pdfJS.pdfEscape(this.documentProperties.keywords) + ')');
        }
        if (this.documentProperties.creator) {
            this.outToContent('/Creator (' + pdfJS.pdfEscape(this.documentProperties.creator) + ')');
        }
        var created = new Date();
        this.outToContent('/CreationDate (D:' +
            [
                created.getFullYear(),
                pdfJS.utils.padd2(created.getMonth() + 1),
                pdfJS.utils.padd2(created.getDate()),
                pdfJS.utils.padd2(created.getHours()),
                pdfJS.utils.padd2(created.getMinutes()),
                pdfJS.utils.padd2(created.getSeconds())
            ].join('') +
            ')'
        );

        this.outToContent('>>');
        this.outToContent('endobj');
        
        this.objectNumber++;

    };
})(jQuery);
﻿(function($) {
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
﻿(function ($) {
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
﻿(function($) {
    pdfJS.doc.prototype.putTrailer = function() {
        this.outToContent('/Size ' + (this.objectNumber + 1));
        this.outToContent('/Root ' + this.objectNumber + ' 0 R');
        this.outToContent('/Info ' + (this.objectNumber - 1) + ' 0 R');
    };
})(jQuery);
﻿(function ($) {
    // this will run on <=IE9, possibly some niche browsers
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
    pdfJS.to8bitStream = function (text, flags) {
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
    pdfJS.pdfEscape = function (text, flags) {
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

    // simplified (speedier) replacement for sprintf's %.2f conversion  
    pdfJS.utils = {
        f2: function (number) {
            return number.toFixed(2);
        }
        // simplified (speedier) replacement for sprintf's %.3f conversion  
        ,
        f3: function (number) {
            return number.toFixed(3);
        }
        // simplified (speedier) replacement for sprintf's %02d
        ,
        padd2: function (number) {
            var n = (number).toFixed(0);
            if (number < 10) return '0' + n;
            else return n;
        }
        // simplified (speedier) replacement for sprintf's %02d
        ,
        padd10: function (number) {
            var n = (number).toFixed(0);
            if (n.length < 10) return new Array(11 - n.length).join('0') + n;
            else return n;
        },
        getObjectLength: typeof Object.keys === 'function' ?
	        function (object) {
	            return Object.keys(object).length;
	        } :
	        function (object) {
	            var i = 0;
	            for (var e in object) { if (object.hasOwnProperty(e)) {
	                                        i++;
	                                    } }
	            return i;
	        }
    };
})(jQuery);