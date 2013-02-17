var stream = function (objectNumber, generationNumber) {
    var self = this;

    obj.call(this, objectNumber, generationNumber);
    self.content = [];
};


stream.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body.push('<< /Length ' + this.content.join('\n').length + ' >>');
            this.body.push('stream');
            this.body = this.body.concat(this.content);
            this.body.push('endstream');

            return obj.prototype.out.apply(this, arguments); //calling obj super class out method.
        }
    },
    push: {
        value: function (args) {
            Array.prototype.push.apply(this.content, arguments);
        }
    }
});
