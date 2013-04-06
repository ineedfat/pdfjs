var enums = {
    /**
    *@readonly
    *@enum {[width, height]}
    */
    paperFormat: {
        a3: [841.89, 1190.55],
        a4: [595.28, 841.89],
        a5: [420.94, 595.28],
        letter: [612, 792],
        legal: [612, 1008]
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {int}
    */
    lineCapStyle: {
        /**The stroke is squared off at the endpoint of
the path. There is no projection beyond the end of
the path.*/
        buttCap: 0,
        /**A semicircular arc with a diameter equal
to the line width is drawn around the endpoint and
filled in.*/
        roundCap: 1,
        /**The stroke continues beyond
the endpoint of the path for a distance equal to half
the line width and is then squared off.*/
        projectinSquareCap: 2
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {int}
    */
    lineJoinStyle: {
        /**The outer edges of the strokes for the two
segments are extended until they meet at an angle, as
in a picture frame. If the segments meet at too sharp
an angle (as defined by the miter limit parameter—
see “Miter Limit,” below), a bevel join is used instead.*/
        miterJoin: 0,
        /**A circle with a diameter equal to the line
width is drawn around the point where the two
segments meet and is filled in, producing a rounded
corner. Note: If path segments shorter than half the line width
meet at a sharp angle, an unintended “wrong side” of
the circle may appear.*/
        roundJoin: 1,
        /**The two segments are finished with butt
caps (see “Line Cap Style” on page 139) and the
resulting notch beyond the ends of the segments is
filled with a triangle.*/
        bevelJoin: 2
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {int}
    */
    renderingIntentOption: {
        /**Colors are represented solely with respect to the light source; no
correction is made for the output medium’s white point (such as
the color of unprinted paper). Thus, for example, a monitor’s
white point, which is bluish compared to that of a printer’s
paper, would be reproduced with a blue cast. In-gamut colors
are reproduced exactly; out-of-gamut colors are mapped to the
nearest value within the reproducible gamut. This style of
reproduction has the advantage of providing exact color
matches from one output medium to another. It has the
disadvantage of causing colors with Y values between the
medium’s white point and 1.0 to be out of gamut. A typical use
might be for logos and solid colors that require exact
reproduction across different media.*/
        absoluteColorimetric: 'AbsoluteColorimetric',
        /**Colors are represented with respect to the combination of the
light source and the output medium’s white point (such as the
color of unprinted paper). Thus, for example, a monitor’s white
point would be reproduced on a printer by simply leaving the
paper unmarked, ignoring color differences between the two
media. In-gamut colors are reproduced exactly; out-of-gamut
colors are mapped to the nearest value within the reproducible
gamut. This style of reproduction has the advantage of adapting
for the varying white points of different output media. It has the
disadvantage of not providing exact color matches from one
medium to another. A typical use might be for vector graphics.*/
        relativeColorimetric: 'RelativeColorimetric',
        /**Colors are represented in a manner that preserves or emphasizes
saturation. Reproduction of in-gamut colors may or may not be
colorimetrically accurate. A typical use might be for business
graphics, where saturation is the most important attribute of the
color.*/
        saturation: 'Saturation',
        /**Colors are represented in a manner that provides a pleasing
perceptual appearance. This generally means that both in-gamut
and out-of-gamut colors are modified from their precise
colorimetric values in order to preserve color relationships. A
typical use might be for scanned images.*/
        perceptual: 'Perceptual'
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {int}
    */
    pathPaintingOption: {
        /**Stroke the path.*/
        bigS: 'S',
        /**Close and stroke the path.*/
        smallS: 's',
        /**Fill the path, using the nonzero winding number rule to determine the region to fill.*/
        smallF: 'f',
        /**Fill the path, using the even-odd rule to determine the region to fill*/
        fStar: 'f*',
        /**Fill and then stroke the path, using the nonzero winding number rule to determine
the region to fill. This produces the same result as constructing two identical path
objects, painting the first with f and the second with S. Note, however, that the filling
and stroking portions of the operation consult different values of several graphics
state parameters, such as the color.*/
        bigB: 'B',
        /**Fill and then stroke the path, using the even-odd rule to determine the region to fill.
This operator produces the same result as B, except that the path is filled as if with
f* instead of f.*/
        bigBStar: 'B*',
        /**Close, fill, and then stroke the path, using the nonzero winding number rule to
determine the region to fill.*/
        smallB: 'b',
        /**Close, fill, and then stroke the path, using the even-odd rule to determine the
region to fill..*/
        smallBStar: 'b*',
        /**End the path object without filling or stroking it. This operator is a “path-painting
no-op,” used primarily for the side effect of changing the clipping path*/
        n: 'n'
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {string}
    */
    colorSpace: {
        /**DeviceGray requires one value between 0.0(black) and 1.0(white).*/
        deviceGray: 'DeviceGray',
        /**DeviceRGB requires three values that are between 0.0 and 1.0 for each channel*/
        deviceRGB: 'DeviceRGB',
        /**DeviceCMYK requires four values that are between 0.0 and 1.0 for each channel*/
        deviceCMYK: 'DeviceCMYK'
    },
    /**
    *See Adobe's PDF Reference v1.3 for more details
    *@readonly
    *@enum {int}
    */
    textMode: {
        /**Fill text.*/
        fillText: 0,
        /**Stroke text.*/
        strokeText: 1,
        /**Fill, then stroke, text.*/
        fillStrokeText: 2,
        /**Neither fill nor stroke text (invisible).*/
        invisibleText: 3,
        /**Fill text and add to path for clipping (see above).*/
        fillClipText: 4,
        /**Stroke text and add to path for clipping.*/
        strokeClipText: 5,
        /**Fill, then stroke, text and add to path for clipping.*/
        fillStrokeClipText: 6,
        /**Add text to path for clipping.*/
        clipText: 7
    }

}