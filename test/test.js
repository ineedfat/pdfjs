/// <reference path="/pdfJS-0.0.1.js" />
var generatePDF = function () {

    var doc = new pdfJS.doc('letter', 'portrait');
    doc.addPage();
    doc.currentPage.graphic('rect', 50, 50, 100, 100);
    doc.currentPage.graphic('grayFill', 1.0);
    doc.currentPage.graphic('grayStroke',  0);
    doc.currentPage.graphic('paintPath', 'B');
    doc.currentPage.graphic('grayFill', 0);
    doc.currentPage.text('beginText');
    doc.currentPage.text('fontStyle', null, null, 22);
    doc.currentPage.text('showText', 'HELLO WORLD');
    doc.currentPage.text('endText');

    window.open(doc.output('datauristring'), "pdfWindow", "height: 700, width: 500");
};

var generatePDfWithImage = function () {
    var doc = new pdfJS.doc('letter', 'portrait');
    doc.addPage();
    var image = $('img')[0];
    var imgXObj = doc.newImage(image, true);
    imgXObj.addImageToPage(doc.currentPage, 175, 75, 175, 75);
    doc.outputAsync('datauristring', function (data) {
        window.open(data, "pdfWindow", "height: 700, width: 500");
    });
};