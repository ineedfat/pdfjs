var statesTracker = function () {
    this.graphicStack = [{ cpX: 0, cpY: 0, sX: 1, sY: 1 }];
    //TODO: Support Char Spacing, text length, text leading
    this.textStack = [{ tCpX: 0, tCpY: 0, tSX: 1, tSY: 1 }];

    this.isTextMode = false;
    
};
statesTracker.prototype = {
    graphicStateTranslate: function(x, y) {
        var current = this.getCurrentGraphicState();
        current.cpX += current.sX*x;
        current.cpY += current.sY*y;
        //console.log("x: " + current.cpX + ' y: ' + current.cpY);
    },
    graphicStateScale: function(sx, sy) {
        var current = this.getCurrentGraphicState();
        current.sX *= sx;
        current.sY *= sy;
    },
    getCurrentGraphicState: function () {
        return this.graphicStack[this.graphicStack.length - 1];
    },
    pushGraphicState: function () {
        this.graphicStack.push(utils.clone(this.getCurrentGraphicState()));

        this.pushTextState();

    },
    popGraphicState: function () {
        this.popTextState();
    },
    //Text States
    textStateTranslate: function (x, y) {
        var current = this.getCurrentTextState();
        current.tCpX += x;
        current.tCpY += y;
    },
    textStateScale: function (sx, sy) {
        var current = this.getCurrentTextState();
        current.tSX *= sx;
        current.tSY *= sy;
    },
    getCurrentTextState: function () {
        return this.textStack[this.textStack.length - 1];
    },
    pushTextState: function () {
        this.textStack.push(utils.clone(this.getCurrentTextState()));

    },
    popTextState: function () {
        this.textStack.pop();
    }
}