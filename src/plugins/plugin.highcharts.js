var plugin = plugin || {};

plugin.highcharts = ['stream', 'utils', function (stream, utils) {
    var renderHighchart = function (highchart, width, height) {
        var div = document.createElement("div");
        div.style.height = (height) + 'px';
        div.style.width = (width) + 'px';
        div.style.opacity = 0;
        div.setAttribute('id', 'cloneHighchart');
        
        var options = utils.clone(highchart.options);
        if (!options.chart) {
            options.chart = {};
        }
        options.chart.renderTo = div;
        
        /*We need to temporary inject this into the DOM
        otherwise highchats may not render the chart correctly.*/
        document.body.appendChild(div);
        return new Highcharts.Chart(options);
    };
    var computeChartDimension = function(highchart, width, height) {
        var chargSvg = highchart.container.childNodes[0],
            origHeight = parseInt(chargSvg.attributes['height'].value),
            origWidth = parseInt(chargSvg.attributes['width'].value),
            aspectRatio = origWidth / origHeight;

        var ret;
        if (width && height) {
            ret = { width: width, height: height };
        } else if (width && !height) {
            ret = { width: width, height: width * (1 / aspectRatio) };
        } else if (!width && height) {
            ret = { width: height * aspectRatio, height: height };
        } else {
            var chartSvg = highchart.container.childNodes[0];
            ret = {
                width: parseInt(chartSvg.attributes['width'].value),
                height: parseInt(chartSvg.attributes['height'].value)
            };
        }
        return ret;
    };
    stream.prototype.addHighchart =
        function (highchart, x, y, processCallback, sourceWidth, sourceHeight, printWidth, printHeight) {
            var pageWidth = this.doc.settings.dimension[0],
                scaleX, scaleY, svgWidth, svgHeight, reader, graphicsState;

            var dimension = computeChartDimension(highchart, sourceWidth, sourceHeight);
            var newChart = renderHighchart(highchart, dimension.width, dimension.height);

            processCallback(newChart);
            var chartSvg = newChart.container.childNodes[0];
            svgWidth = parseInt(chartSvg.attributes['width'].value);
            svgHeight = parseInt(chartSvg.attributes['height'].value);
            graphicsState = this.getCurrentGraphicState();

            if (printWidth && printHeight) {
                scaleX = printWidth / svgWidth;
                scaleY = printWidth / svgHeight;
            } else if (printWidth && !printHeight) {
                scaleX = scaleY = printWidth / svgWidth;
            } else if (!printWidth && printHeight) {
                scaleY = scaleX = printHeight / svgHeight;
            } else {
                scaleX = scaleY =  pageWidth / svgWidth;
            }
            reader = this.doc.svgReader(this);
            this.pushState();
            this.translate(x - graphicsState.cpX, y - graphicsState.cpY);
            this.scale(scaleX, scaleY);
            reader.drawSvg(chartSvg);
            this.popState();

            newChart.destroy();
            document.body.removeChild(document.getElementById('cloneHighchart'));

            return { width: scaleX * svgWidth, height: scaleY * svgHeight };
        };
}];
pdfJS.addPlugin(plugin.highcharts);