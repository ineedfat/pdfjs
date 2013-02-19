doc.prototype.newImage = function (imageData) {
    var imageInfo = analyzeImage(imageData);

    var newImage = new imageXObject(++this.objectNumber, 0, imageInfo.width, imageInfo.height, utils.colorSpace.deviceRGB, 8, 'DCTDecode');
    newImage.content.push(imageInfo.data);
    newImage.name = 'Im' + this.resObj.imageXObjects.length;
    this.resObj.imageXObjects.push(newImage);
    
    return newImage;
}

var analyzeImage = function (imageData) {
    if (typeof imageData === 'object' && imageData.nodeType === 1) {
        return processDomImage(imageData);
        //TODO test with regular expression
    } else if (imageData == 'link') {
    }
    
};

var processDomImage = function (img) {
    var canvas = document.createElement('canvas');
    canvas.width = imageData.clientWidth;
    canvas.height = imageData.clientHeight;

    var ctx = canvas.getContext('2d');
    if (!ctx) {
        throw ('addImage requires canvas to be supported by browser.');
    }
    ctx.drawImage(imageData, 0, 0, canvas.width, canvas.height);
    imageData = canvas.toDataURL('image/jpeg');

    return processImageData(imageData, 'jpeg');
};

var processImageData = function (imageData, format) {
    var ret = {
        width: 0,
        height: 0,
        data: ''
    },
        temp;
    format = format.toLowerCase();

    //TODO replace using regex.
    //Convert dataString to binary.
    if (imageData.substring(0, 23) === 'data:image/jpeg;base64,') {
        imageData = atob(imageData.replace('data:image/jpeg;base64,', ''));
        format = 'jpeg';
    }

    //Try JPEG
    try {
        if (format == 'jpeg' || !format) {
            temp = getJpegSize(imageData);
            ret.width = temp[0];
            ret.height = temp[1];
        }
    }
    catch (e) {
        console.log('Image is not JPEG');
    }

    ret.data = imageData;
    return ret;
}

// Algorithm from: http://www.64lines.com/jpeg-width-height
var getJpegSize = function (imgData) {
    var width, height;
    // Verify we have a valid jpeg header 0xff,0xd8,0xff,0xe0,?,?,'J','F','I','F',0x00
    if (!imgData.charCodeAt(0) === 0xff ||
		!imgData.charCodeAt(1) === 0xd8 ||
		!imgData.charCodeAt(2) === 0xff ||
		!imgData.charCodeAt(3) === 0xe0 ||
		!imgData.charCodeAt(6) === 'J'.charCodeAt(0) ||
		!imgData.charCodeAt(7) === 'F'.charCodeAt(0) ||
		!imgData.charCodeAt(8) === 'I'.charCodeAt(0) ||
		!imgData.charCodeAt(9) === 'F'.charCodeAt(0) ||
		!imgData.charCodeAt(10) === 0x00) {
        throw new Error('getJpegSize requires a binary jpeg file')
    }
    var blockLength = imgData.charCodeAt(4) * 256 + imgData.charCodeAt(5);
    var i = 4, len = imgData.length;
    while (i < len) {
        i += blockLength;
        if (imgData.charCodeAt(i) !== 0xff) {
            throw new Error('getJpegSize could not find the size of the image');
        }
        if (imgData.charCodeAt(i + 1) === 0xc0) {
            height = imgData.charCodeAt(i + 5) * 256 + imgData.charCodeAt(i + 6);
            width = imgData.charCodeAt(i + 7) * 256 + imgData.charCodeAt(i + 8);
            return [width, height];
        } else {
            i += 2;
            blockLength = imgData.charCodeAt(i) * 256 + imgData.charCodeAt(i + 1)
        }
    }
}