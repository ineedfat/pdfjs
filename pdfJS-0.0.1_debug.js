/***********************************************
* pdfJS JavaScript Library
* Authors: https://github.com/ineedfat/pdfjs
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 03/15/2013 20:38
***********************************************/
(function(_) {
'use strict';
var PDFJS_VERSION = '0.0.1';if (!Object.create) {
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

/**
*Includes all supported graphic operations. Please see [pageNode.text]{@link pdfJS.pageNode#text} for details.
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
        
        this.push('1 0 0 1 ' + parseFloat(tx).toFixed(2) + ' ' + parseFloat(ty).toFixed(2) + ' cm');
    },
    /**
    
    *@inner
    *@method
    *@param {int} sx Scale by tx in x direction.
    *@param {int} sy Scale by ty in y direction.
    
    */
    scale: function (sx, sy) {
        this.push(parseFloat(sx).toFixed(2) + ' 0 0 ' + parseFloat(sy).toFixed(2) + ' 0 0 cm');
    },
    /**
    
    *@inner
    *@method
    *@param {int} theta Rotate by theta.
    
    */
    rotate: function (theta) {
        var cos = Math.cos(theta).toFixed(2),
            sin = Math.sin(theta).toFixed(2);
        this.push(cos + ' ' + sin + ' -' + sin + ' ' + cos + ' 0 0 cm');
    },
    /**
   
   *@inner
   *@method
   *@param {int} alphaX Skew horizontally.
   *@param {int} betaY Skew vertically.
   
   */
    skew: function (alphaX, betaY) {
        this.push('1 ' + Math.tan(alphaX).toFixed(2) + ' ' + Math.tan(betaY).toFixed(2) + ' 1 0 0 cm');
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
    *@param {int} limit When two line segments meet at a sharp angle and mitered joins have been specified
as the line join style, it is possible for the miter to extend far beyond the
thickness of the line stroking the path. The miter limit imposes a maximum on
the ratio of the miter length to the line width. When the limit is
exceeded, the join is converted from a miter to a bevel.
    
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
    },
    /**
    *Restore the graphics state by removing the most recently saved state from
the stack and making it the current state .
    *@inner
    *@method
    
    */
    popState: function () {
        this.push('Q');
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
        var args = Array.prototype.slice.call(arguments);
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
        var args = Array.prototype.slice.call(arguments);
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
        var args = Array.prototype.slice.call(arguments);
        switch (arguments.length) {
            case 4:
                this.push(args.join(' ') + ' v');
                break;
            case 5:
                this.push(args.slice(0, 4).join(' ') + ' y');
                break;
            case 6:
                this.push(args.join(' ') + ' c');
                break;
            default:
                throw 'Invalid bezier curve parameters';
        }
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
        var args = Array.prototype.slice.call(arguments);
        this.push(args.join(' ') + ' re');
    },
    /**
    *Set the color space to use for non-stroking operations. Depending on the color space,
    *specify the correct number of color values (e.g DeviceGray requires 1, DeviceRGB requires 2,
    *etc)
     *@inner
    *@param {int} colorValue1 See [colorSpace]{@link pdfJS.utils.colorSpace} required value for each specified color space.
    *@param {int} colorValue2 
    *@param {int} colorValue3 
    *@method
    
    */
    fillColor: function (colorValue1, colorValue2, colorValue3) {
        switch (arguments.length) {
            case 1:
                if (this.activeFillCS !== 'DeviceGray') {
                    this.push('/DeviceGray cs');
                    this.activeFillCS = 'DeviceGray';
                }
                break;
            case 3:
                if (this.activeFillCS !== 'DeviceRGB') {
                    this.push('/DeviceRGB cs');
                    this.activeFillCS = 'DeviceRGB';
                }
                break;
            default:
                throw ('Invalid color values');
        }
        var args = Array.prototype.slice.call(arguments);
        this.push(args.join(' ') + ' sc');
    },
    /**
    *Set the color space to use for stroking operations. The operand
name must be a name object. If the color space is one that can be specified by a
name and no additional parameters (DeviceGray and DeviceRGB).
    *@inner
    *@param {int} colorValue1 See [colorSpace]{@link pdfJS.utils.colorSpace} required value for each specified color space.
    *@param {int} colorValue2 
    *@param {int} colorValue3 
    *@method
    */
    strokeColor: function (colorValue1, colorValue2, colorValue3) {
        switch (arguments.length) {
            case 1:
                if (this.activeStrokeCS !== 'DeviceGray') {
                    this.push('/DeviceGray CS');
                    this.activeStrokeCS = 'DeviceGray';
                }
                break;
            case 3:
                if (this.activeStrokeCS !== 'DeviceRGB') {
                    this.push('/DeviceRGB CS');
                    this.activeStrokeCS = 'DeviceRGB';
                }
            default:
                throw ('Invalid color values');
        }

        var args = Array.prototype.slice.call(arguments);
        this.push(args.join(' ') + ' SC');
    },
    /*Color Controls End*/
    /**
    *Graphic Operation Setter. Please see [graphicOperators]{@link pdfJS.graphicOperators} for available operations and corresponding set of operands.
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
        if (w == 0) {
            w = h * imgXObj.width / imgXObj.height;
        }
        if (h == 0) {
            h = w * imgXObj.height / imgXObj.width;
        }

        this.push('q');
        this.push(w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm');
        this.push('/' + imgXObj.name + ' Do');
        this.push('Q');

        return this;
    },
    addSvg: function (svgObj, x, y, sx, sy) {
        if (!sx && !sy) {
            sx = sy = 1;
        }
        this.pushState();
        this.push(sx.toFixed(2) + ' 0 0 ' + (-1 * sy.toFixed(2)) + ' ' + x.toFixed(2) + ' ' + (y + this.doc.settings.dimension[1]).toFixed(2) + ' cm');
        this.push.apply(this, svgObj.content);
        this.popState();
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
    },
    /**
    End text operator.
    *@inner
    *@method
    */
    endText: function () {
        this.push('ET');
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
        this.push(x + ' ' + y + ' Td');
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
        this.push(rise + ' Ts');
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
                this.activeFont.charactersEncode(sanitize(textString)) + ') Tj');
        }
        else {
            this.push(wordSpace + ' ' + charSpace + ' (' +
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
        this.push('T*');
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
var pageNode = function (parent, pageOptions, objectNumber, generationNumber, contentStreams,
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
};
pageNode.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body = [];
            var i, l, item,
                ret = [];

            for (i = 0, l = this.templateStreams.length; i < l; i++) {
                if (!this.reservedObjectNums[i]) {
                    this.reservedObjectNums[i] = ++this.doc.objectNumber;
                }
                ret.push(this.templateStreams[i].out(this.reservedObjectNums[i], 0, this));
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
    *Set current stream in context by index.
    *@param {int} index index of contentStreams
    *@return {pageNode} Return this pageNode object
    *@memberof pdfJS.pageNode#
    *@method
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





/**
*Initialize new pageTreeNode object.
*@classdesc Representing a page-tree node in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {pdfJS.pageTreeNode} parent Parent pageTreeNode of this page.
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*@param {object} options Define the attributes for pageTree that all children may inherit from.
*/
var pageTreeNode = function (parent, objectNumber, generationNumber, options) {
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
    this.options = options;
};


pageTreeNode.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body = [];
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

/**
*Initialize new steam object.
*@classdesc Representing a stream object in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*/
var stream = function (objectNumber, generationNumber, document) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
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
};
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
        value: function () {
            this.body = [];
            var temp = printDictionary(this.dictionary);
            var tempContent = this.content;

            if (!(this instanceof imageXObject)) {
                tempContent = (['q']).concat(this.content);
                tempContent.push('Q');
            }

            //Add 4 because of the extra q and Q operator with two '\n' by joining the character.
            this.body.push('<< /Length ' + (tempContent.join('\n').length));
            if (temp) {
                this.body.push(temp);
            }
            this.body.push('>>');
            this.body.push('stream');
            //this.body.push('q')
            this.body = this.body.concat(tempContent);
            //this.body.push('Q')
            this.body.push('endstream');

            return obj.prototype.out.apply(this, arguments); //calling obj super class out method.
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
            Array.prototype.push.apply(this.content, arguments);
            return this;
        }
    }
});
mixin(stream, textOperators);
mixin(stream, graphicOperators);
/**
*Initialize new font object.
*@classdesc Representing font type in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {object} font
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*/
var font = function (font, objectNumber, generationNumber) {
    var self = this;
    obj.call(this, objectNumber, generationNumber);
    /**
        *Font description object.
        *@Type object
        */
    this.description = font;
};

font.codePages = {
    "WinAnsiEncoding": {
        "338": 140, "339": 156, "352": 138, "353": 154, "376": 159, "381": 142,
        "382": 158, "402": 131, "710": 136, "732": 152, "8211": 150, "8212": 151, "8216": 145,
        "8217": 146, "8218": 130, "8220": 147, "8221": 148, "8222": 132, "8224": 134, "8225": 135,
        "8226": 149, "8230": 133, "8240": 137, "8249": 139, "8250": 155, "8364": 128, "8482": 153
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
*@param {int} generationNumber defining the number of time the pdf has been modified (default is 0 when creating).
*@param {int} width Width of the image to be rendered on page in pt.
*@param {int} height Height of the image to be rendered on page in pt.
*@param {int} [colorSpace=DeviceRGB] Color space of the image.
*@param {int} [bpc=8] Number of bits per color channel component.
*@param {int} [filter] Filter for decoding the image data.
*@param {object} [options] Extra options that can be set.
*/
var imageXObject = function (objectNumber, generationNumber, width, height, colorSpace, bpc, filter, options) {
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
    this.colorSpace = colorSpace || utils.deviceRGB
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
};


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
            return stream.prototype.out.apply(this, arguments); //calling obj super class out method.
        }
    }
});

/**
*Initialize new template object.
*@classdesc Representing a template object in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {doc} document defining the number of time the pdf has been modified (default is 0 when creating).
*/
var docTemplate = function (document) {
    var self = this;

    this.templateContent = [];
    stream.call(this, 0, 0, document);
};

docTemplate.prototype = Object.create(stream.prototype, {
    out: {
        value: function (objectNumber, generationNumber, page) {
            var i, l, replaceRegex, value,
                    templateString = this.templateContent.join('\n');

            this.objectNumber = objectNumber;
            this.generationNumber = generationNumber;
            if (page.data) {
                for (var name in page.data) {
                    if (page.data.hasOwnProperty(name)) {
                        replaceRegex = new RegExp('\{\{' + name + '\}\}', 'g');
                        value = page.data[name];
                        templateString = templateString.replace(replaceRegex, value);
                    }
                }
            }
            this.content = [templateString];
            //calling stream super class out method.
            return stream.prototype.out.apply(this, arguments); 
        }
    },
    push: {
        value: function (args) {
            Array.prototype.push.apply(this.templateContent, arguments);
            return this;
        }
    }
});
    // Size in pt of various paper formats
    var PDF_VERSION = '1.3';
    
/**
    *Initialize new document object.
    *@constructor
    *@memberof pdfJS
    *@Author Trinh Ho (https://github.com/ineedfat/pdfjs)
    *@classdesc Representing a PDF document.
    *@param {string|array} [format=letter] Paper format name or array containing width and height (e.g [width, height])
    *@param {string} [orientation=portrait] Document orientation.
    *@param {array} [margin=[18,18]] Horizontal and vertical margin in points (e.g [horizontal, vertical])
*/
    var doc = function (format, orientation, margin) {
        var self = this;
        this.pageCount = 0;

        this.repeatableElements = [];
        this.templateStreams = [];
        this.svgs = [];
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
            dimension: utils.paperFormat['letter'],
            documentProperties: { 'title': '', 'subject': '', 'author': '', 'keywords': '', 'creator': '' }
        };
        
        //Determine page dimensions.
        if (typeof format === 'string') {
            self.settings.dimension = utils.paperFormat[format.toLowerCase()].slice();
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
    };
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
                options || { mediabox: [0, 0, width || this.settings.dimension[0], height || this.settings.dimension[1]] },
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
        *@param {string} type (datauristring | datauriLstring | datauri | dataurl | dataurlnewwindow)
        *@return {string} PDF data string.
        */
        output: function(type) {

            var content = removeEmptyElement([
                buildPageTreeNodes(this.rootNode),
                buildObjs(this.resObj.fontObjs),
                buildObjs(this.resObj.imageXObjects),
                buildObjs(this.repeatableElements),
                buildObjs(this.svgs),
                this.resObj.out(),
                this.infoObj.out(),
                this.catalogObj.out()
            ]).join('\n');

            var pdf = buildDocument(content, this.catalogObj, this.infoObj);
            switch (type) {
            case 'datauristring':
            case 'dataurlstring':
                return 'data:application/pdf;base64,' + btoa(pdf);
            case 'datauri':
            case 'dataurl':
                document.location.href = 'data:application/pdf;base64,' + btoa(pdf);
                break;
                break;
            case 'dataurlnewwindow':
                window.open('data:application/pdf;base64,' + btoa(pdf));
                break;
            default:
                return pdf;
            }
        },
        /**
        *Output PDF document.
        *@memberof pdfJS.doc#
        *@param {string} type (datauristring | datauriLstring | datauri | dataurl | dataurlnewwindow)
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
                    ['Times-BoldItalic', TIMES, BOLD_ITALIC],
                    ['Symbol', 'symbol', NORMAL],
                    ['ZapfDingbats', 'zapfdingbats', NORMAL],
                ];

            for (var i = 0, l = standardFonts.length; i < l; i++) {
                this.addFont(standardFonts[i][0], standardFonts[i][1], standardFonts[i][2], encoding);
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
        }
    };

    var getOffsets = function (data) {
        if (typeof data !== 'string') {
            throw 'getOffsets expects a string input';
        }

        var ret = [],
            genRegex = /\d+(?=\sobj)/,
            objRegex = /^\d+/,
            matches, i, match,
            searchRegex;
        //let's search the string for all object declaration in data. 
        matches = data.match(/\d+\s\d+\sobj/gim)

        for (i = 0; match = matches[i]; i++) {
            searchRegex = new RegExp('[^\\d]' + match.replace(/\s+/g, '\\s+'));
            ret.push({
                objNum: parseInt(objRegex.exec(match)),
                genNum: parseInt(genRegex.exec(match)),
                offset: data.search(searchRegex)
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

    var buildObjs = function (objs) {
        var i, obj,
            ret = [];
        for (i = 0; obj = objs[i]; i++) {
            ret.push(obj.out());
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
            return a.objNum - b.objNum;
        });

        // Cross-ref
        contentBuilder.push('xref');
        contentBuilder.push('0 ' + (objectCount + 1));
        contentBuilder.push('0000000000 65535 f ');
        for (i = 0; i < objectCount; i++) {
            //TODO: take account for free objects just in case user screw up by allocating an object doesn't use it 
            //within the document.
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
//Create root pageTreeNode before calling catalog.
var catalog = function (rootNode, catalogObj) {
    catalogObj.body = [];
    catalogObj.body.push('<<');

    catalogObj.body.push('/Type /Catalog');
    catalogObj.body.push('/Pages ' + rootNode.objectNumber + ' ' + rootNode.generationNumber + ' R');

    catalogObj.body.push('/PageLayout /OneColumn');

    catalogObj.body.push('>>');

    return catalogObj;
};
var info = function (settings, infoObj) {
    infoObj.body = [];
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

var resources = function (objectNumber, generationNumber) {
    var self = this;
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

            var xImgObjs = printDictionaryElements(this.imageXObjects, 'Im')
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
                    if (typeof style === 'string') {
                        if (font.description.fontName.toLowerCase() === name.toLowerCase() &&
                            font.description.fontStyle.toLowerCase() === style.toLowerCase()) {
                            return font;
                        }
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
        if (!options.hasOwnProperty(item))
            continue;
        obj = options[item];
        switch (item.toLowerCase()) {
            case 'resources':
                if (obj instanceof resources) {
                    ret.push('/Resources ' + obj.objectNumber + ' ' + obj.generationNumber + ' R');
                }
                else if (typeof obj === 'string') {
                    ret.push(obj);
                } else {
                    throw 'Invalid Resources!';
                }
                break;
            case 'mediabox':
                if (checkValidRect(obj)) {
                    ret.push('/MediaBox [' + obj.join(' ') + ']');
                }
                break;
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
    return ret.join('\n');
};


var pageTreeOptionsConverter = function (options) {
    var ret = [],
        obj;
    for (var item in options) {
        if (!options.hasOwnProperty(item))
            continue;
        obj = options[item];
        switch (item.toLowerCase()) {
            //Inheritable
            case 'resources':
                if (obj instanceof resources) {
                    ret.push('/Resources ' + obj.objectNumber + ' ' + obj.generationNumber + ' R');
                }
                else if (typeof obj === 'string') {
                    ret.push(obj);
                } else {
                    throw 'Invalid Resources!';
                }
                break;
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
            case 'rotate':
                if (typeof obj === 'number' && obj % 90 === 0) {
                    ret.push('/Rotate ' + obj);
                }
                break;
            
        }
    }
    return ret.join('\n');
};
var sanitizeRegex = /((\(|\)|\\))/ig;
var sanitize = function(text) {
    return text.replace(sanitizeRegex, '\\$1');
};

var removeEmptyElement = function(arr) {
    var i, l, value, ret = [];
    for (i = 0, l = arr.length; i < l; i++) {
        value = arr[i];
        if (value) {
            ret.push(value);
        }
    }
    return ret;
};

var funcNameRegex = /function (.{1,})\(/;
var getInstanceType = function (o) {
    var results = (funcNameRegex).exec(o.constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
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
doc.prototype.newImage = function (imageData, crossOrigin, resources) {
    var newImage = new imageXObject(++this.objectNumber, 0, 0, 0, utils.colorSpace.deviceRGB, 8, 'DCTDecode');

    analyzeImage.call(this, imageData, newImage, resources || this.resObj, crossOrigin, this);

    return newImage;
};

var analyzeImage = function (image) {
    if (image instanceof HTMLImageElement) {
        processImage.apply(this, [image].concat(Array.prototype.slice.call(arguments, 1, 3)));
    } else if (typeof image === 'string') {
        processImageSource.apply(this, [image].concat(Array.prototype.slice.call(arguments, 1)));
    } else if (image instanceof HTMLCanvasElement) {
        processCanvas.apply(this, [image].concat(Array.prototype.slice.call(arguments, 1, 3)));
    } else {
        throw 'Invalid Image Type';
    }
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

// Algorithm from: http://www.64lines.com/jpeg-width-height
var getJpegSize = function (imgData) {
    var width, height;
    // Verify we have a valid jpeg header 0xff,0xd8,0xff,0xe0,?,?,'J','F','I','F',0x00
    if (!imgData.charCodeAt(0) === 0xff ||
        !imgData.charCodeAt(1) === 0xd8 ||
        !imgData.charCodeAt(2) === 0xff ||
        !imgData.charCodeAt(3) === 0xe0 ||
        !imgData.charCodeAt(6) === 'J'.charCodeAt(0) ||
        !imgData.charCodeAt(7) === 'F'.charCodeAt(0) ||
        !imgData.charCodeAt(8) === 'I'.charCodeAt(0) ||
        !imgData.charCodeAt(9) === 'F'.charCodeAt(0) ||
        !imgData.charCodeAt(10) === 0x00) {
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
            blockLength = imgData.charCodeAt(i) * 256 + imgData.charCodeAt(i + 1)
        }
    }
};
var svg = function (svgStr) {
    var self = this;

    this.content = [];

    if (svgStr) {
        this.setSvg(svgStr);
    }
};

svg.helpers = {
    sanitizePath: function(path) {
        var ret = path.replace(/\s{2,}/gm, ' '); //replace unnecessary white spaces;
        ret = ret.replace(/([A-Za-z])(?=\d)/gm, '$1 '); //separate letter from numbers;
        return ret;
    },
    drawPath: function(path) {
        var pArr = svg.helpers.sanitizePath(path).split(' '),
            val, i, l;
        for (i = 0, l = pArr.length; i < l; i++) {
            val = pArr[i];
            switch(val.toUpperCase()) {
                case 'M':
                    this.moveTo(pArr[++i], pArr[++i]);
                    break;
                case 'L':
                    this.lineTo(pArr[++i], pArr[++i]);
                    break;
                case 'H':
                    this.lineTo(pArr[++i], 0);
                    break;
                case 'V':
                    this.lineTo(0, pArr[++i]);
                    break;
                case 'C':
                    this.bezierCurve(pArr[++i], pArr[++i], pArr[++i], pArr[++i]);
                    console.error('Path Not Supported');
                    break;
                case 'S':
                    this.bezierCurve(pArr[++i], pArr[++i], pArr[++i], pArr[++i]);
                    console.error('Path Not Supported');
                    break;
                case 'Q':
                    this.bezierCurve(pArr[++i], pArr[++i], pArr[++i], pArr[++i]);
                    console.error('Path Not Supported');
                    break;
                case 'T':
                    this.bezierCurve(pArr[++i], pArr[++i], pArr[++i], pArr[++i], pArr[++i], pArr[++i]);
                    console.error('Path Not Supported');
                    break;
                case 'A':
                    i += 4;
                    console.error('Path Not Supported');
                    break;
                case 'Z':
                    this.close();
                    
                    break;
                default:
                    throw 'Invalid Path String!';
            }
        }
    },
    setGenericOpitons: function(name, value) {
        switch(name) {
            case 'stroke-width':
                this.lineWidth(value);
                break;
            case 'stroke':
                //TODO: Convert color name into RGB.
                this.strokeColor(0);
                break;
            case 'fill':
                //TODO: Convert color name into RGB.
                this.fillColor(0);
                break;
        }
    },
    paintSvg: function (attrs, paintIfEmpty) {
        var fill = attrs['fill'],
            stroke = attrs['stroke'];
        
        if (fill && stroke) {
            this.paintPath();
        } else if (fill) {
            this.paintPath('f');
        } else if (stroke) {
            this.paintPath('f');
        } else if (paintIfEmpty) {
            this.paintPath();
        }
    }
};


var svgOperators = {
    SVGSVGElement: 'skip',
    SVGCircleElement: function(circle) {
        var attrs = circle.attributes,
            i, item, 
            r = parseInt(attrs['r'].value).toFixed(2),
            x = attrs['cx'] ? parseInt(attrs['cx'].value).toFixed(2) : 0,
            y = attrs['cy'] ? parseInt(attrs['cy'].value).toFixed(2) : 0,
            sin33Dot31 = (0.5522422 * r).toFixed(2); // sine of 33 deg 31 sec
        this.translate(x, y);
        this.moveTo(0, -1 * r);
        this.bezierCurve(sin33Dot31, -1 * r, r, -1 * sin33Dot31, r, 0);
        this.bezierCurve(r, sin33Dot31, sin33Dot31, r, 0, r);
        this.bezierCurve(-1 * sin33Dot31, r, -1 * r, sin33Dot31, -1 * r, 0);
        this.bezierCurve(-1 * r, -1 * sin33Dot31, -1 * sin33Dot31, -1 * r, 0, -1 * r);
        
        for (i = 0; item = attrs[i]; i++) {
            svg.helpers.setGenericOpitons.call(this, item.name.toLowerCase(), item.value);
            console.log(item.name + ' = ' + item.value);
        }
        svg.helpers.paintSvg.call(this, attrs);
    },
    SVGPathElement: function(path) {
        var attrs = path.attributes,
            i, item, name;
        for (i = 0; item = attrs[i]; i++) {
            name = item.name.toLowerCase();
            svg.helpers.setGenericOpitons.call(this, name, item.value);
            switch(name) {
                case 'd':
                    svg.helpers.drawPath.call(this, item.value);
                    break;
                
                default:
                    console.error(item.name + ' not supported');
                    break;
            }
            console.log(item.name + ' = ' + item.value);
        }
        svg.helpers.paintSvg.call(this, attrs, true);
    }
};


var parseSVG = function (svg) {
    console.log(svg);
    var opt = svgOperators[getInstanceType(svg)];
    if (!opt) {
        console.error('Not Supported SVGElement: ' + getInstanceType(svg));
    }
    if (opt !== 'skip') {
        this.pushState();
        opt.call(this, svg);
        this.popState();
    }
    //Recursively parse the child nodes.
    for (var i = 0, item; item = svg.childNodes[i]; i++) {
        if (item instanceof SVGElement) {
            parseSVG.call(this, item);
        }
    }
};

svg.prototype = {
    setSvg: function(svg) {
        var pSvg;
        if (svg instanceof SVGSVGElement) {
            var pSvg = parseSVG.call(this, svg);
        } else {
            throw 'Element is not an SVGSVGElement';
        }
    },
    push: function (args) {
        Array.prototype.push.apply(this.content, arguments);
        return this;
    }
};

mixin(svg, textOperators);
mixin(svg, graphicOperators);
//Public
/**
@namespace
*/
var pdfJS = {
    doc: function (format, orientation, margin) {
        var pdf = new doc(format, orientation, margin);
        return {
            objNum: function() {
                pdf.objNumber.apply(pdf, arguments);
            },
            currentPage: function () { return pdf.page.apply(pdf, arguments); },
            createObj: function () { return pdf.newObj.apply(pdf, arguments); },
            createStream: function () { return pdf.newStream.apply(pdf, arguments); },
            addPage: function () { return pdf.addPage.apply(pdf, arguments); },
            addRepeatableElement: function () {
                return pdf.addRepeatableElement.apply(pdf, arguments);
            },
            addRepeatableTemplate: function () {
                return pdf.addRepeatableTemplate.apply(pdf, arguments);
            },
            root: function () { return pdf.rootNode.apply(pdf, arguments); },
            output: function () { return pdf.output.apply(pdf, arguments); },
            outputAsync: function () { return pdf.outputAsync.apply(pdf, arguments); },
            addFont: function () { return pdf.addFont.apply(pdf, arguments); },
            newImage: function () { return pdf.newImage.apply(pdf, arguments); }
        };
    },
    svg: svg,
    obj: obj,
    pageTreeNode: pageTreeNode,
    utils: utils,
};

_.pdfJS = pdfJS;
}(window));