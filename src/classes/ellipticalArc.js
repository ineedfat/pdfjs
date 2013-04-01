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

        } else {

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
        var self = this;

        var twoPi = 2 * Math.PI;

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

        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);

        this.defaultFlatness = 0.5;
        
        //// make sure we have eta1 <= eta2 <= eta1 + 2 PI
        //this.eta2 -= twoPi * Math.floor((this.eta2 - this.eta1) / twoPi);

        //// the preceding correction fails if we have exactly et2 - eta1 = 2 PI
        //// it reduces the interval to zero length
        //if ((lambda2 - lambda1 > Math.PI) && (this.eta2 - this.eta1 < Math.PI)) {
        //    this.eta2 += 2 * Math.PI;
        //}

        this.computeFocii();
        this.computeEndPoints();
    };

    ellipticalArc.prototype = {
        /* Abscissa of the center of the ellipse */
        cx: null,

        /* Ordinate of the center of the ellipse */
        cy: null,

        /* Semi-major axis */
        a: null,

        /* Semi-minor axis */
        b: null,

        /* Orientation of the major axis with respect to the x-axis */
        theta: null,

        /* Start angle of the arc */
        eta1: null,

        /* End angle of the arc */
        eta2: null,

        /* Abscissa of the start point */
        x1: null,

        /* Ordinate of the start point */
        y1: null,

        /* Abscissa of the end point */
        x2: null,

        /* Ordinate of the end point */
        y2: null,

        /* Abscissa of the first focus */
        xF1: null,

        /* Ordinate of the first focus */
        yF1: null,

        /* Abscissa of the end focus */
        xF2: null,

        /* Ordinate of the end focus */
        yF2: null,

        /** Abscissa of the leftmost point of the arc. */
        xLeft: null,

        /** Ordinate of the highest point of the arc. */
        yUp: null,

        /** Vertical height of the arc. */
        height: null,

        /** Indicator for center to endpoints line inclusion. */
        isPieSlice: null,

        /** Maximal degree for Bézier curve approximation. */
        maxDegree: null,

        /** Default flatness for Bézier curve approximation. */
        defaultFlatness: null,

        computeFocii: function () {
            var d = Math.sqrt(Math.pow(this.a, 2) - Math.pow(this.b, 2));
            var dx = d * Math.cos(this.theta);
            var dy = d * Math.sin(this.theta);

            this.xF1 = this.cx - dx;
            this.yF1 = this.cy - dy;
            this.xF2 = this.cx + dx;
            this.yF2 = this.cy + dy;
        },
        computeEndPoints: function () {
            var cosTheta = Math.cos(this.theta);
            var sinTheta = Math.sin(this.theta);
            //Start point
            var aCosEta1 = this.a * Math.cos(this.eta1);
            var bSinEta1 = this.b * Math.sin(this.eta1);

            this.x1 = this.cx + aCosEta1 * cosTheta - bSinEta1 * sinTheta;
            this.y1 = this.cy + aCosEta1 * sinTheta + bSinEta1 * cosTheta;

            var aCosEta2 = this.a * Math.cos(this.eta2);
            var bSinEta2 = this.b * Math.sin(this.eta2);

            this.x2 = this.cx + aCosEta2 * cosTheta - bSinEta2 * sinTheta;
            this.y2 = this.cy + aCosEta2 * sinTheta + bSinEta2 * cosTheta;
        },

        buildEllipticalArc: function (degree, threshold, out) {
            var cosTheta = Math.cos(this.theta);
            var sinTheta = Math.sin(this.theta);
            var found = false;
            var n = 1;
            while ((!found) && (n < 1024)) {
                var dEta = (this.eta2 - this.eta1) / n;
                if (dEta <= 0.5 * Math.PI) {
                    var etaB = this.eta1;
                    found = true;
                    for (var i = 0; found && (i < n) ; i++) {
                        var etaA = etaB;
                        etaB += dEta;
                        found = (estimateError(degree, etaA, etaB, this.theta, this.a, this.b, this.cx, this.cy) <= threshold);
                    }
                    //break;
                }
                n <<= 1;
            }

            var dEta = (this.eta2 - this.eta1) / n;
            var etaB = this.eta1;
            var cosEtaB = Math.cos(etaB);
            var sinEtaB = Math.sin(etaB);
            var aCosEtaB = this.a * cosEtaB;
            var bSinEtaB = this.b * sinEtaB;
            var aSinEtaB = this.a * sinEtaB;
            var bCosEtaB = this.b * cosEtaB;
            var xB = this.cx + aCosEtaB * cosTheta - bSinEtaB * sinTheta;
            var yB = this.cy + aCosEtaB * sinTheta + bSinEtaB * cosTheta;
            var xBDot = -aSinEtaB * cosTheta - bCosEtaB * sinTheta;
            var yBDot = -aSinEtaB + sinTheta + bCosEtaB * cosTheta;
            
            if (this.isPieSlice) {
                out.stream.moveTo(this.cx, this.cy);
                out.stream.lineTo( xB, yB);
            } else {
                out.stream.moveTo( xB,  yB);
            }
            
            var t     = Math.tan(0.5 * dEta);
            var alpha = Math.sin(dEta) * (Math.sqrt(4 + 3 * t * t) - 1) / 3;
            

            for (var i = 0; i < n; ++i) {

                var etaA = etaB;
                var xA = xB;
                var yA = yB;
                var xADot = xBDot;
                var yADot = yBDot;

                etaB += dEta;
                cosEtaB = Math.cos(etaB);
                sinEtaB = Math.sin(etaB);
                aCosEtaB = this.a * cosEtaB;
                bSinEtaB = this.b * sinEtaB;
                aSinEtaB = this.a * sinEtaB;
                bCosEtaB = this.b * cosEtaB;
                xB = this.cx + aCosEtaB * cosTheta - bSinEtaB * sinTheta;
                yB = this.cy + aCosEtaB * sinTheta + bSinEtaB * cosTheta;
                xBDot = -aSinEtaB * cosTheta - bCosEtaB * sinTheta;
                yBDot = -aSinEtaB * sinTheta + bCosEtaB * cosTheta;


                if (degree == 1) {
                    out.stream.lineTo(xB, yB);
                } else if (degree == 2) {
                    var k = (yBDot * (xB - xA) - xBDot * (yB - yA))
                        / (xADot * yBDot - yADot * xBDot);
                    out.stream.quadTo((xA + k * xADot), (yA + k * yADot),
                        xB, yB);
                } else {
                    out.stream.pushState();
                    out.stream.fillColor(.5);
                    out.stream.translate(0, 0);
                    out.stream.beginText('F1', null, 22);
                    out.stream.textPosition(xB, yB);
                    out.stream.print((window.count ? ++window.count : (window.count = 1)).toString());
                    out.stream.endText();
                    out.stream.popState();
                    out.stream.bezierCurve((xA + alpha * xADot), (yA + alpha * yADot),
                        (xB - alpha * xBDot), (yB - alpha * yBDot),
                        xB, yB);
                }
            }


            if (this.isPieSlice) {
                out.stream.close();
            }
        }
    };
})()