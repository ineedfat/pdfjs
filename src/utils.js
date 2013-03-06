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
    *@enum {[width, height]}
    */
    paperFormat: {
        a3: [841.89, 1190.55],
        a4: [595.28, 841.89],
        a5: [420.94, 595.28],
        letter: [612, 792],
        legal: [612, 1008]
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {int}
    */
    lineCapStyle: {
        /**The stroke is squared off at the endpoint of
the path. There is no projection beyond the end of
the path.*/
        buttCap: 0,
        /**A semicircular arc with a diameter equal
to the line width is drawn around the endpoint and
filled in.*/
        roundCap: 1,
        /**The stroke continues beyond
the endpoint of the path for a distance equal to half
the line width and is then squared off.*/
        projectinSquareCap: 2
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {int}
    */
    lineJoinStyle: {
        /**The outer edges of the strokes for the two
segments are extended until they meet at an angle, as
in a picture frame. If the segments meet at too sharp
an angle (as defined by the miter limit parameter—
see “Miter Limit,” below), a bevel join is used instead.*/
        miterJoin: 0,
        /**A circle with a diameter equal to the line
width is drawn around the point where the two
segments meet and is filled in, producing a rounded
corner. Note: If path segments shorter than half the line width
meet at a sharp angle, an unintended “wrong side” of
the circle may appear.*/
        roundJoin: 1,
        /**The two segments are finished with butt
caps (see “Line Cap Style” on page 139) and the
resulting notch beyond the ends of the segments is
filled with a triangle.*/
        bevelJoin: 2
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {int}
    */
    renderingIntentOption: {
        /**Colors are represented solely with respect to the light source; no
correction is made for the output medium’s white point (such as
the color of unprinted paper). Thus, for example, a monitor’s
white point, which is bluish compared to that of a printer’s
paper, would be reproduced with a blue cast. In-gamut colors
are reproduced exactly; out-of-gamut colors are mapped to the
nearest value within the reproducible gamut. This style of
reproduction has the advantage of providing exact color
matches from one output medium to another. It has the
disadvantage of causing colors with Y values between the
medium’s white point and 1.0 to be out of gamut. A typical use
might be for logos and solid colors that require exact
reproduction across different media.*/
        absoluteColorimetric: 'AbsoluteColorimetric',
        /**Colors are represented with respect to the combination of the
light source and the output medium’s white point (such as the
color of unprinted paper). Thus, for example, a monitor’s white
point would be reproduced on a printer by simply leaving the
paper unmarked, ignoring color differences between the two
media. In-gamut colors are reproduced exactly; out-of-gamut
colors are mapped to the nearest value within the reproducible
gamut. This style of reproduction has the advantage of adapting
for the varying white points of different output media. It has the
disadvantage of not providing exact color matches from one
medium to another. A typical use might be for vector graphics.*/
        relativeColorimetric: 'RelativeColorimetric',
        /**Colors are represented in a manner that preserves or emphasizes
saturation. Reproduction of in-gamut colors may or may not be
colorimetrically accurate. A typical use might be for business
graphics, where saturation is the most important attribute of the
color.*/
        saturation: 'Saturation',
        /**Colors are represented in a manner that provides a pleasing
perceptual appearance. This generally means that both in-gamut
and out-of-gamut colors are modified from their precise
colorimetric values in order to preserve color relationships. A
typical use might be for scanned images.*/
        perceptual: 'Perceptual'
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {int}
    */
    pathPaintingOption: {
        /**Stroke the path.*/
        bigS: 'S',
        /**Close and stroke the path.*/
        smallS: 's',
        /**Fill the path, using the nonzero winding number rule to determine the region to fill.*/
        smallF: 'f',
        /**Fill the path, using the even-odd rule to determine the region to fill*/
        fStar: 'f*',
        /**Fill and then stroke the path, using the nonzero winding number rule to determine
the region to fill. This produces the same result as constructing two identical path
objects, painting the first with f and the second with S. Note, however, that the filling
and stroking portions of the operation consult different values of several graphics
state parameters, such as the color.*/
        bigB: 'B',
        /**Fill and then stroke the path, using the even-odd rule to determine the region to fill.
This operator produces the same result as B, except that the path is filled as if with
f* instead of f.*/
        bigBStar: 'B*',
        /**Close, fill, and then stroke the path, using the nonzero winding number rule to
determine the region to fill.*/
        smallB: 'b',
        /**Close, fill, and then stroke the path, using the even-odd rule to determine the
region to fill..*/
        smallBStar: 'b*',
        /**End the path object without filling or stroking it. This operator is a “path-painting
no-op,” used primarily for the side effect of changing the clipping path*/
        n: 'n'
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {string}
    */
    colorSpace: {
        /**DeviceGray requires one value between 0.0(black) and 1.0(white).*/
        deviceGray: 'DeviceGray',
        /**DeviceRGB requires three values that are between 0.0 and 1.0 for each channel*/
        deviceRGB: 'DeviceRGB',
        /**DeviceCMYK requires four values that are between 0.0 and 1.0 for each channel*/
        deviceCMYK: 'DeviceCMYK'
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {int}
    */
    textMode: {
        /**Fill text.*/
        fillText: 0,
        /**Stroke text.*/
        strokeText: 1,
        /**Fill, then stroke, text.*/
        fillStrokeText: 2,
        /**Neither fill nor stroke text (invisible).*/
        invisibleText: 3,
        /**Fill text and add to path for clipping (see above).*/
        fillClipText: 4,
        /**Stroke text and add to path for clipping.*/
        strokeClipText: 5,
        /**Fill, then stroke, text and add to path for clipping.*/
        fillStrokeClipText: 6,
        /**Add text to path for clipping.*/
        clipText: 7
    }

};