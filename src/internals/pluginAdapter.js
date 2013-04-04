var pluginAdapter = function(plugin) {
    var dependencies = [],
        i, l; 

    //inject dependencies
    for (i = 0, l = plugin.length - 1; i < l; i++) {
        switch(plugin[i]) {
            case 'doc':
                dependencies.push(doc);
                break;
            case 'stream':
                dependencies.push(stream);
                break;
            case 'pageNode':
                dependencies.push(pageNode);
                break;
            case 'dictionary':
                dependencies.push(dictionary);
                break;
            case 'docTemplate':
                dependencies.push(docTemplate);
                break;
            case 'ellipticalArc':
                dependencies.push(ellipticalArc);
                break;
            case 'font':
                dependencies.push(font);
                break;
            case 'graphicsStateDictionary':
                dependencies.push(graphicsStateDictionary);
                break;
            case 'obj':
                dependencies.push(obj);
                break;
            case 'pageTreeNode':
                dependencies.push(pageTreeNode);
                break;
            case 'utils':
                dependencies.push(utils);
            case 'enums':
                dependencies.push(enums);
                break;
            default:
                dependencies.push(undefined);
        }
    }

    plugin[l].apply(this, dependencies);
}