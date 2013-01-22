(function ($) {

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