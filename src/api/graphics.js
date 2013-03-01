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
        this.currentStream.push('1 0 0 1 ' + tx + ' ' + ty + ' cm');
    },
    /**
    
    *@inner
    *@method
    *@param {int} sx Scale by tx in x direction.
    *@param {int} sy Scale by ty in y direction.
    
    */
    scale: function (sx, sy) {
        this.currentStream.push(sx + ' 0 0 ' + sy + ' 0 0 cm');
    },
    /**
    
    *@inner
    *@method
    *@param {int} theta Rotate by theta.
    
    */
    rotate: function (theta) {
        var cos = Math.cos(theta),
            sin = Math.sin(theta);
        this.currentStream.push(cos + ' ' + sin + ' -' + sin + ' ' + cos + ' 0 0 cm');
    },
    /**
   
   *@inner
   *@method
   *@param {int} alphaX Skew horizontally.
   *@param {int} betaY Skew vertically.
   
   */
    skew: function (alphaX, betaY) {
        this.currentStream.push('1 ' + Math.tan(alphaX) + ' ' + Math.tan(betaY) + ' 1 0 0 cm');
    },
    /**
    TODO: Implement
   *@inner
   *@method
   
   */
    colorSpace: function () {
    },
    /**
    TODO: Implement
   *@inner
   *@method
   
   */
    color: function () {
    },
    /**
    TODO: Implement
   *@inner
   *@method
   
   */
    textState: function () {
    },
    /**
    
    *@inner
    *@method
    *@param {int} width Set line thickness by lineWidth in pt. Valid Value: Non-negative number.
    A value of zero means the thinnest line a device can print/render;
    therefore setting the value to zero is a device-dependent operation, not recommended'
    
    */
    lineWidth: function (width) {
        this.currentStream.push(width + ' w');
    },
    /**
    
    *@inner
    *@method
    *@param {int} capStyle See [lineCapStyle]{@link pdfJS.utils.lineCapStyle} for valid values.
    
    */
    lineCap: function (capStyle) {
        this.currentStream.push(capStyle + ' J');
    },
    /**
    
    *@inner
    *@method
    *@param {int} joinStyle See [lineCapStyle]{@link pdfJS.utils.lineJoinStyle} for valid values.
    
    */
    lineJoin: function (joinStyle) {
        this.currentStream.push(joinStyle + ' j');
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
        this.currentStream.push(limit + ' M');
    },
    /**
    The line dash pattern controls the pattern of dashes and gaps used to stroke paths .
    *@inner
    *@method
    *@param {int} dashArray Refer to Adobe's PDF Reference v1.3 for more details
    *@param {int} dashPhase Refer to Adobe's PDF Reference v1.3 for more details
    
    */
    dashPattern: function (dashArray, dashPhase) {
        this.currentStream.push(dashArray + ' ' + dashPhase + ' d');
    },
    /**
    Set the color rendering intent in the graphics state .
    *@inner
    *@method
    *@param {int} intent See [renderingIntentOption]{@link pdfJS.utils.renderingIntentOption} for valid values.
    
    */
    renderingIntent: function (intent) {
        this.currentStream.push(intent + ' ri');
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
        this.currentStream.push('q');
    },
    /**
    *Restore the graphics state by removing the most recently saved state from
the stack and making it the current state .
    *@inner
    *@method
    
    */
    popState: function () {
        this.currentStream.push('Q');
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
    newSubPath: function (x, y) {
        if (arguments.length != 4) {
            throw 'Invalid new path parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' m');
    },
    /**
    *Append a straight line segment from the current point to the point
(x, y). The new current point is (x, y). .
    *@inner
    *@method
    
    *@param {int} x
    *@param {int} y
    */
    straightLine: function (x, y) {
        if (arguments.length != 4) {
            throw 'Invalid straight line  parameters';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' l');
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
        this.currentStream.push('h');
    },
    /*Path Controls END*/
    /**
    *Append a rectangle to the current path as a complete subpath, with
lower-left corner (x, y) and dimensions width and height in user
space. .
    *@inner
    *@method
    
    *@param {int} operator See [renderingIntentOption]{@link pdfJS.utils.renderingIntentOption} for valid values.
    */
    paintPath: function (operator) {
        this.currentStream.push(operator);
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
        this.currentStream.push('W' + (asterisk ? ' *' : ''));
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
        this.currentStream.push(args.join(' ') + ' re');
    },
    /*Color Controls Begin */
    /*Path Controls END*/
    /**
    *Set the color space to use for nonstroking operations. The operand
name must be a name object. If the color space is one that can be specified by a
name and no additional parameters (DeviceGray, DeviceRGB, and DeviceCMYK). .
    *@inner
    *@param {pdfJS.utils.colorSpace | string} name See [colorSpace]{@link pdfJS.utils.colorSpace} for valid values.
    *@method
    
    */
    fillColorSpace: function (name) {
        this.currentStream.push(name + ' cs')
    },
    /**
    *Set the color space to use for stroking operations. The operand
name must be a name object. If the color space is one that can be specified by a
name and no additional parameters (DeviceGray, DeviceRGB, and DeviceCMYK). .
    *@inner
    *@param {pdfJS.utils.colorSpace | string} name See [colorSpace]{@link pdfJS.utils.colorSpace} for valid values.
    *@method
    
    */
    strokeColorSpace: function (name) {
        this.currentStream.push(name + ' CS')
    },
    /**
    *Set the color space to use for non-stroking operations. The operand
name must be a name object. If the color space is one that can be specified by a
name and no additional parameters (DeviceGray, DeviceRGB, and DeviceCMYK). .
    *@inner
    *@param {int} colorValue1 See [colorSpace]{@link pdfJS.utils.colorSpace} required value for each specified color space.
    *@param {int} colorValue2 
    *@param {int} colorValue3 
    *@param {int} colorValue4 
    *@method
    
    */
    fillColor: function (colorValue1, colorValue2, colorValue3, colorValue4) {
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
    /**
    *Set the color space to use for stroking operations. The operand
name must be a name object. If the color space is one that can be specified by a
name and no additional parameters (DeviceGray, DeviceRGB, and DeviceCMYK) .
    *@inner
    *@param {int} colorValue1 See [colorSpace]{@link pdfJS.utils.colorSpace} required value for each specified color space.
    *@param {int} colorValue2 
    *@param {int} colorValue3 
    *@param {int} colorValue4 
    *@method
    
    */
    strokeColor: function (colorValue1, colorValue2, colorValue3, colorValue4) {
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
    /**
    *Shortcut for setting both the color space and color value(s) at the same time for non-stroking operations .
    *@inner
    *@param {int} value See [colorSpace]{@link pdfJS.utils.colorSpace} required value for each specified color space.
    *@method
    
    */
    grayFill: function (value) {
        this.currentStream.push(value + ' g');
    },
    /**
    *Shortcut for setting both the color space and color value(s) at the same time for stroking operations .
    *@inner
    *@param {int} value See [colorSpace]{@link pdfJS.utils.colorSpace} required value for each specified color space.
    *@method
    
    */
    grayStroke: function (value) {
        this.currentStream.push(value + ' G');
    },
    /**
    *Shortcut for setting both the color space and color value(s) at the same time for non-stroking operations .
    *@inner
    *@param {int} r set red channel color value. See [colorSpace]{@link pdfJS.utils.colorSpace} required value for each specified color space.
    *@param {int} g set green channel color value.
    *@param {int} b set blue channel color value. 
    *@method
    
    */
    rgbFill: function (r, g, b) {
        if (arguments.length != 3) {
            throw 'Invalid RGB color values';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' rg');
    },
    /**
    *Shortcut for setting both the color space and color value(s) at the same time for stroking operations .
    *@inner
    *@param {int} r set red channel color value. See [colorSpace]{@link pdfJS.utils.colorSpace} required value for each specified color space.
    *@param {int} g set green channel color value.
    *@param {int} b set blue channel color value. 
    *@method
    
    */
    rgbStroke: function () {
        if (arguments.length != 3) {
            throw 'Invalid RGB color values';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' RG');
    },
    /**
    *Shortcut for setting both the color space and color value(s) at the same time for stroking operations .
    *@inner
    *@param {int} c set cryan channel color value. See [colorSpace]{@link pdfJS.utils.colorSpace} required value for each specified color space.
    *@param {int} g set magenta channel color value.
    *@param {int} b set yellow channel color value. 
    *@param {int} k set black channel color value. 
    *@method
    
    */
    cmykFill: function () {
        if (arguments.length != 4) {
            throw 'Invalid CMYK color values';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' k');
    },
    /**
    *Shortcut for setting both the color space and color value(s) at the same time for stroking operations .
    *@inner
    *@param {int} c set cryan channel color value. See [colorSpace]{@link pdfJS.utils.colorSpace} required value for each specified color space.
    *@param {int} g set magenta channel color value.
    *@param {int} b set yellow channel color value. 
    *@param {int} k set black channel color value. 
    *@method
    
    */
    cmykStroke: function () {
        if (arguments.length != 4) {
            throw 'Invalid CMYK color values';
        }
        var args = Array.prototype.slice.call(arguments);
        this.currentStream.push(args.join(' ') + ' K');
    }
    /*Color Controls End*/

};