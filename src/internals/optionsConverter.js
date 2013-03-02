var pageOptionsConverter = function (options) {
    var ret = [],
        obj;
    for (var item in options) {
        if (!options.hasOwnProperty(item))
            continue;
        obj = options[item];
        switch (item.toLowerCase()) {
            case 'resources':
                if (obj instanceof resources) {
                    ret.push('/Resources ' + obj.objectNumber + ' ' + obj.generationNumber + ' R');
                }
                else if (typeof obj === 'string') {
                    ret.push(obj);
                } else {
                    throw 'Invalid Resources!';
                }
                break;
            case 'mediabox':
                if (checkValidRect(obj)) {
                    ret.push('/MediaBox [' + obj.join(' ') + ']');
                }
                break;
            case 'cropbox':
                if (checkValidRect(obj)) {
                    ret.push('/CropBox [' + obj.join(' ') + ']');
                }
                break;
            case 'bleedbox':
                if (checkValidRect(obj)) {
                    ret.push('/BleedBox [' + obj.join(' ') + ']');
                }
                break;
            case 'trimbox':
                if (checkValidRect(obj)) {
                    ret.push('/TrimBox [' + obj.join(' ') + ']');
                }
                break;
            case 'artbox':
                if (checkValidRect(obj)) {
                    ret.push('/ArtBox [' + obj.join(' ') + ']');
                }
                break;
            case 'rotate':
                if (typeof obj === 'number' && obj % 90 === 0) {
                    ret.push('/Rotate ' + obj);
                }
                break;
            case 'thumb':
                //TODO: Thumbnail Image
                break;
            case 'b':
                //TODO: B 
                /*(Optional; PDF 1.1; recommended if the page contains article beads) An 
                array of indirect references to article beads appearing on the page*/
                break;
            case 'dur':
                //TODO: Dur 
                /*(Optional; PDF 1.1) The page’s display duration (also called its advance 
                timing): the maximum length of time, in seconds, that the page will be
                displayed during presentations before the viewer application automatically
                advances to the next page*/
                break;
            case 'Trans':
                //TODO: Trans 
                break;
            case 'Annots':
                //TODO: Annots 
                break;
            case 'AA':
                //TODO: AA 
                break;
            case 'PieceInfo':
                //TODO: PieceInfo 
                break;
            case 'LastModified':
                //TODO: LastModified 
                break;
            case 'StructParents':
                //TODO: StructParents 
                break;
            case 'ID':
                //TODO: ID 
                break;
            case 'PZ':
                //TODO: PZ 
                break;
            case 'SeparationInfo':
                //TODO: SeparationInfo 
                break;
        }
    }
    return ret.join('\n');
};


var pageTreeOptionsConverter = function (options) {
    var ret = [],
        obj;
    for (var item in options) {
        if (!options.hasOwnProperty(item))
            continue;
        obj = options[item];
        switch (item.toLowerCase()) {
            //Inheritable
            case 'resources':
                if (obj instanceof resources) {
                    ret.push('/Resources ' + obj.objectNumber + ' ' + obj.generationNumber + ' R');
                }
                else if (typeof obj === 'string') {
                    ret.push(obj);
                } else {
                    throw 'Invalid Resources!';
                }
                break;
            //Inheritable
            case 'mediabox':
                if (checkValidRect(obj)) {
                    ret.push('/MediaBox [' + obj.join(' ') + ']');
                }
                break;
                //Inheritable
            case 'cropbox':
                if (checkValidRect(obj)) {
                    ret.push('/CropBox [' + obj.join(' ') + ']');
                }
                break;
            case 'rotate':
                if (typeof obj === 'number' && obj % 90 === 0) {
                    ret.push('/Rotate ' + obj);
                }
                break;
            
        }
    }
    return ret.join('\n');
};