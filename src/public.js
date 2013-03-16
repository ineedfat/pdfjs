//Public
/**
@namespace
*/
var pdfJS = {
    doc: function (format, orientation, margin) {
        var pdf = new doc(format, orientation, margin);
        return {
            objNum: function() {
                pdf.objNumber.apply(pdf, arguments);
            },
            currentPage: function () { return pdf.page.apply(pdf, arguments); },
            createObj: function () { return pdf.newObj.apply(pdf, arguments); },
            createStream: function () { return pdf.newStream.apply(pdf, arguments); },
            addPage: function () { return pdf.addPage.apply(pdf, arguments); },
            addRepeatableElement: function () {
                return pdf.addRepeatableElement.apply(pdf, arguments);
            },
            addRepeatableTemplate: function () {
                return pdf.addRepeatableTemplate.apply(pdf, arguments);
            },
            root: function () { return pdf.rootNode.apply(pdf, arguments); },
            output: function () { return pdf.output.apply(pdf, arguments); },
            outputAsync: function () { return pdf.outputAsync.apply(pdf, arguments); },
            addFont: function () { return pdf.addFont.apply(pdf, arguments); },
            newImage: function () { return pdf.newImage.apply(pdf, arguments); }
        };
    },
    svg: svg,
    obj: obj,
    pageTreeNode: pageTreeNode,
    utils: utils,
};

_.pdfJS = pdfJS;