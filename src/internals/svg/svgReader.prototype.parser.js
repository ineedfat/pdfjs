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
                    } while (next || next === 0)
                    break;
                case 'L':
                    do {
                        this.currentPoint.x = parseFloat(pArr[++i]);
                        this.currentPoint.y = parseFloat(pArr[++i]);
                        this.stream.lineTo(this.currentPoint.x, this.currentPoint.y);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0)
                    break;
                case 'H':
                    do {
                        this.currentPoint.x = parseFloat(pArr[++i]);
                        this.stream.lineTo(this.currentPoint.x, 0);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0)
                    break;
                case 'V':
                    do {
                        this.currentPoint.y = parseFloat(pArr[++i]);
                        this.stream.lineTo(0, this.currentPoint.y);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0)
                    break;
                case 'C':
                    do {
                        this.stream.bezierCurve(pArr[++i], pArr[++i], pArr[++i], pArr[++i], this.currentPoint.x = pArr[++i], this.currentPoint.y = pArr[++i]);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0)
                    break;
                case 'S':
                    do {
                        this.stream.bezierCurve(pArr[++i], pArr[++i], this.currentPoint.x = pArr[++i], this.currentPoint.y = pArr[++i]);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0)
                    break;
                case 'Q':
                    do {
                        svgReader.utils.quadraticToCubicBezier.call(this, this.currentPoint.x, this.currentPoint.y, pArr[++i], pArr[++i], pArr[++i], pArr[++i]);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0)
                    break;
                case 'T':
                    var newCP;
                    next = parseFloat(pArr[i + 1]);
                    do {
                        if (this.lastCP.x || this.lastCP.y) {
                            newCP = svgReader.utils.computePointReflection.call(this, this.lastCP, this.currentPoint);
                        } else {
                            newCP = {};
                            newCP.x = this.currentPoint.x;
                            newCP.y = this.currentPoint.y;
                        }
                        svgReader.utils.quadraticToCubicBezier.call(this, this.currentPoint.x, this.currentPoint.y, newCP.x, newCP.y, pArr[++i], pArr[++i]);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0)
                    break;
                case 'A':
                    var x1, y1, x2, y2, fa, fs, rx, ry, phi;
                    do {
                        rx = parseFloat(pArr[++i]);
                        ry = parseFloat(pArr[++i]);
                        phi = parseFloat(pArr[++i]);
                        fa = parseInt(pArr[++i]);
                        fs = parseInt(pArr[++i]);
                        x2 = parseFloat(pArr[++i]);
                        y2 = parseFloat(pArr[++i]);
                        x1 = this.currentPoint.x;
                        y1 = this.currentPoint.y;

                        this.currentPoint.x = x2;
                        this.currentPoint.y = y2;
                        if (!rx || !ry) {
                            this.stream.lineTo(x2, y2);
                            return;
                        }
                        var c = svgReader.utils.computeArc.call(this, x1, y1, rx, ry, phi, fa, fs, x2, y2, this);
                        var arc = new ellipticalArc(c.cx, c.cy, c.rx, c.ry, phi, c.theta, c.theta + c.dTheta, false);
                        arc.buildEllipticalArc(3, 0.01, this);
                        next = parseFloat(pArr[i + 1]);
                    } while (next || next === 0)
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
                                    this.stream.translate(-this.textCurrentPoint.x, -this.textCurrentPoint.y);
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
        
        if (!cssStyles)
            return;
        
        cssStyles = cssStyles.map(function (aItem, index, arr) {
            var splits = aItem.split(':');
            if (splits.length != 2)
                return { name: 'IgnoreObject' };

            return { name: splits[0].trim(), value: splits[1].trim() };
        });
        
        for (i = 0; item = cssStyles[i]; i++) {
            this.setCssOption( item.name.toLowerCase(), item.value);
        }
    },
    setCssOption: function (name, value) {
        if (!name) {
            return;
        }
        switch (name.toLowerCase()) {
            case 'font-size':
                this.stream.fontSize(parseInt(value));
                break;
            case 'color':
            case 'fill':
                this.setGenericOption( 'fill', value);
                break;
        }
    },
    setTextOptions: function (attrs) {
        var i, item;
        for (i = 0; item = attrs[i]; i++) {
            this.setTextOption( item.name.toLowerCase(), item.value);
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