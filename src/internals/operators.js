var operators = {
    generalGraphicsState: {
        'w': 'setlinewidth',
        'J': 'setlinecap',
        'j': 'setlinejoin',
        'M': 'setmiterlimit',
        'd': 'setdash',
        'ri': 'renderingIntent', //not PS
        'i': 'setflat'
    },
    specialGraphicsState: {
        'q': 'gsave',
        'Q': 'grestore',
        'cm': 'concat' //Concatenate matrix of current transformation matrix
    },
    pathConstruction: {
        'm': 'moveto',
        'l': 'lineto',
        'c': 'curveto', // Append curved segment to path(three control points)
        'v': 'curveto', //Append curved segment to path(initial oint replicated).
        'y': 'curveto', //Append curved segement to path (final point replicated).
        'h': 'closepath',
        're': 'rectangle' //not PS
    },
    pathPainting: {
        'S': 'stroke',
        's': 'closepathStroke',
        'f': 'fill', //nonzero winding number rule
        'F': 'fill', //obsolete
        'f*': 'eofill', //even-odd rule fill
        'B': 'fillStroke',
        'B*': 'eofillStroke', //even-odd rule stroke
        'b': 'closepathFillStroke',
        'b*': 'closepathEofillStroke', //even-odd rule
        'n': 'noOp' //not PS
    },
    clippingPath: {
        'W': 'clip',
        'W*': 'eoclip' //clip even-odd rule.
    },
    textObjects: {
        'BT': 'beginText', //not PS
        'ET': 'endText' //not PS
    },
    textState: {
        'Tc': 'charSpace', //not PS
        'Tw': 'wordSpace', //not PS
        'Tz': 'scaleText', //not PS
        'TL': 'leading', //not PS
        'Tf': 'selectfont',
        'Tr': 'renderMode', //not PS
        'Ts': 'rise' //not PS,
    },
    textPosition: {
        'Td': 'textPosition', //not PS,
        'TD': 'textPositionLeading', //not PS
        'Tm': 'textMatrix', //not PS 
        'T*': 'newLine' //not PS    
    },
    textShow: {
        'Tj': 'show',
        'TJ': 'showArrayText', //not PS
        '\'': 'nextlineShowText', //not PS
        '"': 'wordCharSpaceNextlineShowText' //not PS
    },
    type3Font: {
        'd0': 'setcharwidth',
        'd1': 'setcachedevice'
    },
    color: {
        'CS': 'setcolorspace', //stroke
        'cs': 'setcolorspace', //fill
        'SC': 'setcolor', //stroke
        'sc': 'setcolor', //fill
        'SCN': 'setcolor', //set stroke color for ICCBased and special color spaces
        'scn': 'setcolor', //same as above but for fill
        'G': 'setgray', //stroke
        'g': 'setgray', //fill
        'RG': 'setrgbcolor', //stroke
        'rg': 'setrgbcolor', //fill
        'K': 'setcmykcolor', //stroke
        'k': 'setcmykcolor' //fill
    },
    shadingPattern: {
        'sh': 'shfill'
    },
    inlineImages: {
        'BI': 'beginInlineImageObject', //not PS
        'ID': 'beginInlineImageData', //not PS
        'EI': 'endInlineImageObject' //not PS
    },
    xObjects: {
        'Do': 'invokeNamedXObject' //not PS
    },
    markedcontent: {
        'MP': 'markedcontentPoint', //not PS
        'DP': 'markedcontentPointPropertylist', //not PS
        'BMC': 'beginMarkedcontentSequence', //not PS
        'BDC': 'beginMarkedcontentSequenceProperList', //not PS
        'EMC': 'endMarkedcontentSequence' //not PS
    },
    compatibility: {
        'BX': 'beginCompatibilitySection', //not PS
        'EX': 'endCompatibilitySection' //not PS
    }
};