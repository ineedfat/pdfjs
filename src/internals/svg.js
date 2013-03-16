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
    drawPath: function (path) {
        var self = this;
        var pArr = svg.helpers.sanitizePath(path).split(' '),
            val, i, l,
            currentPoint = {},
            lastCP = {};

        var quadraticToCubicBezier = function (q0x, q0y, q1x, q1y, q2x, q2y) {
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

            self.bezierCurve(xq1, yq1, xq2, yq2, q2x, q2y);
            currentPoint = { x: q2x, y: q2y };
            lastCP = { x: q1x, y: q1y };
        };

        var computePointReflection = function(pt, relativePt) {
            return { x: 2 * (relativePt.x) - pt.x, y: 2 * (relativePt.y) - pt.y };
        };
        for (i = 0, l = pArr.length; i < l; i++) {
            val = pArr[i];
            if (val !== 'T' && val !== 'Q' && val !== 't' && val !== 'q') {
                lastCP = {};
            }
            switch(val) {
                case 'M':
                    while (parseFloat(pArr[i + 1])) {
                        currentPoint.x = pArr[++i];
                        currentPoint.y = pArr[++i];
                        this.moveTo(currentPoint.x, currentPoint.y);
                    }
                    break;
                case 'L':
                    while (parseFloat(pArr[i + 1])) {
                        currentPoint.x = pArr[++i];
                        currentPoint.y = pArr[++i];
                        this.lineTo(currentPoint.x, currentPoint.y);
                    }
                    break;
                case 'H':
                    while (parseFloat(pArr[i + 1])) {
                        currentPoint.x = pArr[++i];
                        this.lineTo(currentPoint.x, 0);
                    }
                    break;
                case 'V':
                    while (parseFloat(pArr[i + 1])) {
                        currentPoint.y = pArr[++i];
                        this.lineTo(0, currentPoint.y);
                    }
                    break;
                case 'C':
                    while (parseFloat(pArr[i + 1])) {
                        this.bezierCurve(pArr[++i], pArr[++i], pArr[++i], pArr[++i], currentPoint.x = pArr[++i], currentPoint.y = pArr[++i]);
                    }
                    break;
                case 'S':
                    while (parseFloat(pArr[i + 1])) {
                        this.bezierCurve(pArr[++i], pArr[++i], currentPoint.x = pArr[++i], currentPoint.y = pArr[++i]);
                    }
                    break;
                case 'Q':
                    while (parseFloat(pArr[i + 1])) {
                        quadraticToCubicBezier(currentPoint.x, currentPoint.y, pArr[++i], pArr[++i], pArr[++i], pArr[++i]);
                    }
                    break;
                case 'T':
                    var newCP;
                    while (parseFloat(pArr[i + 1])) {
                        if (lastCP.x || lastCP.y) {
                            newCP = computePointReflection(lastCP, currentPoint);
                        } else {
                            newCP = {};
                            newCP.x = currentPoint.x;
                            newCP.y = currentPoint.y;
                        }
                        quadraticToCubicBezier(currentPoint.x, currentPoint.y, newCP.x, newCP.y, pArr[++i], pArr[++i]);
                    }
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
                if (value.toLowerCase() !== 'none') {
                    this.strokeColor(0);
                }
                break;
            case 'fill':
                //TODO: Convert color name into RGB.
                if (value.toLowerCase() !== 'none') {
                    this.fillColor(0);
                }
                break;
        }
    },
    paintSvg: function (attrs, paintIfEmpty) {
        var fill = attrs['fill'],
            stroke = attrs['stroke'];
        var isFillNone = fill ? fill.value.toLowerCase() === 'none' : false;
        var isStrokeNone = stroke ? stroke.value.toLowerCase() === 'none' : false;
        if (fill && stroke && !isFillNone && !isStrokeNone) {
            this.paintPath();
        } else if (fill && !isFillNone) {
            this.paintPath('f');
        } else if (stroke && !isStrokeNone) {
            this.paintPath('s');
        } else if (paintIfEmpty && !fill && !stroke) {
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