function dictionary (objectNumber, generationNumber, type, options) {
    this.type = type;
    this.options = options;
    obj.call(this, objectNumber, generationNumber);
   
}

dictionary.prototype = Object.create(obj.prototype, {
    out: {
        value: function () {
            this.body = [];
            this.body.push('<< /Type /' + this.type);
            this.body.push(utils.evalOptions(this.options));

            this.body.push('>>');

            return obj.prototype.out.apply(this, arguments); //calling obj super class out method.
        }
    }
});