var plugin = plugin || {};

plugin.highchart = ['stream', 'utils', function (stream, utils) {
    var renderHighChart = function (highChart, width, height) {
        if (!width || !height) {
            
        }
        var div = document.createElement("div");
        div.style.height = (height) + 'px';
        div.style.width = (width) + 'px';

        var options = utils.clone(highChart.options);

        if (!options.chart) {
            options.chart = {};
        }

        options.chart.renderTo = div;
        return new Highcharts.Chart(options);
    };
    var computeChartDimension = function(highChart, width, height) {
        var chargSvg = highChart.container.childNodes[0],
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
            var chartSvg = newChart.container.childNodes[0];
            ret = {
                width: parseInt(chartSvg.attributes['width'].value),
                height: parseInt(chartSvg.attributes['height'].value)
            };
        }
        return ret;
    };
    stream.prototype.addHighChart =
        function (highChart, x, y, processCallback, sourceWidth, sourceHeight, printWidth, printHeight) {
            var pageWidth = this.doc.settings.dimension[0],
                scaleX, scaleY, svgWidth, svgHeight, reader, graphicsState;

            var dimension = computeChartDimension(highChart, sourceWidth, sourceHeight);
            var newChart = renderHighChart(highChart, dimension.width, dimension.height);

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

            return { width: scaleX * svgWidth, height: scaleY * svgHeight };
        };
}];
pdfJS.addPlugin(plugin.highchart);