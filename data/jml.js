/*globals DOMParser, XMLSerializer, module*/
(function () {
/*
Todos inspired by JsonML: https://github.com/mckamey/jsonml/blob/master/jsonml-html.js
0. Support style object? / Confirm utility of JsonML fix for style attribute and IE; if so, handle style.cssFloat (or style.styleFloat in IE)

0. Add JsonML code to handle name attribute (during element creation)
0. boolean attributes?
0. DOM attributes?
0. duplicate attributes?
0. expand with attr_map
0. equivalent of markup, to allow strings to be embedded within an object (e.g., {$value: '<div>id</div>'}); advantage over innerHTML in that it wouldn't need to work as the entire contents (nor destroy any existing content or handlers)
0. More validation?
0. JsonML DOM Level 0 listener
0. Whitespace trimming?

JsonML element-specific:
0. table appending
0. IE object-param handling
0. canHaveChildren necessary? (attempts to append to script and img)

Todos:
0. Note to self: Integrate research from other jml notes
0. Allow array as single first argument
0. Settle on whether need to use null as last argument to return array (or fragment) or other way to allow appending? Options object at end instead to indicate whether returning array, fragment, first element, etc.?
0. Allow building of generic XML (pass configuration object)
0. Allow building content internally as a string (though allowing DOM methods, etc.?)
0. Support JsonML empty string element name to represent fragments?
0. Redo browser testing of jml (including ensuring IE7 can work even if test framework can't work)
*/

    'use strict';

    /**
    * Retrieve the (lower-cased) HTML name of a node
    * @static
    * @param {Node} node The HTML node
    * @returns {String} The lower-cased node name
    */
    function _getHTMLNodeName (node) {
        return node.nodeName && node.nodeName.toLowerCase();
    }

    /**
    * Apply styles if this is a style tag
    * @static
    * @param {Node} node The element to check whether it is a style tag
    */
    function _applyAnyStylesheet (node) {
        if (!document.createStyleSheet) {
            return;
        }
        if (_getHTMLNodeName(node) === 'style') { // IE
            var ss = document.createStyleSheet(); // Create a stylesheet to actually do something useful
            ss.cssText = node.cssText;
            // We continue to add the style tag, however
        }
    }

    /**
     * Need this function for IE since options weren't otherwise getting added
     * @private
     * @static
     * @param {DOMElement} parent The parent to which to append the element
     * @param {DOMNode} child The element or other node to append to the parent
     */
    function _appendNode (parent, child) {
        var parentName = _getHTMLNodeName(parent),
            childName = _getHTMLNodeName(child);

        if (document.createStyleSheet) {
            if (parentName === 'script') {
                parent.text = child.nodeValue;
                return;
            }
            if (parentName === 'style') {
                parent.cssText = child.nodeValue; // This will not apply it--just make it available within the DOM cotents
                return;
            }
        }
        try {
            parent.appendChild(child); // IE9 is now ok with this
        }
        catch (e) {
            if (parentName === 'select' && childName === 'option') {
                try { // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
                    parent.add(child);
                }
                catch (err) { // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
                    parent.add(child, null); // IE7 has a problem with this, but IE8+ is ok
                }
                return;
            }
            throw e;
        }
    }

    /**
     * Attach event in a cross-browser fashion
     * @static
     * @param {DOMElement} el DOM element to which to attach the event
     * @param {String} type The DOM event (without 'on') to attach to the element
     * @param {Function} handler The event handler to attach to the element
     * @param {Boolean} [capturing] Whether or not the event should be
     *                                                              capturing (W3C-browsers only); default is false; NOT IN USE
     */
    function _addEvent (el, type, handler, capturing) {
        if (el.addEventListener) { // W3C
            el.addEventListener(type, handler, !!capturing);
        }
        else if (el.attachEvent) { // IE
            el.attachEvent('on' + type, handler);
        }
        else { // OLDER BROWSERS (DOM0)
            el['on' + type] = handler;
        }
    }

    /**
    * Creates a text node of the result of resolving an entity or character reference
    * @param {'entity'|'decimal'|'hexadecimal'} type Type of reference
    * @param {String} prefix Text to prefix immediately after the "&"
    * @param {String} arg The body of the reference
    * @returns {Text} The text node of the resolved reference
    */
    function _createSafeReference (type, prefix, arg) {
        // For security reasons related to innerHTML, we ensure this string only contains potential entity characters
        if (!arg.match(/^\w+$/)) {
            throw 'Bad ' + type;
        }
        var elContainer = document.createElement('div');
        // Todo: No workaround for XML?
        elContainer.innerHTML = '&' + prefix + arg + ';';
        return document.createTextNode(elContainer.innerHTML);
    }

    /**
    * @param {String} n0 Whole expression match (including "-")
    * @param {String} n1 Lower-case letter match
    * @returns {String} Uppercased letter
    */
    function _upperCase (n0, n1) {
        return n1.toUpperCase();
    }

    /**
     * Creates an XHTML or HTML element (XHTML is preferred, but only in browsers that support);
     * Any element after element can be omitted, and any subsequent type or types added afterwards
     * @requires polyfill: Array.isArray
     * @requires polyfill: Array.prototype.reduce For returning a document fragment
     * @requires polyfill: Element.prototype.dataset For dataset functionality (Will not work in IE <= 7)
     * @param {String} el The element to create (by lower-case name)
     * @param {Object} [atts] Attributes to add with the key as the attribute name and value as the
     *                                               attribute value; important for IE where the input element's type cannot
     *                                               be added later after already added to the page
     * @param {DOMElement[]} [children] The optional children of this element (but raw DOM elements
     *                                                                      required to be specified within arrays since
     *                                                                      could not otherwise be distinguished from siblings being added)
     * @param {DOMElement} [parent] The optional parent to which to attach the element (always the last
     *                                                                  unless followed by null, in which case it is the second-to-last)
     * @param {null} [returning] Can use null to indicate an array of elements should be returned
     * @returns {DOMElement} The newly created (and possibly already appended) element or array of elements
     */
    function jml () {
        var i, arg, procValue, p, p2, attVal, replacer = '', xmlns, val, k, elsl, j, cl, elem = document.createDocumentFragment(), nodes = [], elStr, atts, child = [], argc = arguments.length, argv = arguments, NS_HTML = 'http://www.w3.org/1999/xhtml',
            _getType = function (item) {
                if (typeof item === 'string') {
                    return 'string';
                }
                if (typeof item === 'object') {
                    if (item === null) {
                        return 'null';
                    }
                    if (Array.isArray(item)) {
                        return 'array';
                    }
                    if (item.nodeType === 1) {
                        return 'element';
                    }
                    return 'object';
                }
            },
            fragReducer = function (frag, node) {
                frag.appendChild(node);
                return frag;
            },
            replaceDefiner = function (xmlnsObj) {
                return function (n0) {
                    var retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : (n0 || ''); // Preserve XHTML
                    for (xmlns in xmlnsObj) {
                        if (xmlns !== '') {
                            retStr += ' xmlns:' + xmlns + '="' + xmlnsObj[xmlns] + '"';
                        }
                    }
                    return retStr;
                };
            };
        for (i = 0; i < argc; i++) {
            arg = argv[i];
            switch (_getType(arg)) {
                case 'null': // null always indicates a place-holder (only needed for last argument if want array returned)
                    if (i === argc - 1) {
                        _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
                        // Todo: Fix to allow application of stylesheets of style tags within fragments?
                        return nodes.length <= 1 ? nodes[0] : nodes.reduce(fragReducer, document.createDocumentFragment()); // nodes;
                    }
                    break;
                case 'string': // Strings indicate elements
                    switch (arg) {
                        case '!':
                            nodes[nodes.length] = document.createComment(argv[++i]);
                            break;
                        case '?':
                            arg = argv[++i];
                            procValue = val = argv[++i];
                            if (typeof val === 'object') {
                                procValue = [];
                                for (p in val) {
                                    if (val.hasOwnProperty(p)) {
                                        procValue.push(p + '=' + '"' + val[p].replace(/"/g, '\\"') + '"');
                                    }
                                }
                                procValue = procValue.join(' ');
                            }
                            // Firefox allows instructions with ">" in this method, but not if placed directly!
                            try {
                                nodes[nodes.length] = document.createProcessingInstruction(arg, procValue);
                            }
                            catch(e) { // Getting NotSupportedError in IE, so we try to imitate a processing instruction with a comment
                                // innerHTML didn't work
                                    // var elContainer = document.createElement('div');
                                    // elContainer.innerHTML = '<?' + document.createTextNode(arg + ' ' + procValue).nodeValue + '?>';
                                    // nodes[nodes.length] = elContainer.innerHTML;
                                // Todo: any other way to resolve? Just use XML?
                                nodes[nodes.length] = document.createComment('?' + arg + ' ' + procValue + '?');
                            }
                            break;
                        // Browsers don't support document.createEntityReference, so we just use this as a convenience
                        case '&':
                            nodes[nodes.length] = _createSafeReference('entity', '', argv[++i]);
                            break;
                        case '#': // // Decimal character reference - '#', ['01234'] // &#01234; // probably easier to use JavaScript Unicode escapes
                            nodes[nodes.length] = _createSafeReference('decimal', arg, argv[++i]);
                            break;
                        case '#x': // Hex character reference - '#x', ['123a'] // &#x123a; // probably easier to use JavaScript Unicode escapes
                            nodes[nodes.length] = _createSafeReference('hexadecimal', arg, argv[++i]);
                            break;
                        case '![':
                            // '![', ['escaped <&> text'] // <![CDATA[escaped <&> text]]>
                            // CDATA valid in XML only, so we'll just treat as text for mutual compatibility
                            // Todo: config (or detection via some kind of document.documentType property?) of whether in XML
                            try {
                                nodes[nodes.length] = document.createCDATASection(argv[++i]);
                            }
                            catch (e2) {
                                nodes[nodes.length] = document.createTextNode(argv[i]); // i already incremented
                            }
                            break;
                        case '':
                            nodes[nodes.length] = document.createDocumentFragment();
                            break;
                        default: // An element
                            elStr = arg;
                            if (document.createElementNS) {
                                elem = document.createElementNS(NS_HTML, elStr);
                            }
                            // Fix this to depend on XML/config, not availability of methods
                            else {
                                elem = document.createElement(elStr);
                            }
                            nodes[nodes.length] = elem; // Add to parent
                            break;
                    }
                    break;
                case 'object': // Non-DOM-element objects indicate attribute-value pairs
                    atts = arg;

                    if (atts.xmlns !== undefined) { // We handle this here, as otherwise may lose events, etc.
                        // As namespace of element already set as XHTML, we need to change the namespace
                        // elem.setAttribute('xmlns', atts.xmlns); // Doesn't work
                        // Can't set namespaceURI dynamically, renameNode() is not supported, and setAttribute() doesn't work to change the namespace, so we resort to this hack
                        if (typeof atts.xmlns === 'object') {
                            replacer = replaceDefiner(atts.xmlns);
                        }
                        else {
                            replacer = ' xmlns="' + atts.xmlns + '"';
                        }
//try {
                        // Also fix DOMParser to work with text/html
                        elem = nodes[nodes.length - 1] = new DOMParser().parseFromString(
                            new XMLSerializer().serializeToString(elem).
                                // Mozilla adds XHTML namespace
                                replace(' xmlns="' + NS_HTML + '"', replacer),
                            'application/xml'
                        ).documentElement;
//}catch(e) {alert(elem.outerHTML);throw e;}
                    }
                    for (p in atts) {
                        if (atts.hasOwnProperty(p)) {
                            attVal = atts[p];
                            switch(p) {
                                /*
                                Todos:
                                0. Accept array for any attribute with first item as prefix and second as value?
                                0. add '$a' for array of ordered (prefix-)attribute-value arrays
                                0. {$: ['xhtml', 'div']} for prefixed elements
                                0. {$document: []} // document.implementation.createHTMLDocument
                                0. {$xmlDocument: []} // document.implementation.createDocument
                                0. {$documentType: []} // document.implementation.createDocumentType
                                0. Way to create attribute nodes esp. if no element? Now deprecated

                                0. JSON mode to prevent event addition?
                                */
                                /* unfinished:
                                case '$': // Element with prefix?
                                    nodes[nodes.length] = elem = document.createElementNS(attVal[0], attVal[1]);
                                    break;
                                */
                                case '#': // Document fragment
                                    nodes[nodes.length] = jml.apply(null, [attVal]); // Nest within array to avoid confusion with elements
                                    break;
                                case '$on': // Events
                                    for (p2 in attVal) {
                                        if (attVal.hasOwnProperty(p2)) {
                                            val = attVal[p2];
                                            if (typeof val === 'function') {
                                                val = [val, false];
                                            }
                                            _addEvent(elem, p2, val[0], val[1]); // element, event name, handler, capturing
                                        }
                                    }
                                    break;
                                case 'className': case 'class':
                                    elem.className = attVal;
                                    break;
                                case 'dataset':
                                    for (p2 in attVal) { // Map can be keyed with hyphenated or camel-cased properties
                                        if (attVal.hasOwnProperty(p2)) {
                                            elem.dataset[p2.replace(/-([a-z])/g, _upperCase)] = attVal[p2];
                                        }
                                    }
                                    break;
                                // Todo: Disable this by default unless configuration explicitly allows (for security)
                                case 'innerHTML':
                                    elem.innerHTML = attVal;
                                    break;
                                case 'selected' : case 'checked': case 'value':
                                    elem[p] = attVal;
                                    break;
                                case 'htmlFor': case 'for':
                                    if (elStr === 'label') {
                                        elem.htmlFor = attVal;
                                        break;
                                    }
                                    elem.setAttribute(p, attVal);
                                    break;
                                case 'xmlns':
                                    // Already handled
                                    break;
                                default:
                                    if (p.match(/^on/)) {
                                        _addEvent(elem, p.slice(2), attVal, false);
                                        break;
                                    }
                                    if (p === 'style') { // setAttribute will work, but erases any existing styles
                                        if (elem.style.cssText !== undefined) {
                                            elem.style.cssText = attVal; // Todo: If we don't need the following condition, we could change to += to avoid overwriting existing style values
                                        }
                                        else {
                                            elem.style = attVal;
                                        }
                                        break;
                                    }
                                    elem.setAttribute(p, attVal);
                                    break;
                            }
                        }
                    }
                    break;
                case 'element':
                    /*
                    1) Last element always the parent (put null if don't want parent and want to return array) unless only atts and children (no other elements)
                    2) Individual elements (DOM elements or sequences of string[/object/array]) get added to parent first-in, first-added
                    */
                    if (i === argc - 1 || (i === argc - 2 && argv[i+1] === null)) { // parent
                        for (k = 0, elsl = nodes.length; k < elsl; k++) {
                            _appendNode(arg, nodes[k]);
                        }
                        // Todo: Apply stylesheets if any style tags were added elsewhere besides the first element?
                        _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
                    }
                    else {
                        nodes[nodes.length] = arg;
                    }
                    break;
                case 'array': // Arrays or arrays of arrays indicate child nodes
                    child = arg;
                    for (j = 0, cl = child.length; j < cl; j++) { // Go through children array container to handle elements
                        if (typeof child[j] === 'string') {
                            _appendNode(elem, document.createTextNode(child[j]));
                        }
                        else if (Array.isArray(child[j])) { // Arrays representing child elements
                            _appendNode(elem, jml.apply(null, child[j]));
                        }
                        else if (child[j]['#']) { // Fragment
                            _appendNode(elem, jml.apply(null, [child[j]['#']]));
                        }
                        else { // Single DOM element children
                            _appendNode(elem, child[j]);
                        }
                    }
                    break;
            }
        }
        return nodes[0] || elem;
    }

    // EXPORTS
    if (typeof module !== 'undefined') {
        module.exports = jml;
    }
    else if (typeof define === 'function' && define.amd) {
        define(function () {
            return jml;
        });
    }
    else {
        window.jml = jml;
    }

}());
