(function () {
    pdfJS.doc.prototype.info = function () {
        var infoObj = new pdfJS.obj(++this.objectNumber, 0);
        infoObj.body.push('<<');

        infoObj.body.push('/Producer (PDFjs ' + PDFJS_VERSION + ')');
        if (this.settings.documentProperties.title) {
            infoObj.body.push('/Title (' + pdfJS.pdfEscape(this.settings.documentProperties.title) + ')');
        }
        if (this.settings.documentProperties.subject) {
            infoObj.body.push('/Subject (' + pdfJS.pdfEscape(this.settings.documentProperties.subject) + ')');
        }
        if (this.settings.documentProperties.author) {
            infoObj.body.push('/Author (' + pdfJS.pdfEscape(this.settings.documentProperties.author) + ')');
        }
        if (this.settings.documentProperties.keywords) {
            infoObj.body.push('/Keywords (' + pdfJS.pdfEscape(this.settings.documentProperties.keywords) + ')');
        }
        if (this.settings.documentProperties.creator) {
            infoObj.body.push('/Creator (' + pdfJS.pdfEscape(this.settings.documentProperties.creator) + ')');
        }
        var created = new Date();
        infoObj.body.push('/CreationDate (D:' +
            [
                created.getFullYear(),
                pdfJS.utils.padd2(created.getMonth() + 1),
                pdfJS.utils.padd2(created.getDate()),
                pdfJS.utils.padd2(created.getHours()),
                pdfJS.utils.padd2(created.getMinutes()),
                pdfJS.utils.padd2(created.getSeconds())
            ].join('') +
            ')'
        );

        infoObj.body.push('>>');
        
        return infoObj;

    };
})(jQuery);