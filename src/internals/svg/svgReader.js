var svgReader = function (stream, doc) {
    statesTracker.call(this);
    this.doc = doc;
    this.stream = stream;
    this.states = {currentElementStack: []}; //Keep the state current state of the pdf.
    this.textCurrentPoint = { x: 0, y: 0 };
    this.currentPoint = {};
    this.lastCP = {};
};

svgReader.prototype = {
    parseSVG: function (svgElement) {
        var opt = svgReader.elements[utils.getInstanceType(svgElement)],
            temp;
        if (!opt) {
            console.error('Not Supported SVGElement: ' + utils.getInstanceType(svgElement));
            return;
        }
        if (opt !== 'skip') {
            this.stream.pushState();
            temp = utils.clone(this.getCurrentSvgElement());
            temp.element = svgElement;
            this.states.currentElementStack.push(temp);
            if (temp) {
                if (temp.fill) {
                    this.stream.fillColor.call(this.stream, temp.fill.r, temp.fill.g, temp.fill.b);
                }
                if (temp.stroke) {
                    this.stream.fillColor.call(this.stream, temp.stroke.r, temp.stroke.g, temp.stroke.b);
                }
            }
            opt.call(this, svgElement);
            this.states.currentElementStack.pop();
            this.stream.popState();
        } else {
            this.processChildNodes( svgElement);
        }
    
    },
    drawSvg: function (svg) {
        if (svg instanceof SVGSVGElement) {
            this.stream.pushState();
            this.stream.fillColor(0, 0, 0);
            this.stream.strokeColor(0, 0, 0);
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
        Array.prototype.push.apply(this.stream.content, arguments);
        return this;
    },
    getCurrentSvgElement: function() {
        return this.states.currentElementStack[this.states.currentElementStack.length - 1] || {};
    },
};

mixin(svgReader, svgParser);
mixin(svgReader, statesTracker.prototype);
