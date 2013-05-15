/**
*Initialize new pageTreeNode object.
*@classdesc Representing a page-tree node in a PDF document.
*@constructor
*@memberof pdfJS
*@augments pdfJS.obj
*@param {pdfJS.pageTreeNode} parent Parent pageTreeNode of this page.
*@param {int} objectNumber Unique number to define this object.
*@param {int} generationNumber defining the number of time the pdf 
has been modified (default is 0 when creating).
*@param {object} options Define the attributes for pageTree that all
children may inherit from.
*/
var pageTreeNode = function (parent, objectNumber, generationNumber, options) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    /**
        *The parent pageTreeNode of this page-tree.
        *@Type pdfJS.pageTreeNode
        */
    this.parent = parent;
    /**
        *Children of this page-tree node.
        *@type array[[pdfJS.pageTreeNode]{@link pdfJS.pageTreeNode} | 
        [pdfJS.pageNode]{@link pdfJS.pageNode}]
        */
    this.kids = [];
    this.options = options;
};

var walkPageTree = function (pageTree) {
    var count = 0,
        i, item;

    for (i = 0; item = pageTree.kids[i]; i++) {
        if (item instanceof pageNode) {
            count++;
        } else {
            count += walkPageTree(item);
        }
    }
    return count;
};

pageTreeNode.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body = [];
            var i, item;
            this.body.push(
                '<< /Type /Pages',
                pageTreeOptionsConverter(this.options),
                '/Kids [');
            //TODO: add resources for pageTree page 80.
            for (i = 0; item = this.kids[i]; i++) {
                this.body.push(item.objectNumber + ' ' + item.generationNumber + ' R');
            }
            this.body.push(']');

            this.body.push('/Count ' + walkPageTree(this));

            if (this.parent) {
                this.body.push('/Parent ' + this.parent.objectNumber +
                    ' ' + this.parent.generationNumber + ' R');
            }

            this.body.push('>>');
            //calling obj super class out method.
            return obj.prototype.out.apply(this, arguments);
        }
    }
});