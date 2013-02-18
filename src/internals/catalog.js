//Create root pageTreeNode before calling catalog.
var catalog = function (rootNode, catalogObj) {
    catalogObj.body = [];
    catalogObj.body.push('<<');

    catalogObj.body.push('/Type /Catalog');
    catalogObj.body.push('/Pages ' + rootNode.objectNumber + ' ' + rootNode.generationNumber + ' R');

    catalogObj.body.push('/PageLayout /OneColumn');

    catalogObj.body.push('>>');

    return catalogObj;
};