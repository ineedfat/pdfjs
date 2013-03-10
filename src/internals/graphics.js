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
        this.content.push('1 0 0 1 ' + tx + ' ' + ty + ' cm');
    },
    /**
    
    *@inner
    *@method
    *@param {int} sx Scale by tx in x direction.
    *@param {int} sy Scale by ty in y direction.
    
    */
    scale: function (sx, sy) {
        this.content.push(sx + ' 0 0 ' + sy + ' 0 0 cm');
    },
    /**
    
    *@inner
    *@method
    *@param {int} theta Rotate by theta.
    
    */
    rotate: function (theta) {
        var cos = Math.cos(theta),
            sin = Math.sin(theta);
        this.content.push(cos + ' ' + sin + ' -' + sin + ' ' + cos + ' 0 0 cm');
    },
    /**
   
   *@inner
   *@method
   *@param {int} alphaX Skew horizontally.
   *@param {int} betaY Skew vertically.
   
   */
    skew: function (alphaX, betaY) {
        this.content.push('1 ' + Math.tan(alphaX) + ' ' + Math.tan(betaY) + ' 1 0 0 cm');
    },
    /**
    
    *@inner
    *@method
    *@param {int} width Set line thickness by lineWidth in pt. Valid Value: Non-negative number.
    A value of zero means the thinnest line a device can print/render;
    therefore setting the value to zero is a device-dependent operation, not recommended'
    
    */
    lineWidth: function (width) {
        this.content.push(width + ' w');
    },
    /**
    
    *@inner
    *@method
    *@param {int} capStyle See [lineCapStyle]{@link pdfJS.utils.lineCapStyle} for valid values.
    
    */
    lineCap: function (capStyle) {
        this.content.push(capStyle + ' J');
    },
    /**
    
    *@inner
    *@method
    *@param {int} joinStyle See [lineCapStyle]{@link pdfJS.utils.lineJoinStyle} for valid values.
    
    */
    lineJoin: function (joinStyle) {
        this.content.push(joinStyle + ' j');
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
        this.content.push(limit + ' M');
    },
    /**
    The line dash pattern controls the pattern of dashes and gaps used to stroke paths .
    *@inner
    *@method
    *@param {int} dashArray Refer to Adobe's PDF Reference v1.3 for more details
    *@param {int} dashPhase Refer to Adobe's PDF Reference v1.3 for more details
    
    */
    dashPattern: function (dashArray, dashPhase) {
        this.content.push(dashArray + ' ' + dashPhase + ' d');
    },
    /**
    Set the color rendering intent in the graphics state .
    *@inner
    *@method
    *@param {int} intent See [renderingIntentOption]{@link pdfJS.utils.renderingIntentOption} for valid values.
    
    */
    renderingIntent: function (intent) {
        this.content.push(intent + ' ri');
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
        this.content.push('q');
    },
    /**
    *Restore the graphics state by removing the most recently saved state from
the stack and making it the current state .
    *@inner
    *@method
    
    */
    popState: function () {
        this.content.push('Q');
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
        if (arguments.length != 4) {
            throw 'Invalid new path parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.content.push(args.join(' ') + ' m');
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
        if (arguments.length != 4) {
            throw 'Invalid straight line  parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.content.push(args.join(' ') + ' l');
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
                this.content.push(args.join(' ') + ' v');
                break;
            case 5:
                this.content.push(args.slice(0, 4).join(' ') + ' y');
                break;
            case 6:
                this.content.push(args.join(' ') + ' c');
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
        this.content.push('h');
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
            this.content.push(operator);
        } else {
            //By default, paint both stroke and fill.
            this.content.push('B');
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
        this.content.push('S');
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
    fillPath: function () {
        //By default, paint both stroke and fill.
        this.content.push('F');
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
        this.content.push('W' + (asterisk ? ' *' : ''));
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
        this.content.push(args.join(' ') + ' re');
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
                    this.content.push('/DeviceGray cs');
                    this.activeFillCS = 'DeviceGray';
                }
                break;
            case 3:
                if (this.activeFillCS !== 'DeviceRGB') {
                    this.content.push('/DeviceRGB cs');
                    this.activeFillCS = 'DeviceRGB';
                }
                break;
            default:
                throw ('Invalid color values');
        }
        var args = Array.prototype.slice.call(arguments);
        this.content.push(args.join(' ') + ' sc');
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
                    this.content.push('/DeviceGray CS');
                    this.activeStrokeCS = 'DeviceGray';
                }
                break;
            case 3:
                if (this.activeStrokeCS !== 'DeviceRGB') {
                    this.content.push('/DeviceRGB CS');
                    this.activeStrokeCS = 'DeviceRGB';
                }
            default:
                throw ('Invalid color values');
        }

        var args = Array.prototype.slice.call(arguments);
        this.content.push(args.join(' ') + ' SC');
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
        if (!w && !h) {
            w = -96;
            h = -96;
        }
        if (w < 0) {
            w = (-1) * imgXObj.width * 72 / w;
        }
        if (h < 0) {
            h = (-1) * imgXObj.height * 72 / h;
        }
        if (w === 0) {
            w = h * imgXObj.width / imgXObj.height;
        }
        if (h === 0) {
            h = w * imgXObj.height / imgXObj.width;
        }

        this.content.push('q');
        this.content.push(w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + (y + h).toFixed(2) + ' cm');
        this.content.push('/' + imgXObj.name + ' Do');
        this.content.push('Q');

        return this;
    }
};