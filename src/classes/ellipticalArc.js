var ellipticalArc;
(function () {
    // coefficients for error estimation
    // while using quadratic Bézier curves for approximation
    // 0 < b/a < 1/4
    var coeffs2Low =
    [
        [
            [3.92478, -13.5822, -0.233377, 0.0128206],
                [-1.08814, 0.859987, 0.000362265, 0.000229036],
            [-0.942512, 0.390456, 0.0080909, 0.00723895],
            [-0.736228, 0.20998, 0.0129867, 0.0103456]
        ],
        [
            [-0.395018, 6.82464, 0.0995293, 0.0122198],
            [-0.545608, 0.0774863, 0.0267327, 0.0132482],
            [0.0534754, -0.0884167, 0.012595, 0.0343396],
            [0.209052, -0.0599987, -0.00723897, 0.00789976]
        ]
    ];

    // coefficients for error estimation
    // while using quadratic Bézier curves for approximation
    // 1/4 <= b/a <= 1
    var coeffs2High = [
        [
            [0.0863805, -11.5595, -2.68765, 0.181224],
            [0.242856, -1.81073, 1.56876, 1.68544],
            [0.233337, -0.455621, 0.222856, 0.403469],
            [0.0612978, -0.104879, 0.0446799, 0.00867312]
        ],
        [
            [0.028973, 6.68407, 0.171472, 0.0211706],
            [0.0307674, -0.0517815, 0.0216803, -0.0749348],
            [-0.0471179, 0.1288, -0.0781702, 2.0],
            [-0.0309683, 0.0531557, -0.0227191, 0.0434511]
        ]
    ];

    // safety factor to convert the "best" error approximation
    // into a "max bound" error
    var safety2 = [0.02, 2.83, 0.125, 0.01];

    // coefficients for error estimation
    // while using cubic Bézier curves for approximation
    // 0 < b/a < 1/4
    var coeffs3Low = [
        [
            [3.85268, -21.229, -0.330434, 0.0127842],
            [-1.61486, 0.706564, 0.225945, 0.263682],
            [-0.910164, 0.388383, 0.00551445, 0.00671814],
            [-0.630184, 0.192402, 0.0098871, 0.0102527]
        ],
        [
            [-0.162211, 9.94329, 0.13723, 0.0124084],
            [-0.253135, 0.00187735, 0.0230286, 0.01264],
            [-0.0695069, -0.0437594, 0.0120636, 0.0163087],
            [-0.0328856, -0.00926032, -0.00173573, 0.00527385]
        ]
    ];

    // coefficients for error estimation
    // while using cubic Bézier curves for approximation
    // 1/4 <= b/a <= 1
    var coeffs3High = [
        [
            [0.0899116, -19.2349, -4.11711, 0.183362],
            [0.138148, -1.45804, 1.32044, 1.38474],
            [0.230903, -0.450262, 0.219963, 0.414038],
            [0.0590565, -0.101062, 0.0430592, 0.0204699]
        ],
        [
            [0.0164649, 9.89394, 0.0919496, 0.00760802],
            [0.0191603, -0.0322058, 0.0134667, -0.0825018],
            [0.0156192, -0.017535, 0.00326508, -0.228157],
            [-0.0236752, 0.0405821, -0.0173086, 0.176187]
        ]
    ];

    // safety factor to convert the "best" error approximation
    // into a "max bound" error
    var safety3 = [0.001, 4.98, 0.207, 0.0067];
    /** Compute the value of a rational function.
     * This method handles rational functions where the numerator is
     * quadratic and the denominator is linear
     * @param x absissa for which the value should be computed
     * @param c coefficients array of the rational function
     */
    var rationalFunction = function (x, c) {
        return (x * (x * c[0] + c[1]) + c[2]) / (x + c[3]);
    };
    var estimateError = function (degree, etaA, etaB, theta, a, b, cx, cy) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        var x;
        var eta = 0.5 * (etaA + etaB);
        if (degree < 2) {

            // start point
            var aCosEtaA = a * Math.cos(etaA);
            var bSinEtaA = b * Math.sin(etaA);
            var xA = cx + aCosEtaA * cosTheta - bSinEtaA * sinTheta;
            var yA = cy + aCosEtaA * sinTheta + bSinEtaA * cosTheta;

            // end point
            var aCosEtaB = a * Math.cos(etaB);
            var bSinEtaB = b * Math.sin(etaB);
            var xB = cx + aCosEtaB * cosTheta - bSinEtaB * sinTheta;
            var yB = cy + aCosEtaB * sinTheta + bSinEtaB * cosTheta;

            // maximal error point
            var aCosEta = a * Math.cos(eta);
            var bSinEta = b * Math.sin(eta);
            x = cx + aCosEta * cosTheta - bSinEta * sinTheta;
            var y = cy + aCosEta * sinTheta + bSinEta * cosTheta;

            var dx = xB - xA;
            var dy = yB - yA;

            return Math.abs(x * dy - y * dx + xB * yA - xA * yB)
                 / Math.sqrt(dx * dx + dy * dy);

        }
        else {

            x = b / a;
            var dEta = etaB - etaA;
            var cos2 = Math.cos(2 * eta);
            var cos4 = Math.cos(4 * eta);
            var cos6 = Math.cos(6 * eta);

            // select the right coeficients set according to degree and b/a
            var coeffs;
            var safety;
            if (degree == 2) {
                coeffs = (x < 0.25) ? coeffs2Low : coeffs2High;
                safety = safety2;
            } else {
                coeffs = (x < 0.25) ? coeffs3Low : coeffs3High;
                safety = safety3;
            }

            var c0 = rationalFunction(x, coeffs[0][0])
               + cos2 * rationalFunction(x, coeffs[0][1])
               + cos4 * rationalFunction(x, coeffs[0][2])
               + cos6 * rationalFunction(x, coeffs[0][3]);

            var c1 = rationalFunction(x, coeffs[1][0])
               + cos2 * rationalFunction(x, coeffs[1][1])
               + cos4 * rationalFunction(x, coeffs[1][2])
               + cos6 * rationalFunction(x, coeffs[1][3]);

            return rationalFunction(x, safety) * a * Math.exp(c0 + c1 * dEta);
        }
    };
    //Access outside of closure
    ellipticalArc = function (cx, cy, a, b, theta, lambda1, lambda2, isPieSlice) {
        var twoPi = 2 * Math.PI;
        //lambda1 = (lambda1);
        //lambda2 = svgReader.utils.reflectAngleAboutY(lambda2);
        this.cx = cx;
        this.cy = cy;
        this.a = a;
        this.b = b;
        this.theta = theta;
        this.isPieSlice = isPieSlice;
        
        this.eta1 = Math.atan2(Math.sin(lambda1) / b,
                           Math.cos(lambda1) / a);
        this.eta2 = Math.atan2(Math.sin(lambda2) / b,
                                Math.cos(lambda2) / a);

        this.cosTheta = Math.cos(theta);
        this.sinTheta = Math.sin(theta);

        //// make sure we have eta1 <= eta2 <= eta1 + 2 PI
        this.eta2 -= twoPi * Math.floor((this.eta2 - this.eta1) / twoPi);

        //// the preceding correction fails if we have exactly et2 - eta1 = 2 PI
        //// it reduces the interval to zero length
        if (((lambda2 - lambda1) > Math.PI) && ((this.eta2 - this.eta1) < Math.PI)) {
            this.eta2 += 2 * Math.PI;
        }
    };

    ellipticalArc.prototype = {
        computePoint: function (eta) {
            var aCosEta = this.a * Math.cos(eta),
                bSinEta = this.b * Math.sin(svgReader.utils.reflectAngleAboutY(eta)),
                x = this.cx + aCosEta * this.cosTheta - bSinEta * this.sinTheta,
                y = this.cy + (aCosEta * this.sinTheta + bSinEta * this.cosTheta);
            return { x: x, y: y };
        },
        computePointDot: function (eta) {
            var aSinEta = this.a * Math.sin(eta),
                bCosEta = this.b * Math.cos(eta),
                xDot = -aSinEta * this.cosTheta - bCosEta * this.sinTheta,
                yDot = -aSinEta + this.sinTheta + bCosEta * this.cosTheta;
            return { xDot: xDot, yDot: yDot };
        },
        getSegmentCount: function (degree, threshold) {
            var n = 1,
                found = false,
                etaA, etaB, dEta, i;
            while ((!found) && (n < 1024)) {
                dEta = (this.eta2 - this.eta1) / n;
                if (dEta <= 0.5 * Math.PI) {
                    etaB = this.eta1;
                    found = true;
                    for (i = 0; found && (i < n) ; i++) {
                        etaA = etaB;
                        etaB += dEta;
                        found = (estimateError(degree, etaA, etaB, this.theta, this.a, this.b, this.cx, this.cy) <= threshold);
                    }
                }
                n <<= 1;
            }
            return n;
        },
        buildEllipticalArc: function (degree, threshold, out) {
            degree = 1;
            var n = this.getSegmentCount(degree, threshold),
                i, dEta, etaB, pointA, pointB, pointDA, pointDB;
            console.log(n);
            dEta = (this.eta2 - this.eta1) / n;
            etaB = this.eta1;
            pointB = this.computePoint(etaB);
            if (degree > 1) {
                pointDB = this.computePointDot(etaB);
            }
            if (this.isPieSlice) {
                out.stream.moveTo(this.cx, this.cy);
                out.stream.lineTo(pointB.x, pointB.y);
            } else {
                out.stream.moveTo(pointB.x, pointB.y);
            }
            
            var t     = Math.tan(0.5 * dEta);
            var alpha = Math.sin(dEta) * (Math.sqrt(4 + 3 * t * t) - 1) / 3;

            for (i = 0; i < n; ++i) {
                etaB += dEta;
                pointB = this.computePoint(etaB);
                if (degree === 1) {
                    out.stream.lineTo(pointB.x, pointB.y);
                } else {
                    pointA = pointB;
                    pointDA = pointDB;
                    pointDB = this.computePointDot(etaB);
                    if (degree === 2) {
                        var k = (pointDB.yDot * (pointB.x - pointA.x) - pointDB.xDot * (pointB.y - pointA.y))
                            / (pointDA.xDot * pointDB.yDot - pointDA.yDot * pointDB.xDot);
                        out.stream.quadraticCurveTo((pointA.x + k * pointDA.xDot), (pointA.y + k * pointDA.yDot),
                            pointB.x, pointB.y);
                    } else {
                        out.stream.bezierCurve(
                            (pointA.x + alpha * pointDA.xDot), (pointA.y + alpha * pointDA.yDot),
                            (pointB.x - alpha * pointDB.xDot), (pointB.y - alpha * pointDB.yDot),
                            pointB.x, pointB.y);
                    }
                }
            }
            if (this.isPieSlice) {
                out.stream.close();
            }
        }
    };
})()