'use strict';
/**
 * @ngdoc directive
 * @name ng.directive:ngChildWindow
 *
 * @description
 * The 'ngChildWindow' directive allows creation of an external child window that share the same
 * scope as the parent window. This allow an angular application to span over multiple window and
 * allowing a multi-window environment application. 
 *
 * Note: When creating a new dom element dynamically using native javascript, the new dom element
 * will get created under the context of the parent window. This will cause some browser to throw
 * an exception if attempt to append to the child-window. In order to avoid the problem, create
 * the element using jQueryor use the child-window's window instance
 (e.g childWindow.document.createElement).
 *
 * @param {string} ngChildWindow angular expression evaluating to a URL of an html page or a
 * template html string.
 * @param {bool} toggle It uses to toggle (close/open) the child-window.
 * @param {string} name value used in sepcifying the target attribute or the name of the
 * child-window.
 * If specified, a property with the same value will be injected into the scope containg the
 * child-window's window instance.
 * @param {string} [title] the window head>title for the child-window if a template html
 * string is used.
 * @param {string} [specs] a comma separated list of items. See native javascript
 * window.open() specs options.
 * @example
 *
 */

/**
 * @ngdoc event
 * @name ng.directive:ngChildWindow#childWindowLoaded
 * @eventOf ng.directive:ngChildWindow
 * @eventType broadcast on the current ngChildWindow scope
 * @description
 * Broadcasted every time the ngChildWindow content is initalized and loaded. The args passed
 * by the event contains the childWindow's window object.
 */
app.directive('example', ['$compile', '$timeout', '$window', '$http', '$templateCache',
    function factory(c, $timeout, $window, $http, $templateCache) {
    	var example = {
    		scope: {
    			title: '@',
    			editorId: '=',
    			editorTheme: '=',
    			editorMode: '=',
    			editorWrap: '=',
    			docLink: '@',
				id: '@'
    		},
    		transclude: true,
    		restrict: 'E',
    		replace: true,
    		templateUrl: './views/exampleview.html',
    		link: function (scope, element, attrs) {
    			var iframe = element.find('iframe');
    			scope.pdfDataUri = '';
    			var updateIframe = function () {
    				var doc = utiles.evalEditorDocCode(scope.editor.getValue());
    				if (doc) {
    					scope.pdfDataUri = doc.output('datauristring');
    					//iframe.attr('src', doc.output('datauristring'));
    				} else {
    					console.log('empty code');
    				}
    				try{
    					scope.$digest();
    				} catch (e) { }
    			};
				//setting up editor
    			if (scope.editorId) {
    				iframe.addClass(scope.editorId + '-frame');
    				iframe.attr('data-ng-src', '{{pdfDataUri}}');
					//Bootstrapping the iframe to scope.
    				c(iframe)(scope);
					scope.editor = ace.edit(scope.editorId);
					scope.editor.setTheme(scope.editorTheme || "ace/theme/monokai");
					scope.editor.getSession().setMode(scope.editorMode || "ace/mode/javascript");
					scope.editor.getSession().setUseWrapMode(scope.editorWrap);
					scope.editor.getSession().setUseSoftTabs(true);
					updateIframe();
					scope.editor.getSession().on('change', updateIframe);
    			}

				

				scope.openChildWindow = function () {
					$window.open(scope.docLink, '_blank');
				};

				
    		}
    	};
    	return example;
    }]);