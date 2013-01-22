var generatePDF = function () {

    var doc = new pdfJS.doc('letter', 'portrait');
    window.open(doc.output('datauristring'), "pdfWindow", "height: 700, width: 500");
};