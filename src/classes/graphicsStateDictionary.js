var graphicsStateDictionary = function (objectNumber, generationNumber, width, height, colorSpace, bpc, filter, options) {

    dictionary.call(this, objectNumber, generationNumber);
};

graphicsStateDictionary.prototype = Object.create(stream.prototype, {
    out: {
        value: function () {
            this.dictionary['Type'] = '/XObject';
            this.dictionary['Subtype'] = '/Image';
            this.dictionary['Width'] = this.width;
            this.dictionary['Height'] = this.height;
            this.dictionary['ColorSpace'] = '/' + this.colorSpace;
            this.dictionary['BitsPerComponent'] = this.bpc;

            if (this.filter) {
                this.dictionary['Filter'] = '/' + this.filter;
            }
            return stream.prototype.out.apply(this, arguments); //calling obj super class out method.
        }
    }
});
