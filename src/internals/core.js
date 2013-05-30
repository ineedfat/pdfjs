﻿    // Size in pt of various paper formats
    var PDF_VERSION = '1.3';
/**
    *Initialize new document object.
    *@constructor
    *@memberof pdfJS
    *@Author Trinh Ho (https://github.com/ineedfat/pdfjs)
    *@classdesc Representing a PDF document.
    *@param {string|array} [format=letter] Paper format name or array
    containing width and height (e.g [width, height])
    *@param {string} [orientation=portrait] Document orientation.
    *@param {array} [margin=[18,18]] Horizontal and vertical margin in
    points (e.g [horizontal, vertical])
*/
    function doc (format, orientation, margin, disableValidation) {
        var self = this;
        this.pageCount = 0;

        this.repeatableElements = [];
        this.templateStreams = [];
        /**
        *Number of active async calls such as adding a new image. TODO: make this field private.
        *@Type int
        *@memberof pdfJS.doc#
        */
        this.activeAsync = 0;
        /**
        *Positive integer representing the object number of pdf internal objects. (Becareful when
        *when modifying this property).
        *@Type int
        *@memberof pdfJS.doc#
        */
        this.objectNumber = 0; //object counter used for setting indirect object.

        /**
        *Current document page in context.
        *@Type {[fonts]{@link pdfJS.pageNode}}  
        */
        this.currentPage = null;

        /**
        *General document settings
        *@property {Object} settings - Document settings
        *@property {Array}  settings.dimension - Document dimension
        *@property {Object} settings.documentProperties - Document info
        *@property {Object} settings.documentProperties.title - title
        *@property {Object} settings.documentProperties.subject - subject
        *@property {Object} settings.documentProperties.author - author
        *@property {Object} settings.documentProperties.keywords - keywords
        *@property {Object} settings.documentProperties.creator - creator
        */
        this.settings = {
            dimension: enums.paperFormat['letter'],
            documentProperties: {
                'title': '', 'subject': '',
                'author': '', 'keywords': '', 'creator': ''
            },
            disableValidation: disableValidation
        };

        //Determine page dimensions.
        if (typeof format === 'string') {
            self.settings.dimension = enums.paperFormat[format.toLowerCase()].slice();
        } else {
            self.settings.dimension = format.slice().splice(0, 2);
        }

        if (orientation.toLowerCase() === 'landscape') {
            var temp = self.settings.dimension[0];
            self.settings.dimension[0] = self.settings.dimension[1];
            self.settings.dimension[1] = temp;
        }

        this.resObj = new resources(++this.objectNumber, 0);

        /**
        *Root of the Page-Tree
        *@Type {[pageTreeNode]{@link pdfJS.pageTreeNode}  
        */
        this.rootNode = new pageTreeNode(null, ++self.objectNumber, 0,
             {
                 mediabox: [0, 0, this.settings.dimension[0], this.settings.dimension[1]],
                 resources: this.resObj
             });

        /**
       *Current pageTreeNode in context
       *@Type {[pageTreeNode]{@link pdfJS.pageTreeNode}  
       */
        this.currentNode = this.rootNode;

        this.infoObj = info(this.settings, this.newObj());
        this.catalogObj = catalog(this.rootNode, this.newObj());
        this.addStandardFonts();
    }

    doc.prototype = {
        /**
        *Get/Set the object number of this document.
        *@memberof pdfJS.doc#
        *@return {int} the object number.
        */
        objNumber: function(val) {
            if (val) {
                this.objectNumber = value;
            }
            return val;
        },
        /**
        *Get/Set the current page of this document.
        *@memberof pdfJS.doc#
        *@return {pageNode} the object number.
        */
        page: function(val) {
            if (val) {
                this.objectNumber = value;
            }
            return val;
        },
        /**
        *Create new pdf object for this document.
        *@memberof pdfJS.doc#
        *@return {[obj]{@link pdfJS.obj}} a newly created pdf object for this document.
        */
        newObj: function() {
            return new obj(++this.objectNumber, 0);
        },
        /**
        *Create new pdf stream for this document.
        *@memberof pdfJS.doc#
        *@return {[stream]{@link pdfJS.stream}} a newly created pdf stream for this document.
        */
        newStream: function() {
            return new stream(++this.objectNumber, 0, this);
        },
        /**
        *Add a new page to the document.
        *@param {number} [height] Height in pt
        *@param {number} [width] Width in pt
        *@param {object} [options] Page options take procedence over height and width.
        *TODO documentation for page options.
        *@memberof pdfJS.doc#
        *@return {[pageNode]{@link pdfJS.pageNode}}
        */
        //TODO: Add options/margin/etc
        addPage: function (height, width, options) {
            this.pageCount++;
            this.currentPage = new pageNode(
                this.currentNode,
                options ||
                    {
                        mediabox: [
                            0,
                            0,
                            width || this.settings.dimension[0],
                            height || this.settings.dimension[1]
                        ]
                    },
                ++this.objectNumber,
                0,
                [this.newStream()],
                this.repeatableElements.slice(),
                this.templateStreams.slice(),
                this
            );
            this.currentPage.data.pageNum = this.pageCount;
            this.currentNode.kids.push(this.currentPage);

            return this.currentPage;
        },
        /**
        *Output PDF document.
        *@memberof pdfJS.doc#
        *@param {string} type 
        (datauristring | datauriLstring | datauri | dataurl | dataurlnewwindow)
        *@return {string} PDF data string.
        */
        output: (function () {
            var buildPageTreeNodes = function (node, buff) {
                var ret = buff || [], i, item;
                node.out(ret);
                for (i = 0; item = node.kids[i]; i++) {
                    if (item instanceof pageTreeNode) {
                        buildPageTreeNodes(item, ret);
                        continue;
                    }
                    item.out(ret);
                }
                return ret;
            };

            var buildDocument = function (content, catalog, info) {
                var getOffsets = function (data) {
                    if (typeof data !== 'string') {
                        throw 'getOffsets expects a string input';
                    }

                    var ret = [],
                        //genRegex = /\d+(?=\sobj)/,
                        objRegex = /^\d+/,
                        matches, i, match;
                    //let's search the string for all object declaration in data. 
                    matches = data.match(/\d+\s\d+\sobj/gim);

                    var currentOffset = 0;
                    var search = function(m) {
                        var offset = currentOffset;
                        var count = 0;
                        var k = null;
                        var c = null;
                        var start = null;
                        while ((c = data[offset]) && (k = m[count])) {
                            if (k === c) {
                                count++;
                                if (!start) {
                                    start = offset;
                                }
                            } else {
                                count = 0;
                                start = null;
                            }
                            offset++;
                        }
                        if (!k) {
                            currentOffset = start;
                            return start;
                        }
                        return -1;
                    };
                    for (i = 0; match = matches[i]; i++) {
                        ret.push({
                            objNum: parseInt(objRegex.exec(match), 10),
                            genNum: 0, //parseInt(genRegex.exec(match), 10),
                            offset: search(match)
                        });
                    }

                    return ret;
                };
                var i,
                    contentBuilder = [
                        '%PDF-' + PDF_VERSION, //header
                        content
                    ];
                var body = contentBuilder.join('\n');
                var o = body.length;
                var offsets = getOffsets(body);
                var objectCount = offsets.length;

                //sorting from low to high object numbers
                offsets = offsets.sort(function (a, b) {
                    return a.objNum - b.objNum;
                });

                // Cross-ref
                contentBuilder.push('xref');
                contentBuilder.push('0 ' + (objectCount + 1));
                contentBuilder.push('0000000000 65535 f ');
                for (i = 0; i < objectCount; i++) {
                    //within the document.
                    contentBuilder.push(utils.padd10(offsets[i].offset) + ' 00000 n ');
                }

                // Trailer
                contentBuilder.push('trailer');
                contentBuilder.push('<<');
                contentBuilder.push('/Size ' + (objectCount + 1));
                contentBuilder.push('/Root ' + catalog.objectNumber + ' 0 R');
                contentBuilder.push('/Info ' + info.objectNumber + ' 0 R');
                contentBuilder.push('>>');
                contentBuilder.push('startxref');
                contentBuilder.push(o);

                contentBuilder.push('%%EOF');

                return contentBuilder.join('\n');
            };

            var buildObjs = function (objs) {
                var i, obj,
                    ret =  [];
                for (i = 0; obj = objs[i]; i++) {
                    obj.out(ret);
                }
                return ret.join('\n');
            };

            return function(type) {
                type = type || 'dataurl';

                var pageContent = buildPageTreeNodes(this.rootNode, []);

                var content = utils.removeEmptyElement([
                    pageContent.join('\n'),
                    buildObjs(this.resObj.fontObjs),
                    buildObjs(this.resObj.imageXObjects),
                    buildObjs(this.repeatableElements),
                    this.resObj.out().join('\n'),
                    this.infoObj.out().join('\n'),
                    this.catalogObj.out().join('\n')
                ]).join('\n');

                var pdf = buildDocument(content, this.catalogObj, this.infoObj);
                switch (type.toLowerCase()) {
                case 'dataurl':
                    return 'data:application/pdf;base64,' + btoa(pdf);
                case 'base64':
                    return btoa(pdf);
                default:
                    return pdf;
                }
            };
        })(),
        /**
        *Output PDF document.
        *@memberof pdfJS.doc#
        *@param {string} type 
        (datauristring | datauriLstring | datauri | dataurl | dataurlnewwindow)
        *@return {string} PDF data string.
        */
        outputAsync: function(type, callback) {
            var self = this;
            var t = window.setInterval(function() {
                if (self.activeAsync === 0) {
                    window.clearInterval(t);
                    callback(self.output(type));
                }
            }, 50);
        },
        /**
        *Add new font to document
        *@param {string} postScriptName (e.g 'Helvetica-Oblique')
        *@param {string} fontName (e.g 'HELVETICA')
        *@param {string} fontStyle (e.g 'ITALIC')
        *@param {string} [encoding='StandardEncoding'] Font encoding
        *@memberof pdfJS.doc#
        *@return {string} Reference name of font used in the PDF document internally.
        */
        addFont: function(postScriptName, fontName, fontStyle, encoding) {

            var fontKey = 'F' + (this.resObj.fontObjs.length + 1).toString(10);
            // This is FontObject 
            var fontDescription = {
                key: fontKey,
                postScriptName: postScriptName,
                fontName: fontName,
                fontStyle: fontStyle,
                encoding: encoding,
                metadata: {}
            };

            this.resObj.fontObjs.push(new font(fontDescription, ++this.objectNumber, 0));

            return fontKey;
        },
        /**
        *@memberof pdfJS.doc#
        *Add a list of standard fonts to document.
        */
        addStandardFonts: function() {
            var HELVETICA = 'helvetica',
                TIMES = 'times',
                COURIER = 'courier',
                NORMAL = 'normal',
                BOLD = 'bold',
                ITALIC = 'italic',
                BOLD_ITALIC = 'bolditalic',
                encoding = 'StandardEncoding',
                standardFonts = [
                    ['Helvetica', HELVETICA, NORMAL],
                    ['Helvetica-Bold', HELVETICA, BOLD],
                    ['Helvetica-Oblique', HELVETICA, ITALIC],
                    ['Helvetica-BoldOblique', HELVETICA, BOLD_ITALIC],
                    ['Courier', COURIER, NORMAL],
                    ['Courier-Bold', COURIER, BOLD],
                    ['Courier-Oblique', COURIER, ITALIC],
                    ['Courier-BoldOblique', COURIER, BOLD_ITALIC],
                    ['Times-Roman', TIMES, NORMAL],
                    ['Times-Bold', TIMES, BOLD],
                    ['Times-Italic', TIMES, ITALIC],
                    ['Times-BoldItalic', TIMES, BOLD_ITALIC],
                    ['Symbol', 'symbol', NORMAL],
                    ['ZapfDingbats', 'zapfdingbats', NORMAL]
                ];

            for (var i = 0, l = standardFonts.length; i < l; i++) {
                this.addFont(
                    standardFonts[i][0],
                    standardFonts[i][1],
                    standardFonts[i][2],
                    encoding);
            }
            return this;
        },
        addRepeatableElement: function () {
            var element = this.newStream();
            this.repeatableElements.push(element);
            return element;
        },
        addRepeatableTemplate: function () {
            var template = new docTemplate(this);
            this.templateStreams.push(template);
            return template;
        },
        svgReader: function (stream) {
            var parser = new svgReader(stream, this);
            return {
                drawSvg: function(args) {
                    parser.drawSvg.apply(parser, arguments);
                }
            };
        }
    };