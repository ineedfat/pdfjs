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
    var p = doc.addPage().currentStream;
    var imgXObj = doc.newImage('https://api.azaleos.com/images/customerlogos/45f56d81-4512-e211-b259-00155dd3131a.png', true);
    p.addImage(imgXObj, 175, 75, 175, 75);
    doc.outputAsync('datauristring', function (data) {
        window.open(data, "pdfWindow", "height: 700, width: 500");
    });
};


var generatePDfWithSVG = function () {
    var sObj = $('svg');
    var doc = new pdfJS.doc('letter', ' portrait');
    var p = doc.addPage().currentStream;
    var svg = new pdfJS.svg(sObj[0]);
    p.fillColor(0);
    p.strokeColor(0);
    p.addSvg(svg, 0, 0, 1, 1);
    doc.outputAsync('datauristring', function (data) {
        window.open(data, "pdfWindow", "height: 700, width: 500");
    });
};