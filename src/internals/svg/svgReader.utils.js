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