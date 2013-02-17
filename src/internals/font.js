doc.prototype.addFont = function (PostScriptName, fontName, fontStyle, encoding) {

    var fontKey = 'F' + (this.fontObjs.length + 1).toString(10);
    // This is FontObject 
    var font = {
        'id': fontKey,
        'PostScriptName': PostScriptName,
        'fontName': fontName,
        'fontStyle': fontStyle,
        'encoding': encoding,
        'metadata': {}
    };

    this.fontObjs.push(fontFactory(font, this.newObj()));
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

var fontFactory = function (font, fontObj) {
    fontObj.body.push('<< /Type /Font');
    fontObj.body.push('/Subtype /Type1');
    fontObj.body.push('/BaseFont /' + font.PostScriptName);

    if (typeof font.encoding === 'string') {
        fontObj.body.push('/Encoding /' + font.encoding);
    }
    fontObj.body.push('>>');

    return fontObj;
};
