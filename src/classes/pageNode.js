var pageNode = function (parent, pageOptions, objectNumber, generationNumber, contentStreams, document) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    this.pageOptions = pageOptions;
    this.parent = parent;
    this.contentStreams = contentStreams;
    this.currentStream = this.contentStreams[0];
    this.doc = document;
};
pageNode.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            var i, item,
                ret = [];

            this.body.push('<< /Type /Page');
            this.body.push(pageOptionsConverter(this.pageOptions));
            this.body.push('/Parent ' + this.parent.objectNumber + ' ' + this.parent.generationNumber + ' R');
            this.body.push('/Contents ');

            if (this.contentStreams.length) {
                this.body.push('[');
                for (i = 0; item = this.contentStreams[i]; i++) {
                    this.body.push(item.objectNumber + ' ' + item.generationNumber + ' R');
                }
                this.body.push(']');
            }

            this.body.push('>>');

            ret.push(obj.prototype.out.apply(this, arguments)); //calling obj super class out method.

            if (this.contentStreams.length) {
                for (i = 0; item = this.contentStreams[i]; i++) {
                    ret.push(item.out());
                }
            }
            return ret.join('\n');
        }
    },
    graphic: {
        value: function (operator, operands) {
            if (this instanceof pageNode) {
                graphicOperators[operator].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    },
    text: {
        value: function (operator, operands) {
            if (this instanceof pageNode) {
                textOperators[operator].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    },
    setStream: {
        value: function (index) {
            if (index >= this.contentStreams.length)
                throw 'Invalid stream index';
            this.currentStream = this.contentStreams[index];
        }
    }
});
