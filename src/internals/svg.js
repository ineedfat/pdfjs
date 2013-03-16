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