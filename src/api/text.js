/**
*Includes all supported text operations. Please see [pageNode.text]{@link pdfJS.pageNode#text} for details.
*@namespace
*@memberof pdfJS*/
var textOperators = {
    /**
    Begin text operator.
    *@inner
    *@method
    */
    beginText: function () {
        this.currentStream.push('BT');
    },
    /**
    End text operator.
    *@inner
    *@method
    */
    endText: function () {
        this.currentStream.push('ET');
    },
    /**
    *Move from current text coordinate.
    *@inner
    *@method
    *@param {int} x Translate by x pt in x direction from current text coordinate.
    *@param {int} y Translate by y pt in y direction. from current text coordinate
    */
    textPosition: function (x, y) {
        this.currentStream.push(x + ' ' + y + ' Td');
    },
    /**
    *Move from current text coordinate without leading.
    *@inner
    *@method
    *@param {int} x Translate by x pt in x direction from current text coordinate.
    *@param {int} y Translate by y pt in y direction. from current text coordinate
    */
    textPositionWithLeading: function (x, y) {
        this.currentStream.push(x + ' ' + y + ' TD');
    },
    /**
    *Character Spacing
    *@inner
    *@method
    *@param {int} charSpace Space between characters.
    */
    charSpace: function (charSpace) {
        this.currentStream.push(charSpace + ' Tc');
    },
    /**
    *Word Spacing
    *@inner
    *@method
    *@param {int} wordSpace Space between words.
    */
    wordSpace: function (wordSpace) {
        this.currentStream.push(wordSpace + ' Tw');
    },
    /**
    *Scale text by value.
    *@inner
    *@method
    *@param {int} scale Scaling factor.
    */
    scaleText: function (scale) {
        this.currentStream.push(scale + ' Tz');
    },
    /**
    *Set 'leading'
    *@inner
    *@method
    *@param {int} val
    */
    leading: function (val) {
        this.currentStream.push(val + ' TL');
    },
    /**
    *Set font size.
    *@inner
    *@method
    *@param {int} size FontSize in pt.
    */
    fontSize: function (size) {
        this.currentStream.push(size + ' Tf');
    },
    /**
    *Set font size.
    *@inner
    *@method
    *@param {string} [name=F1] Font internal reference name.
    *@param {string} [style] Font style.
    *@param {int} [size] FontSize in pt.
    */
    fontStyle: function (name, style, fontSize) {
        var fontKey = name && style ? this.doc.fontmap[name][style] : this.doc.resObj.fontObjs[0].description.key,
            len = arguments.length;
        this.currentStream.push('/' + fontKey);

        if (len >= 3) {
            this.fontSize(arguments[2]);
        }
    },
    /**
    *Set text rendering mode.
    *@inner
    *@method
    *@param {pdf.utils.textMode} mode
    */
    renderMode: function (mode) {
        this.currentStream.push(render + ' Tr');
    },
    /**
    *Set text rise.
    *@inner
    *@method
    *@param {int} rise Positive values of text rise move the
baseline up and opposite for negative values.
    */
    rise: function (rise) {
        this.currentStream.push(rise + ' Ts');
    },
    /**
    *Print text
    *@inner
    *@method
    *@param {string} textString
    *@param {int} [wordSpace] word spacing
    *@param {int} [charSpace] character spacing
    */
    showText: function (textString, wordSpace, charSpace) {
        if (arguments.length === 1) {
            this.currentStream.push('(' + sanitize(textString) + ') Tj');
        }
        else {
            this.currentStream.push(wordSpace + ' ' + charSpace + ' (' + sanitize(textString) + ') "');
        }
    },
    /**
    *Print text
    *@inner
    *@method
    *@param {array[string]} arr Show one or more text strings, allowing individual glyph positioning. Each element of array can be a string or a
number. If the element is a string, this operator shows the string. If it is a number,
the operator adjusts the text position by that amount; that is, it translates
the text matrix. The number is expressed in thousandths of a unit of text
space. This amount is subtracted from the current x coordinate in horizontal
writing mode or from the current y coordinate in vertical writing mode.
In the default coordinate system, a positive adjustment has the effect of moving
the next glyph painted either to the left or down by the given amount.
    */
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
    /**
    *Print text on newline.
    *@inner
    *@method
    *@param {string} textString
    */
    showTextln: function (textString) {
        this.currentStream.push(textString + ' \'');
    },
    /**
    *Specifying text transforming matrix.
    *@inner
    *@method
    *@param {int} a
    *@param {int} b
    *@param {int} c
    *@param {int} d
    *@param {int} e
    *@param {int} f
    */
    textMatrix: function (a, b, c, d, e, f) {
        var args = Array.prototype.slice.call(arguments);
        if (args.length !== 6) {
            throw 'Invalid text matrix';
        }
        this.currentStream.push(args.join(' ') + ' Tm');
    },
    /**
    *Move to the start of the next line.
    *@inner
    *@method
    */
    nextLine: function () {
        this.currentStream.push('T*');
    }
};
