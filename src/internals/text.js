/**
*Includes all supported text operations. Please see [pageNode.text]{@link pdfJS.pageNode#text} for details.
*@namespace
*@memberof pdfJS*/
var textOperators = {
    /**
    Begin text operator.
    *@inner
    *@method
    *@param {string} [name=Helvetica] Font name.
    *@param {string} [style] Font style.
    *@param {int} [size] FontSize in pt.
    */
    beginText: function (name, style, size) {
        this.currentStream.push('BT');
        this.fontStyle(name, style, size);
    },
    /**
    End text operator.
    *@inner
    *@method
    */
    endText: function () {
        this.currentStream.push('ET');
        this.activeFont = undefined;
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
    *Vertical distance between the baselines of adjacent lines of text.
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
        this.currentStream.push('/' + this.activeFont.description.key + ' ' + size + ' Tf');
        this.activeFontSize = size;
    },
    /**
    *Set font size.
    *@inner
    *@method
    *@param {string} name=F1 Font internal reference name.
    *@param {string} style Font style.
    *@param {int} [size] FontSize in pt.
    */
    fontStyle: function (name, style, fontSize) {
        this.activeFont = this.doc.resObj.getFont(name, style) || this.doc.resObj.fontObjs[0];
        var fontKey = this.activeFont.description.key;
        this.currentStream.push('/' + fontKey + ' ' + (fontSize || this.activeFontSize) + ' Tf');
        if (fontSize) {
            this.activeFontSize = fontSize;
        }
    },
    /**
    *Set text rendering mode.
    *@inner
    *@method
    *@param {pdf.utils.textMode} mode
    */
    //See page 284 in reference.
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
    /**
    *Print text on newline.
    *@inner
    *@method
    *@param {string} textString
    */
    println: function (textString) {
        this.currentStream.push('T*');
        if (textString) {
            this.print(textString);
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

    }
};
