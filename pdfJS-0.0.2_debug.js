/***********************************************
* pdfJS JavaScript Library
* Authors: https://github.com/ineedfat/pdfjs
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 06/14/2013 11:51
***********************************************/
(function(_) {
'use strict';
var PDFJS_VERSION = '0.0.2';
if (!Object.create) {
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

/*
 * Copyright (c) 2010 Nick Galbreath
 * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/* base64 encode/decode compatible with window.btoa/atob
 *
 * window.atob/btoa is a Firefox extension to convert binary data (the "b")
 * to base64 (ascii, the "a").
 *
 * It is also found in Safari and Chrome.  It is not available in IE.
 *
 * if (!window.btoa) window.btoa = base64.encode
 * if (!window.atob) window.atob = base64.decode
 *
 * The original spec's for atob/btoa are a bit lacking
 * https://developer.mozilla.org/en/DOM/window.atob
 * https://developer.mozilla.org/en/DOM/window.btoa
 *
 * window.btoa and base64.encode takes a string where charCodeAt is [0,255]
 * If any character is not [0,255], then an DOMException(5) is thrown.
 *
 * window.atob and base64.decode take a base64-encoded string
 * If the input length is not a multiple of 4, or contains invalid characters
 *   then an DOMException(5) is thrown.
 */

var base64 = {};
base64.PADCHAR = '=';
base64.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

base64.makeDOMException = function() {
    // sadly in FF,Safari,Chrome you can't make a DOMException

    try {
        return new DOMException(DOMException.INVALID_CHARACTER_ERR);
    } catch(tmp) {
        // not available, just passback a duck-typed equiv
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
        var ex = new Error('DOM Exception 5');

        // ex.number and ex.description is IE-specific.
        ex.code = ex.number = 5;
        ex.name = ex.description = 'INVALID_CHARACTER_ERR';

        // Safari/Chrome output format
        ex.toString = function() { return 'Error: ' + ex.name + ': ' + ex.message; };
        return ex;
    }
};

base64.getbyte64 = function(s, i) {
    // This is oddly fast, except on Chrome/V8.
    //  Minimal or no improvement in performance by using a
    //   object with properties mapping chars to value (eg. 'A': 0)
    var idx = base64.ALPHA.indexOf(s.charAt(i));
    if (idx === -1) {
        throw base64.makeDOMException();
    }
    return idx;
};

base64.decode = function(s) {
    // convert to string
    s = '' + s;
    var getbyte64 = base64.getbyte64;
    var pads, i, b10;
    var imax = s.length;
    if (imax === 0) {
        return s;
    }

    if (imax % 4 !== 0) {
        throw base64.makeDOMException();
    }

    pads = 0;
    if (s.charAt(imax - 1) === base64.PADCHAR) {
        pads = 1;
        if (s.charAt(imax - 2) === base64.PADCHAR) {
            pads = 2;
        }
        // either way, we want to ignore this last block
        imax -= 4;
    }

    var x = [];
    for (i = 0; i < imax; i += 4) {
        b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12) |
            (getbyte64(s, i + 2) << 6) | getbyte64(s, i + 3);
        x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
    }

    switch (pads) {
    case 1:
        b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12) | (getbyte64(s, i + 2) << 6);
        x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
        break;
    case 2:
        b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12);
        x.push(String.fromCharCode(b10 >> 16));
        break;
    }
    return x.join('');
};

base64.getbyte = function(s, i) {
    var x = s.charCodeAt(i);
    if (x > 255) {
        throw base64.makeDOMException();
    }
    return x;
};

base64.encode = function(s) {
    if (arguments.length !== 1) {
        throw new SyntaxError('Not enough arguments');
    }
    var padchar = base64.PADCHAR;
    var alpha = base64.ALPHA;
    var getbyte = base64.getbyte;

    var i, b10;
    var x = [];

    // convert to string
    s = '' + s;

    var imax = s.length - s.length % 3;

    if (s.length === 0) {
        return s;
    }
    for (i = 0; i < imax; i += 3) {
        b10 = (getbyte(s, i) << 16) | (getbyte(s, i + 1) << 8) | getbyte(s, i + 2);
        x.push(alpha.charAt(b10 >> 18));
        x.push(alpha.charAt((b10 >> 12) & 0x3F));
        x.push(alpha.charAt((b10 >> 6) & 0x3f));
        x.push(alpha.charAt(b10 & 0x3f));
    }
    switch (s.length - imax) {
    case 1:
        b10 = getbyte(s, i) << 16;
        x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
            padchar + padchar);
        break;
    case 2:
        b10 = (getbyte(s, i) << 16) | (getbyte(s, i + 1) << 8);
        x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
            alpha.charAt((b10 >> 6) & 0x3f) + padchar);
        break;
    }
    return x.join('');
};

if (!window.btoa) {
    window.btoa = base64.encode;
}
if (!window.atob) {
    window.atob = base64.decode;
}


function statesTracker () {
    this.graphicStack = [{ cpX: 0, cpY: 0, sX: 1, sY: 1, fillColor: [], strokeColor: []}];
    //TODO: Support Char Spacing, text length, text leading
    this.textStack = [{ tCpX: 0, tCpY: 0, tSX: 1, tSY: 1 }];
    this.operationState = operationStates.pageLevel;
}
statesTracker.prototype = {
    validate: function(operation) {
        if (this.doc.settings.disableValidation) {
            return;
        }
        var opt = operation.match(operatorRegex),
            transitionTo;
        if (opt) {
            opt = opt[0];
            transitionTo = this.operationState.transition[opt];
            if (transitionTo) {
                this.operationState = transitionTo;
                return;
            }
            if (!this.operationState[opt]) {
                console.error(opt + ' is invalid in this operation state: ' +
                    this.operationState.state + ' at line ' + this.content.length + ' of this content stream');
            }
        }
    },
    graphicStateTranslate: function(x, y) {
        var current = this.getCurrentGraphicState();
        if (typeof x === 'number') {
            current.cpX += current.sX * x;
        }
        if (typeof y === 'number') {
            current.cpY += current.sY * y;
        }
        return { cpX: current.cpX, cpY: current.cpY };
    },
    graphicStateScale: function(sx, sy) {
        var current = this.getCurrentGraphicState();
        if (typeof sx === 'number') {
            current.sX *= sx;
        }
        if (typeof sy === 'number') {
            current.sY *= sy;
        }
        return { sX: current.sX, sY: current.sY };
    },
    graphicStateFillColor: function(args) {
        var current = this.getCurrentGraphicState();
        if (typeof args !== 'undefined') {
            current.fillColor = arguments;
        }

        return current.fillColor;
    },
    graphicStateStrokeColor: function(args) {
        var current = this.getCurrentGraphicState();
        if (typeof args !== 'undefined') {
            current.stroke = arguments;
        }
        return current.strokeColor;
    },
    getCurrentGraphicState: function() {
        return this.graphicStack[this.graphicStack.length - 1];
    },
    pushGraphicState: function() {
        this.graphicStack.push(utils.clone(this.getCurrentGraphicState()));
        this.pushTextState();
    },
    popGraphicState: function() {
        this.graphicStack.pop();
        this.popTextState();
    },
    //Text States
    textStateTranslate: function(x, y) {
        var current = this.getCurrentTextState();
        if (typeof x === 'number') {
            current.tCpX += x;
        }
        if (typeof y === 'number') {
            current.tCpY += y;
        }
        return { tCpX: current.tCpX, tCpY: current.tCpY };
    },
    textStateScale: function(s) {
        var current = this.getCurrentTextState();
        if (typeof s === 'number') {
            current.tS *= s;
        }

        return current.tS;
    },
    getCurrentTextState: function() {
        return this.textStack[this.textStack.length - 1];
    },
    pushTextState: function() {
        this.textStack.push(utils.clone(this.getCurrentTextState()));
    },
    popTextState: function() {
        this.textStack.pop();
    }
};
/**
*Includes all supported graphic operations. Please see
[pageNode.text]{@link pdfJS.pageNode#text} for details.
*@namespace
*@memberof pdfJS*/
var graphicOperators = {
    /**

    *@inner
    *@method
    *@param {int} tx Translate by tx pt in x direction.
    *@param {int} ty Translate by ty pt in y direction.
    */
    translate: function (tx, ty) {
        var args = utils.toPrecision(arguments);
        if (!args[0] && !args[1]) {
            return;
        }
        this.graphicStateTranslate(args[0], args[1]);
        this.push('1 0 0 1 ' + args[0] + ' ' + args[1] + ' cm');

    },
    /**
    *@inner
    *@method
    *@param {int} sx Scale by tx in x direction.
    *@param {int} sy Scale by ty in y direction.
    */
    scale: function (sx, sy) {
        var args = utils.toPrecision(arguments);
        if (args[0] == 1 && args[1] == 1) {
            return;
        }
        this.graphicStateScale(args[0], args[1]);
        this.push(args[0] + ' 0 0 ' + args[1] + ' 0 0 cm');
    },
    /**
    *@inner
    *@method
    *@param {int} theta Rotate by theta.
    */
    rotate: function (theta) {
        var cos = parseFloat(Math.cos(theta).toFixed(2)),
            sin = parseFloat(Math.sin(theta).toFixed(2));
        this.push(cos + ' ' + sin + ' ' + -sin + ' ' + cos + ' 0 0 cm');
    },
    /**
   *@inner
   *@method
   *@param {int} alphaX Skew horizontally.
   *@param {int} betaY Skew vertically.
   */
    skew: function (alphaX, betaY) {
        this.push('1 ' + Math.tan(alphaX).toFixed(2) + ' ' +
            Math.tan(betaY).toFixed(2) + ' 1 0 0 cm');
    },
    /**
    *@inner
    *@method
    *@param {int} width Set line thickness by lineWidth in pt. Valid Value: Non-negative number.
    A value of zero means the thinnest line a device can print/render;
    therefore setting the value to zero is a device-dependent operation, not recommended'
    */
    lineWidth: function (width) {
        this.push(parseFloat(width).toFixed(2) + ' w');
    },
    /**
    *@inner
    *@method
    *@param {int} capStyle See [lineCapStyle]{@link pdfJS.utils.lineCapStyle} for valid values.
    */
    lineCap: function (capStyle) {
        this.push(capStyle + ' J');
    },
    /**
    *@inner
    *@method
    *@param {int} joinStyle See [lineCapStyle]{@link pdfJS.utils.lineJoinStyle} for valid values.
    */
    lineJoin: function (joinStyle) {
        this.push(joinStyle + ' j');
    },
    /**
    *@inner
    *@method
    *@param {int} limit When two line segments meet at a sharp angle and mitered
    joins have been specified as the line join style, it is possible for the 
    miter to extend far beyond the thickness of the line stroking the path.
    The miter limit imposes a maximum on the ratio of the miter length to the
    line width. When the limit is exceeded, the join is converted from a miter
    to a bevel.
    */
    miterLimit: function (limit) {
        this.push(limit + ' M');
    },
    /**
    The line dash pattern controls the pattern of dashes and gaps used to stroke paths .
    *@inner
    *@method
    *@param {int} dashArray Refer to Adobe's PDF Reference v1.3 for more details
    *@param {int} dashPhase Refer to Adobe's PDF Reference v1.3 for more details
    */
    dashPattern: function (dashArray, dashPhase) {
        this.push(dashArray + ' ' + dashPhase + ' d');
    },
    /**
    Set the color rendering intent in the graphics state .
    *@inner
    *@method
    *@param {int} intent See [renderingIntentOption]{@link pdfJS.utils.renderingIntentOption} for valid values.
    */
    renderingIntent: function (intent) {
        this.push(intent + ' ri');
    },
    /**
    TODO: Implement
   *@inner
   *@method
   */
    strokeAdjustment: function () {
    },
    /**
    *Save the current graphics state on the graphics state stack .
    *@inner
    *@method
    */
    pushState: function () {
        this.push('q');
        this.pushGraphicState();
    },
    /**
    *Restore the graphics state by removing the most recently saved state from
    the stack and making it the current state .
    *@inner
    *@method
    */
    popState: function () {
        this.push('Q');
        this.popGraphicState();
    },
    /*Path Controls Begin*/
    /**
    *Begin a new subpath by moving the current point to coordinates
(x, y), omitting any connecting line segment. If the previous path
construction operator in the current path was also initiated by 'newSubPath', the new 'newSubPath'
overrides it; no vestige of the previous m operation remains in the
path. .
    *@inner
    *@method
    *@param {int} x
    *@param {int} y
    */
    moveTo: function (x, y) {
        if (arguments.length != 2) {
            throw 'Invalid new path parameters';
        }
        var args = utils.toPrecision(arguments);
        this.graphicStateTranslate.apply(this, args);
        this.push(args.join(' ') + ' m');
    },
    /**
    *Append a straight line segment from the current point to the point
(x, y). The new current point is (x, y). .
    *@inner
    *@method
    *@param {int} x
    *@param {int} y
    */
    lineTo: function (x, y) {
        if (arguments.length != 2) {
            throw 'Invalid straight line  parameters';
        }
        var args = utils.toPrecision(arguments);
        this.graphicStateTranslate.apply(this, args);
        this.push(args.join(' ') + ' l');
    },
    /**
    *Append a cubic Bézier curve to the current path. The curve extends
from the current point to the point (x3, y3), using the other pairs of points as the Bézier control points .
    *@inner
    *@method
    *@param {int} x1
    *@param {int} y1
    *@param {int} x2
    *@param {int} y2
    *@param {int} x3
    *@param {int} y3
    */
    bezierCurve: function (x1, y1, x2, y2, x3, y3) {
        var args = utils.toPrecision(arguments);
        switch (arguments.length) {
            case 4:
                this.push(args.join(' ') + ' v');
                this.graphicStateTranslate(x2, y2);
                break;
            case 5:
                this.push(args.slice(0, 4).join(' ') + ' y');
                this.graphicStateTranslate(x2, y2);
                break;
            case 6:
                this.push(args.join(' ') + ' c');
                this.graphicStateTranslate(x3, y3);
                break;
            default:
                throw 'Invalid bezier curve parameters';
        }
    },
    quadraticCurveTo: function (q0x, q0y, q1x, q1y, q2x, q2y) {
        //We don't want to lose the precision for the first 4 values.
        q0x = parseFloat(q0x);
        q0y = parseFloat(q0y);
        q1x = parseFloat(q1x);
        q1y = parseFloat(q1y);
        q2x = parseFloat(q2x).toFixed(2);
        q2y = parseFloat(q2y).toFixed(2);
        var xq1, yq1, xq2, yq2;
        xq1 = (q1x * 2 / 3 + q0x / 3).toFixed(2);
        yq1 = (q1y * 2 / 3 + q0y / 3).toFixed(2);
        xq2 = (q1x * 2 / 3 + q2x / 3).toFixed(2);
        yq2 = (q1y * 2 / 3 + q2y / 3).toFixed(2);
        this.bezierCurve(xq1, yq1, xq2, yq2, q2x, q2y);
        this.graphicStateTranslate(q2x, q2y);
    },
    ellipseArc: function(rx, ry, rot, laF, sF, x, y, sign) {
        var flip = sign ? -1 : 1;
        rx = Math.abs(rx).toFixed(2);
        ry = Math.abs(ry).toFixed(2);
        var lx = (0.5522422 * rx).toFixed(2),
            ly = (0.5522422 * ry).toFixed(2);

        this.bezierCurve(lx, flip * ry, rx, flip * ly, x, y);
    },
    /**
    *Close the current subpath by appending a straight line segment
from the current point to the starting point of the subpath. This
operator terminates the current subpath; appending another segment
to the current path will begin a new subpath, even if the new
segment begins at the endpoint reached by the 'close' operation. If the
current subpath is already closed or the current path is empty, 'close' operation
does nothing. .
    *@inner
    *@method
    */
    close: function () {
        this.push('h');
    },
    /*Path Controls END*/
    /**
    *Append a rectangle to the current path as a complete subpath, with
lower-left corner (x, y) and dimensions width and height in user
space. .
    *@inner
    *@method
    *@param {int} [operator] See [renderingIntentOption]{@link pdfJS.utils.renderingIntentOption} for valid values.
    */
    paintPath: function (operator) {
        if (operator) {
            this.push(operator);
        } else {
            //By default, paint both stroke and fill.
            this.push('B');
        }
    },
    /*Path Controls END*/
    /**
    *Append a rectangle to the current path as a complete subpath, with
lower-left corner (x, y) and dimensions width and height in user
space. .
    *@inner
    *@method
    *@param {int} [operator] See [renderingIntentOption]{@link pdfJS.utils.renderingIntentOption} for valid values.
    */
    strokePath: function () {
        //By default, paint both stroke and fill.
        this.push('S');
    },
    /**
    *Append a rectangle to the current path as a complete subpath, with
lower-left corner (x, y) and dimensions width and height in user
space. .
    *@inner
    *@method
    *@param {int} [operator] See [renderingIntentOption]{@link pdfJS.utils.renderingIntentOption} for valid values.
    */
    fillPath: function () {
        //By default, paint both stroke and fill.
        this.push('F');
    },
    /**
   *Append a rectangle to the current path as a complete subpath, with
lower-left corner (x, y) and dimensions width and height in user
space. .
   *@inner
   *@method
   *@param {int} [operator] See [renderingIntentOption]{@link pdfJS.utils.renderingIntentOption} for valid values.
   */
    endPath: function () {
        //By default, paint both stroke and fill.
        this.push('n');
    },
    /*Path Controls END*/
    /**
    *Append a rectangle to the current path as a complete subpath, with
lower-left corner (x, y) and dimensions width and height in user
space. .
    *@inner
    *@method
    *@param {bool} asterisk if true, then set clipping path using even-odd rule.
    */
    clip: function (asterisk) {
        this.push('W' + (asterisk ? ' *' : ''));
    },
    /*Path Controls END*/
    /**
    *Append a rectangle to the current path as a complete subpath, with
lower-left corner (x, y) and dimensions width and height in user
space. .
    *@inner
    *@method
    */
    rect: function (x, y, width, height) {
        if (arguments.length != 4) {
            throw 'Invalid rectangle parameters';
        }
        var args = utils.toPrecision(arguments);
        this.push(args.join(' ') + ' re');
    },
    /**
    *Set the color space to use for non-stroking operations. Depending on the color space,
    *specify the correct number of color values (e.g DeviceGray requires 1, DeviceRGB requires 2,
    *etc)
     *@inner
    *@param {int} colorValue1 See [colorSpace]{@link pdfJS.utils.colorSpace}
    required value for each specified color space.
    *@param {int} colorValue2 
    *@param {int} colorValue3 
    *@method
    */
    fillColor: function (colorValue1, colorValue2, colorValue3) {
        var args = utils.toPrecision(arguments);
        var graphicState = this.getCurrentGraphicState();
        switch (args.length) {
            case 1:
                if (graphicState.fillColor.length !== 1) {
                    this.push('/DeviceGray cs');
                }
                break;
            case 3:
                if (graphicState.fillColor.length !== 3) {
                    this.push('/DeviceRGB cs');
                }
                break;
            default:
                throw ('Invalid color values');
        }
        this.graphicStateFillColor.apply(this, args);
        this.push(args.join(' ') + ' sc');
    },
    /**
    *Set the color space to use for stroking operations. The operand
name must be a name object. If the color space is one that can be specified by a
name and no additional parameters (DeviceGray and DeviceRGB).
    *@inner
    *@param {int} colorValue1 See [colorSpace]{@link pdfJS.utils.colorSpace} 
    required value for each specified color space.
    *@param {int} colorValue2 
    *@param {int} colorValue3 
    *@method
    */
    strokeColor: function (colorValue1, colorValue2, colorValue3) {
        var args = utils.toPrecision(arguments);
        var graphicState = this.getCurrentGraphicState();
        switch (args.length) {
            case 1:
                if (graphicState.strokeColor.length !== 1) {
                    this.push('/DeviceGray CS');
                }
                break;
            case 3:
                if (graphicState.strokeColor.length !== 3) {
                    this.push('/DeviceRGB CS');
                }
                break;
            default:
                throw ('Invalid color values');
        }
        this.graphicStateFillColor.apply(this, args);
        this.push(args.join(' ') + ' SC');
    },
    /*Color Controls End*/
    /**
    *Graphic Operation Setter. Please see [graphicOperators]{@link pdfJS.graphicOperators}
    for available operations and corresponding set of operands.
    *@param {pdfJS.pageNode} pageObj Page to add image.
    *@param {int} x Translation in X direction (pt).
    *@param {int} y Translation in Y direction (pt).
    *@param {int} w Width of the image on page (pt).
    *@param {int} h Height of the image on page (pt).
    *@return {pdfJS.imageXObject#}
    *@memberof pdfJS.imageXObject#
    *@method
    */
    addImage: function (imgXObj, x, y, w, h) {
        if (w === 0) {
            w = h * imgXObj.width / imgXObj.height;
        }
        if (h === 0) {
            h = w * imgXObj.height / imgXObj.width;
        }

        this.push('q');
        this.push(w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm');
        this.push('/' + imgXObj.name + ' Do');
        this.push('Q');

        return this;
    }
};
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
        this.push('BT');
        this.fontStyle(name, style, size);
        this.pushTextState();
    },
    /**
    End text operator.
    *@inner
    *@method
    */
    endText: function () {
        this.push('ET');
        this.activeFont = undefined;
        this.popTextState();
    },
    /**
    *Move from current text coordinate.
    *@inner
    *@method
    *@param {int} x Translate by x pt in x direction from current text coordinate.
    *@param {int} y Translate by y pt in y direction. from current text coordinate
    */
    textPosition: function (x, y) {
        var args = utils.toPrecision(arguments);
        if (!args[0] && !args[1]) {
            return;
        }
        this.textStateTranslate(args[0], args[1]);
        this.push(args[0] + ' ' + args[1] + ' Td');
    },
    /**
    *Character Spacing
    *@inner
    *@method
    *@param {int} charSpace Space between characters.
    */
    charSpace: function (charSpace) {
        this.push(charSpace + ' Tc');
    },
    /**
    *Word Spacing
    *@inner
    *@method
    *@param {int} wordSpace Space between words.
    */
    wordSpace: function (wordSpace) {
        this.push(wordSpace + ' Tw');
    },
    /**
    *Scale text by value.
    *@inner
    *@method
    *@param {int} scale Scaling factor.
    */
    scaleText: function (scale) {
        this.push(scale + ' Tz');
    },
    /**
    *Vertical distance between the baselines of adjacent lines of text.
    *@inner
    *@method
    *@param {int} val
    */
    leading: function (val) {
        this.push(val + ' TL');
    },
    /**
    *Set font size.
    *@inner
    *@method
    *@param {int} size FontSize in pt.
    */
    fontSize: function (size) {
        this.push('/' + this.activeFont.description.key + ' ' + size + ' Tf');
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
        this.push('/' + fontKey + ' ' + (fontSize || this.activeFontSize) + ' Tf');
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
        this.push(render + ' Tr');
    },
    /**
    *Set text rise.
    *@inner
    *@method
    *@param {int} rise Positive values of text rise move the
baseline up and opposite for negative values.
    */
    rise: function (rise) {
        var args = utils.toPrecision(arguments);
        if (!args[0] && !args[1]) {
            return;
        }
        this.textStateTranslate(0, args[0]);
        this.push(args[0] + ' Ts');
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
            this.push('(' +
                this.activeFont.charactersEncode(utils.sanitize(textString)) + ') Tj');
        }
        else {
            this.push(wordSpace + ' ' + charSpace + ' (' +
                this.activeFont.charactersEncode(utils.sanitize(textString)) + ') "');
        }
    },
    /**
    *Print text on newline.
    *@inner
    *@method
    *@param {string} textString
    */
    println: function (textString) {
        this.push('T*');
        if (textString) {
            this.print(textString);
        }
    },
    /**
    *Print text
    *@inner
    *@method
    *@param {array[string]} arr Show one or more text strings, allowing 
    individual glyph positioning. Each element of array can be a string or a
    number. If the element is a string, this operator shows the string. If it is a number,
    the operator adjusts the text position by that amount; that is, it translates
    the text matrix. The number is expressed in thousandths of a unit of text
    space. This amount is subtracted from the current x coordinate in horizontal
    writing mode or from the current y coordinate in vertical writing mode.
    In the default coordinate system, a positive adjustment has the effect of moving
    the next glyph painted either to the left or down by the given amount.
    */
    showArrayText: function (arr) {
        var i, len, temp;
        for (i = 0, len = arr.length; I < len; i++) {
            temp = arr[i];
            if (typeof temp === 'string') {
                arr[i] = '(' + temp + ')';
            }
        }
        this.push(arr.join(' ') + ' TJ');

    }
};

/**
*Initialize new PDf speical object.
*@classdesc A PDF internal object.
*@constructor
*@memberof pdfJS
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*/
function obj (objectNumber, generationNumber) {
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
}
obj.prototype = {
    /**
    *Output PDF data string for this obj.
    *@return {string}
    *@memberof pdfJS.obj#
    */
    out: function (buff) {
        var sb = buff || [];

        sb.push(this.objectNumber + ' ' + this.generationNumber + ' obj');
        sb.push.apply(sb, this.body);
        sb.push('endobj');

        return sb;
    },
    body: [],
    objectNumber: 0,
    generationNumber: 0
};
/**
*Initialize new pageNode object.
*@classdesc Representing a page in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {pdfJS.pageTreeNode} parent Parent pageTreeNode of this page.
*@param {pageOptions} pageOptions for this page.
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*@param {array[pdfJS.stream]} contentStreams Array of stream object that populate the page.
*@param {pdf.doc} document The document that own this page.
*/
function pageNode (parent, pageOptions, objectNumber, generationNumber, contentStreams,
    repeatableStreams, templateStreams, document) {
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

    this.repeatableStreams = repeatableStreams;

    this.templateStreams = templateStreams;

    this.reservedObjectNums = [];

    this.doc = document;

    this.data = {
        pageNum: 0,
        pageTotal: function () { return self.doc.pageCount; }
    };
}

pageNode.prototype = Object.create(obj.prototype, {
    out: {
        value: function (buff) {
            var i, l, item,
                ret = buff || [];

            for (i = 0, l = this.templateStreams.length; i < l; i++) {
                if (!this.reservedObjectNums[i]) {
                    this.reservedObjectNums[i] = ++this.doc.objectNumber;
                }
                this.templateStreams[i].out(this.reservedObjectNums[i], 0, this, ret);
            }
            this.body.push('<< /Type /Page');
            this.body.push(pageOptionsConverter(this.pageOptions));
            this.body.push('/Parent ' + this.parent.objectNumber + ' ' + this.parent.generationNumber + ' R');
            this.body.push('/Contents ');

            //TODO: add resources page 80.
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

            obj.prototype.out.apply(this, arguments); //calling obj super class out method.

            if (this.contentStreams.length) {
                for (i = 0; item = this.contentStreams[i]; i++) {
                    item.out(ret);
                }
            }
            this.body = [];
            return ret;
        }
    },
    /**
    *Set current stream in context by index.
    *@param {int} index index of contentStreams
    *@return {pageNode} Return this pageNode object
    *@memberof pdfJS.pageNode#
    *@method
    */
    setStream: {
        value: function (index) {
            if (index >= this.contentStreams.length) {
                throw 'Invalid stream index';
            }
            this.currentStream = this.contentStreams[index];
            return this;
        }
    }
});
/**
*Initialize new pageTreeNode object.
*@classdesc Representing a page-tree node in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {pdfJS.pageTreeNode} parent Parent pageTreeNode of this page.
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf 
has been modified (default is 0 when creating).
*@param {object} options Define the attributes for pageTree that all
children may inherit from.
*/
function pageTreeNode (parent, objectNumber, generationNumber, options) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    /**
        *The parent pageTreeNode of this page-tree.
        *@Type pdfJS.pageTreeNode
        */
    this.parent = parent;
    /**
        *Children of this page-tree node.
        *@type array[[pdfJS.pageTreeNode]{@link pdfJS.pageTreeNode} | 
        [pdfJS.pageNode]{@link pdfJS.pageNode}]
        */
    this.kids = [];
    this.options = options;
}

var walkPageTree = function(pageTree) {
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

pageTreeNode.prototype = Object.create(obj.prototype, {
    out: {
        value: function (buff) {
            var i, item;
            this.body.push(
                '<< /Type /Pages',
                pageTreeOptionsConverter(this.options),
                '/Kids [');
            //TODO: add resources for pageTree page 80.
            for (i = 0; item = this.kids[i]; i++) {
                this.body.push(item.objectNumber + ' ' + item.generationNumber + ' R');
            }
            this.body.push(']');

            this.body.push('/Count ' + walkPageTree(this));

            if (this.parent) {
                this.body.push('/Parent ' + this.parent.objectNumber +
                    ' ' + this.parent.generationNumber + ' R');
            }

            this.body.push('>>');
            //calling obj super class out method.
            var ret = obj.prototype.out.apply(this, arguments);
            this.body = [];

            return ret;
        }
    }
});
/**
*Initialize new steam object.
*@classdesc Representing a stream object in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the
pdf has been modified (default is 0 when creating).
*/
function stream (objectNumber, generationNumber, document) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    statesTracker.call(this);
    /**
        *The content of this stream.
        *@Type [string]
        *@default []
        */
    this.content = [];
    /**
        *Specifying the dictionary part of a PDF object (e.g dictionary['SomeKey'] = 'SomeValue').
        *@Type object 
        *@default {}
        */
    this.dictionary = {};
    /**
        *The document that this page belongs to.
        *@Type pdfJS.doc
        */
    this.doc = document;

    this.activeFont = undefined;
    this.activeFontSize = 14;

    this.activeFillCS = undefined;
    this.activeStrokeCS = undefined;
}
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
        value: function (buff) {
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
            this.body.push.apply(this.body, tempContent);
            this.body.push('endstream');

            var ret = obj.prototype.out.apply(this, arguments); //calling obj super class out method.

            this.body = [];

            return ret;
        }
    },
    /**
        *Shortcut to pushing content to the stream (same as stream.content.push('something');
        *@param {string} args stream.push(item1, item2, . . . , itemX)
        *@return {pdfJS.stream} Return this stream object.
        *@memberof pdfJS.stream#
        *@method
        */
    push: {
        value: function (args) {
            this.validate(args);
            Array.prototype.push.apply(this.content, arguments);
            return this;
        }
    }
});
mixin(stream, textOperators);
mixin(stream, graphicOperators);
mixin(stream, statesTracker.prototype);
/**
*Initialize new font object.
*@classdesc Representing font type in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {object} font
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the
pdf has been modified (default is 0 when creating).
*/
function font(fontDescription, objectNumber, generationNumber) {
    var self = this;
    obj.call(this, objectNumber, generationNumber);
    /**
        *Font description object.
        *@Type object
        */
    this.description = fontDescription;
}

font.codePages = {
    'WinAnsiEncoding': {
        '338': 140, '339': 156, '352': 138, '353': 154, '376': 159, '381': 142,
        '382': 158, '402': 131, '710': 136, '732': 152, '8211': 150, '8212': 151, '8216': 145,
        '8217': 146, '8218': 130, '8220': 147, '8221': 148, '8222': 132, '8224': 134, '8225': 135,
        '8226': 149, '8230': 133, '8240': 137, '8249': 139, '8250': 155, '8364': 128, '8482': 153
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

            return obj.prototype.out.apply(this, arguments); //calling obj super class out method.
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
                /*If outputEncoding isn't specified, then we assumed it to be "StandardEncoding" or
                assume the user know what he/she is doing.*/
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

/**
*Initialize new imageXObject object.
*@classdesc Representing an image object in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.stream
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the
pdf has been modified (default is 0 when creating).
*@param {int} width Width of the image to be rendered on page in pt.
*@param {int} height Height of the image to be rendered on page in pt.
*@param {int} [colorSpace=DeviceRGB] Color space of the image.
*@param {int} [bpc=8] Number of bits per color channel component.
*@param {int} [filter] Filter for decoding the image data.
*@param {object} [options] Extra options that can be set.
*/
function imageXObject (objectNumber, generationNumber, width,
    height, colorSpace, bpc, filter, options) {
    var self = this;

    stream.call(this, objectNumber, generationNumber);
    /**
        *Width of the image to be rendered on page in pt.
        *@Type int
        */
    this.width = width;
    /**
        *Height of the image to be rendered on page in pt.
        *@Type int
        */
    this.height = height;
    /**
        *Color space of the image.
        *@Type pdfJS.utils.colorSpace
        */
    this.colorSpace = colorSpace || utils.deviceRGB;
    /**
        *Bits per component
        *@Type int
        *@Default 8
        */
    this.bpc = bpc || 8;
    /**
        *Decoding filter for the image data.
        *@Type pdfJS.utils.filterDecoder
        */
    this.filter = filter;

    /**
        *Name
        *@Type string
        *@Default Im1
        */
    this.name = 'Im1';
    /**
        *TODO: Extra options
        *@Type object
        *@Default {}
        */
    this.options = options || {};
}


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
            //calling obj super class out method.
            return stream.prototype.out.apply(this, arguments);
        }
    }
});
/**
*Initialize new template object.
*@classdesc Representing a template object in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {doc} document defining the number of time the pdf
has been modified (default is 0 when creating).
*/
function docTemplate(document) {
    this.templateContent = [];
    stream.call(this, 0, 0, document);
}

docTemplate.prototype = Object.create(stream.prototype, {
    out: {
        value: function (objectNumber, generationNumber, page, buff) {
            var replaceRegex, value,
                    templateString = this.templateContent.join('\n');

            this.objectNumber = objectNumber;
            this.generationNumber = generationNumber;
            if (page.data) {
                for (var name in page.data) {
                    if (page.data.hasOwnProperty(name)) {
                        replaceRegex = new RegExp('{{' + name + '}}', 'g');
                        value = page.data[name];
                        templateString = templateString.replace(replaceRegex, value);
                    }
                }
            }
            this.content = [templateString];
            //calling stream super class out method.
            return stream.prototype.out.call(this, buff);
        }
    },
    push: {
        value: function (args) {
            Array.prototype.push.apply(this.templateContent, arguments);
            return this;
        }
    }
});
var ellipticalArc;
(function() {
    // coefficients for error estimation
    // while using quadratic Bézier curves for approximation
    // 0 < b/a < 1/4
    var coeffs2Low =
    [
        [
            [3.92478, -13.5822, -0.233377, 0.0128206],
            [-1.08814, 0.859987, 0.000362265, 0.000229036],
            [-0.942512, 0.390456, 0.0080909, 0.00723895],
            [-0.736228, 0.20998, 0.0129867, 0.0103456]
        ],
        [
            [-0.395018, 6.82464, 0.0995293, 0.0122198],
            [-0.545608, 0.0774863, 0.0267327, 0.0132482],
            [0.0534754, -0.0884167, 0.012595, 0.0343396],
            [0.209052, -0.0599987, -0.00723897, 0.00789976]
        ]
    ];

    // coefficients for error estimation
    // while using quadratic Bézier curves for approximation
    // 1/4 <= b/a <= 1
    var coeffs2High = [
        [
            [0.0863805, -11.5595, -2.68765, 0.181224],
            [0.242856, -1.81073, 1.56876, 1.68544],
            [0.233337, -0.455621, 0.222856, 0.403469],
            [0.0612978, -0.104879, 0.0446799, 0.00867312]
        ],
        [
            [0.028973, 6.68407, 0.171472, 0.0211706],
            [0.0307674, -0.0517815, 0.0216803, -0.0749348],
            [-0.0471179, 0.1288, -0.0781702, 2.0],
            [-0.0309683, 0.0531557, -0.0227191, 0.0434511]
        ]
    ];

    // safety factor to convert the "best" error approximation
    // into a "max bound" error
    var safety2 = [0.02, 2.83, 0.125, 0.01];

    // coefficients for error estimation
    // while using cubic Bézier curves for approximation
    // 0 < b/a < 1/4
    var coeffs3Low = [
        [
            [3.85268, -21.229, -0.330434, 0.0127842],
            [-1.61486, 0.706564, 0.225945, 0.263682],
            [-0.910164, 0.388383, 0.00551445, 0.00671814],
            [-0.630184, 0.192402, 0.0098871, 0.0102527]
        ],
        [
            [-0.162211, 9.94329, 0.13723, 0.0124084],
            [-0.253135, 0.00187735, 0.0230286, 0.01264],
            [-0.0695069, -0.0437594, 0.0120636, 0.0163087],
            [-0.0328856, -0.00926032, -0.00173573, 0.00527385]
        ]
    ];

    // coefficients for error estimation
    // while using cubic Bézier curves for approximation
    // 1/4 <= b/a <= 1
    var coeffs3High = [
        [
            [0.0899116, -19.2349, -4.11711, 0.183362],
            [0.138148, -1.45804, 1.32044, 1.38474],
            [0.230903, -0.450262, 0.219963, 0.414038],
            [0.0590565, -0.101062, 0.0430592, 0.0204699]
        ],
        [
            [0.0164649, 9.89394, 0.0919496, 0.00760802],
            [0.0191603, -0.0322058, 0.0134667, -0.0825018],
            [0.0156192, -0.017535, 0.00326508, -0.228157],
            [-0.0236752, 0.0405821, -0.0173086, 0.176187]
        ]
    ];

    // safety factor to convert the "best" error approximation
    // into a "max bound" error
    var safety3 = [0.001, 4.98, 0.207, 0.0067];
    /** Compute the value of a rational function.
     * This method handles rational functions where the numerator is
     * quadratic and the denominator is linear
     * @param x absissa for which the value should be computed
     * @param c coefficients array of the rational function
     */
    var rationalFunction = function(x, c) {
        return (x * (x * c[0] + c[1]) + c[2]) / (x + c[3]);
    };
    var estimateError = function(degree, etaA, etaB, theta, a, b, cx, cy) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        var x;
        var eta = 0.5 * (etaA + etaB);
        if (degree < 2) {

            // start point
            var aCosEtaA = a * Math.cos(etaA);
            var bSinEtaA = b * Math.sin(etaA);
            var xA = cx + aCosEtaA * cosTheta - bSinEtaA * sinTheta;
            var yA = cy + aCosEtaA * sinTheta + bSinEtaA * cosTheta;

            // end point
            var aCosEtaB = a * Math.cos(etaB);
            var bSinEtaB = b * Math.sin(etaB);
            var xB = cx + aCosEtaB * cosTheta - bSinEtaB * sinTheta;
            var yB = cy + aCosEtaB * sinTheta + bSinEtaB * cosTheta;

            // maximal error point
            var aCosEta = a * Math.cos(eta);
            var bSinEta = b * Math.sin(eta);
            x = cx + aCosEta * cosTheta - bSinEta * sinTheta;
            var y = cy + aCosEta * sinTheta + bSinEta * cosTheta;

            var dx = xB - xA;
            var dy = yB - yA;

            return Math.abs(x * dy - y * dx + xB * yA - xA * yB) /
                Math.sqrt(dx * dx + dy * dy);

        } else {

            x = b / a;
            var dEta = etaB - etaA;
            var cos2 = Math.cos(2 * eta);
            var cos4 = Math.cos(4 * eta);
            var cos6 = Math.cos(6 * eta);

            // select the right coeficients set according to degree and b/a
            var coeffs;
            var safety;
            if (degree == 2) {
                coeffs = (x < 0.25) ? coeffs2Low : coeffs2High;
                safety = safety2;
            } else {
                coeffs = (x < 0.25) ? coeffs3Low : coeffs3High;
                safety = safety3;
            }

            var c0 = rationalFunction(x, coeffs[0][0]) +
                cos2 * rationalFunction(x, coeffs[0][1]) +
                cos4 * rationalFunction(x, coeffs[0][2]) +
                cos6 * rationalFunction(x, coeffs[0][3]);

            var c1 = rationalFunction(x, coeffs[1][0]) +
                cos2 * rationalFunction(x, coeffs[1][1]) +
                cos4 * rationalFunction(x, coeffs[1][2]) +
                cos6 * rationalFunction(x, coeffs[1][3]);

            return rationalFunction(x, safety) * a * Math.exp(c0 + c1 * dEta);
        }
    };
    //Access outside of closure
    ellipticalArc = function(cx, cy, a, b, theta, lambda1, lambda2, isPieSlice) {
        var twoPi = 2 * Math.PI;
        //lambda1 = (lambda1);
        //lambda2 = svgReader.utils.reflectAngleAboutY(lambda2);
        this.cx = cx;
        this.cy = cy;
        this.a = a;
        this.b = b;
        this.theta = theta;
        this.isPieSlice = isPieSlice;

        this.eta1 = Math.atan2(Math.sin(lambda1) / b,
            Math.cos(lambda1) / a);
        this.eta2 = Math.atan2(Math.sin(lambda2) / b,
            Math.cos(lambda2) / a);

        this.cosTheta = Math.cos(theta);
        this.sinTheta = Math.sin(theta);

        //// make sure we have eta1 <= eta2 <= eta1 + 2 PI
        //this.eta2 -= twoPi * Math.floor((this.eta2 - this.eta1) / twoPi);

        //// the preceding correction fails if we have exactly et2 - eta1 = 2 PI
        //// it reduces the interval to zero length
        if (((lambda2 - lambda1) > Math.PI) && ((this.eta2 - this.eta1) < Math.PI)) {
            this.eta2 += 2 * Math.PI;
        }
    };

    ellipticalArc.prototype = {
        computePoint: function(eta) {
            var aCosEta = this.a * Math.cos(eta),
                bSinEta = this.b * Math.sin(svgReader.utils.reflectAngleAboutY(eta)),
                x = this.cx + aCosEta * this.cosTheta - bSinEta * this.sinTheta,
                y = this.cy + (aCosEta * this.sinTheta + bSinEta * this.cosTheta);
            return { x: x, y: y };
        },
        computePointDot: function(eta) {
            var aSinEta = this.a * Math.sin(eta),
                bCosEta = this.b * Math.cos(eta),
                xDot = -aSinEta * this.cosTheta - bCosEta * this.sinTheta,
                yDot = -aSinEta + this.sinTheta + bCosEta * this.cosTheta;
            return { xDot: xDot, yDot: yDot };
        },
        getSegmentCount: function(degree, threshold) {
            var n = 1,
                found = false,
                etaA, etaB, dEta, i;
            while ((!found) && (n < 1024)) {
                dEta = (this.eta2 - this.eta1) / n;
                if (dEta <= 0.5 * Math.PI) {
                    etaB = this.eta1;
                    found = true;
                    for (i = 0; found && (i < n); i++) {
                        etaA = etaB;
                        etaB += dEta;
                        found = (estimateError(degree,
                            etaA, etaB, this.theta, this.a, this.b, this.cx, this.cy) <= threshold);
                    }
                }
                n <<= 1;
            }
            return n;
        },
        buildEllipticalArc: function(degree, threshold, out) {
            degree = 1;
            var n = this.getSegmentCount(degree, threshold),
                i, dEta, etaB, pointA, pointB, pointDA, pointDB;
            console.log(n);
            dEta = (this.eta2 - this.eta1) / n;
            etaB = this.eta1;
            pointB = this.computePoint(etaB);
            if (degree > 1) {
                pointDB = this.computePointDot(etaB);
            }
            if (this.isPieSlice) {
                out.stream.moveTo(this.cx, this.cy);
                out.stream.lineTo(pointB.x, pointB.y);
            } else {
                out.stream.moveTo(pointB.x, pointB.y);
            }

            var t = Math.tan(0.5 * dEta);
            var alpha = Math.sin(dEta) * (Math.sqrt(4 + 3 * t * t) - 1) / 3;

            for (i = 0; i < n; ++i) {
                etaB += dEta;
                pointB = this.computePoint(etaB);
                if (degree === 1) {
                    out.stream.lineTo(pointB.x, pointB.y);
                } else {
                    pointA = pointB;
                    pointDA = pointDB;
                    pointDB = this.computePointDot(etaB);
                    if (degree === 2) {
                        var k = (pointDB.yDot * (pointB.x - pointA.x) -
                            pointDB.xDot * (pointB.y - pointA.y)) /
                            (pointDA.xDot * pointDB.yDot - pointDA.yDot * pointDB.xDot);

                        out.stream.quadraticCurveTo((pointA.x + k * pointDA.xDot),
                            (pointA.y + k * pointDA.yDot),
                            pointB.x, pointB.y);
                    } else {
                        out.stream.bezierCurve(
                            (pointA.x + alpha * pointDA.xDot), (pointA.y + alpha * pointDA.yDot),
                            (pointB.x - alpha * pointDB.xDot), (pointB.y - alpha * pointDB.yDot),
                            pointB.x, pointB.y);
                    }
                }
            }
            if (this.isPieSlice) {
                out.stream.close();
            }
        }
    };
})();
    // Size in pt of various paper formats
    var PDF_VERSION = '1.3';
/**
    *Initialize new document object.
    *@constructor
    *@memberof pdfJS
    *@Author Trinh Ho (https://github.com/ineedfat/pdfjs)
    *@classdesc Representing a PDF document.
    *@param {string|array} [format=letter] Paper format name or array
    containing width and height (e.g [width, height])
    *@param {string} [orientation=portrait] Document orientation.
    *@param {array} [margin=[18,18]] Horizontal and vertical margin in
    points (e.g [horizontal, vertical])
*/
    function doc (format, orientation, margin, disableValidation) {
        var self = this;
        this.pageCount = 0;

        this.repeatableElements = [];
        this.templateStreams = [];
        /**
        *Number of active async calls such as adding a new image. TODO: make this field private.
        *@Type int
        *@memberof pdfJS.doc#
        */
        this.activeAsync = 0;
        /**
        *Positive integer representing the object number of pdf internal objects. (Becareful when
        *when modifying this property).
        *@Type int
        *@memberof pdfJS.doc#
        */
        this.objectNumber = 0; //object counter used for setting indirect object.

        /**
        *Current document page in context.
        *@Type {[fonts]{@link pdfJS.pageNode}}  
        */
        this.currentPage = null;

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
            dimension: enums.paperFormat['letter'],
            documentProperties: {
                'title': '', 'subject': '',
                'author': '', 'keywords': '', 'creator': ''
            },
            disableValidation: disableValidation
        };

        //Determine page dimensions.
        if (typeof format === 'string') {
            self.settings.dimension = enums.paperFormat[format.toLowerCase()].slice();
        } else {
            self.settings.dimension = format.slice().splice(0, 2);
        }

        if (orientation.toLowerCase() === 'landscape') {
            var temp = self.settings.dimension[0];
            self.settings.dimension[0] = self.settings.dimension[1];
            self.settings.dimension[1] = temp;
        }

        this.resObj = new resources(++this.objectNumber, 0);

        /**
        *Root of the Page-Tree
        *@Type {[pageTreeNode]{@link pdfJS.pageTreeNode}  
        */
        this.rootNode = new pageTreeNode(null, ++self.objectNumber, 0,
             {
                 mediabox: [0, 0, this.settings.dimension[0], this.settings.dimension[1]],
                 resources: this.resObj
             });

        /**
       *Current pageTreeNode in context
       *@Type {[pageTreeNode]{@link pdfJS.pageTreeNode}  
       */
        this.currentNode = this.rootNode;

        this.infoObj = info(this.settings, this.newObj());
        this.catalogObj = catalog(this.rootNode, this.newObj());
        this.addStandardFonts();
    }

    doc.prototype = {
        /**
        *Get/Set the object number of this document.
        *@memberof pdfJS.doc#
        *@return {int} the object number.
        */
        objNumber: function(val) {
            if (val) {
                this.objectNumber = value;
            }
            return val;
        },
        /**
        *Get/Set the current page of this document.
        *@memberof pdfJS.doc#
        *@return {pageNode} the object number.
        */
        page: function(val) {
            if (val) {
                this.objectNumber = value;
            }
            return val;
        },
        /**
        *Create new pdf object for this document.
        *@memberof pdfJS.doc#
        *@return {[obj]{@link pdfJS.obj}} a newly created pdf object for this document.
        */
        newObj: function() {
            return new obj(++this.objectNumber, 0);
        },
        /**
        *Create new pdf stream for this document.
        *@memberof pdfJS.doc#
        *@return {[stream]{@link pdfJS.stream}} a newly created pdf stream for this document.
        */
        newStream: function() {
            return new stream(++this.objectNumber, 0, this);
        },
        /**
        *Add a new page to the document.
        *@param {number} [height] Height in pt
        *@param {number} [width] Width in pt
        *@param {object} [options] Page options take procedence over height and width.
        *TODO documentation for page options.
        *@memberof pdfJS.doc#
        *@return {[pageNode]{@link pdfJS.pageNode}}
        */
        //TODO: Add options/margin/etc
        addPage: function (height, width, options) {
            this.pageCount++;
            this.currentPage = new pageNode(
                this.currentNode,
                options ||
                    {
                        mediabox: [
                            0,
                            0,
                            width || this.settings.dimension[0],
                            height || this.settings.dimension[1]
                        ]
                    },
                ++this.objectNumber,
                0,
                [this.newStream()],
                this.repeatableElements.slice(),
                this.templateStreams.slice(),
                this
            );
            this.currentPage.data.pageNum = this.pageCount;
            this.currentNode.kids.push(this.currentPage);

            return this.currentPage;
        },
        /**
        *Output PDF document.
        *@memberof pdfJS.doc#
        *@param {string} type 
        (datauristring | datauriLstring | datauri | dataurl | dataurlnewwindow)
        *@return {string} PDF data string.
        */
        output: (function () {
            var buildPageTreeNodes = function (node, buff) {
                var ret = buff || [], i, item;
                node.out(ret);
                for (i = 0; item = node.kids[i]; i++) {
                    if (item instanceof pageTreeNode) {
                        buildPageTreeNodes(item, ret);
                        continue;
                    }
                    item.out(ret);
                }
                return ret;
            };

            var buildDocument = function (content, catalog, info) {
                var getOffsets = function (data) {
                    if (typeof data !== 'string') {
                        throw 'getOffsets expects a string input';
                    }

                    var ret = [],
                        //genRegex = /\d+(?=\sobj)/,
                        objRegex = /^\d+/,
                        matches, i, match;
                    //let's search the string for all object declaration in data. 
                    matches = data.match(/\d+\s\d+\sobj/gim);

                    var currentOffset = 0;
                    var search = function(m) {
                        var offset = currentOffset;
                        var count = 0;
                        var k = null;
                        var c = null;
                        var start = null;
                        while ((c = data[offset]) && (k = m[count])) {
                            if (k === c) {
                                count++;
                                if (!start) {
                                    start = offset;
                                }
                            } else {
                                count = 0;
                                start = null;
                            }
                            offset++;
                        }
                        if (!k) {
                            currentOffset = start;
                            return start;
                        }
                        return -1;
                    };
                    for (i = 0; match = matches[i]; i++) {
                        ret.push({
                            objNum: parseInt(objRegex.exec(match), 10),
                            genNum: 0, //parseInt(genRegex.exec(match), 10),
                            offset: search(match)
                        });
                    }

                    return ret;
                };
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
                    return a.objNum - b.objNum;
                });

                // Cross-ref
                contentBuilder.push('xref');
                contentBuilder.push('0 ' + (objectCount + 1));
                contentBuilder.push('0000000000 65535 f ');
                for (i = 0; i < objectCount; i++) {
                    //within the document.
                    contentBuilder.push(utils.padd10(offsets[i].offset) + ' 00000 n ');
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

                return contentBuilder.join('\n');
            };

            var buildObjs = function (objs) {
                var i, obj,
                    ret =  [];
                for (i = 0; obj = objs[i]; i++) {
                    obj.out(ret);
                }
                return ret.join('\n');
            };

            return function(type) {
                type = type || 'dataurl';

                var pageContent = buildPageTreeNodes(this.rootNode, []);

                var content = utils.removeEmptyElement([
                    pageContent.join('\n'),
                    buildObjs(this.resObj.fontObjs),
                    buildObjs(this.resObj.imageXObjects),
                    buildObjs(this.repeatableElements),
                    this.resObj.out().join('\n'),
                    this.infoObj.out().join('\n'),
                    this.catalogObj.out().join('\n')
                ]).join('\n');

                var pdf = buildDocument(content, this.catalogObj, this.infoObj);
                switch (type.toLowerCase()) {
                case 'dataurl':
                    return 'data:application/pdf;base64,' + btoa(pdf);
                case 'base64':
                    return btoa(pdf);
                default:
                    return pdf;
                }
            };
        })(),
        /**
        *Output PDF document.
        *@memberof pdfJS.doc#
        *@param {string} type 
        (datauristring | datauriLstring | datauri | dataurl | dataurlnewwindow)
        *@return {string} PDF data string.
        */
        outputAsync: function(type, callback) {
            var self = this;
            var t = window.setInterval(function() {
                if (self.activeAsync === 0) {
                    window.clearInterval(t);
                    callback(self.output(type));
                }
            }, 50);
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
        addFont: function(postScriptName, fontName, fontStyle, encoding) {

            var fontKey = 'F' + (this.resObj.fontObjs.length + 1).toString(10);
            // This is FontObject 
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
        /**
        *@memberof pdfJS.doc#
        *Add a list of standard fonts to document.
        */
        addStandardFonts: function() {
            var HELVETICA = 'helvetica',
                TIMES = 'times',
                COURIER = 'courier',
                NORMAL = 'normal',
                BOLD = 'bold',
                ITALIC = 'italic',
                BOLD_ITALIC = 'bolditalic',
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
                    ['ZapfDingbats', 'zapfdingbats', NORMAL]
                ];

            for (var i = 0, l = standardFonts.length; i < l; i++) {
                this.addFont(
                    standardFonts[i][0],
                    standardFonts[i][1],
                    standardFonts[i][2],
                    encoding);
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
        },
        svgReader: function (stream) {
            var parser = new svgReader(stream, this);
            return {
                drawSvg: function(args) {
                    parser.drawSvg.apply(parser, arguments);
                }
            };
        }
    };
//Create root pageTreeNode before calling catalog.
function catalog (rootNode, catalogObj) {
    catalogObj.body = [];
    catalogObj.body.push('<<');

    catalogObj.body.push('/Type /Catalog');
    catalogObj.body.push('/Pages ' + rootNode.objectNumber + ' ' +
        rootNode.generationNumber + ' R');

    catalogObj.body.push('/PageLayout /OneColumn');

    catalogObj.body.push('>>');

    return catalogObj;
}
function info (settings, infoObj) {
    infoObj.body = [];
    infoObj.body.push('<<');

    infoObj.body.push('/Producer (pdfJS ' + PDFJS_VERSION + ')');
    if (settings.documentProperties.title) {
        infoObj.body.push('/Title (' +
            utils.sanitize(settings.documentProperties.title) + ')');
    }
    if (settings.documentProperties.subject) {
        infoObj.body.push('/Subject (' +
            utils.sanitize(settings.documentProperties.subject) + ')');
    }
    if (settings.documentProperties.author) {
        infoObj.body.push('/Author (' +
            utils.sanitize(settings.documentProperties.author) + ')');
    }
    if (settings.documentProperties.keywords) {
        infoObj.body.push('/Keywords (' +
            utils.sanitize(settings.documentProperties.keywords) + ')');
    }
    if (settings.documentProperties.creator) {
        infoObj.body.push('/Creator (' + utils.sanitize(settings.documentProperties.creator) + ')');
    }
    var created = new Date();
    infoObj.body.push('/CreationDate (D:' +
        [
            created.getFullYear(),
            utils.padd2(created.getMonth() + 1),
            utils.padd2(created.getDate()),
            utils.padd2(created.getHours()),
            utils.padd2(created.getMinutes()),
            utils.padd2(created.getSeconds())
        ].join('') +
        ')'
    );

    infoObj.body.push('>>');

    return infoObj;

}
var resources = function (objectNumber, generationNumber) {
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
            // Resource dictionary
            this.body.push('<<');
            //For compatibility only.
            this.body.push('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
            this.body.push('/Font <<');
            // Do this for each font, the '1' bit is the index of the font
            this.body.push(printDictionaryElements(this.fontObjs, 'F'));
            this.body.push('>>');

            var xImgObjs = printDictionaryElements(this.imageXObjects, 'Im');
            if (xImgObjs) {
                this.body.push('/XObject <<');
                this.body.push(xImgObjs);
                this.body.push('>>');
            }
            this.body.push('>>');

            return obj.prototype.out.apply(this, arguments); //calling obj super class out method.
        }
    },
    getFont: {
        value: function (name, style) {
            if (typeof name === 'string') {
                for (var i = 0, font; font = this.fontObjs[i]; i++) {
                    if (font.description.key.toLowerCase() === name.toLowerCase()) {
                        return font;
                    }
                    if (typeof style === 'string' &&
                        font.description.fontName.toLowerCase() === name.toLowerCase() &&
                        font.description.fontStyle.toLowerCase() === style.toLowerCase()) {
                            return font;
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
        if (options.hasOwnProperty(item)) {
            obj = options[item];
            switch (item.toLowerCase()) {
            case 'resources':
                if (obj instanceof resources) {
                    ret.push('/Resources ' + obj.objectNumber + ' ' + obj.generationNumber + ' R');
                } else if (typeof obj === 'string') {
                    ret.push(obj);
                } else {
                    throw 'Invalid Resources!';
                }
                break;
            case 'mediabox':
                if (utils.checkValidRect(obj)) {
                    ret.push('/MediaBox [' + obj.join(' ') + ']');
                }
                break;
            case 'cropbox':
                if (utils.checkValidRect(obj)) {
                    ret.push('/CropBox [' + obj.join(' ') + ']');
                }
                break;
            case 'bleedbox':
                if (utils.checkValidRect(obj)) {
                    ret.push('/BleedBox [' + obj.join(' ') + ']');
                }
                break;
            case 'trimbox':
                if (utils.checkValidRect(obj)) {
                    ret.push('/TrimBox [' + obj.join(' ') + ']');
                }
                break;
            case 'artbox':
                if (utils.checkValidRect(obj)) {
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
    }
    return ret.join('\n');
};


var pageTreeOptionsConverter = function (options) {
    var ret = [],
        obj;
    for (var item in options) {
        if (options.hasOwnProperty(item)) {
            obj = options[item];
            switch (item.toLowerCase()) {
            //Inheritable
            case 'resources':
                if (obj instanceof resources) {
                    ret.push('/Resources ' + obj.objectNumber + ' ' + obj.generationNumber + ' R');
                } else if (typeof obj === 'string') {
                    ret.push(obj);
                } else {
                    throw 'Invalid Resources!';
                }
                break;
            //Inheritable
            case 'mediabox':
                if (utils.checkValidRect(obj)) {
                    ret.push('/MediaBox [' + obj.join(' ') + ']');
                }
                break;
            //Inheritable
            case 'cropbox':
                if (utils.checkValidRect(obj)) {
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
    }
    return ret.join('\n');
};
var colorCCanvas;
var funcNameRegex = /function\s+(\S{1,})\s*\(/;
var sanitizeRegex = /((\(|\)|\\))/ig;
var listParamsRegex = /(\S*)\(((\d|,|;|\.|\-|\s)*)\)/gm;
var operatorRegex = /(\w{1,3}$)/gm;
var objectNameRegex = /^\[object (.*)\]$/;


var utils = {
    radsToDegrees: function(rads) {
        return rads * (180 / Math.PI);
    },
    degreesToRads: function(degrees) {
    return degrees * (Math.PI / 180);
    },
    sanitize: function(text) {
        return text.replace(sanitizeRegex, '\\$1');
    },
    removeEmptyElement: function(arr) {
        var i, l, value, ret = [];
        for (i = 0, l = arr.length; i < l; i++) {
            value = arr[i];
            if (value) {
                ret.push(value);
            }
        }
        return ret;
    },
    getInstanceType: function (o) {
        if (o === null) {
            return null;
        }
        var results = (funcNameRegex).exec(o.constructor.toString());

        if (results && results.length > 1) {
            return results[1];
        }

        //In cases where we cannot extract function name from the constructor object. (IE)
        return Object.prototype.toString.call(o).match(objectNameRegex)[1];
    },
    colorToRgb: function(name) {
        if (!colorCCanvas) {
            colorCCanvas = document.createElement('canvas');
        }
        var ctx = colorCCanvas.getContext('2d');
        ctx.strokeStyle = name;
        var colorHex = ctx.strokeStyle;
        return {
            r: (parseInt(colorHex.slice(1, 3), 16) / 255).toFixed(2),
            g: (parseInt(colorHex.slice(3, 5), 16) / 255).toFixed(2),
            b: (parseInt(colorHex.slice(5, 7), 16) / 255).toFixed(2)
        };
    },
    checkValidRect: function (rect) {
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
    },
    padd2: function (number) {
        var n = (number).toFixed(0);
        if (number < 10) {
            return '0' + n;
        } else {
            return n;
        }
    },
    padd10: function (number) {
        var n = (number).toFixed(0);
        if (n.length < 10) {
            return new Array(11 - n.length).join('0') + n;
        } else {
            return n;
        }
    },
    toPrecision: function (arr, n) {
        if (!(arr instanceof Array)) {
            arr = Array.prototype.slice.call(arr);
        }
        if (!n || !n.isNaN || n.isNaN()) {
            n = 2;
        }
        for (var i = 0, l = arr.length; i < l; i++) {
            arr[i] = parseFloat(parseFloat(arr[i]).toFixed(n));
        }
        return arr;
    },
    clone: function (obj) {
        if (typeof obj === 'undefined') {
            return obj;
        }
        var type = utils.getInstanceType(obj),
            index, ret, l;
        switch(type) {
            case 'Object':
                ret = {};
                for (index in obj) {
                    if (obj.hasOwnProperty(index)) {
                        ret[index] = this.clone(obj[index]);
                    }
                }
                break;
            case 'Array':
                ret = [];
                for (index = 0, l = obj.length; index < l; index++)
                {
                    ret.push(this.clone(obj[index]));
                }
                break;
            default:
                ret = obj;
        }
        return ret;
    },
    extend: function (out, obj2) {
        var i, l, obj, prop;
        if (!out) {
            out = {};
        }
        for (i = 1, l = arguments.length; i < l; i++) {
            obj = arguments[i];
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    out[prop] = obj[prop];
                }
            }
        }
        return out;
    },
    evalOptions: function (options) {
        var sb = [], item, index;
        for (index in options) {
            if (options.hasOwnProperty(index)) {
                item = options[index];
                switch(utils.getInstanceType(item)) {
                    case 'String':
                        sb.push('/' + index + ' ' + item);
                        break;
                    case 'Number':
                        sb.push('/' + index + ' ' + utils.toPrecision(item));
                        break;
                    case 'dictionary':
                        console.error('Not yet supported');
                        break;
                }
            }
        }
        return sb.join('\n');
    }
};
var operators = {
    generalGraphicsState: {
        'w': 'setlinewidth',
        'J': 'setlinecap',
        'j': 'setlinejoin',
        'M': 'setmiterlimit',
        'd': 'setdash',
        'ri': 'renderingIntent', //not PS
        'i': 'setflat'
    },
    specialGraphicsState: {
        'q': 'gsave',
        'Q': 'grestore',
        'cm': 'concat' //Concatenate matrix of current transformation matrix
    },
    pathConstruction: {
        'm': 'moveto',
        'l': 'lineto',
        'c': 'curveto', // Append curved segment to path(three control points)
        'v': 'curveto', //Append curved segment to path(initial oint replicated).
        'y': 'curveto', //Append curved segement to path (final point replicated).
        'h': 'closepath',
        're': 'rectangle' //not PS
    },
    pathPainting: {
        'S': 'stroke',
        's': 'closepathStroke',
        'f': 'fill', //nonzero winding number rule
        'F': 'fill', //obsolete
        'f*': 'eofill', //even-odd rule fill
        'B': 'fillStroke',
        'B*': 'eofillStroke', //even-odd rule stroke
        'b': 'closepathFillStroke',
        'b*': 'closepathEofillStroke', //even-odd rule
        'n': 'noOp' //not PS
    },
    clippingPath: {
        'W': 'clip',
        'W*': 'eoclip' //clip even-odd rule.
    },
    textObjects: {
        'BT': 'beginText', //not PS
        'ET': 'endText' //not PS
    },
    textState: {
        'Tc': 'charSpace', //not PS
        'Tw': 'wordSpace', //not PS
        'Tz': 'scaleText', //not PS
        'TL': 'leading', //not PS
        'Tf': 'selectfont',
        'Tr': 'renderMode', //not PS
        'Ts': 'rise' //not PS,
    },
    textPosition: {
        'Td': 'textPosition', //not PS,
        'TD': 'textPositionLeading', //not PS
        'Tm': 'textMatrix', //not PS 
        'T*': 'newLine' //not PS    
    },
    textShow: {
        'Tj': 'show',
        'TJ': 'showArrayText', //not PS
        '\'': 'nextlineShowText', //not PS
        '"': 'wordCharSpaceNextlineShowText' //not PS
    },
    type3Font: {
        'd0': 'setcharwidth',
        'd1': 'setcachedevice'
    },
    color: {
        'CS': 'setcolorspace', //stroke
        'cs': 'setcolorspace', //fill
        'SC': 'setcolor', //stroke
        'sc': 'setcolor', //fill
        'SCN': 'setcolor', //set stroke color for ICCBased and special color spaces
        'scn': 'setcolor', //same as above but for fill
        'G': 'setgray', //stroke
        'g': 'setgray', //fill
        'RG': 'setrgbcolor', //stroke
        'rg': 'setrgbcolor', //fill
        'K': 'setcmykcolor', //stroke
        'k': 'setcmykcolor' //fill
    },
    shadingPattern: {
        'sh': 'shfill'
    },
    inlineImages: {
        'BI': 'beginInlineImageObject', //not PS
        'ID': 'beginInlineImageData', //not PS
        'EI': 'endInlineImageObject' //not PS
    },
    xObjects: {
        'Do': 'invokeNamedXObject' //not PS
    },
    markedcontent: {
        'MP': 'markedcontentPoint', //not PS
        'DP': 'markedcontentPointPropertylist', //not PS
        'BMC': 'beginMarkedcontentSequence', //not PS
        'BDC': 'beginMarkedcontentSequenceProperList', //not PS
        'EMC': 'endMarkedcontentSequence' //not PS
    },
    compatibility: {
        'BX': 'beginCompatibilitySection', //not PS
        'EX': 'endCompatibilitySection' //not PS
    }
};
var operationStates = {
    //Page Description Level
    pageLevel: utils.extend({state: 'Page Description Level'},
        operators.generalGraphicsState,
        operators.specialGraphicsState,
        operators.color,
        operators.textState,
        operators.markedContent,
        operators.shadingPattern,
        operators.xObjects
    ),
    //Path Object
    path: utils.extend({state: 'Path Object'},
        operators.pathConstruction
    ),
    //Clipping Path Object,
    clippingPath: {state: 'Clipping Path Object'},
    //In-line Image Obj,
    inlineImage: {
        state: 'In-line Image Object',
        'ID': 'beginInlineImageData' //not PS
    },
    //Text Object
    text: utils.extend({state: 'Text Object'},
        operators.generalGraphicsState,
        operators.color,
        operators.textState,
        operators.textShow,
        operators.textPosition,
        operators.markedcontent
    )
};

operationStates.pageLevel.transition = {
    'BI': operationStates.inlineImage,
    'm': operationStates.path,
    're': operationStates.path,
    'BT': operationStates.text
};

operationStates.path.transition = {
    'W': operationStates.clippingPath,
    'W*': operationStates.clippingPath,
    'S': operationStates.pageLevel,
    's': operationStates.pageLevel,
    'f': operationStates.pageLevel,
    'F': operationStates.pageLevel,
    'f*': operationStates.pageLevel,
    'B': operationStates.pageLevel,
    'B*': operationStates.pageLevel,
    'b': operationStates.pageLevel,
    'b*': operationStates.pageLevel,
    'n': operationStates.pageLevel
};
operationStates.clippingPath.transition = {
    'S': operationStates.pageLevel,
    's': operationStates.pageLevel,
    'f': operationStates.pageLevel,
    'F': operationStates.pageLevel,
    'f*': operationStates.pageLevel,
    'B': operationStates.pageLevel,
    'B*': operationStates.pageLevel,
    'b': operationStates.pageLevel,
    'b*': operationStates.pageLevel,
    'n': operationStates.pageLevel
};

operationStates.inlineImage.transition = {
    'EI': operationStates.pageLevel
};

operationStates.text.transition = {
    'ET': operationStates.pageLevel
};
var enums = {
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
doc.prototype.newImage = function (imageData, crossOrigin, resources) {
    // Algorithm from: http://www.64lines.com/jpeg-width-height
    var getJpegSize = function (imgData) {
        var width, height;
        // Verify we have a valid jpeg header 0xff,0xd8,0xff,0xe0,?,?,'J','F','I','F',0x00
        if (imgData.charCodeAt(0) !== 0xff ||
            imgData.charCodeAt(1) !== 0xd8 ||
            imgData.charCodeAt(2) !== 0xff ||
            imgData.charCodeAt(3) !== 0xe0 ||
            imgData.charCodeAt(6) !== 'J'.charCodeAt(0) ||
            imgData.charCodeAt(7) !== 'F'.charCodeAt(0) ||
            imgData.charCodeAt(8) !== 'I'.charCodeAt(0) ||
            imgData.charCodeAt(9) !== 'F'.charCodeAt(0) ||
            imgData.charCodeAt(10) !== 0x00) {
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
                blockLength = imgData.charCodeAt(i) * 256 + imgData.charCodeAt(i + 1);
            }
        }
    };
    var processImageData = function (imageData, format) {
        var ret = {
            width: 0,
            height: 0,
            data: ''
        },
            temp;
        format = format.toLowerCase();

        //TODO replace using regex.
        //Convert dataString to binary.
        if (imageData.substring(0, 23) === 'data:image/jpeg;base64,') {
            imageData = atob(imageData.replace('data:image/jpeg;base64,', ''));
            format = 'jpeg';
        }

        //Try JPEG
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

    var processCanvas = function (canvas, imgXObj, resources) {

        var imageData = canvas.toDataURL('image/jpeg');
        var imageInfo = processImageData(imageData, 'jpeg');

        imgXObj.content.push(imageInfo.data);
        imgXObj.name = 'Im' + (resources.imageXObjects.length + 1);
        imgXObj.width = imageInfo.width;
        imgXObj.height = imageInfo.height;

        //Add image to the resource dictionary.
        resources.imageXObjects.push(imgXObj);
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

    var processImageSource = function (imgSrc, imgXObj, resources, crossOrigin, doc) {
        var img = new Image();
        img.onload = function (e) {
            doc.activeAsync--;
            processImage.call(this, img, imgXObj, resources);
        };

        //Enable crossOrigin based on CORS if crossOrigin is true.
        if (crossOrigin) {
            img.crossOrigin = 'anonymous';
        }
        doc.activeAsync++;
        img.src = imgSrc;
    };
    var analyzeImage = function (image) {
        if (image instanceof HTMLImageElement) {
            processImage.apply(this, [image].concat(Array.prototype.slice.call(arguments, 1, 3)));
        } else if (typeof image === 'string') {
            processImageSource.apply(this,
                [image].concat(Array.prototype.slice.call(arguments, 1)));
        } else if (image instanceof HTMLCanvasElement) {
            processCanvas.apply(this, [image].concat(Array.prototype.slice.call(arguments, 1, 3)));
        } else {
            throw 'Invalid Image Type';
        }
    };


    var newImage = new imageXObject(++this.objectNumber,
        0, 0, 0, enums.colorSpace.deviceRGB, 8, 'DCTDecode');

    analyzeImage.call(this, imageData, newImage, resources || this.resObj, crossOrigin, this);

    return newImage;
};






var svgParser = {
    drawPath: function (path) {
        var pArr = svgReader.utils.sanitizePath(path).split(' '),
            val, i, l, next;
        this.currentPoint = {};
        this.lastCP = {};
        for (i = 0, l = pArr.length; i < l; i++) {
            val = pArr[i];
            if (val !== 'T' && val !== 'Q' && val !== 't' && val !== 'q') {
                this.lastCP = {};
            }
            switch (val) {
                case 'M':
                    do {
                        this.currentPoint.x = parseFloat(pArr[++i]);
                        this.currentPoint.y = parseFloat(pArr[++i]);
                        this.stream.moveTo(this.currentPoint.x, this.currentPoint.y);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0);
                    break;
                case 'L':
                    do {
                        this.currentPoint.x = parseFloat(pArr[++i]);
                        this.currentPoint.y = parseFloat(pArr[++i]);
                        this.stream.lineTo(this.currentPoint.x, this.currentPoint.y);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0);
                    break;
                case 'H':
                    do {
                        this.currentPoint.x = parseFloat(pArr[++i]);
                        this.stream.lineTo(this.currentPoint.x, 0);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0);
                    break;
                case 'V':
                    do {
                        this.currentPoint.y = parseFloat(pArr[++i]);
                        this.stream.lineTo(0, this.currentPoint.y);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0);
                    break;
                case 'C':
                    do {
                        this.stream.bezierCurve(pArr[++i], pArr[++i], pArr[++i], pArr[++i],
                            this.currentPoint.x = pArr[++i], this.currentPoint.y = pArr[++i]);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0);
                    break;
                case 'S':
                    do {
                        this.stream.bezierCurve(pArr[++i], pArr[++i],
                            this.currentPoint.x = pArr[++i], this.currentPoint.y = pArr[++i]);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0);
                    break;
                case 'Q':
                    do {
                        svgReader.utils.quadraticToCubicBezier
                            .call(this, this.currentPoint.x, this.currentPoint.y,
                                pArr[++i], pArr[++i], pArr[++i], pArr[++i]);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0);
                    break;
                case 'T':
                    var newCP;
                    next = parseFloat(pArr[i + 1]);
                    do {
                        if (this.lastCP.x || this.lastCP.y) {
                            newCP = svgReader.utils.computePointReflection
                                .call(this, this.lastCP, this.currentPoint);
                        } else {
                            newCP = {};
                            newCP.x = this.currentPoint.x;
                            newCP.y = this.currentPoint.y;
                        }
                        svgReader.utils.quadraticToCubicBezier
                            .call(this, this.currentPoint.x, this.currentPoint.y,
                                newCP.x, newCP.y, pArr[++i], pArr[++i]);

                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0);
                    break;
                case 'A':
                    var x1, y1, x2, y2, fa, fs, rx, ry, phi;
                    do {
                        rx = parseFloat(pArr[++i]);
                        ry = parseFloat(pArr[++i]);
                        phi = parseFloat(pArr[++i]);
                        fa = parseInt(pArr[++i], 10);
                        fs = parseInt(pArr[++i], 10);
                        x2 = parseFloat(pArr[++i]);
                        y2 = parseFloat(pArr[++i]);
                        x1 = this.currentPoint.x;
                        y1 = this.currentPoint.y;
                        this.currentPoint.x = x2;
                        this.currentPoint.y = y2;
                        if (!rx || !ry) {
                            this.stream.lineTo(x2, y2);
                        } else {
                            var c = svgReader.utils.computeArc
                                .call(this, x1, y1, rx, ry, phi, fa, fs, x2, y2, this);
                            var arc = new ellipticalArc(c.cx, c.cy, c.rx, c.ry,
                                phi, c.theta, c.theta + c.dTheta, false);
                            arc.buildEllipticalArc(3, 0.01, this);
                        }
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0);
                    break;
                case 'Z':
                    this.stream.close();
                    break;
                default:
                    throw 'Invalid Path String!';
            }
        }
    },
    setGenericOptions: function (attrs) {
        var i, item;
        for (i = 0; item = attrs[i]; i++) {
            this.setGenericOption(item.name.toLowerCase(), item.value);
        }
    },
    setGenericOption: function (name, value) {
        if (!name) {
            return;
        }
        var rgb, i, matches, item, temp, sb;
        switch (name) {
            case 'stroke-width':
                this.stream.lineWidth(value);
                break;
            case 'stroke':
                //TODO: Convert color name into RGB.
                if (value.toLowerCase() !== 'none') {
                    rgb = utils.colorToRgb(value.toLowerCase());
                    this.getCurrentSvgElement().stroke = rgb;
                    this.stream.strokeColor(rgb.r, rgb.g, rgb.b);
                }
                break;
            case 'fill':
                //TODO: Convert color name into RGB.
                if (value.toLowerCase() !== 'none') {
                    rgb = utils.colorToRgb(value.toLowerCase());
                    this.getCurrentSvgElement().fill = rgb;
                    this.stream.fillColor(rgb.r, rgb.g, rgb.b);
                }
                break;
            case 'transform':
                matches = value.match(listParamsRegex);
                for (i = 0; item = matches[i]; i++) {
                    temp = item.replace(listParamsRegex, '$2');
                    if (temp.indexOf(',') > 0) {
                        temp = temp.split(',');
                    } else {
                        temp = temp.split(' ');
                    }
                    temp = temp.map(function (ele) {
                        return parseFloat(parseFloat(ele).toFixed(2));
                    });
                    switch (item.replace(listParamsRegex, '$1').toLowerCase()) {
                        case 'translate':
                            if (temp.length >= 2) {
                                this.stream.translate(temp[0], temp[1]);
                            } else {
                                this.stream.translate(temp[0], 0);
                            }
                            break;
                        case 'scale':
                            if (temp.length >= 2) {
                                this.stream.scale(temp[0], temp[1]);
                            } else {
                                this.stream.translate(temp[0], temp[0]);
                            }
                            break;
                        case 'skewx':
                            this.stream.skew(temp[0], 0);
                            break;
                        case 'skewy':
                            this.stream.skew(0, temp[0]);
                            break;
                        case 'rotate':
                            if (temp.length === 3) {
                                if (this.textCurrentPoint.x || this.textCurrentPoint.y) {
                                    this.stream.translate(-this.textCurrentPoint.x,
                                        -this.textCurrentPoint.y);
                                }
                                this.stream.translate(temp[1], temp[2]);
                                this.stream.rotate(utils.degreesToRads(temp[0]));
                                this.stream.translate(-temp[1], -temp[2]);
                            } else {
                                this.stream.rotate(temp[0]);
                            }
                            break;
                        case 'matrix':
                            sb = [temp[0], temp[1], temp[2], temp[3], temp[4], temp[5], 'cm'];
                            this.stream.push(sb.push(' '));
                            break;
                    }
                }
                break;
            case 'style':
        }
    },
    setCssOptions: function (attrs) {
        var i, item;
        for (i = 0; item = attrs[i]; i++) {
            if (item.name.toLowerCase() === 'style') {
                break;
            }
        }
        if (!item) {
            return;
        }
        var cssStyles = item.value.split(';');
        if (!cssStyles) {
            return;
        }
        cssStyles = cssStyles.map(function (aItem, index, arr) {
            var splits = aItem.split(':');
            if (splits.length != 2) {
                return { name: 'IgnoreObject' };
            }
            return { name: splits[0].trim(), value: splits[1].trim() };
        });
        for (i = 0; item = cssStyles[i]; i++) {
            this.setCssOption(item.name.toLowerCase(), item.value);
        }
    },
    setCssOption: function (name, value) {
        if (!name) {
            return;
        }
        switch (name.toLowerCase()) {
            case 'font-size':
                this.stream.fontSize(parseInt(value, 10));
                break;
            case 'color':
            case 'fill':
                this.setGenericOption('fill', value);
                break;
        }
    },
    setTextOptions: function (attrs) {
        var i, item;
        for (i = 0; item = attrs[i]; i++) {
            this.setTextOption(item.name.toLowerCase(), item.value);
            //console.log(item.name + ' = ' + item.value);
        }
    },
    setTextOption: function (name, value) {
        if (!name) {
            return;
        }
        var temp, graphicState, textState;
        switch (name.toLowerCase()) {
            //TODO support list coordinates
            case 'x':
                textState = this.stream.getCurrentTextState();
                graphicState = this.getCurrentSvgElement();
                temp = parseFloat(parseFloat(value).toFixed(2));
                this.stream.textPosition(
                    temp - (textState.tCpX - (svgReader.utils.computeTextOffsetByAnchor
                        (graphicState.element, graphicState['textAnchor']))), 0);
                break;
            case 'y':
                textState = this.stream.getCurrentTextState();
                temp = parseFloat(parseFloat(value).toFixed(2));
                this.stream.textPosition(0, -temp - textState.tCpY);
                break;
            case 'dx':
                temp = parseFloat(parseFloat(value).toFixed(2));
                graphicState = this.getCurrentSvgElement();
                this.stream.textPosition(temp - (svgReader.utils.computeTextOffsetByAnchor
                        (graphicState.element, graphicState['textAnchor'])), 0);
                break;
            case 'dy':
                temp = parseFloat(parseFloat(value).toFixed(2));
                this.stream.textPosition(0, -temp);
                break;
            case 'rotate':
                this.stream.rotate(parseFloat(value).toFixed(2));
                break;
                //TODO: support 'textLength';
                //TODO: support 'lengthAdjust';
            case 'text-anchor':
                graphicState = this.getCurrentSvgElement();
                graphicState['textAnchor'] = value.toLowerCase();
                var offset = svgReader.utils.computeTextOffsetByAnchor(graphicState.element);
                if (offset) {
                    this.stream.textPosition(offset, 0);
                }
        }
    }
};
var svgReader = function (stream, doc) {
    //statesTracker.call(this);
    this.doc = doc;
    this.stream = stream;
    this.states = {currentElementStack: []}; //Keep the state current state of the pdf.
    this.textCurrentPoint = { x: 0, y: 0 };
    this.currentPoint = {};
    this.lastCP = {};
};

svgReader.prototype = {
    parseSVG: function (svgElement) {
        var elementType = utils.getInstanceType(svgElement);
        var opt = svgReader.elements[elementType],
            temp;
        if (!opt) {
            console.error('Not Supported SVGElement: ' + utils.getInstanceType(svgElement));
            return;
        }
        if (opt !== 'skip') {
            if (elementType !== 'SVGTSpanElement') {
                this.stream.pushState();
            }
            temp = utils.clone(this.getCurrentSvgElement());
            temp.element = svgElement;
            this.states.currentElementStack.push(temp);
            if (temp) {
                if (temp.fill) {
                    this.stream.fillColor
                        .call(this.stream, temp.fill.r, temp.fill.g, temp.fill.b);
                }
                if (temp.stroke) {
                    this.stream.fillColor
                        .call(this.stream, temp.stroke.r, temp.stroke.g, temp.stroke.b);
                }
            }
            opt.call(this, svgElement);
            this.states.currentElementStack.pop();
            if (elementType !== 'SVGTSpanElement') {
                this.stream.popState();
            }
        } else {
            this.processChildNodes( svgElement);
        }

    },
    drawSvg: function (svg) {
        if (svg instanceof SVGSVGElement) {
            this.stream.pushState();
            this.stream.scale(1, -1);
            this.parseSVG(svg);
            this.stream.popState();
        } else {
            throw 'Element is not an SVGSVGElement';
        }
    },
    processChildNodes: function (svg) {
        //Recursively parse the child nodes.
        for (var i = 0, item; item = svg.childNodes[i]; i++) {
            if (item instanceof SVGElement) {
                this.parseSVG(item);
            }
        }
    },
    paintSvg: function (attrs, paintIfEmpty) {
        var fill = attrs['fill'],
            stroke = attrs['stroke'];
        var isFillNone = fill ? fill.value.toLowerCase() === 'none' : false;
        var isStrokeNone = stroke ? stroke.value.toLowerCase() === 'none' : false;
        if (fill && stroke && !isFillNone && !isStrokeNone) {
            this.stream.paintPath();
        } else if (fill && !isFillNone) {
            this.stream.paintPath('f');
        } else if (stroke && !isStrokeNone) {
            this.stream.paintPath('S');
        } else if (paintIfEmpty && !fill && !stroke) {
            this.stream.paintPath();
        }
    },
    push: function (args) {
        Array.prototype.push.apply(this.stream, arguments);
        return this;
    },
    getCurrentSvgElement: function() {
        return this.states.currentElementStack[this.states.currentElementStack.length - 1] || {};
    }
};

mixin(svgReader, svgParser);
mixin(svgReader, statesTracker.prototype);
svgReader.utils = {
    sanitizePath: function(path) {
        var ret = path.replace(/\s{2,}/gm, ' '); //replace unnecessary white spaces;
        ret = ret.replace(/([A-Za-z])(?=\d)/gm, '$1 ').trim(); //separate letter from numbers;
        return ret;
    },
    quadraticToCubicBezier: function (q0x, q0y, q1x, q1y, q2x, q2y) {
        //We don't want to lose the precision for the first 4 values.
        q1x = parseFloat(q1x);
        q1y = parseFloat(q1y);
        q2x = parseFloat(q2x).toFixed(2);
        q2y = parseFloat(q2y).toFixed(2);
        this.stream.quadraticCurveTo.apply(this.stream, arguments);
        this.currentPoint = { x: q2x, y: q2y };
        this.lastCP = { x: q1x, y: q1y };
    },
    reflectAngleAboutY: function(angle) {
        if (angle >= 0) {
            return (Math.PI* 2.0) - angle;
        }
        return -(Math.PI*2.0) - angle;
    },
    computeArc: function(x0, y0, rx, ry, angle, largeArcFlag, sweepFlag, x, y) {
        /*Computing arc based on SVG specification note.
        http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes */
        var twoPi = Math.PI * 2.0;
        var dx2 = (x0 - x) / 2.0,
            dy2 = (y0 - y) / 2.0;
        angle = utils.degreesToRads(angle % 360.0);
        var cosAngle = Math.cos(angle);
        var sinAngle = Math.sin(angle);

        //Compute (x1, y1)
        var x1 = cosAngle * dx2 + sinAngle * dy2;
        var y1 = (-sinAngle * dx2 + cosAngle * dy2);
        rx = Math.abs(rx);
        ry = Math.abs(ry);
        var Prx = rx * rx;
        var Pry = ry * ry;
        var Px1 = x1 * x1;
        var Py1 = y1 * y1;
        var radiiCheck = Px1 / Prx + Py1 / Pry;

        if (radiiCheck > 0.99999) {
            var radiiScale = Math.sqrt(radiiCheck) * 1.00001;
            rx = radiiScale * rx;
            ry = radiiScale * ry;
            Prx = rx * rx;
            Pry = ry * ry;
        }

        var sign = (largeArcFlag === sweepFlag) ? -1 : 1;
        var sq = ((Prx * Pry) - (Prx * Py1) - (Pry * Px1)) / ((Prx * Py1) + (Pry * Px1));
        sq = (sq < 0) ? 0 : sq;
        var coef = (sign * Math.sqrt(sq));
        var cx1 = coef * ((rx * y1) / ry);
        var cy1 = coef * -((ry * x1) / rx);
        var sx2 = (x0 + x) / 2.0;
        var sy2 = (y0 + y) / 2.0;
        var cx = sx2 + (cosAngle * cx1 - sinAngle * cy1);
        var cy = sy2 + (sinAngle * cx1 + cosAngle * cy1);
        var ux = (x1 - cx1) / rx;
        var uy = (y1 - cy1) / ry;
        var vx = (-x1 - cx1) / rx;
        var vy = (-y1 - cy1) / ry;
        var p, n;
        n = Math.sqrt((ux * ux) + (uy * uy));
        p = ux;
        sign = (uy < 0) ? -1.0 : 1.0;
        var angleStart = sign * Math.acos(p / n);
        n = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
        p = ux * vx + uy * vy;
        sign = ((ux * vy - uy * vx) < 0) ? -1.0 : 1.0;
        var angleExtent = sign * Math.acos(p / n);
        angleExtent %= twoPi;
        angleStart %= twoPi;
        if (!sweepFlag && angleExtent > 0) {
            angleExtent -= twoPi;
        } else if (sweepFlag && angleExtent < 0) {
            angleExtent += twoPi;
        }

        return {
            cx: cx,
            cy: cy,
            rx: rx,
            ry: ry,
            phi: angle,
            x: x,
            y: y,
            theta: -angleStart,
            dTheta: -angleExtent
        };
    },
    computePointReflection: function(pt, relativePt) {
        return { x: 2 * (relativePt.x) - pt.x, y: 2 * (relativePt.y) - pt.y };
    },
    computeTextOffsetByAnchor: function (svgElement, textAnchor) {
        if (!textAnchor) {
            return 0;
        }
        switch (textAnchor.toLowerCase()) {
            case 'middle':
                return -(svgElement.getComputedTextLength() / 2);
            case 'end':
                return -svgElement.getComputedTextLength();
        }
        return 0;
    }

};
svgReader.elements = {
    SVGSVGElement: 'skip',
    SVGGElement: function (groupElement) {
        this.setGenericOptions( groupElement.attributes);
        this.processChildNodes( groupElement);
    },
    SVGTextElement: function (textElement) {
        var attrs = textElement.attributes;
        this.setGenericOptions(attrs);
        this.stream.scale(1, -1);
        this.stream.beginText();
        this.setCssOptions(attrs);
        this.setTextOptions(attrs);
        if (!textElement.childElementCount && textElement.textContent) {
            this.stream.print(textElement.textContent);
        }
        this.textCurrentPoint = { x: 0, y: 0 };
        this.processChildNodes(textElement);
        this.stream.endText();
        this.stream.scale(1, -1);
    },
    SVGTSpanElement: function (tSpanElement) {
        var attrs = tSpanElement.attributes;
        this.setGenericOptions( attrs);
        this.setCssOptions(attrs);
        this.setTextOptions(attrs);

        if (tSpanElement.textContent) {
            this.stream.print(tSpanElement.textContent);
            this.stream.textPosition(tSpanElement.getComputedTextLength(), 0);
        }
    },
    SVGCircleElement: function (circle) {
        var attrs = circle.attributes,
            r = Math.abs(parseInt(attrs['r'].value, 10)).toFixed(2),
            x = attrs['cx'] ? parseInt(attrs['cx'].value, 10).toFixed(2) : 0,
            y = attrs['cy'] ? parseInt(attrs['cy'].value, 10).toFixed(2) : 0,
            l = (0.5522422 * r).toFixed(2); // kappa = 4((sqrt(2) - 1)/2
        this.setGenericOptions(attrs);

        this.stream.translate(x, y);
        this.stream.moveTo(0, -1 * r);
        this.stream.bezierCurve(l, -1 * r, r, -1 * l, r, 0);
        this.stream.bezierCurve(r, l, l, r, 0, r);
        this.stream.bezierCurve(-1 * l, r, -1 * r, l, -1 * r, 0);
        this.stream.bezierCurve(-1 * r, -1 * l, -1 * l, -1 * r, 0, -1 * r);

        this.paintSvg( attrs);
    },
    SVGEllipseElement: function (ellipse) {
        var attrs = ellipse.attributes,
            rx = Math.abs(parseInt(attrs['rx'].value, 10)).toFixed(2),
            ry = Math.abs(parseInt(attrs['ry'].value, 10)).toFixed(2),
            x = attrs['cx'] ? parseInt(attrs['cx'].value, 10).toFixed(2) : 0,
            y = attrs['cy'] ? parseInt(attrs['cy'].value, 10).toFixed(2) : 0,
            lx = (0.5522422 * rx).toFixed(2), // kappa = 4((sqrt(2) - 1)/2
            ly = (0.5522422 * ry).toFixed(2); // kappa = 4((sqrt(2) - 1)/2

        this.setGenericOptions(attrs);

        this.stream.translate(x, y);
        this.stream.moveTo(0, -1 * ry);
        this.stream.bezierCurve(lx, -1 * ry, rx, -1 * ly, rx, 0);
        this.stream.bezierCurve(rx, ly, lx, ry, 0, ry);
        this.stream.bezierCurve(-1 * lx, ry, -1 * rx, ly, -1 * rx, 0);
        this.stream.bezierCurve(-1 * rx, -1 * ly, -1 * lx, -1 * ry, 0, -1 * ry);

        this.paintSvg( attrs);
    },
    SVGPathElement: function (path) {
        var attrs = path.attributes,
            i, item, name, pathValues;
        for (i = 0; item = attrs[i]; i++) {
            name = item.name.toLowerCase();
            switch (name) {
                case 'd':
                    //We want to draw the Path last.
                    pathValues = item.value;
                    break;
                default:
                    this.setGenericOption( name, item.value);
            }
        }
        this.drawPath(pathValues);
        this.paintSvg( attrs, true);
    },
    SVGRectElement: function (rect) {
        var attrs = rect.attributes,
            i, item, name,
            width = 0, height = 0, x = 0, y = 0;
        for (i = 0; item = attrs[i]; i++) {
            name = item.name.toLowerCase();
            switch (name) {
                case 'width':
                    width = item.value;
                    break;
                case 'height':
                    height = item.value;
                    break;
                case 'x':
                    x = item.value;
                    break;
                case 'y':
                    y = item.value;
                    break;
                default:
                    this.setGenericOption( name, item.value);
            }
        }

        this.stream.rect(x, y, width, height);
        this.paintSvg( attrs, true);
    }
};
var pluginAdapter = function (plugin) {
    var dependencies = [],
        i, l;
    //inject dependencies
    for (i = 0, l = plugin.length - 1; i < l; i++) {
        switch (plugin[i]) {
            case 'doc':
                dependencies.push(doc);
                break;
            case 'stream':
                dependencies.push(stream);
                break;
            case 'pageNode':
                dependencies.push(pageNode);
                break;
            case 'dictionary':
                dependencies.push(dictionary);
                break;
            case 'docTemplate':
                dependencies.push(docTemplate);
                break;
            case 'ellipticalArc':
                dependencies.push(ellipticalArc);
                break;
            case 'font':
                dependencies.push(font);
                break;
            case 'graphicsStateDictionary':
                dependencies.push(graphicsStateDictionary);
                break;
            case 'obj':
                dependencies.push(obj);
                break;
            case 'pageTreeNode':
                dependencies.push(pageTreeNode);
                break;
            case 'utils':
                dependencies.push(utils);
                break;
            case 'enums':
                dependencies.push(enums);
                break;
            default:
                dependencies.push(undefined);
        }
    }
    plugin[l].apply(this, dependencies);
};
//Public
/**
@namespace
*/
var pdfJS = {
    doc: function (format, orientation, margin, disableValidation) {
        var pdf = new doc(format, orientation, margin, disableValidation);
        return {
            objNum: function() {
                pdf.objNumber.apply(pdf, arguments);
            },
            currentPage: function() { return pdf.page.apply(pdf, arguments); },
            createObj: function() { return pdf.newObj.apply(pdf, arguments); },
            createStream: function() { return pdf.newStream.apply(pdf, arguments); },
            addPage: function() { return pdf.addPage.apply(pdf, arguments); },
            addRepeatableElement: function() {
                return pdf.addRepeatableElement.apply(pdf, arguments);
            },
            addRepeatableTemplate: function() {
                return pdf.addRepeatableTemplate.apply(pdf, arguments);
            },
            root: function() { return pdf.rootNode.apply(pdf, arguments); },
            output: function() { return pdf.output.apply(pdf, arguments); },
            outputAsync: function() { return pdf.outputAsync.apply(pdf, arguments); },
            addFont: function() { return pdf.addFont.apply(pdf, arguments); },
            newImage: function() { return pdf.newImage.apply(pdf, arguments); },
            svgReader: function() { return pdf.svgReader.apply(pdf, arguments); },
            options: function() { return pdf.settings; }
        };
    },
    obj: obj,
    pageTreeNode: pageTreeNode,
    addPlugin: pluginAdapter
};
utils.extend(pdfJS, enums);

_.pdfJS = pdfJS;
}(window));