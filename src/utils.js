var colorCCanvas;
var funcNameRegex = /function (.{1,})\(/;
var sanitizeRegex = /((\(|\)|\\))/ig;
var listParamsRegex = /(\S*)\(((\d|,|;|\.|\-|\s)*)\)/gm;
var operatorRegex = /(\w{1,3}$)/gm;


var utils = {
    radsToDegrees: function(rads) {
        return rads * (180 / Math.PI);
    },
    degreesToRads: function(degrees) {
    return degrees * (Math.PI / 180);
    },
    sanitize: function(text) {
        return text.replace(sanitizeRegex, '\\$1');
    },
    removeEmptyElement: function(arr) {
        var i, l, value, ret = [];
        for (i = 0, l = arr.length; i < l; i++) {
            value = arr[i];
            if (value) {
                ret.push(value);
            }
        }
        return ret;
    },
    getInstanceType: function (o) {
        if (o === null) {
            return null;
        }
        var results = (funcNameRegex).exec(o.constructor.toString());
        return (results && results.length > 1) ? results[1] : '';
    },
    colorToRgb: function(name) {
        if (!colorCCanvas) {
            colorCCanvas = document.createElement('canvas');
        }
        var ctx = colorCCanvas.getContext('2d');
        ctx.strokeStyle = name;
        var colorHex = ctx.strokeStyle;
        return {
            r: (parseInt(colorHex.slice(1, 3), 16) / 255).toFixed(2),
            g: (parseInt(colorHex.slice(3, 5), 16) / 255).toFixed(2),
            b: (parseInt(colorHex.slice(5, 7), 16) / 255).toFixed(2)
        };
    },
    checkValidRect: function (rect) {
        if (!rect || typeof rect !== 'object' || rect.length !== 4) {
            console.warn('Invalid Rect');
            return false;
        }
        for (var i = 0; i < 4; i++) {
            if (typeof rect[i] !== 'number') {
                console.warn('Invalid Rect');
                return false;
            }
        }
        return true;
    },
    padd2: function (number) {
        var n = (number).toFixed(0);
        if (number < 10) {
            return '0' + n;
        } else {
            return n;
        }
    },
    padd10: function (number) {
        var n = (number).toFixed(0);
        if (n.length < 10) {
            return new Array(11 - n.length).join('0') + n;
        } else {
            return n;
        }
    },
    toPrecision: function (arr, n) {
        if (!(arr instanceof Array)) {
            arr = Array.prototype.slice.call(arr);
        }
        if (!n || !n.isNaN || n.isNaN()) {
            n = 2;
        }
        for (var i = 0, l = arr.length; i < l; i++) {
            arr[i] = parseFloat(parseFloat(arr[i]).toFixed(n));
        }
        return arr;
    },
    clone: function (obj) {
        if (typeof obj === 'undefined') {
            return obj;
        }
        var type = utils.getInstanceType(obj),
            index, ret, l;
        switch(type) {
            case 'Object':
                ret = {};
                for (index in obj) {
                    if (obj.hasOwnProperty(index)) {
                        ret[index] = this.clone(obj[index]);
                    }
                }
                break;
            case 'Array':
                ret = [];
                for (index = 0, l = obj.length; index < l; index++)
                {
                    ret.push(this.clone(obj[index]));
                }
                break;
            default:
                ret = obj;
        }
        return ret;
    },
    extend: function (out, obj2) {
        var i, l, obj, prop;
        if (!out) {
            out = {};
        }
        for (i = 1, l = arguments.length; i < l; i++) {
            obj = arguments[i];
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    out[prop] = obj[prop];
                }
            }
        }
        return out;
    },
    evalOptions: function (options) {
        var sb = [], item, index;
        for (index in options) {
            if (options.hasOwnProperty(index)) {
                item = options[index];
                switch(utils.getInstanceType(item)) {
                    case 'String':
                        sb.push('/' + index + ' ' + item);
                        break;
                    case 'Number':
                        sb.push('/' + index + ' ' + utils.toPrecision(item));
                        break;
                    case 'dictionary':
                        console.error('Not yet supported');
                        break;
                }
            }
        }
        return sb.join('\n');
    }
};