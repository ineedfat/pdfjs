(function () {
    var walkPageTree = function(pageTree) {
        var count = 0;

        for(var i = 0; item = pageTree.kids[i]; i++) {
            if (item instanceof pdfJS.pageNode) {
                count ++;
            } else {
                count += walkPageTree(item);
            }
        }
        return count;
    };
    pdfJS.pageTreeNode = function (parent, objectNumber, generationNumber) {
        var self = this;

        pdfJS.obj.call(this, objectNumber, generationNumber);
        this.parent = parent;
        this.kids = [];
    };


    pdfJS.pageTreeNode.prototype = Object.create(pdfJS.obj.prototype, {
        out: {
            value: function () {
                var i, item;
                this.body.push(
                    '<< /Type /Pages',
                    '/Kids [');

                for (i = 0; item = this.kids[i]; i++) {
                    this.body.push(item.objectNumber + ' ' + item.generationNumber + ' R');
                }
                this.body.push(']');

                this.body.push('/Count ' + walkPageTree(this));

                if (this.parent) {
                    this.body.push('/Parent ' + this.parent.objectNumber + ' ' + this.parent.generationNumber + ' R');
                }
                
                this.body.push('>>');

                return pdfJS.obj.prototype.out.apply(this, arguments); //calling obj super class out method.

            }
        }
    });

    })();