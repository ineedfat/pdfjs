/// <reference path="/pdfJS-0.0.1.js" />
var generatePDF = function () {

    var doc = new pdfJS.doc('letter', 'portrait');
    var p = doc.addPage();

    p.rect(50, 50, 100, 100);

    p.grayFill(1.0);
    p.grayStroke( 0);
    p.paintPath('B');
    p.grayFill(0);
    p.beginText();
    p.fontStyle(null, null, 22);
    p.showText('HELLO WORLD');
    p.endText();

    window.open(doc.output('datauristring'), "pdfWindow", "height: 700, width: 500");
};

var generatePDfWithImage = function () {
    var doc = new pdfJS.doc('letter', 'portrait');
    var p = doc.addPage();
    var imgXObj = doc.newImage('../examples/img/sample.jpg', true);
    p.addImage(imgXObj, 175, 75, 175, 75);
    doc.outputAsync('datauristring', function (data) {
        window.open(data, "pdfWindow", "height: 700, width: 500");
    });
};