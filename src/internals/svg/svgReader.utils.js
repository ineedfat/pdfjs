svgReader.utils = {
    sanitizePath: function(path) {
        var ret = path.replace(/\s{2,}/gm, ' '); //replace unnecessary white spaces;
        ret = ret.replace(/([A-Za-z])(?=\d)/gm, '$1 ').trim(); //separate letter from numbers;
        return ret;
    },
    quadraticToCubicBezier: function (q0x, q0y, q1x, q1y, q2x, q2y) {
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

        this.stream.bezierCurve(xq1, yq1, xq2, yq2, q2x, q2y);
        this.currentPoint = { x: q2x, y: q2y };
        this.this.lastCP = { x: q1x, y: q1y };
    },
    computeArc: function(x0, y0, rx, ry, angle, largeArcFlag, sweepFlag, x, y, stream) {
        //Computing arc based on SVG specification note. http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes

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

        var angleStart = utils.radsToDegrees(sign * Math.acos(p / n));

        n = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
        p = ux * vx + uy * vy;

        sign = ((ux * vy - uy * vx) < 0) ? -1.0 : 1.0;

        var angleExtent = utils.radsToDegrees(sign * Math.acos(p / n));
        if (!sweepFlag && angleExtent > 0) {
            angleExtent -= 360.0;
        } else if (sweepFlag && angleExtent < 0) {
            angleExtent += 360.0;
        }

        angleExtent %= 360.0;
        angleStart %= 360.0;
        stream.pushState();
        stream.fillColor(.5);
        stream.translate(0, 0);
        stream.beginText('F1', null, 22);
        stream.textPosition(cx, cy);
        stream.print('Center');
        stream.endText();
        stream.popState();
        stream.pushState();
        stream.fillColor(.5);
        stream.translate(0, 0);
        stream.beginText('F1', null, 22);
        stream.textPosition(x, y);
        stream.print('End');
        stream.endText();
        stream.popState();
        stream.pushState();
        stream.fillColor(.5);
        stream.translate(0, 0);
        stream.beginText('F1', null, 22);
        stream.textPosition(x0, y0);
        stream.print('Start');
        stream.endText();
        stream.popState();
        return {
            cx: cx,
            cy: cy,
            rx: rx,
            ry: ry,
            phi: angle,
            x: x,
            y: y,
            theta: utils.degreesToRads(angleStart + 360.0),
            dTheta: utils.degreesToRads(angleExtent + 360.0)
        };
    },
    ellipseArcToCubicBezier: function (cx, cy, rx, ry, phi, theta, dTheta) {
        var theta1 = theta;
        var theta2 = theta + Math.abs(dTheta);

        var nP1 = Math.atan2(Math.sin(theta1) / ry, Math.cos(theta1) / rx);
        var nP2 = Math.atan2(Math.sin(theta2) / ry, Math.cos(theta2) / rx);

        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var cosnP1 = Math.cos(nP1);
        var sinnP1 = Math.sin(nP1);

        var cosnP2 = Math.cos(nP2);
        var sinnP2 = Math.sin(nP2);

        var alpha = Math.sin(nP2 - nP1) * ((Math.sqrt(4 + 3 * Math.pow(Math.tan((nP2 - nP1) / 2),2)) - 1) / 3);

        var p1XDerivative = -1 * cosPhi * sinnP1 - ry * sinPhi * cosnP1;
        var p1YDerivative = -1 * sinPhi * sinnP1 + ry * cosPhi * cosnP1;

        var p2XDerivative = -1 * cosPhi * sinnP2 - ry * sinPhi * cosnP2;
        var p2YDerivative = -1 * sinPhi * sinnP2 + ry * cosPhi * cosnP2;

        var p1X = cx + (rx * cosPhi * cosnP1) - (ry * sinPhi * sinnP1);
        var p1Y = cy + (rx * sinPhi * cosnP1) + (ry * cosPhi * sinnP1);
        var p2X = cx + (rx * cosPhi * cosnP2) - (ry * sinPhi * sinnP2);
        var p2Y = cy + (rx * sinPhi * cosnP2) + (ry * cosPhi * sinnP2);

        var q1X = p1X + alpha * p1XDerivative;
        var q1Y = p1Y + alpha * p1YDerivative;

        var q2X = p2X + alpha * p2XDerivative;
        var q2Y = p2Y + alpha * p2YDerivative;
        this.stream.bezierCurve(q1X, q1Y, q2X, q2Y, p2X, p2Y);

    },
    computePointReflection: function(pt, relativePt) {
        return { x: 2 * (relativePt.x) - pt.x, y: 2 * (relativePt.y) - pt.y };
    },
    
};