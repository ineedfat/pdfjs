var obj = function (objectNumber, generationNumber) {
    var self = this;

    this.objectNumber = objectNumber;
    this.generationNumber = generationNumber;
    this.body = [];
};

obj.prototype = {
    out: function () {
        var self = this,
            sb = [];

        sb.push(this.objectNumber + ' ' + this.generationNumber + ' obj');
        sb = sb.concat(this.body);
        sb.push('endobj');

        return sb.join('\n')
    },
    body: [],
    objectNumber: 0,
    generationNumber: 0
}