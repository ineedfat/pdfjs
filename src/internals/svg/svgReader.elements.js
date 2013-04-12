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
            r = Math.abs(parseInt(attrs['r'].value)).toFixed(2),
            x = attrs['cx'] ? parseInt(attrs['cx'].value).toFixed(2) : 0,
            y = attrs['cy'] ? parseInt(attrs['cy'].value).toFixed(2) : 0,
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
            rx = Math.abs(parseInt(attrs['rx'].value)).toFixed(2),
            ry = Math.abs(parseInt(attrs['ry'].value)).toFixed(2),
            x = attrs['cx'] ? parseInt(attrs['cx'].value).toFixed(2) : 0,
            y = attrs['cy'] ? parseInt(attrs['cy'].value).toFixed(2) : 0,
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