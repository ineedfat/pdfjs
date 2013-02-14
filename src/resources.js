(function () {
    //Add fonts before calling resource. 
    pdfJS.doc.prototype.resources = function () {
        var resourceObj = new pdfJS.obj(++this.objectNumber, 0);
        // Resource dictionary
        //Manually increment objectNumber
        resourceObj.body.push('<<');
        resourceObj.body.push('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
        resourceObj.body.push('/Font <<');
        // Do this for each font, the '1' bit is the index of the font
        for (var i = 0, len = this.fontObjs.length; i < len; i++) {
                resourceObj.body.push('/F' + (i).toString(10) + ' ' + this.fontObjs[i].objectNumber + ' ' + this.fontObjs[i].generationNumber + ' R');
        }
        resourceObj.body.push('>>');
        resourceObj.body.push('/XObject <<');
        //putXobjectDict();
        resourceObj.body.push('>>');
        resourceObj.body.push('>>');

        return resourceObj;
    };
})();