var info = function (settings, infoObj) {
    infoObj.body = [];
    infoObj.body.push('<<');

    infoObj.body.push('/Producer (pdfJS ' + PDFJS_VERSION + ')');
    if (settings.documentProperties.title) {
        infoObj.body.push('/Title (' + utils.sanitize(settings.documentProperties.title) + ')');
    }
    if (settings.documentProperties.subject) {
        infoObj.body.push('/Subject (' + utils.sanitize(settings.documentProperties.subject) + ')');
    }
    if (settings.documentProperties.author) {
        infoObj.body.push('/Author (' + utils.sanitize(settings.documentProperties.author) + ')');
    }
    if (settings.documentProperties.keywords) {
        infoObj.body.push('/Keywords (' + utils.sanitize(settings.documentProperties.keywords) + ')');
    }
    if (settings.documentProperties.creator) {
        infoObj.body.push('/Creator (' + utils.sanitize(settings.documentProperties.creator) + ')');
    }
    var created = new Date();
    infoObj.body.push('/CreationDate (D:' +
        [
            created.getFullYear(),
            utils.padd2(created.getMonth() + 1),
            utils.padd2(created.getDate()),
            utils.padd2(created.getHours()),
            utils.padd2(created.getMinutes()),
            utils.padd2(created.getSeconds())
        ].join('') +
        ')'
    );

    infoObj.body.push('>>');

    return infoObj;

};