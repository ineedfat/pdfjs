doc.prototype.setGraphicsState = function (options) {
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