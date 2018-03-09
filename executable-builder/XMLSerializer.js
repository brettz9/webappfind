// From https://github.com/brettz9/jamilih/blob/master/polyfills/XMLSerializer.js
/* globals DOMException */
/**
* Currently applying not only as a polyfill for IE but for other browsers in order to ensure consistent serialization. For example,
*  its serialization method is serializing attributes in alphabetical order despite Mozilla doing so in document order since
* IE does not appear to otherwise give a readily determinable order
* Looks for optional, non-standard $overrideNative boolean property
* @license MIT, GPL, Do what you want
* @requires polyfill: Array.from
* @requires polyfill: Array.prototype.map
* @requires polyfill: Node.prototype.lookupNamespaceURI
* @todo NOT COMPLETE! Especially for namespaces
*/
var XMLSerializer; // eslint-disable-line no-var
(function () {
'use strict';
if (!XMLSerializer) {
    XMLSerializer = function () {};
}
const prohibitHTMLOnly = true,
    _serializeToString = XMLSerializer.prototype.serializeToString,
    emptyElements = '|basefont|frame|isindex' + // Deprecated
    '|area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr|',
    nonEmptyElements = 'article|aside|audio|bdi|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|rp|rt|ruby|section|summary|time|video' + // new in HTML5
    'html|body|p|h1|h2|h3|h4|h5|h6|form|button|fieldset|label|legend|select|option|optgroup|textarea|table|tbody|colgroup|tr|td|tfoot|thead|th|caption|abbr|acronym|address|b|bdo|big|blockquote|center|code|cite|del|dfn|em|font|i|ins|kbd|pre|q|s|samp|small|strike|strong|sub|sup|tt|u|var|ul|ol|li|dd|dl|dt|dir|menu|frameset|iframe|noframes|head|title|a|map|div|span|style|script|noscript|applet|object|',
    pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/,
    xmlChars = /([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/,
    entify = function (str) { // FIX: this is probably too many replaces in some cases and a call to it may not be needed at all in some cases
        return str.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    },
    clone = function (obj) { // We don't need a deep clone, so this should be sufficient without recursion
        const newObj = {};
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                newObj[prop] = obj[prop];
            }
        }
        return JSON.parse(JSON.stringify(newObj));
    },
    invalidStateError = function () { // These are probably only necessary if working with text/html
        if (prohibitHTMLOnly) {
            // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
            throw window.DOMException && DOMException.create
                ? DOMException.create(11)
                // If the (nonstandard) polyfill plugin helper is not loaded (e.g., to reduce overhead and/or modifying a global's property), we'll throw our own light DOMException
                : {message: 'INVALID_STATE_ERR: DOM Exception 11', code: 11};
        }
    },
    addExternalID = function (node, all) {
        if (node.systemId.indexOf('"') !== -1 && node.systemId.indexOf("'") !== -1) {
            invalidStateError();
        }
        let string = '';
        const {publicId, systemId} = node;
        const publicQuote = publicId && publicId.indexOf("'") !== -1 ? "'" : '"', // Don't need to check for quotes here, since not allowed with public
            systemQuote = systemId && systemId.indexOf("'") !== -1 ? "'" : '"'; // If as "entity" inside, will it return quote or entity? If former, we need to entify here (should be an error per section 9.3 of http://www.w3.org/TR/html5/the-xhtml-syntax.html )
        if (systemId !== null && publicId !== null) {
            string += ' PUBLIC ' + publicQuote + publicId + publicQuote + ' ' + systemQuote + systemId + systemQuote;
        } else if (publicId !== null) {
            string += ' PUBLIC ' + publicQuote + publicId + publicQuote;
        } else if (all || systemId !== null) {
            string += ' SYSTEM ' + systemQuote + systemId + systemQuote;
        }
        return string;
    },
    notIEInsertedAttributes = function (att, node, nameVals) {
        return nameVals.every(function (nameVal) {
            const name = Array.isArray(nameVal) ? nameVal[0] : nameVal,
                val = Array.isArray(nameVal) ? nameVal[1] : null;
            return att.name !== name ||
                (val && att.value !== val) ||
                // (!node.outerHTML.match(new RegExp(' ' + name + '=')));
                (node.outerHTML.match(new RegExp(' ' + name + '=' + val ? '"' + val + '"' : '')));
        });
    },
    serializeToString = function (nodeArg) {
        if (!this.$overrideNative && _serializeToString) {
            return _serializeToString.apply(this, arguments);
        }

        // if (nodeArg.xml) { // If this is genuine XML, IE should be able to handle it (and anyways, I am not sure how to override the prototype of XML elements in IE as we must do to add the likes of lookupNamespaceURI)
        //   return nodeArg.xml;
        // }
        const that = this,
            mode = this.$mode || 'xml',
            ieFix = true, // Todo: Make conditional on IE and processing of HTML
            mozilla = true, // Todo: Detect (since built-in lookupNamespaceURI() appears to always return null now for HTML elements),
            // htmlElement = true, // Todo: Make conditional on namespace?
            namespaces = {},
            xmlDeclaration = true,
            nodeType = nodeArg.nodeType;
        let string = '';

        function serializeDOM (node, namespaces) {
            let children, tagName, tagAttributes, tagAttLen, opt, optionsLen, prefix, val, content, i, textNode,
                string = '';
            const nodeValue = node.nodeValue,
                type = node.nodeType;
            namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

            if ((node.prefix && node.prefix.indexOf(':') !== -1) || (node.localName && node.localName.indexOf(':') !== -1)) {
                invalidStateError();
            }

            if (
                ((type === 3 || type === 4 || type === 7 || type === 8) &&
                    !xmlChars.test(nodeValue)) ||
                ((type === 2) && !xmlChars.test(node.value)) // Attr.nodeValue is now deprecated, so we use Attr.value
            ) {
                invalidStateError();
            }

            switch (type) {
            case 1: // ELEMENT
                tagName = node.tagName;

                if (ieFix) {
                    tagName = tagName.toLowerCase();
                }

                if (that.$formSerialize) {
                    // Firefox serializes certain properties even if only set via JavaScript ("disabled", "readonly") and it sometimes even adds the "value" property in certain cases (<input type=hidden>)
                    if ('|input|button|object|'.indexOf('|' + tagName + '|') > -1) {
                        if (node.value !== node.defaultValue) { // May be undefined for an object, or empty string for input, etc.
                            node.setAttribute('value', node.value);
                        }
                        if (tagName === 'input' && node.checked !== node.defaultChecked) {
                            if (node.checked) {
                                node.setAttribute('checked', 'checked');
                            } else {
                                node.removeAttribute('checked');
                            }
                        }
                    } else if (tagName === 'select') {
                        for (i = 0, optionsLen = node.options.length; i < optionsLen; i++) {
                            opt = node.options[i];
                            if (opt.selected !== opt.defaultSelected) {
                                if (opt.selected) {
                                    opt.setAttribute('selected', 'selected');
                                } else {
                                    opt.removeAttribute('selected');
                                }
                            }
                        }
                    }
                }

                // Make this consistent, e.g., so browsers can be reliable in serialization

                // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, but we can safely use name and value
                tagAttributes = [].slice.call(node.attributes).sort(function (attr1, attr2) {
                    return attr1.name > attr2.name ? 1 : -1;
                });

                prefix = node.prefix;

                string += '<' + tagName;
                /**/
                // Do the attributes above cover our namespaces ok? What if unused but in the DOM?
                if ((mozilla || !node.lookupNamespaceURI || node.lookupNamespaceURI(prefix) !== null) && namespaces[prefix || '$'] === undefined) {
                    namespaces[prefix || '$'] = node.namespaceURI || 'http://www.w3.org/1999/xhtml';
                    string += ' xmlns' + (prefix ? ':' + prefix : '') +
                                '="' + entify(namespaces[prefix || '$']) + '"';
                }
                // */
                tagAttLen = tagAttributes.length;
                // Todo: optimize this by joining the for loops together but inserting into an array to sort
                for (i = 0; i < tagAttLen; i++) {
                    if (tagAttributes[i].name.match(/^xmlns:\w*$/)) {
                        string += ' ' + tagAttributes[i].name + // .toLowerCase() +
                            '="' + entify(tagAttributes[i].value) + '"'; // .toLowerCase()
                    }
                }
                for (i = 0; i < tagAttLen; i++) {
                    if (
                        // IE includes attributes like type=text even if not explicitly added as such
                        // Todo: Maybe we should ALWAYS apply instead of never apply in the case of type=text?
                        // Todo: Does XMLSerializer serialize properties in any browsers as well (e.g., if after setting an input.value); it does not in Firefox, but I think this could be very useful (especially since we are
                        // changing native behavior in Firefox anyways in order to sort attributes in a consistent manner
                        // with IE
                        notIEInsertedAttributes(tagAttributes[i], node, [
                            ['type', 'text'], 'colSpan', 'rowSpan', 'cssText', 'shape'
                        ]) &&
                        !tagAttributes[i].name.match(/^xmlns:?\w*$/) // Avoid adding these (e.g., from Firefox) as we add above
                    ) {
                        string += ' ' + tagAttributes[i].name + // .toLowerCase() +
                            '="' + entify(tagAttributes[i].value) + '"'; // .toLowerCase()
                    }
                }

                // Todo: Faster to use array with Array.prototype.indexOf polyfill?
                const emptyElement = emptyElements.indexOf('|' + tagName + '|') > -1;
                const htmlElement = (nonEmptyElements.indexOf('|' + tagName + '|') > -1) || emptyElement;

                if (!node.firstChild && (emptyElement || !htmlElement)) {
                    string += mode === 'xml' ? ' />' : '>';
                } else {
                    string += '>';
                    children = node.childNodes;
                    // Todo: After text nodes are only entified in XML, could change this first block to insist on document.createStyleSheet
                    if (tagName === 'script' || tagName === 'style') {
                        if (tagName === 'script' && (node.type === '' || node.type === 'text/javascript')) {
                            string += document.createStyleSheet ? node.text : node.textContent;
                            // serializeDOM(document.createTextNode(node.text), namespaces);
                        } else if (tagName === 'style') {
                            // serializeDOM(document.createTextNode(node.cssText), namespaces);
                            string += document.createStyleSheet ? node.cssText : node.textContent;
                        }
                    } else {
                        if (that.$formSerialize && tagName === 'textarea') {
                            textNode = document.createTextNode(node.value);
                            children = [textNode];
                        }
                        for (i = 0; i < children.length; i++) {
                            string += serializeDOM(children[i], namespaces);
                        }
                    }
                    string += '</' + tagName + '>';
                }
                break;
            case 2: // ATTRIBUTE (should only get here if passing in an attribute node)
                return ' ' + node.name + // .toLowerCase() +
                                '="' + entify(node.value) + '"'; // .toLowerCase()
            case 3: // TEXT
                return entify(nodeValue); // Todo: only entify for XML
            case 4: // CDATA
                if (nodeValue.indexOf(']]' + '>') !== -1) {
                    invalidStateError();
                }
                return '<' + '![CDATA[' +
                                nodeValue +
                                ']]' + '>';
            case 5: // ENTITY REFERENCE (probably not used in browsers since already resolved)
                return '&' + node.nodeName + ';';
            case 6: // ENTITY (would need to pass in directly)
                val = '';
                content = node.firstChild;

                if (node.xmlEncoding) { // an external entity file?
                    string += '<?xml ';
                    if (node.xmlVersion) {
                        string += 'version="' + node.xmlVersion + '" ';
                    }
                    string += 'encoding="' + node.xmlEncoding + '"' +
                                    '?>';

                    if (!content) {
                        return '';
                    }
                    while (content) {
                        val += content.nodeValue; // FIX: allow for other entity types
                        content = content.nextSibling;
                    }
                    return string + content; // reconstruct external entity file, if this is that
                }
                string += '<' + '!ENTITY ' + node.nodeName + ' ';
                if (node.publicId || node.systemId) { // External Entity?
                    string += addExternalID(node);
                    if (node.notationName) {
                        string += ' NDATA ' + node.notationName;
                    }
                    string += '>';
                    break;
                }

                if (!content) {
                    return '';
                }
                while (content) {
                    val += content.nodeValue; // FIX: allow for other entity types
                    content = content.nextSibling;
                }
                string += '"' + entify(val) + '">';
                break;
            case 7: // PROCESSING INSTRUCTION
                if (/^xml$/i.test(node.target)) {
                    invalidStateError();
                }
                if (node.target.indexOf('?>') !== -1) {
                    invalidStateError();
                }
                if (node.target.indexOf(':') !== -1) {
                    invalidStateError();
                }
                if (node.data.indexOf('?>') !== -1) {
                    invalidStateError();
                }
                return '<?' + node.target + ' ' + nodeValue + '?>';
            case 8: // COMMENT
                if (nodeValue.indexOf('--') !== -1 ||
                    (nodeValue.length && nodeValue.lastIndexOf('-') === nodeValue.length - 1)
                ) {
                    invalidStateError();
                }
                return '<' + '!--' + nodeValue + '-->';
            case 9: // DOCUMENT (handled earlier in script)
                break;
            case 10: // DOCUMENT TYPE
                string += '<' + '!DOCTYPE ' + node.name;
                if (!pubIdChar.test(node.publicId)) {
                    invalidStateError();
                }
                string += addExternalID(node) +
                                (node.internalSubset ? '[\n' + node.internalSubset + '\n]' : '') +
                                '>\n';
                /* Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD
                var notations = node.notations;
                if (notations) {
                    for (i=0; i < notations.length; i++) {
                        serializeDOM(notations[0], namespaces);
                    }
                }
                */
                // UNFINISHED
                break;
            case 11: // DOCUMENT FRAGMENT (handled earlier in script)
                break;
            case 12: // NOTATION (would need to be passed in directly)
                return '<' + '!NOTATION ' + node.nodeName +
                                addExternalID(node, true) +
                                '>';
            default:
                throw new TypeError('Not an XML type');
            }
            return string;
        }

        if (xmlDeclaration && document.xmlVersion && nodeType === 9) { // DOCUMENT - Faster to do it here without first calling serializeDOM
            string += '<?xml version="' + document.xmlVersion + '"';
            if (document.xmlEncoding !== undefined && document.xmlEncoding !== null) {
                string += ' encoding="' + document.xmlEncoding + '"';
            }
            if (document.xmlStandalone !== undefined) { // Could configure to only output if "yes"
                string += ' standalone="' + (document.xmlStandalone ? 'yes' : 'no') + '"';
            }
            string += '?>\n';
        }
        if (nodeType === 9 || nodeType === 11) { // DOCUMENT & DOCUMENT FRAGMENT - Faster to do it here without first calling serializeDOM
            const children = nodeArg.childNodes;
            for (let i = 0; i < children.length; i++) {
                string += serializeDOM(children[i] /* .cloneNode(true) */, namespaces);
            }
            return string;
        }
        // While safer to clone to avoid modifying original DOM, we need to iterate over properties to obtain textareas and select menu states (if they have been set dynamically) and these states are lost upon cloning (even though dynamic setting of input boxes is not lost to the DOM)
        // See http://stackoverflow.com/a/21060052/271577 and:
        // https://bugzilla.mozilla.org/show_bug.cgi?id=197294
        // https://bugzilla.mozilla.org/show_bug.cgi?id=230307
        // https://bugzilla.mozilla.org/show_bug.cgi?id=237783
        //            nodeArg = nodeArg.cloneNode(true);
        return serializeDOM(nodeArg, namespaces);
    };

XMLSerializer.prototype.serializeToString = serializeToString;

/* if (!Element.prototype.outerHTML) {
    var ser = new XMLSerializer();
    ser.$mode = 'html';
    Object.defineProperty(Element.prototype.outerHTML, {get: function () {
        return ser.serializeToString.apply(ser, arguments);
    }});
} */
}());
