(function () {

    pdfJS.stream = function (objectNumber, generationNumber) {
        var self = this;

        pdfJS.obj.call(this, objectNumber, generationNumber);
        self.content = [];
    };


    pdfJS.stream.prototype = Object.create(pdfJS.obj.prototype, {
        out: {
            value: function () {
                var i, item;
                this.body.push('<< /Length ' + this.content.length + ' >>');
                this.body.push('stream');
                this.body = this.body.concat(this.content);
                this.body.push('endstream');

                return pdfJS.obj.prototype.out.apply(this, arguments); //calling obj super class out method.
            }
        }
    });

})();