var statesTracker = function () {
    this.graphicStack = [{ cpX: 0, cpY: 0, sX: 1, sY: 1, fillColor: [], strokeColor:[] }];
    //TODO: Support Char Spacing, text length, text leading
    this.textStack = [{ tCpX: 0, tCpY: 0, tSX: 1, tSY: 1 }];

    this.isTextMode = false;
    this.operationState = operationStates.pageLevel;
};
statesTracker.prototype = {
    validate: function (operation) {
        if (this.doc.settings.disableValidation) {
            return;
        }
        var opt = operation.match(operatorRegex);
        var transitionTo;
        if (opt) {
            opt = opt[0];
            transitionTo = this.operationState.transition[opt];
            if (transitionTo) {
                this.operationState = transitionTo;
                return;
            }
            if (!this.operationState[opt]) {
                console.error(opt + ' is invalid in this operation state: ' + this.operationState.state + ' at line ' + this.content.length + ' of this content stream');
            }
        }
    },
    graphicStateTranslate: function(x, y) {
        var current = this.getCurrentGraphicState();
        if (typeof x === 'number') {
            current.cpX += current.sX * x;
        }
        if (typeof y === 'number') {
            current.cpY += current.sY * y;
        }
        return { cpX: current.cpX, cpY: current.cpY };
    },
    graphicStateScale: function(sx, sy) {
        var current = this.getCurrentGraphicState();
        if (typeof sx === 'number') {
            current.sX *= sx;
        }
        if (typeof sy === 'number') {
            current.sY *= sy;
        }
        return { sX: current.sX, sY: current.sY };
    },
    graphicStateFillColor: function (args) {
        var current = this.getCurrentGraphicState();
        current.fillColor = arguments;

        return current.fillColor;
    },
    graphicStateStrokeColor: function (args) {
        var current = this.getCurrentGraphicState();
        current.stroke = arguments;

        return current.strokeColor;
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
        if (typeof x === 'number') {
            current.tCpX += x;
        }
        if (typeof y === 'number') {
            current.tCpY += y;
        }
        return { tCpX: current.tCpX, tCpY: current.tCpY };
    },
    textStateScale: function (s) {
        var current = this.getCurrentTextState();
        if (typeof s === 'number') {
            current.tS *= s;
        }

        return current.tS;
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