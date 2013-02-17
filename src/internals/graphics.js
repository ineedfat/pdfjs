doc.prototype.setGraphicsState = function (options) {
    for (var item in options) {
        if (!options.hasOwnProperty(item))
            return;
        switch (item.toLowerCase()) {
            //Setting the text font and font size
            //Expect object: {fontName: Time, fontStyle: Normal, size: 16}
            case 'font':
                var opt = options[item];
                var fontKey;
                try {
                    fontKey = this.fontmap[opt.fontName][opt.fontStyle];
                }
                catch (e) {
                    throw Error('font does not exist.');
                }

                var font = this.fonts[fontKey];
                //TODO: Search for font name from font dictionary
        }
    }
};