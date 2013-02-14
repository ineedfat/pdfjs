(function () {
    var insertOptions = function (options) {
        var ret = [],
            obj;
        for (var item in options) {
            if (!options.hasOwnProperty(item))
                continue;
            obj = options[item];
            switch (item.toLowerCase()) {
                //Inheritable
                case 'mediabox':
                    if (pdfJS.utils.checkValidRect(obj)) {
                        ret.push('/MediaBox [' + obj.join(' ') + ']');
                    }
                    break;
                    //Inheritable
                case 'cropbox':
                    if (pdfJS.utils.checkValidRect(obj)) {
                        ret.push('/CropBox [' + obj.join(' ') + ']');
                    }
                    break;
                case 'bleedbox':
                    if (pdfJS.utils.checkValidRect(obj)) {
                        ret.push('/BleedBox [' + obj.join(' ') + ']');
                    }
                    break;
                case 'trimbox':
                    if (pdfJS.utils.checkValidRect(obj)) {
                        ret.push('/TrimBox [' + obj.join(' ') + ']');
                    }
                    break;
                case 'artbox':
                    if (pdfJS.utils.checkValidRect(obj)) {
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
        return ret.join(' ');
    };

    pdfJS.pageNode = function (parent, pageOptions, objectNumber, generationNumber, contentStreams) {
        var self = this;

        pdfJS.obj.call(this, objectNumber, generationNumber);
        this.pageOptions = pageOptions;
        this.parent = parent;
        this.contentStreams = contentStreams;
    };
    pdfJS.pageNode.prototype = Object.create(pdfJS.obj.prototype, {
        out: {
            value: function () {
                var i, item,
                    ret = [];
                    
                this.body.push('<< /Type /Page');

                this.body.push(insertOptions(this.pageOptions));
                
                this.body.push('/Parent ' + this.parent.objectNumber + ' ' + this.parent.generationNumber + ' R');
                this.body.push('/Contents ');

                if (this.contentStreams.length) {
                    this.body.push('[');
                    for (i = 0; item = this.contentStreams[i]; i++) {
                        this.body.push(item.objectNumber + ' ' + item.generationNumber + ' R');
                    }
                    this.body.push(']');
                }
                else {
                    this.body.push(this.contentStreams.objectNumber + ' ' + this.contentStreams.generationNumber + ' R');
                }

                this.body.push('>>');

                ret.push(pdfJS.obj.prototype.out.apply(this, arguments)); //calling obj super class out method.

                if (this.contentStreams.length) {
                    for (i = 0; item = this.contentStreams[i]; i++) {
                        ret.push(item.out());
                    }
                } else {
                    ret.push(this.contentStreams.out());
                }

                return ret.join('\n');
            }
        },
        
    });

})();