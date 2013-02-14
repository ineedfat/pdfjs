(function ($) {
    //Create root pageTreeNode before calling catalog.
    pdfJS.doc.prototype.catalog = function () {
        var catalogObj = new pdfJS.obj(++this.objectNumber, 0);
        catalogObj.body.push('<<');
        
        catalogObj.body.push('/Type /Catalog');
        catalogObj.body.push('/Pages '+ this.rootNode.objectNumber + ' ' + this.rootNode.generationNumber + ' R');

        catalogObj.body.push('/PageLayout /OneColumn');

        catalogObj.body.push('>>');

        return catalogObj;
    };
})();