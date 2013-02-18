//Add fonts before calling resurce. 
var resources = function (fontObjs, resourceObj) {
    //reset resource body.
    resourceObj.body = [];
    // Resource dictionary
    resourceObj.body.push('<<');
    resourceObj.body.push('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
    resourceObj.body.push('/Font <<');
    // Do this for each font, the '1' bit is the index of the font
    for (var i = 0, len = fontObjs.length; i < len; i++) {
        resourceObj.body.push('/F' + (i).toString(10) + ' ' + fontObjs[i].objectNumber + ' ' + fontObjs[i].generationNumber + ' R');
    }
    resourceObj.body.push('>>');
    resourceObj.body.push('/XObject <<');
    //putXobjectDict();
    resourceObj.body.push('>>');
    resourceObj.body.push('>>');

    return resourceObj;
};