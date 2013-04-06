var operationStates = {
    //Page Description Level
    pageLevel: utils.extend({state: 'Page Description Level'},
        operators.generalGraphicsState,
        operators.specialGraphicsState,
        operators.color,
        operators.textState,
        operators.markedContent,
        operators.shadingPattern,
        operators.xObjects
    ),
    //Path Object
    path: utils.extend({state: 'Path Object'},
        operators.pathConstruction
    ),
    //Clipping Path Object,
    clippingPath: {state: 'Clipping Path Object'},
    //In-line Image Obj,
    inlineImage: {
        state: 'In-line Image Object',
        'ID': 'beginInlineImageData', //not PS
    },
    //Text Object
    text: utils.extend({state: 'Text Object'},
        operators.generalGraphicsState,
        operators.color,
        operators.textState,
        operators.textShow,
        operators.textPosition,
        operators.markedcontent
    )
};

operationStates.pageLevel.transition = {
    'BI': operationStates.inlineImage,
    'm': operationStates.path,
    're': operationStates.path,
    'BT': operationStates.text
};

operationStates.path.transition = {
    'W': operationStates.clippingPath,
    'W*': operationStates.clippingPath,
    'S': operationStates.pageLevel,
    's': operationStates.pageLevel,
    'f': operationStates.pageLevel,
    'F': operationStates.pageLevel,
    'f*': operationStates.pageLevel,
    'B': operationStates.pageLevel,
    'B*': operationStates.pageLevel,
    'b': operationStates.pageLevel,
    'b*': operationStates.pageLevel,
    'n': operationStates.pageLevel
};
operationStates.clippingPath.transition = {
    'S': operationStates.pageLevel,
    's': operationStates.pageLevel,
    'f': operationStates.pageLevel,
    'F': operationStates.pageLevel,
    'f*': operationStates.pageLevel,
    'B': operationStates.pageLevel,
    'B*': operationStates.pageLevel,
    'b': operationStates.pageLevel,
    'b*': operationStates.pageLevel,
    'n': operationStates.pageLevel
};

operationStates.inlineImage.transition = {
    'EI': operationStates.pageLevel,
};

operationStates.text.transition = {
    'ET': operationStates.pageLevel
};
        