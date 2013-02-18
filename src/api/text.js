var textOperators = {
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
    scaleText: function (scale) {
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