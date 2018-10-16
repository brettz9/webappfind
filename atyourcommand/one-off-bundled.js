(function () {
    'use strict';

    /**
    These may need tweaking or moving out of NormalTags
    Note that img.src and a.href include base URI
     @todo Allow video and audio to be checked for <source> tags
     @todo Do more thorough review of all other tags
     @todo Include SVG elements
    */
    var Tags = [
        ['frames', ['frame', 'frameset', ['iframe', {prop: 'src'}], ['noframes', {hidden: 'feature-present'}]]],
        ['navigation', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'nav']],
        ['block', ['article', 'aside', 'blockquote', 'body', 'center', 'details', 'dialog', 'div', 'fieldset', 'footer', 'listing', 'main', 'marquee', 'p', 'plaintext', 'pre', 'section', 'summary', 'xmp']],
        ['lists', ['dd', 'dir', 'dl', 'dt', 'li', 'ol', 'ul']],
        ['tables', ['caption', ['col', {hidden: true}], ['colgroup', {hidden: true}], 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr']],
        ['forms', ['form', 'isindex', ['input', {prop: 'value'}], 'keygen', ['button', {prop: 'value'}], 'meter', 'optgroup', 'option', ['progress', {prop: 'value'}], ['select', {prop: 'value'}], ['textarea', {prop: 'value'}], 'menu', 'menuitem']],
        ['links_and_anchors', [['a', {prop: 'href', label: "The clicked link's location"}]]], // (or tags like images inside of links or anchors)
        ['inline', [['abbr', {prop: 'title'}], ['acronym', {prop: 'title'}], 'address', 'b', 'bdi', 'bdo', 'big', 'blink', 'cite', 'code', ['data', {prop: 'value'}], 'del', 'dfn', 'em', 'figcaption', 'figure', 'font', 'i', 'ins', 'kbd', 'label', 'legend', 'mark', 'nobr', 'output', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'tt', 'u', 'var']],
        ['time', ['time']],
        ['images', [['img', {prop: 'src', label: "The selected image's location"}], ['map', {hidden: true}], ['area', {hidden: true}], ['canvas', {hidden: true, dataURL: true}]]],
        ['other_media', [['video', {prop: 'src'}], ['audio', {prop: 'src'}], ['bgsound', {hidden: true, prop: 'src'}], ['source', {hidden: true, prop: 'src'}]]],
        ['plugins', [['object', {selector: 'object:not([hidden])', prop: 'data'}], ['object', {selector: 'object[hidden)', prop: 'data'}], ['applet', {selector: 'applet:not([hidden])', prop: 'code'}], ['applet', {selector: 'applet[hidden]', prop: 'code'}], ['embed', {selector: 'embed:not([hidden])', prop: 'src'}], ['embed', {selector: 'embed[hidden]', prop: 'src'}], ['param', {hidden: true, prop: 'value'}]]],
        ['empty_but_visible', ['br', 'hr', 'spacer', 'wbr']],
        ['hidden', [['DOCTYPE', {hidden: true, type: 'special'}], ['comments', {hidden: true, type: 'special'}], ['processing instructions', {hidden: true, type: 'special'}], ['CDATA', {type: 'special'}], 'html', ['head', {hidden: true}], ['meta', {hidden: true}], ['title', {hidden: true, textContents: true}], ['base', {hidden: true}], ['style', {hidden: true, textContents: true}], ['link', {prop: 'href', hidden: true}], ['datalist', {hidden: true}], ['track', {hidden: true}], ['basefont', {hidden: true}]]],
        ['templates', [['content', {hidden: true}], ['decorator', {hidden: true}], ['element', {hidden: true}], ['shadow', {hidden: true}], ['template', {hidden: true}]]],
        ['scripting', [['script', {prop: 'src', hidden: true, textContents: true}], ['noscript', {hidden: 'feature-present'}]]]
    ];

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    var get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);

      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);

        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    };

    var inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };

    var possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    var slicedToArray = function () {
      function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;

        try {
          for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);

            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"]) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }

        return _arr;
      }

      return function (arr, i) {
        if (Array.isArray(arr)) {
          return arr;
        } else if (Symbol.iterator in Object(arr)) {
          return sliceIterator(arr, i);
        } else {
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
      };
    }();

    var toConsumableArray = function (arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

        return arr2;
      } else {
        return Array.from(arr);
      }
    };

    /*
    Possible todos:
    0. Add XSLT to JML-string stylesheet (or even vice versa)
    0. IE problem: Add JsonML code to handle name attribute (during element creation)
    0. Element-specific: IE object-param handling

    Todos inspired by JsonML: https://github.com/mckamey/jsonml/blob/master/jsonml-html.js

    0. duplicate attributes?
    0. expand ATTR_MAP
    0. equivalent of markup, to allow strings to be embedded within an object (e.g., {$value: '<div>id</div>'}); advantage over innerHTML in that it wouldn't need to work as the entire contents (nor destroy any existing content or handlers)
    0. More validation?
    0. JsonML DOM Level 0 listener
    0. Whitespace trimming?

    JsonML element-specific:
    0. table appending
    0. canHaveChildren necessary? (attempts to append to script and img)

    Other Todos:
    0. Note to self: Integrate research from other jml notes
    0. Allow Jamilih to be seeded with an existing element, so as to be able to add/modify attributes and children
    0. Allow array as single first argument
    0. Settle on whether need to use null as last argument to return array (or fragment) or other way to allow appending? Options object at end instead to indicate whether returning array, fragment, first element, etc.?
    0. Allow building of generic XML (pass configuration object)
    0. Allow building content internally as a string (though allowing DOM methods, etc.?)
    0. Support JsonML empty string element name to represent fragments?
    0. Redo browser testing of jml (including ensuring IE7 can work even if test framework can't work)
    */

    var win = typeof window !== 'undefined' && window;
    var doc = typeof document !== 'undefined' && document;
    var XmlSerializer = typeof XMLSerializer !== 'undefined' && XMLSerializer;

    // STATIC PROPERTIES

    var possibleOptions = ['$plugins', '$map' // Add any other options here
    ];

    var NS_HTML = 'http://www.w3.org/1999/xhtml',
        hyphenForCamelCase = /-([a-z])/g;

    var ATTR_MAP = {
        'readonly': 'readOnly'
    };

    // We define separately from ATTR_DOM for clarity (and parity with JsonML) but no current need
    // We don't set attribute esp. for boolean atts as we want to allow setting of `undefined`
    //   (e.g., from an empty variable) on templates to have no effect
    var BOOL_ATTS = ['checked', 'defaultChecked', 'defaultSelected', 'disabled', 'indeterminate', 'open', // Dialog elements
    'readOnly', 'selected'];
    var ATTR_DOM = BOOL_ATTS.concat([// From JsonML
    'accessKey', // HTMLElement
    'async', 'autocapitalize', // HTMLElement
    'autofocus', 'contentEditable', // HTMLElement through ElementContentEditable
    'defaultValue', 'defer', 'draggable', // HTMLElement
    'formnovalidate', 'hidden', // HTMLElement
    'innerText', // HTMLElement
    'inputMode', // HTMLElement through ElementContentEditable
    'ismap', 'multiple', 'novalidate', 'pattern', 'required', 'spellcheck', // HTMLElement
    'translate', // HTMLElement
    'value', 'willvalidate']);
    // Todo: Add more to this as useful for templating
    //   to avoid setting through nullish value
    var NULLABLES = ['dir', // HTMLElement
    'lang', // HTMLElement
    'max', 'min', 'title' // HTMLElement
    ];

    var $ = function $(sel) {
        return doc.querySelector(sel);
    };
    var $$ = function $$(sel) {
        return [].concat(toConsumableArray(doc.querySelectorAll(sel)));
    };

    /**
    * Retrieve the (lower-cased) HTML name of a node
    * @static
    * @param {Node} node The HTML node
    * @returns {String} The lower-cased node name
    */
    function _getHTMLNodeName(node) {
        return node.nodeName && node.nodeName.toLowerCase();
    }

    /**
    * Apply styles if this is a style tag
    * @static
    * @param {Node} node The element to check whether it is a style tag
    */
    function _applyAnyStylesheet(node) {
        if (!doc.createStyleSheet) {
            return;
        }
        if (_getHTMLNodeName(node) === 'style') {
            // IE
            var ss = doc.createStyleSheet(); // Create a stylesheet to actually do something useful
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
    function _appendNode(parent, child) {
        var parentName = _getHTMLNodeName(parent);
        var childName = _getHTMLNodeName(child);

        if (doc.createStyleSheet) {
            if (parentName === 'script') {
                parent.text = child.nodeValue;
                return;
            }
            if (parentName === 'style') {
                parent.cssText = child.nodeValue; // This will not apply it--just make it available within the DOM cotents
                return;
            }
        }
        if (parentName === 'template') {
            parent.content.appendChild(child);
            return;
        }
        try {
            parent.appendChild(child); // IE9 is now ok with this
        } catch (e) {
            if (parentName === 'select' && childName === 'option') {
                try {
                    // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
                    parent.add(child);
                } catch (err) {
                    // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
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
    function _addEvent(el, type, handler, capturing) {
        el.addEventListener(type, handler, !!capturing);
    }

    /**
    * Creates a text node of the result of resolving an entity or character reference
    * @param {'entity'|'decimal'|'hexadecimal'} type Type of reference
    * @param {String} prefix Text to prefix immediately after the "&"
    * @param {String} arg The body of the reference
    * @returns {Text} The text node of the resolved reference
    */
    function _createSafeReference(type, prefix, arg) {
        // For security reasons related to innerHTML, we ensure this string only contains potential entity characters
        if (!arg.match(/^\w+$/)) {
            throw new TypeError('Bad ' + type);
        }
        var elContainer = doc.createElement('div');
        // Todo: No workaround for XML?
        elContainer.textContent = '&' + prefix + arg + ';';
        return doc.createTextNode(elContainer.textContent);
    }

    /**
    * @param {String} n0 Whole expression match (including "-")
    * @param {String} n1 Lower-case letter match
    * @returns {String} Uppercased letter
    */
    function _upperCase(n0, n1) {
        return n1.toUpperCase();
    }

    /**
    * @private
    * @static
    */
    function _getType(item) {
        if (typeof item === 'string') {
            return 'string';
        }
        if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
            if (item === null) {
                return 'null';
            }
            if (Array.isArray(item)) {
                return 'array';
            }
            if ('nodeType' in item) {
                if (item.nodeType === 1) {
                    return 'element';
                }
                if (item.nodeType === 11) {
                    return 'fragment';
                }
            }
            return 'object';
        }
        return undefined;
    }

    /**
    * @private
    * @static
    */
    function _fragReducer(frag, node) {
        frag.appendChild(node);
        return frag;
    }

    /**
    * @private
    * @static
    */
    function _replaceDefiner(xmlnsObj) {
        return function (n0) {
            var retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : n0 || ''; // Preserve XHTML
            for (var ns in xmlnsObj) {
                if (xmlnsObj.hasOwnProperty(ns)) {
                    if (ns !== '') {
                        retStr += ' xmlns:' + ns + '="' + xmlnsObj[ns] + '"';
                    }
                }
            }
            return retStr;
        };
    }

    function _optsOrUndefinedJML() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return jml.apply(undefined, toConsumableArray(args[0] === undefined ? args.slice(1) : args));
    }

    /**
    * @private
    * @static
    */
    function _jmlSingleArg(arg) {
        return jml(arg);
    }

    /**
    * @private
    * @static
    */
    function _copyOrderedAtts(attArr) {
        var obj = {};
        // Todo: Fix if allow prefixed attributes
        obj[attArr[0]] = attArr[1]; // array of ordered attribute-value arrays
        return obj;
    }

    /**
    * @private
    * @static
    */
    function _childrenToJML(node) {
        return function (childNodeJML, i) {
            var cn = node.childNodes[i];
            var j = Array.isArray(childNodeJML) ? jml.apply(undefined, toConsumableArray(childNodeJML)) : jml(childNodeJML);
            cn.parentNode.replaceChild(j, cn);
        };
    }

    /**
    * @private
    * @static
    */
    function _appendJML(node) {
        return function (childJML) {
            node.appendChild(jml.apply(undefined, toConsumableArray(childJML)));
        };
    }

    /**
    * @private
    * @static
    */
    function _appendJMLOrText(node) {
        return function (childJML) {
            if (typeof childJML === 'string') {
                node.appendChild(doc.createTextNode(childJML));
            } else {
                node.appendChild(jml.apply(undefined, toConsumableArray(childJML)));
            }
        };
    }

    /**
    * @private
    * @static
    function _DOMfromJMLOrString (childNodeJML) {
        if (typeof childNodeJML === 'string') {
            return doc.createTextNode(childNodeJML);
        }
        return jml(...childNodeJML);
    }
    */

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
    var jml = function jml() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        var elem = doc.createDocumentFragment();
        function _checkAtts(atts) {
            var att = void 0;
            for (att in atts) {
                if (!atts.hasOwnProperty(att)) {
                    continue;
                }
                var attVal = atts[att];
                att = att in ATTR_MAP ? ATTR_MAP[att] : att;
                if (NULLABLES.includes(att)) {
                    if (attVal != null) {
                        elem[att] = attVal;
                    }
                    continue;
                } else if (ATTR_DOM.includes(att)) {
                    elem[att] = attVal;
                    continue;
                }
                switch (att) {
                    /*
                    Todos:
                    0. JSON mode to prevent event addition
                     0. {$xmlDocument: []} // doc.implementation.createDocument
                     0. Accept array for any attribute with first item as prefix and second as value?
                    0. {$: ['xhtml', 'div']} for prefixed elements
                        case '$': // Element with prefix?
                            nodes[nodes.length] = elem = doc.createElementNS(attVal[0], attVal[1]);
                            break;
                    */
                    case '#':
                        {
                            // Document fragment
                            nodes[nodes.length] = _optsOrUndefinedJML(opts, attVal);
                            break;
                        }case '$shadow':
                        {
                            var open = attVal.open,
                                closed = attVal.closed;
                            var content = attVal.content,
                                template = attVal.template;

                            var shadowRoot = elem.attachShadow({
                                mode: closed || open === false ? 'closed' : 'open'
                            });
                            if (template) {
                                if (Array.isArray(template)) {
                                    if (_getType(template[0]) === 'object') {
                                        // Has attributes
                                        template = jml.apply(undefined, ['template'].concat(toConsumableArray(template), [doc.body]));
                                    } else {
                                        // Array is for the children
                                        template = jml('template', template, doc.body);
                                    }
                                } else if (typeof template === 'string') {
                                    template = $(template);
                                }
                                jml(template.content.cloneNode(true), shadowRoot);
                            } else {
                                if (!content) {
                                    content = open || closed;
                                }
                                if (content && typeof content !== 'boolean') {
                                    if (Array.isArray(content)) {
                                        jml({ '#': content }, shadowRoot);
                                    } else {
                                        jml(content, shadowRoot);
                                    }
                                }
                            }
                            break;
                        }case 'is':
                        {
                            // Not yet supported in browsers
                            // Handled during element creation
                            break;
                        }case '$custom':
                        {
                            Object.assign(elem, attVal);
                            break;
                        }case '$define':
                        {
                            var _ret = function () {
                                var localName = elem.localName.toLowerCase();
                                // Note: customized built-ins sadly not working yet
                                var customizedBuiltIn = !localName.includes('-');

                                var def = customizedBuiltIn ? elem.getAttribute('is') : localName;
                                if (customElements.get(def)) {
                                    return 'break';
                                }
                                var getConstructor = function getConstructor(cb) {
                                    var baseClass = options && options.extends ? doc.createElement(options.extends).constructor : customizedBuiltIn ? doc.createElement(localName).constructor : HTMLElement;
                                    return cb ? function (_baseClass) {
                                        inherits(_class, _baseClass);

                                        function _class() {
                                            classCallCheck(this, _class);

                                            var _this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

                                            cb.call(_this);
                                            return _this;
                                        }

                                        return _class;
                                    }(baseClass) : function (_baseClass2) {
                                        inherits(_class2, _baseClass2);

                                        function _class2() {
                                            classCallCheck(this, _class2);
                                            return possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).apply(this, arguments));
                                        }

                                        return _class2;
                                    }(baseClass);
                                };

                                var constructor = void 0,
                                    options = void 0,
                                    prototype = void 0;
                                if (Array.isArray(attVal)) {
                                    if (attVal.length <= 2) {
                                        var _attVal = slicedToArray(attVal, 2);

                                        constructor = _attVal[0];
                                        options = _attVal[1];

                                        if (typeof options === 'string') {
                                            options = { extends: options };
                                        } else if (!options.hasOwnProperty('extends')) {
                                            prototype = options;
                                        }
                                        if ((typeof constructor === 'undefined' ? 'undefined' : _typeof(constructor)) === 'object') {
                                            prototype = constructor;
                                            constructor = getConstructor();
                                        }
                                    } else {
                                        var _attVal2 = slicedToArray(attVal, 3);

                                        constructor = _attVal2[0];
                                        prototype = _attVal2[1];
                                        options = _attVal2[2];

                                        if (typeof options === 'string') {
                                            options = { extends: options };
                                        }
                                    }
                                } else if (typeof attVal === 'function') {
                                    constructor = attVal;
                                } else {
                                    prototype = attVal;
                                    constructor = getConstructor();
                                }
                                if (!constructor.toString().startsWith('class')) {
                                    constructor = getConstructor(constructor);
                                }
                                if (!options && customizedBuiltIn) {
                                    options = { extends: localName };
                                }
                                if (prototype) {
                                    Object.assign(constructor.prototype, prototype);
                                }
                                customElements.define(def, constructor, customizedBuiltIn ? options : undefined);
                                return 'break';
                            }();

                            if (_ret === 'break') break;
                        }case '$symbol':
                        {
                            var _attVal3 = slicedToArray(attVal, 2),
                                symbol = _attVal3[0],
                                func = _attVal3[1];

                            if (typeof func === 'function') {
                                var funcBound = func.bind(elem);
                                if (typeof symbol === 'string') {
                                    elem[Symbol.for(symbol)] = funcBound;
                                } else {
                                    elem[symbol] = funcBound;
                                }
                            } else {
                                var obj = func;
                                obj.elem = elem;
                                if (typeof symbol === 'string') {
                                    elem[Symbol.for(symbol)] = obj;
                                } else {
                                    elem[symbol] = obj;
                                }
                            }
                            break;
                        }case '$data':
                        {
                            setMap(attVal);
                            break;
                        }case '$attribute':
                        {
                            // Attribute node
                            var node = attVal.length === 3 ? doc.createAttributeNS(attVal[0], attVal[1]) : doc.createAttribute(attVal[0]);
                            node.value = attVal[attVal.length - 1];
                            nodes[nodes.length] = node;
                            break;
                        }case '$text':
                        {
                            // Todo: Also allow as jml(['a text node']) (or should that become a fragment)?
                            var _node = doc.createTextNode(attVal);
                            nodes[nodes.length] = _node;
                            break;
                        }case '$document':
                        {
                            // Todo: Conditionally create XML document
                            var _node2 = doc.implementation.createHTMLDocument();
                            if (attVal.childNodes) {
                                attVal.childNodes.forEach(_childrenToJML(_node2));
                                // Remove any extra nodes created by createHTMLDocument().
                                var j = attVal.childNodes.length;
                                while (_node2.childNodes[j]) {
                                    var cn = _node2.childNodes[j];
                                    cn.parentNode.removeChild(cn);
                                    j++;
                                }
                            } else {
                                if (attVal.$DOCTYPE) {
                                    var dt = { $DOCTYPE: attVal.$DOCTYPE };
                                    var doctype = jml(dt);
                                    _node2.firstChild.replaceWith(doctype);
                                }
                                var html = _node2.childNodes[1];
                                var head = html.childNodes[0];
                                var _body = html.childNodes[1];
                                if (attVal.title || attVal.head) {
                                    var meta = doc.createElement('meta');
                                    meta.setAttribute('charset', 'utf-8');
                                    head.appendChild(meta);
                                }
                                if (attVal.title) {
                                    _node2.title = attVal.title; // Appends after meta
                                }
                                if (attVal.head) {
                                    attVal.head.forEach(_appendJML(head));
                                }
                                if (attVal.body) {
                                    attVal.body.forEach(_appendJMLOrText(_body));
                                }
                            }
                            nodes[nodes.length] = _node2;
                            break;
                        }case '$DOCTYPE':
                        {
                            /*
                            // Todo:
                            if (attVal.internalSubset) {
                                node = {};
                            }
                            else
                            */
                            var _node3 = void 0;
                            if (attVal.entities || attVal.notations) {
                                _node3 = {
                                    name: attVal.name,
                                    nodeName: attVal.name,
                                    nodeValue: null,
                                    nodeType: 10,
                                    entities: attVal.entities.map(_jmlSingleArg),
                                    notations: attVal.notations.map(_jmlSingleArg),
                                    publicId: attVal.publicId,
                                    systemId: attVal.systemId
                                    // internalSubset: // Todo
                                };
                            } else {
                                _node3 = doc.implementation.createDocumentType(attVal.name, attVal.publicId || '', attVal.systemId || '');
                            }
                            nodes[nodes.length] = _node3;
                            break;
                        }case '$ENTITY':
                        {
                            /*
                            // Todo: Should we auto-copy another node's properties/methods (like DocumentType) excluding or changing its non-entity node values?
                            const node = {
                                nodeName: attVal.name,
                                nodeValue: null,
                                publicId: attVal.publicId,
                                systemId: attVal.systemId,
                                notationName: attVal.notationName,
                                nodeType: 6,
                                childNodes: attVal.childNodes.map(_DOMfromJMLOrString)
                            };
                            */
                            break;
                        }case '$NOTATION':
                        {
                            // Todo: We could add further properties/methods, but unlikely to be used as is.
                            var _node4 = { nodeName: attVal[0], publicID: attVal[1], systemID: attVal[2], nodeValue: null, nodeType: 12 };
                            nodes[nodes.length] = _node4;
                            break;
                        }case '$on':
                        {
                            // Events
                            for (var p2 in attVal) {
                                if (attVal.hasOwnProperty(p2)) {
                                    var val = attVal[p2];
                                    if (typeof val === 'function') {
                                        val = [val, false];
                                    }
                                    if (typeof val[0] === 'function') {
                                        _addEvent(elem, p2, val[0], val[1]); // element, event name, handler, capturing
                                    }
                                }
                            }
                            break;
                        }case 'className':case 'class':
                        if (attVal != null) {
                            elem.className = attVal;
                        }
                        break;
                    case 'dataset':
                        {
                            var _ret2 = function () {
                                // Map can be keyed with hyphenated or camel-cased properties
                                var recurse = function recurse(attVal, startProp) {
                                    var prop = '';
                                    var pastInitialProp = startProp !== '';
                                    Object.keys(attVal).forEach(function (key) {
                                        var value = attVal[key];
                                        if (pastInitialProp) {
                                            prop = startProp + key.replace(hyphenForCamelCase, _upperCase).replace(/^([a-z])/, _upperCase);
                                        } else {
                                            prop = startProp + key.replace(hyphenForCamelCase, _upperCase);
                                        }
                                        if (value === null || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
                                            if (value != null) {
                                                elem.dataset[prop] = value;
                                            }
                                            prop = startProp;
                                            return;
                                        }
                                        recurse(value, prop);
                                    });
                                };
                                recurse(attVal, '');
                                return 'break';
                                // Todo: Disable this by default unless configuration explicitly allows (for security)
                            }();

                            break;
                        }

                    case 'htmlFor':case 'for':
                        if (elStr === 'label') {
                            if (attVal != null) {
                                elem.htmlFor = attVal;
                            }
                            break;
                        }
                        elem.setAttribute(att, attVal);
                        break;
                    case 'xmlns':
                        // Already handled
                        break;
                    default:
                        if (att.match(/^on/)) {
                            elem[att] = attVal;
                            // _addEvent(elem, att.slice(2), attVal, false); // This worked, but perhaps the user wishes only one event
                            break;
                        }
                        if (att === 'style') {
                            if (attVal == null) {
                                break;
                            }
                            if ((typeof attVal === 'undefined' ? 'undefined' : _typeof(attVal)) === 'object') {
                                for (var _p in attVal) {
                                    if (attVal.hasOwnProperty(_p) && attVal[_p] != null) {
                                        // Todo: Handle aggregate properties like "border"
                                        if (_p === 'float') {
                                            elem.style.cssFloat = attVal[_p];
                                            elem.style.styleFloat = attVal[_p]; // Harmless though we could make conditional on older IE instead
                                        } else {
                                            elem.style[_p.replace(hyphenForCamelCase, _upperCase)] = attVal[_p];
                                        }
                                    }
                                }
                                break;
                            }
                            // setAttribute unfortunately erases any existing styles
                            elem.setAttribute(att, attVal);
                            /*
                            // The following reorders which is troublesome for serialization, e.g., as used in our testing
                            if (elem.style.cssText !== undefined) {
                                elem.style.cssText += attVal;
                            } else { // Opera
                                elem.style += attVal;
                            }
                            */
                            break;
                        }
                        var matchingPlugin = opts && opts.$plugins && opts.$plugins.find(function (p) {
                            return p.name === att;
                        });
                        if (matchingPlugin) {
                            matchingPlugin.set({ element: elem, attribute: { name: att, value: attVal } });
                            break;
                        }
                        elem.setAttribute(att, attVal);
                        break;
                }
            }
        }
        var nodes = [];
        var elStr = void 0;
        var opts = void 0;
        var isRoot = false;
        if (_getType(args[0]) === 'object' && Object.keys(args[0]).some(function (key) {
            return possibleOptions.includes(key);
        })) {
            opts = args[0];
            if (opts.state !== 'child') {
                isRoot = true;
                opts.state = 'child';
            }
            if (opts.$map && !opts.$map.root && opts.$map.root !== false) {
                opts.$map = { root: opts.$map };
            }
            if ('$plugins' in opts) {
                if (!Array.isArray(opts.$plugins)) {
                    throw new Error('$plugins must be an array');
                }
                opts.$plugins.forEach(function (pluginObj) {
                    if (!pluginObj) {
                        throw new TypeError('Plugin must be an object');
                    }
                    if (!pluginObj.name || !pluginObj.name.startsWith('$_')) {
                        throw new TypeError('Plugin object name must be present and begin with `$_`');
                    }
                    if (typeof pluginObj.set !== 'function') {
                        throw new TypeError('Plugin object must have a `set` method');
                    }
                });
            }
            args = args.slice(1);
        }
        var argc = args.length;
        var defaultMap = opts && opts.$map && opts.$map.root;
        var setMap = function setMap(dataVal) {
            var map = void 0,
                obj = void 0;
            // Boolean indicating use of default map and object
            if (dataVal === true) {
                var _defaultMap = slicedToArray(defaultMap, 2);

                map = _defaultMap[0];
                obj = _defaultMap[1];
            } else if (Array.isArray(dataVal)) {
                // Array of strings mapping to default
                if (typeof dataVal[0] === 'string') {
                    dataVal.forEach(function (dVal) {
                        setMap(opts.$map[dVal]);
                    });
                    // Array of Map and non-map data object
                } else {
                    map = dataVal[0] || defaultMap[0];
                    obj = dataVal[1] || defaultMap[1];
                }
                // Map
            } else if (/^\[object (?:Weak)?Map\]$/.test([].toString.call(dataVal))) {
                map = dataVal;
                obj = defaultMap[1];
                // Non-map data object
            } else {
                map = defaultMap[0];
                obj = dataVal;
            }
            map.set(elem, obj);
        };
        for (var i = 0; i < argc; i++) {
            var arg = args[i];
            switch (_getType(arg)) {
                case 'null':
                    // null always indicates a place-holder (only needed for last argument if want array returned)
                    if (i === argc - 1) {
                        _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
                        // Todo: Fix to allow application of stylesheets of style tags within fragments?
                        return nodes.length <= 1 ? nodes[0] : nodes.reduce(_fragReducer, doc.createDocumentFragment()); // nodes;
                    }
                    break;
                case 'string':
                    // Strings indicate elements
                    switch (arg) {
                        case '!':
                            nodes[nodes.length] = doc.createComment(args[++i]);
                            break;
                        case '?':
                            arg = args[++i];
                            var procValue = args[++i];
                            var val = procValue;
                            if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
                                procValue = [];
                                for (var p in val) {
                                    if (val.hasOwnProperty(p)) {
                                        procValue.push(p + '=' + '"' +
                                        // https://www.w3.org/TR/xml-stylesheet/#NT-PseudoAttValue
                                        val[p].replace(/"/g, '&quot;') + '"');
                                    }
                                }
                                procValue = procValue.join(' ');
                            }
                            // Firefox allows instructions with ">" in this method, but not if placed directly!
                            try {
                                nodes[nodes.length] = doc.createProcessingInstruction(arg, procValue);
                            } catch (e) {
                                // Getting NotSupportedError in IE, so we try to imitate a processing instruction with a comment
                                // innerHTML didn't work
                                // var elContainer = doc.createElement('div');
                                // elContainer.textContent = '<?' + doc.createTextNode(arg + ' ' + procValue).nodeValue + '?>';
                                // nodes[nodes.length] = elContainer.textContent;
                                // Todo: any other way to resolve? Just use XML?
                                nodes[nodes.length] = doc.createComment('?' + arg + ' ' + procValue + '?');
                            }
                            break;
                        // Browsers don't support doc.createEntityReference, so we just use this as a convenience
                        case '&':
                            nodes[nodes.length] = _createSafeReference('entity', '', args[++i]);
                            break;
                        case '#':
                            // // Decimal character reference - ['#', '01234'] // &#01234; // probably easier to use JavaScript Unicode escapes
                            nodes[nodes.length] = _createSafeReference('decimal', arg, String(args[++i]));
                            break;
                        case '#x':
                            // Hex character reference - ['#x', '123a'] // &#x123a; // probably easier to use JavaScript Unicode escapes
                            nodes[nodes.length] = _createSafeReference('hexadecimal', arg, args[++i]);
                            break;
                        case '![':
                            // '![', ['escaped <&> text'] // <![CDATA[escaped <&> text]]>
                            // CDATA valid in XML only, so we'll just treat as text for mutual compatibility
                            // Todo: config (or detection via some kind of doc.documentType property?) of whether in XML
                            try {
                                nodes[nodes.length] = doc.createCDATASection(args[++i]);
                            } catch (e2) {
                                nodes[nodes.length] = doc.createTextNode(args[i]); // i already incremented
                            }
                            break;
                        case '':
                            nodes[nodes.length] = doc.createDocumentFragment();
                            break;
                        default:
                            {
                                // An element
                                elStr = arg;
                                var _atts = args[i + 1];
                                // Todo: Fix this to depend on XML/config, not availability of methods
                                if (_getType(_atts) === 'object' && _atts.is) {
                                    var is = _atts.is;

                                    if (doc.createElementNS) {
                                        elem = doc.createElementNS(NS_HTML, elStr, { is: is });
                                    } else {
                                        elem = doc.createElement(elStr, { is: is });
                                    }
                                } else {
                                    if (doc.createElementNS) {
                                        elem = doc.createElementNS(NS_HTML, elStr);
                                    } else {
                                        elem = doc.createElement(elStr);
                                    }
                                }
                                nodes[nodes.length] = elem; // Add to parent
                                break;
                            }
                    }
                    break;
                case 'object':
                    // Non-DOM-element objects indicate attribute-value pairs
                    var atts = arg;

                    if (atts.xmlns !== undefined) {
                        // We handle this here, as otherwise may lose events, etc.
                        // As namespace of element already set as XHTML, we need to change the namespace
                        // elem.setAttribute('xmlns', atts.xmlns); // Doesn't work
                        // Can't set namespaceURI dynamically, renameNode() is not supported, and setAttribute() doesn't work to change the namespace, so we resort to this hack
                        var replacer = void 0;
                        if (_typeof(atts.xmlns) === 'object') {
                            replacer = _replaceDefiner(atts.xmlns);
                        } else {
                            replacer = ' xmlns="' + atts.xmlns + '"';
                        }
                        // try {
                        // Also fix DOMParser to work with text/html
                        elem = nodes[nodes.length - 1] = new DOMParser().parseFromString(new XmlSerializer().serializeToString(elem)
                        // Mozilla adds XHTML namespace
                        .replace(' xmlns="' + NS_HTML + '"', replacer), 'application/xml').documentElement;
                        // }catch(e) {alert(elem.outerHTML);throw e;}
                    }
                    var orderedArr = atts.$a ? atts.$a.map(_copyOrderedAtts) : [atts];
                    orderedArr.forEach(_checkAtts);
                    break;
                case 'fragment':
                case 'element':
                    /*
                    1) Last element always the parent (put null if don't want parent and want to return array) unless only atts and children (no other elements)
                    2) Individual elements (DOM elements or sequences of string[/object/array]) get added to parent first-in, first-added
                    */
                    if (i === 0) {
                        // Allow wrapping of element
                        elem = arg;
                    }
                    if (i === argc - 1 || i === argc - 2 && args[i + 1] === null) {
                        // parent
                        var elsl = nodes.length;
                        for (var k = 0; k < elsl; k++) {
                            _appendNode(arg, nodes[k]);
                        }
                        // Todo: Apply stylesheets if any style tags were added elsewhere besides the first element?
                        _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
                    } else {
                        nodes[nodes.length] = arg;
                    }
                    break;
                case 'array':
                    // Arrays or arrays of arrays indicate child nodes
                    var child = arg;
                    var cl = child.length;
                    for (var j = 0; j < cl; j++) {
                        // Go through children array container to handle elements
                        var childContent = child[j];
                        var childContentType = typeof childContent === 'undefined' ? 'undefined' : _typeof(childContent);
                        if (childContent === undefined) {
                            throw String('Parent array:' + JSON.stringify(args) + '; child: ' + child + '; index:' + j);
                        }
                        switch (childContentType) {
                            // Todo: determine whether null or function should have special handling or be converted to text
                            case 'string':case 'number':case 'boolean':
                                _appendNode(elem, doc.createTextNode(childContent));
                                break;
                            default:
                                if (Array.isArray(childContent)) {
                                    // Arrays representing child elements
                                    _appendNode(elem, _optsOrUndefinedJML.apply(undefined, [opts].concat(toConsumableArray(childContent))));
                                } else if (childContent['#']) {
                                    // Fragment
                                    _appendNode(elem, _optsOrUndefinedJML(opts, childContent['#']));
                                } else {
                                    // Single DOM element children
                                    _appendNode(elem, childContent);
                                }
                                break;
                        }
                    }
                    break;
            }
        }
        var ret = nodes[0] || elem;
        if (opts && isRoot && opts.$map && opts.$map.root) {
            setMap(true);
        }
        return ret;
    };

    /**
    * Converts a DOM object or a string of HTML into a Jamilih object (or string)
    * @param {string|HTMLElement} [dom=document.documentElement] Defaults to converting the current document.
    * @param {object} [config={stringOutput:false}] Configuration object
    * @param {boolean} [config.stringOutput=false] Whether to output the Jamilih object as a string.
    * @returns {array|string} Array containing the elements which represent a Jamilih object, or,
                                if `stringOutput` is true, it will be the stringified version of
                                such an object
    */
    jml.toJML = function (dom, config) {
        config = config || { stringOutput: false };
        if (typeof dom === 'string') {
            dom = new DOMParser().parseFromString(dom, 'text/html'); // todo: Give option for XML once implemented and change JSDoc to allow for Element
        }

        var ret = [];
        var parent = ret;
        var parentIdx = 0;

        function invalidStateError() {
            // These are probably only necessary if working with text/html
            function DOMException() {
                return this;
            }
            {
                // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
                // Since we can't instantiate without this (at least in Mozilla), this mimicks at least (good idea?)
                var e = new DOMException();
                e.code = 11;
                throw e;
            }
        }

        function addExternalID(obj, node) {
            if (node.systemId.includes('"') && node.systemId.includes("'")) {
                invalidStateError();
            }
            var publicId = node.publicId;
            var systemId = node.systemId;
            if (systemId) {
                obj.systemId = systemId;
            }
            if (publicId) {
                obj.publicId = publicId;
            }
        }

        function set$$1(val) {
            parent[parentIdx] = val;
            parentIdx++;
        }
        function setChildren() {
            set$$1([]);
            parent = parent[parentIdx - 1];
            parentIdx = 0;
        }
        function setObj(prop1, prop2) {
            parent = parent[parentIdx - 1][prop1];
            parentIdx = 0;
            if (prop2) {
                parent = parent[prop2];
            }
        }

        function parseDOM(node, namespaces) {
            // namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

            /*
            if ((node.prefix && node.prefix.includes(':')) || (node.localName && node.localName.includes(':'))) {
                invalidStateError();
            }
            */

            var type = 'nodeType' in node ? node.nodeType : null;
            namespaces = Object.assign({}, namespaces);

            var xmlChars = /([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/; // eslint-disable-line no-control-regex
            if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
                invalidStateError();
            }

            var children = void 0,
                start = void 0,
                tmpParent = void 0,
                tmpParentIdx = void 0;
            function setTemp() {
                tmpParent = parent;
                tmpParentIdx = parentIdx;
            }
            function resetTemp() {
                parent = tmpParent;
                parentIdx = tmpParentIdx;
                parentIdx++; // Increment index in parent container of this element
            }
            switch (type) {
                case 1:
                    // ELEMENT
                    setTemp();
                    var nodeName = node.nodeName.toLowerCase(); // Todo: for XML, should not lower-case

                    setChildren(); // Build child array since elements are, except at the top level, encapsulated in arrays
                    set$$1(nodeName);

                    start = {};
                    var hasNamespaceDeclaration = false;

                    if (namespaces[node.prefix || ''] !== node.namespaceURI) {
                        namespaces[node.prefix || ''] = node.namespaceURI;
                        if (node.prefix) {
                            start['xmlns:' + node.prefix] = node.namespaceURI;
                        } else if (node.namespaceURI) {
                            start.xmlns = node.namespaceURI;
                        }
                        hasNamespaceDeclaration = true;
                    }
                    if (node.attributes.length) {
                        set$$1(Array.from(node.attributes).reduce(function (obj, att) {
                            obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value
                            return obj;
                        }, start));
                    } else if (hasNamespaceDeclaration) {
                        set$$1(start);
                    }

                    children = node.childNodes;
                    if (children.length) {
                        setChildren(); // Element children array container
                        Array.from(children).forEach(function (childNode) {
                            parseDOM(childNode, namespaces);
                        });
                    }
                    resetTemp();
                    break;
                case undefined: // Treat as attribute node until this is fixed: https://github.com/tmpvar/jsdom/issues/1641 / https://github.com/tmpvar/jsdom/pull/1822
                case 2:
                    // ATTRIBUTE (should only get here if passing in an attribute node)
                    set$$1({ $attribute: [node.namespaceURI, node.name, node.value] });
                    break;
                case 3:
                    // TEXT
                    if (config.stripWhitespace && /^\s+$/.test(node.nodeValue)) {
                        return;
                    }
                    set$$1(node.nodeValue);
                    break;
                case 4:
                    // CDATA
                    if (node.nodeValue.includes(']]' + '>')) {
                        invalidStateError();
                    }
                    set$$1(['![', node.nodeValue]);
                    break;
                case 5:
                    // ENTITY REFERENCE (probably not used in browsers since already resolved)
                    set$$1(['&', node.nodeName]);
                    break;
                case 6:
                    // ENTITY (would need to pass in directly)
                    setTemp();
                    start = {};
                    if (node.xmlEncoding || node.xmlVersion) {
                        // an external entity file?
                        start.$ENTITY = { name: node.nodeName, version: node.xmlVersion, encoding: node.xmlEncoding };
                    } else {
                        start.$ENTITY = { name: node.nodeName };
                        if (node.publicId || node.systemId) {
                            // External Entity?
                            addExternalID(start.$ENTITY, node);
                            if (node.notationName) {
                                start.$ENTITY.NDATA = node.notationName;
                            }
                        }
                    }
                    set$$1(start);
                    children = node.childNodes;
                    if (children.length) {
                        start.$ENTITY.childNodes = [];
                        // Set position to $ENTITY's childNodes array children
                        setObj('$ENTITY', 'childNodes');

                        Array.from(children).forEach(function (childNode) {
                            parseDOM(childNode, namespaces);
                        });
                    }
                    resetTemp();
                    break;
                case 7:
                    // PROCESSING INSTRUCTION
                    if (/^xml$/i.test(node.target)) {
                        invalidStateError();
                    }
                    if (node.target.includes('?>')) {
                        invalidStateError();
                    }
                    if (node.target.includes(':')) {
                        invalidStateError();
                    }
                    if (node.data.includes('?>')) {
                        invalidStateError();
                    }
                    set$$1(['?', node.target, node.data]); // Todo: Could give option to attempt to convert value back into object if has pseudo-attributes
                    break;
                case 8:
                    // COMMENT
                    if (node.nodeValue.includes('--') || node.nodeValue.length && node.nodeValue.lastIndexOf('-') === node.nodeValue.length - 1) {
                        invalidStateError();
                    }
                    set$$1(['!', node.nodeValue]);
                    break;
                case 9:
                    // DOCUMENT
                    setTemp();
                    var docObj = { $document: { childNodes: [] } };

                    if (config.xmlDeclaration) {
                        docObj.$document.xmlDeclaration = { version: doc.xmlVersion, encoding: doc.xmlEncoding, standAlone: doc.xmlStandalone };
                    }

                    set$$1(docObj); // doc.implementation.createHTMLDocument

                    // Set position to fragment's array children
                    setObj('$document', 'childNodes');

                    children = node.childNodes;
                    if (!children.length) {
                        invalidStateError();
                    }
                    // set({$xmlDocument: []}); // doc.implementation.createDocument // Todo: use this conditionally

                    Array.from(children).forEach(function (childNode) {
                        // Can't just do documentElement as there may be doctype, comments, etc.
                        // No need for setChildren, as we have already built the container array
                        parseDOM(childNode, namespaces);
                    });
                    resetTemp();
                    break;
                case 10:
                    // DOCUMENT TYPE
                    setTemp();

                    // Can create directly by doc.implementation.createDocumentType
                    start = { $DOCTYPE: { name: node.name } };
                    if (node.internalSubset) {
                        start.internalSubset = node.internalSubset;
                    }
                    var pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/; // eslint-disable-line no-control-regex
                    if (!pubIdChar.test(node.publicId)) {
                        invalidStateError();
                    }
                    addExternalID(start.$DOCTYPE, node);
                    // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD
                    set$$1(start); // Auto-generate the internalSubset instead? Avoid entities/notations in favor of array to preserve order?

                    var entities = node.entities; // Currently deprecated
                    if (entities && entities.length) {
                        start.$DOCTYPE.entities = [];
                        setObj('$DOCTYPE', 'entities');
                        Array.from(entities).forEach(function (entity) {
                            parseDOM(entity, namespaces);
                        });
                        // Reset for notations
                        parent = tmpParent;
                        parentIdx = tmpParentIdx + 1;
                    }

                    var notations = node.notations; // Currently deprecated
                    if (notations && notations.length) {
                        start.$DOCTYPE.notations = [];
                        setObj('$DOCTYPE', 'notations');
                        Array.from(notations).forEach(function (notation) {
                            parseDOM(notation, namespaces);
                        });
                    }
                    resetTemp();
                    break;
                case 11:
                    // DOCUMENT FRAGMENT
                    setTemp();

                    set$$1({ '#': [] });

                    // Set position to fragment's array children
                    setObj('#');

                    children = node.childNodes;
                    Array.from(children).forEach(function (childNode) {
                        // No need for setChildren, as we have already built the container array
                        parseDOM(childNode, namespaces);
                    });

                    resetTemp();
                    break;
                case 12:
                    // NOTATION
                    start = { $NOTATION: { name: node.nodeName } };
                    addExternalID(start.$NOTATION, node);
                    set$$1(start);
                    break;
                default:
                    throw new TypeError('Not an XML type');
            }
        }

        parseDOM(dom, {});

        if (config.stringOutput) {
            return JSON.stringify(ret[0]);
        }
        return ret[0];
    };
    jml.toJMLString = function (dom, config) {
        return jml.toJML(dom, Object.assign(config || {}, { stringOutput: true }));
    };
    jml.toDOM = function () {
        // Alias for jml()
        return jml.apply(undefined, arguments);
    };
    jml.toHTML = function () {
        // Todo: Replace this with version of jml() that directly builds a string
        var ret = jml.apply(undefined, arguments);
        // Todo: deal with serialization of properties like 'selected', 'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*', 'style'! (i.e., need to build a string ourselves)
        return ret.outerHTML;
    };
    jml.toDOMString = function () {
        // Alias for jml.toHTML for parity with jml.toJMLString
        return jml.toHTML.apply(jml, arguments);
    };
    jml.toXML = function () {
        var ret = jml.apply(undefined, arguments);
        return new XmlSerializer().serializeToString(ret);
    };
    jml.toXMLDOMString = function () {
        // Alias for jml.toXML for parity with jml.toJMLString
        return jml.toXML.apply(jml, arguments);
    };

    var JamilihMap = function (_Map) {
        inherits(JamilihMap, _Map);

        function JamilihMap() {
            classCallCheck(this, JamilihMap);
            return possibleConstructorReturn(this, (JamilihMap.__proto__ || Object.getPrototypeOf(JamilihMap)).apply(this, arguments));
        }

        createClass(JamilihMap, [{
            key: 'get',
            value: function get$$1(elem) {
                elem = typeof elem === 'string' ? $(elem) : elem;
                return get(JamilihMap.prototype.__proto__ || Object.getPrototypeOf(JamilihMap.prototype), 'get', this).call(this, elem);
            }
        }, {
            key: 'set',
            value: function set$$1(elem, value) {
                elem = typeof elem === 'string' ? $(elem) : elem;
                return get(JamilihMap.prototype.__proto__ || Object.getPrototypeOf(JamilihMap.prototype), 'set', this).call(this, elem, value);
            }
        }, {
            key: 'invoke',
            value: function invoke(elem, methodName) {
                var _get;

                elem = typeof elem === 'string' ? $(elem) : elem;

                for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
                    args[_key3 - 2] = arguments[_key3];
                }

                return (_get = this.get(elem))[methodName].apply(_get, [elem].concat(args));
            }
        }]);
        return JamilihMap;
    }(Map);

    var JamilihWeakMap = function (_WeakMap) {
        inherits(JamilihWeakMap, _WeakMap);

        function JamilihWeakMap() {
            classCallCheck(this, JamilihWeakMap);
            return possibleConstructorReturn(this, (JamilihWeakMap.__proto__ || Object.getPrototypeOf(JamilihWeakMap)).apply(this, arguments));
        }

        createClass(JamilihWeakMap, [{
            key: 'get',
            value: function get$$1(elem) {
                elem = typeof elem === 'string' ? $(elem) : elem;
                return get(JamilihWeakMap.prototype.__proto__ || Object.getPrototypeOf(JamilihWeakMap.prototype), 'get', this).call(this, elem);
            }
        }, {
            key: 'set',
            value: function set$$1(elem, value) {
                elem = typeof elem === 'string' ? $(elem) : elem;
                return get(JamilihWeakMap.prototype.__proto__ || Object.getPrototypeOf(JamilihWeakMap.prototype), 'set', this).call(this, elem, value);
            }
        }, {
            key: 'invoke',
            value: function invoke(elem, methodName) {
                var _get2;

                elem = typeof elem === 'string' ? $(elem) : elem;

                for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
                    args[_key4 - 2] = arguments[_key4];
                }

                return (_get2 = this.get(elem))[methodName].apply(_get2, [elem].concat(args));
            }
        }]);
        return JamilihWeakMap;
    }(WeakMap);

    jml.Map = JamilihMap;
    jml.WeakMap = JamilihWeakMap;

    jml.weak = function (obj) {
        var map = new JamilihWeakMap();

        for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
            args[_key5 - 1] = arguments[_key5];
        }

        var elem = jml.apply(undefined, [{ $map: [map, obj] }].concat(args));
        return [map, elem];
    };

    jml.strong = function (obj) {
        var map = new JamilihMap();

        for (var _len6 = arguments.length, args = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
            args[_key6 - 1] = arguments[_key6];
        }

        var elem = jml.apply(undefined, [{ $map: [map, obj] }].concat(args));
        return [map, elem];
    };

    jml.symbol = jml.sym = jml.for = function (elem, sym) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return elem[(typeof sym === 'undefined' ? 'undefined' : _typeof(sym)) === 'symbol' ? sym : Symbol.for(sym)];
    };

    jml.command = function (elem, symOrMap, methodName) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        var func = void 0;

        for (var _len7 = arguments.length, args = Array(_len7 > 3 ? _len7 - 3 : 0), _key7 = 3; _key7 < _len7; _key7++) {
            args[_key7 - 3] = arguments[_key7];
        }

        if (['symbol', 'string'].includes(typeof symOrMap === 'undefined' ? 'undefined' : _typeof(symOrMap))) {
            var _func;

            func = jml.sym(elem, symOrMap);
            if (typeof func === 'function') {
                return func.apply(undefined, [methodName].concat(args)); // Already has `this` bound to `elem`
            }
            return (_func = func)[methodName].apply(_func, args);
        } else {
            var _func3;

            func = symOrMap.get(elem);
            if (typeof func === 'function') {
                var _func2;

                return (_func2 = func).call.apply(_func2, [elem, methodName].concat(args));
            }
            return (_func3 = func)[methodName].apply(_func3, [elem].concat(args));
        }
        // return func[methodName].call(elem, ...args);
    };

    jml.setWindow = function (wind) {
        win = wind;
    };
    jml.setDocument = function (docum) {
        doc = docum;
        if (docum && docum.body) {
            body = docum.body;
        }
    };
    jml.setXMLSerializer = function (xmls) {
        XmlSerializer = xmls;
    };

    jml.getWindow = function () {
        return win;
    };
    jml.getDocument = function () {
        return doc;
    };
    jml.getXMLSerializer = function () {
        return XmlSerializer;
    };

    var body = doc && doc.body;

    var nbsp = '\xA0'; // Very commonly needed in templates

    /* eslint-env browser */

    /**
    * @class ExpandableInputs
    */
    /*
    // DEBUGGING
    function l (str) {
        console.log(str);
    }
    */

    // STATIC VARS
    let ns = 0; // Used to prevent conflicts if the user does not supply their own namespace

    const defaultLocaleStrings = {
        en: {
            browse: 'Browse\u2026',
            directory: 'Directory?',
            plus: '+',
            minus: '-',
            reveal: '' // We use a background-image of a folder instead of text
        }
    };

    /**
    *
    * @constructor
    * @param {object} cfg Configuration object
    * @param {string} cfg.table The ID of the table.
    * @param {string} [cfg.prefix="ei-"] Prefix to denote expandable inputs. Should not need to be changed
    * @param {string} [cfg.namespace] Namespace for this set
        of expandable inputs. If none is supplied, an incrementing value will be used.
    * @param {string} [cfg.label="%s:"] The label to be shown. (See cfg.pattern for the regular expression used to do substitutions.)
    * @param {string} [cfg.pattern=/%s/g] The regular expression for finding numbers within labels.
    * @param {string} [cfg.inputType="text"] The type for text inputs
    * @param {boolean} [cfg.selects=false] Whether to include a select menu for preset file paths or directories
    * @param {number} [cfg.inputSize=50] The size for text inputs
    * @param {number} [cfg.rows] The number of rows; auto-changes input to a textarea (even if set to 1)
    * @param {string} [cfg.locale] A locale language code. Defaults to "en". (Note that the suppied label property ought to also be localized.)
    * @param {string} [cfg.localeStrings] A localeStrings. Default to an English localeStrings. (Note that the supplied label property ought to also be localized.)
    */
    function ExpandableInputs (cfg) {
        if (!(this instanceof ExpandableInputs)) {
            return new ExpandableInputs(cfg);
        }
        if (!cfg || typeof cfg !== 'object' || !cfg.table) {
            throw new Error('A config object with a table ID must be supplied to ExpandableInputs');
        }
        this.table = cfg.table;
        this.prefix = ((cfg.prefix && cfg.prefix.replace(/-$/, '')) || 'ei') + '-';
        this.ns = ((cfg.namespace && cfg.namespace.replace(/-$/, '')) || (ns++).toString()) + '-';
        this.label = cfg.label || '%s:';
        this.pattern = cfg.pattern || /%s/g;
        this.inputType = cfg.inputType && cfg.inputType !== 'file' ? cfg.inputType : 'text';
        this.selects = cfg.selects || false;
        this.inputSize = cfg.inputSize || 50;
        if (cfg.rows !== undefined) {
            this.rows = cfg.rows;
        }
        this.localeStrings = Object.assign(
            {},
            defaultLocaleStrings.en,
            defaultLocaleStrings[cfg.locale] || {},
            cfg.localeStrings || {}
        );

        // State variables
        this.fileType = 'inputType' in cfg && cfg.inputType === 'file';
        this.resetCount();
    }

    ExpandableInputs.prototype.resetCount = function () {
        this.id = 1;
        this.num = 1;
    };

    ExpandableInputs.prototype.getLabel = function (num) {
        return this.label.replace(this.pattern, num);
    };

    ExpandableInputs.prototype.getPrefixedNamespace = function () {
        return this.prefix + this.ns;
    };

    ExpandableInputs.prototype.remove = function (id) {
        const prefixedNS = this.getPrefixedNamespace(),
            rowIDSel = '#' + prefixedNS + 'row-' + id;
        if ($$('.' + prefixedNS + 'row').length === 1) { // Don't delete if only one remaining
            return true;
        }
        $(rowIDSel).remove();
        // Renumber to ensure inputs remain incrementing by one
        this.num = 1;
        $$('.' + prefixedNS + 'number').forEach((numHolder) => {
            numHolder.firstChild.replaceWith(
                this.getLabel(this.num++)
            );
        });
        return false;
    };
    ExpandableInputs.prototype.addTableEvent = function () {
        const that = this;
        $('#' + this.table).addEventListener('click', function (e) {
            const {dataset} = e.target;
            if (!dataset || !dataset.ei_type) {
                return;
            }
            switch (dataset.ei_type) {
            case 'remove':
                const noneToRemove = that.remove(dataset.ei_id);

                // Allow DOM listening for removal
                if (!noneToRemove) {
                    const e = new Event('change', {
                        bubbles: true,
                        cancelable: true
                    });
                    $('#' + that.table).dispatchEvent(e);
                }

                break;
            case 'add':
                that.add();
                break;
            }
        });
    };

    ExpandableInputs.prototype.getValues = function (type) {
        const selector = '.' + this.getPrefixedNamespace() + type;
        return $$(selector).map(({type, checked, value}) => {
            return type === 'checkbox' ? checked : value;
        });
    };
    ExpandableInputs.prototype.getTextValues = function () {
        return this.getValues('input');
    };

    ExpandableInputs.prototype.setValues = function (type, storage) {
        // We could simplify this by allowing add() to take an initial value
        const prefixedNS = this.getPrefixedNamespace();
        const selector = '.' + prefixedNS + type;
        storage = storage || [];
        if ($$(selector).length !== storage.length) { // Don't remove if already the right number
            $$('.' + prefixedNS + 'row').forEach((row) => {
                row.remove();
            });
            this.resetCount();
            if (!storage.length) {
                this.add();
                return;
            }
            storage.forEach(() => {
                this.add();
            });
        }

        $$(selector).forEach((arg, i) => {
            const data = storage[i];
            if (arg.type === 'checkbox') {
                arg.checked = data || false;
            } else {
                arg.value = data || '';
            }
        });
    };

    ExpandableInputs.prototype.setTextValues = function (storage) {
        return this.setValues('input', storage);
    };

    ExpandableInputs.prototype.add = function () {
        const prefixedNS = this.getPrefixedNamespace();
        if (!this.tableEventAdded) {
            this.addTableEvent();
            this.tableEventAdded = true;
        }
        $('#' + this.table).appendChild(jml(
            'tr', {
                id: prefixedNS + 'row-' + this.id,
                class: prefixedNS + 'row'
            }, [
                ['td', [
                    ['label', {
                        for: prefixedNS + 'input-' + this.id,
                        class: prefixedNS + 'number'
                    }, [this.getLabel(this.num), ['span', [' ' + nbsp]]]]
                ]],
                ['td', [
                    (this.fileType && this.selects
                        ? ($$('.' + prefixedNS + 'presets').length > 0
                            ? (() => {
                                const select = $('.' + prefixedNS + 'presets').cloneNode(true);
                                select.id = prefixedNS + 'select-' + this.id;
                                select.dataset.ei_sel = '#' + prefixedNS + 'input-' + this.id;
                                return select;
                            })()
                            : ['select', {
                                id: prefixedNS + 'select-' + this.id,
                                class: prefixedNS + 'presets',
                                dataset: {ei_sel: '#' + prefixedNS + 'input-' + this.id}
                            }]
                        )
                        : ''
                    ),
                    [(this.hasOwnProperty('rows') ? 'textarea' : 'input'), (() => {
                        const atts = {
                            id: prefixedNS + 'input-' + this.id,
                            class: prefixedNS + 'input ' + prefixedNS + 'path'
                        };
                        if (this.hasOwnProperty('rows')) { // textarea
                            atts.cols = this.inputSize;
                            atts.rows = this.rows;
                        } else { // input
                            atts.size = this.inputSize;
                            atts.type = this.inputType;
                            atts.value = '';
                        }
                        if (this.fileType) {
                            atts.list = prefixedNS + 'fileDatalist-' + this.id;
                            atts.autocomplete = 'off';
                        }
                        return atts;
                    })()],
                    // Todo: Should have user supply own callback to ensure
                    //        reveal button, etc. has functionality, and
                    //        ensure only those desired are added
                    (this.fileType
                        ? {'#': [
                            ' ',
                            ['datalist', {id: prefixedNS + 'fileDatalist-' + this.id}],
                            /*
                            // Todo: We might reenable this if we implement a
                            //   Ajax+Node-based file picker (could even use
                            //   Miller columns, etc.)
                            ['input', {
                                type: 'button',
                                class: prefixedNS + 'picker',
                                dataset: {
                                    ei_sel: '#' + prefixedNS + 'input-' + this.id,
                                    ei_directory: '#' + prefixedNS + 'directory' + this.id
                                },
                                value: this.localeStrings.browse
                            }],
                            */
                            ['input', {
                                type: 'button',
                                class: prefixedNS + 'revealButton',
                                value: this.localeStrings.reveal,
                                dataset: {ei_sel: '#' + prefixedNS + 'input-' + this.id}
                            }]
                            /*
                            // Todo: We might reenable this if we implement a
                            //   Ajax+Node-based file picker (could even use
                            //   Miller columns, etc.)
                            , ['label', [
                                ['input', {
                                    id: prefixedNS + 'directory' + this.id,
                                    type: 'checkbox',
                                    class: prefixedNS + 'directory'
                                }],
                                ' ',
                                this.localeStrings.directory
                            ]] */
                        ]}
                        : ''
                    )
                ]],
                ['td', [nbsp]],
                ['td', [
                    ['button', {
                        class: prefixedNS + 'add',
                        dataset: {ei_type: 'add'}
                    }, [this.localeStrings.plus]]
                ]],
                ['td', [
                    ['button', {
                        class: prefixedNS + 'remove',
                        dataset: {ei_id: this.id, ei_type: 'remove'}
                    }, [this.localeStrings.minus]]
                ]]
            ], null
        ));
        this.id++;
        this.num++;
    };

    /* eslint-env webextensions */

    let {getNodeJSON} = browser.extension.getBackgroundPage();

    function execFile (aFile, args = [], options) {
        if (!getNodeJSON) {
            ({getNodeJSON} = browser.extension.getBackgroundPage());
        }
        return getNodeJSON('execFile', aFile, args, options);
    }

    /* eslint-env webextensions */

    const execute = async function (detail, tabData) {
        const {executablePath} = detail;
        console.log('executablePath', executablePath);
        const args = await getCommandArgs(detail, tabData);
        // console.log('ExecBridge', executablePath, ExecBridge);
        // console.log('args', args);
        // Todo: Change to spawn?
        try {
            const result = await execFile(
                // Todo: Apply same substitutions within executable path in case it
                //          is dynamic based on selection?
                executablePath,
                // Todo: handle hard-coded `dirs`;
                //   ability to invoke with link to or contents of a sequence of
                //   hand-typed (auto-complete drop-down) local files and/or URLs
                //   (including option to encode, etc.)
                // Todo: If `dirs` shows something is a directory, confirm the
                //         supplied path is also (no UI enforcement on this currently)
                args
            );
            console.log('resultExec', result);
            return result;
        } catch (err) {
            console.log('Exec Erred: ', err, executablePath, args);
        }
    };

    const getCommandArgs = async function (detail, tabData) {
        const {args, files, urls, dirs} = detail;
        function escapeValue (s) {
            // Escape result (for our XMLish escape) so will counter the subsequent unescaping
            return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
            // Seems we actually do not want this as args parsed after equals regardless of
            //  spaces, apparently because they are separate args to `execFile`
            /*
            // Todo: We'll use `js-string-escape` for a safe string (also if we
            //        use within `eval()`)
            return '"' + jsStringEscape(s)
                // Todo: Replace `jsStringEscape` with https://github.com/mathiasbynens/jsesc#quotes
                //   to avoid escape/unescape here of single quotes
                .replace(/\\'/g, "'")
                // Escape result (for our XMLish escape) so will counter the subsequent unescaping
                .replace(/&/g, '&amp;').replace(/</g, '&lt;') + '"';
            */
        }

        console.log('detail', detail);
        console.log('nnn', args, files, urls, dirs);

        const newArgs = args.map((argVal) => {
            // We use <> for escaping
            // since these are disallowed anywhere
            // in URLs (unlike ampersands)
            // Todo: Use real parser like <https://github.com/kach/nearley>
            //    or `eval` with variables replaced using
            //    https://github.com/brettz9/js-string-escape
            return argVal.replace(/<(.*?)>/g, (n0, n1) => {
                if ([
                    'contentType',
                    'pageURL', 'pageTitle',
                    'pageHTML', 'bodyText',
                    'selectedHTML', 'selectedText', 'contextSelector', 'contextHTML',
                    /* 'linkPageURLAsNativePath',
                    'linkPageTitle', 'linkBodyText', 'linkPageHTML',
                    'imageDataURL', 'imageDataBinary' */
                    'favIconUrl',
                    'linkText', 'linkUrl',
                    'frameUrl', 'srcUrl', 'mediaType',
                    'modifiers',
                    'details'
                ].includes(n1)) {
                    return escapeValue(tabData[n1] || '');
                }            const urlNum = n1.match(/^url(\d+)$/);
                if (urlNum) {
                    return escapeValue(urls[parseInt(urlNum[1], 10) - 1]);
                }
                const fileNum = n1.match(/^file(\d+)$/);
                if (fileNum) {
                    return escapeValue(files[parseInt(fileNum[1], 10) - 1]);
                }
                return ''; // Todo: Report an error
            }).replace(/&lt;/g, '<').replace(/&amp;/g, '&');
            /*
            // We could take this approach, but maybe easier for now to
            //   just let user pipe to temporary files or what not:
            //   https://serverfault.com/questions/40284/create-virtual-file-from-bash-command-output
            return argVal.replace(/<.*?>/g, (n0) => {
                const saveTemp = (new RegExp(
                    '^saveTemp' +
                    '(?:\\s+overwrite=(yes|no|prompt))?' +
                    '(?:\\s+continue=(yes|no))?'
                    // What to do when a file in the location already exists.
                    // Whether to continue execution when a file is found in
                    //    the location and "overwrite" is "no" or "prompt"
                    //    with a resulting "no" answer by the user.
                    //  Can be followed by %N where "N" is the number of
                    //     the directory argument below
                )).exec(n0);
                if (saveTemp) {
                    const [overwrite, cont] = saveTemp;
                    console.log('overw', overwrite, cont);
                    // return;
                }
            }).replace(/&lt;/g, '<').replace(/&amp;/g, '&');
            */
            /*
            return XRegExp.replace(
                argVal,
                // Begin special syntax
                new XRegExp('<' +
                    // saveTemp with its options
                    '(?:(?<saveTemp>save_temp)' +
                        '(\\s+?:overwrite=(?<overwrite>yes|no|prompt))?' +
                        '(?:\\s+continue=(?<cont>yes|no))?' +
                    '\\s+)?' +
                    // Encoding
                    '(?:(?<ucencode>ucencode_)|(?<uencode>uencode_))?' +
                    // Escaping
                    '(?<escquotes>escquotes_)?' +
                    // Begin main grouping
                    '(?:' +
                        // Eval with body
                        '(?:eval: (?<evl>[^>]*))|' +
                        // Other flags
                        ([
                            'pageURL', 'pageTitle', 'pageHTML',
                            'bodyText', 'selectedHTML', 'selectedText', 'contextSelector', 'contextHTML',
                            'linkPageURLAsNativePath',
                            'linkPageTitle', 'linkBodyText', 'linkPageHTML',
                            'imageDataURL', 'imageDataBinary'
                        ].reduce((str, key) => {
                            return str + '|(?<' + XRegExp.escape(key) + '>' + XRegExp.escape(key) + ')';
                        }, '').slice(1)) +
                    // End the main grouping
                    ')' +
                // End special syntax
                '>'),
                ({
                    saveTemp,
                    overwrite, cont,
                    ucencode, uencode, escquotes, evl,
                    pageURL, pageTitle, pageHTML, bodyText,
                    selectedHTML, selectedText, contextSelector, contextHTML,
                    linkPageURLAsNativePath, linkPageTitle, linkBodyText,
                    linkPageHTML, imageDataURL, imageDataBinary
                }) => {
                    if (saveTemp) {
                        // overwrite
                        // cont
                        // Work with URLs as well as files? (if not correct,
                        //    `messages.json` `prefix_save_temp` text)
                    }
                    // Other args here

                    // Todo: Ensure substitutions take place within `eval()` first
                    // Todo: Ensure escaping occurs in proper order
                    // `ucencode` needs `encodeURIComponent` applied
                    // For `linkPageURLAsNativePath`, convert to native path
                    // Allow `eval()`
                    // Todo: Implement `save_temp` and all arguments
                    // Retrieve "linkPageTitle", "linkBodyText", or "linkPageHTML"
                    //    as needed and cache
                    // Retrieve "imageDataBinary" and "imageDataURL" (available
                    //    via canvas?) as needed (available from cache?)
                    // Move ones found to be used here to the top of the
                    //    list/mark in red/asterisked
                },
                'all'
            // Todo: Escape newlines (since allowable with textarea args)?
            ).split('').reverse().join('')
                .replace(/(?:<|>)(?!\\)/g, '').split('').reverse().join('')
                .replace(/\\(<|>)/g, '$1');
            */
        });
        console.log('newArgs', newArgs);
        return newArgs;
        // Todo: return Promise when completed (whose errors can be caught) whose
        //        resolved value is the command line output
    };

    /* eslint-env webextensions */
    const _ = function _ (...args) {
        try {
            return browser.i18n.getMessage(...args);
        } catch (err) {
            return `(Non-internationalized string--FIXME!) ${args.join(', ')}`;
        }
    };

    // Todo: Make as own module dependency

    const $$1 = (sel) => document.querySelector(sel);

    const $e = (el, descendentsSel) => {
        el = typeof el === 'string' ? $$1(el) : el;
        return el.querySelector(descendentsSel);
    };

    /* globals dialogPolyfill */

    const defaultLocale = 'en';
    const localeStrings = {
        en: {
            submit: 'Submit',
            cancel: 'Cancel',
            ok: 'Ok'
        }
    };

    class Dialog {
        constructor ({locale, localeObject} = {}) {
            this.setLocale({locale, localeObject});
        }
        setLocale ({locale = {}, localeObject = {}}) {
            this.localeStrings = Object.assign(
                {},
                localeStrings[defaultLocale],
                localeStrings[locale],
                localeObject
            );
        }
        makeDialog ({atts = {}, children = [], close, remove = true}) {
            if (close) {
                if (!atts.$on) {
                    atts.$on = {};
                }
                if (!atts.$on.close) {
                    atts.$on.close = close;
                }
            }
            const dialog = jml('dialog', atts, children, document.body);
            dialogPolyfill.registerDialog(dialog);
            dialog.showModal();
            if (remove) {
                dialog.addEventListener('close', () => {
                    dialog.remove();
                });
            }
            return dialog;
        }
        makeSubmitDialog ({
            submit, // Don't pass this on to `args` if present
            submitClass = 'submit',
            ...args
        }) {
            const dialog = this.makeCancelDialog(args);
            $e(dialog, `button.${args.cancelClass || 'cancel'}`).before(
                jml('button', {
                    class: submitClass,
                    $on: {
                        click (e) {
                            if (submit) {
                                submit.call(this, {e, dialog});
                            }
                        }
                    }
                }, [this.localeStrings.submit]),
                nbsp.repeat(2)
            );
            return dialog;
        }
        makeCancelDialog ({
            submit, // Don't pass this on to `args` if present
            cancel,
            cancelClass = 'cancel', submitClass = 'submit',
            ...args
        }) {
            const dialog = this.makeDialog(args);
            jml('div', {class: submitClass}, [
                ['br'], ['br'],
                ['button', {class: cancelClass, $on: {
                    click (e) {
                        e.preventDefault();
                        if (cancel) {
                            if (cancel.call(this, {e, dialog}) === false) {
                                return;
                            }
                        }
                        dialog.close();
                    }
                }}, [this.localeStrings.cancel]]
            ], dialog);
            return dialog;
        }
        alert (message) {
            message = typeof message === 'string' ? {message} : message;
            const {message: msg, submitClass = 'submit'} = message;
            return new Promise((resolve, reject) => {
                const dialog = jml('dialog', [
                    msg,
                    ['br'], ['br'],
                    ['div', {class: submitClass}, [
                        ['button', {$on: {click () {
                            dialog.close();
                            resolve();
                        }}}, [this.localeStrings.ok]]
                    ]]
                ], document.body);
                dialogPolyfill.registerDialog(dialog);
                dialog.showModal();
            });
        }
        prompt (message) {
            message = typeof message === 'string' ? {message} : message;
            const {message: msg, submit: userSubmit, ...submitArgs} = message;
            return new Promise((resolve, reject) => {
                const submit = function ({e, dialog}) {
                    if (userSubmit) {
                        userSubmit.call(this, {e, dialog});
                    }
                    dialog.close();
                    resolve($e(dialog, 'input').value);
                };
                /* const dialog = */ this.makeSubmitDialog({
                    ...submitArgs,
                    submit,
                    cancel () {
                        reject(new Error('cancelled'));
                    },
                    children: [
                        ['label', [
                            msg,
                            nbsp.repeat(3),
                            ['input']
                        ]]
                    ]
                });
            });
        }
        confirm (message) {
            message = typeof message === 'string' ? {message} : message;
            const {message: msg, submitClass = 'submit'} = message;
            return new Promise((resolve, reject) => {
                const dialog = jml('dialog', [
                    msg,
                    ['br'], ['br'],
                    ['div', {class: submitClass}, [
                        ['button', {$on: {click () {
                            dialog.close();
                            resolve();
                        }}}, [this.localeStrings.ok]],
                        nbsp.repeat(2),
                        ['button', {$on: {click () {
                            dialog.close();
                            reject(new Error('cancelled'));
                        }}}, [this.localeStrings.cancel]]
                    ]]
                ], document.body);
                dialogPolyfill.registerDialog(dialog);
                dialog.showModal();
            });
        }
    }
    const dialogs = new Dialog();

    /* eslint-env webextensions */

    const {getNodeJSON: getNodeJSON$1} = browser.extension.getBackgroundPage();

    function getHardPaths () {
        return getNodeJSON$1('getHardPaths');
    }

    async function getHardPath (dir) {
        const [paths] = await initPromise;
        return paths[dir];
    }

    function getBrowserExecutableAndDir () {
        return getNodeJSON$1('getBrowserExecutableAndDir');
    }

    async function getBrowserExecutable () {
        const [aFile] = await getBrowserExecutableAndDir();
        return aFile;
    }
    async function getTempPaths () {
        return {
            paths: [
                [_('System_temp'), await getHardPath('TmpD')]
            ]
        };
    }async function getExePaths () {
        const [paths, firefoxExecutablePath] = await initPromise;
        return {
            paths: [
                [_('Firefox'), firefoxExecutablePath],
                [_('Command_prompt'), paths.cmdExe],
                [_('WebAppFind'), paths.webappfind]
            ]
        };
    }

    let initPromise;

    async function init () {
        if (initPromise) {
            return initPromise;
        }
        initPromise = Promise.all([ /*, profiles */
            getHardPaths(),
            getBrowserExecutable()
        ]);
        return initPromise;
    }
    init(); // Get things started

    /* eslint-env webextensions */

    const {getNodeJSON: getNodeJSON$2} = browser.extension.getBackgroundPage();

    function l (msg) {
        console.log(msg);
    }

    function autocompletePaths (data) {
        return getNodeJSON$2('autocompletePaths', data);
    }

    function reveal (data) {
        return getNodeJSON$2('reveal', data);
    }

    // THE REMAINING WAS COPIED FROM filebrowser-enhanced fileBrowserResponses.js
    //    (RETURN ALL MODIFICATIONS THERE)
    // Todo: Apply these changes in other add-ons using it;
    //   also add this as a filterMap where needed [{type: '*.ico', message: _('Icon_file')}]
    // Todo: Fix so not using Firefox/Mozilla code!
    const defaultLocaleStrings$1 = {
        en: {
            pickFolder: 'Pick a folder for the executable',
            pickFile: 'Pick an executable file'
        }
    };
    // TODO: Could reimplement as a Node-based file/directory picker;
    //           maybe this? https://github.com/Joker-Jelly/nfb
    function picker ({dirPath, selectFolder, defaultExtension, filterMap = [], locale, localeStrings}) {
        localeStrings = Object.assign(
            {},
            defaultLocaleStrings$1.en,
            defaultLocaleStrings$1[locale],
            localeStrings
        );
        // Note: could use https://developer.mozilla.org/en-US/docs/Extensions/Using_the_DOM_File_API_in_chrome_code
        //         but this appears to be less feature rich
        const Cc = 0, Ci = 0, file = 0;
        const windowMediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator),
            nsIFilePicker = Ci.nsIFilePicker,
            fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
        if (!selectFolder) {
            fp.defaultExtension = defaultExtension;
            // fp.appendFilter('ICO (.ico)', '*.ico');
            // fp.appendFilter('SVG (.svg)', '*.svg');
            // fp.appendFilter('Icon file', '*.ico; *.svg');
            filterMap.forEach(({message, type}) => {
                fp.appendFilter(message, type);
            });
        }

        if (dirPath) {
            try {
                const dir = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
                dir.initWithPath(dirPath);
                if (!dir.isDirectory()) { // Todo: Return this change to other add-ons
                    dir.initWithPath(file.dirname(dirPath));
                }
                fp.displayDirectory = dir;
            } catch (err) {
                l('initWithPath error: ' + err);
            }
        }
        // Todo: i18nize messages
        fp.init(
            windowMediator.getMostRecentWindow(null),
            selectFolder ? localeStrings.pickFolder : localeStrings.pickFile,
            selectFolder ? nsIFilePicker.modeGetFolder : nsIFilePicker.modeOpen
        );

        return new Promise((resolve, reject) => {
            fp.open({done (rv) {
                let path = '';
                if (rv === nsIFilePicker.returnOK || rv === nsIFilePicker.returnReplace) {
                    ({file: {path}} = fp);
                }
                if (selectFolder) {
                    resolve({type: 'dirPickResult', path, selectFolder});
                } else {
                    resolve({type: 'filePickResult', path});
                }
                return false;
            }});
            /*
            const rv = fp.show();
            if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
                const {file: {path}} = fp;
            } */
        });
    }

    function loadStylesheets(stylesheets, {
        before: beforeDefault, after: afterDefault, favicon: faviconDefault,
        canvas: canvasDefault, image: imageDefault = true,
        acceptErrors
    } = {}) {
        stylesheets = Array.isArray(stylesheets) ? stylesheets : [stylesheets];

        function setupLink(stylesheetURL) {
            let options = {};
            if (Array.isArray(stylesheetURL)) {
                [stylesheetURL, options = {}] = stylesheetURL;
            }
            let { favicon = faviconDefault } = options;
            const {
                before = beforeDefault,
                after = afterDefault,
                canvas = canvasDefault,
                image = imageDefault
            } = options;
            function addLink() {
                if (before) {
                    before.before(link);
                } else if (after) {
                    after.after(link);
                } else {
                    document.head.appendChild(link);
                }
            }

            const link = document.createElement('link');
            return new Promise((resolve, reject) => {
                let rej = reject;
                if (acceptErrors) {
                    rej = typeof acceptErrors === 'function' ? error => {
                        acceptErrors({ error, stylesheetURL, options, resolve, reject });
                    } : resolve;
                }
                if (stylesheetURL.endsWith('.css')) {
                    favicon = false;
                } else if (stylesheetURL.endsWith('.ico')) {
                    favicon = true;
                }
                if (favicon) {
                    link.rel = 'shortcut icon';
                    link.type = 'image/x-icon';

                    if (image === false) {
                        link.href = stylesheetURL;
                        addLink();
                        resolve(link);
                        return;
                    }

                    const cnv = document.createElement('canvas');
                    cnv.width = 16;
                    cnv.height = 16;
                    const context = cnv.getContext('2d');
                    const img = document.createElement('img');
                    img.addEventListener('error', error => {
                        reject(error);
                    });
                    img.addEventListener('load', () => {
                        context.drawImage(img, 0, 0);
                        link.href = canvas ? cnv.toDataURL('image/x-icon') : stylesheetURL;
                        addLink();
                        resolve(link);
                    });
                    img.src = stylesheetURL;
                    return;
                }
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = stylesheetURL;
                addLink();
                link.addEventListener('error', error => {
                    rej(error);
                });
                link.addEventListener('load', () => {
                    resolve(link);
                });
            });
        }

        return Promise.all(stylesheets.map(setupLink));
    }

    /**
     * @author zhixin wen <wenzhixin2010@gmail.com>
     * @version 1.2.1
     *
     * http://wenzhixin.net.cn/p/multiple-select/
     */

    function removeDiacritics(str) {
        return str.normalize('NFD').replace(
        // \p{Block=Combining_Diacritical_Marks}|
        // \p{Block=Combining_Diacritical_Marks_Extended}|
        // \p{Block=Combining_Diacritical_Marks_for_Symbols}|
        // \p{Block=Combining_Diacritical_Marks_Supplement}|
        // \p{Block=Combining_Half_Marks}
        /[\u0300-\u036f\u1AB0-\u1AFF\u20D0-\u20FF\u1DC0-\u1DFF\uFE20-\uFE2F]/g, '');
    }

    function addMultipleSelect($) {
        class MultipleSelect {
            constructor($el, options) {
                const that = this,
                      name = $el.attr('name') || options.name || '';

                this.options = options;

                // hide select element
                this.$el = $el.hide();

                // label element
                this.$label = this.$el.closest('label');
                if (this.$label.length === 0 && this.$el.attr('id')) {
                    this.$label = $(`label[for="${this.$el.attr('id').replace(/:/g, '\\:')}"]`);
                }

                // restore class and title from select element
                this.$parent = $(`<div class="ms-parent ${$el.attr('class') || ''}" title="${$el.attr('title')}"/>`);

                // add placeholder to choice button
                this.$choice = $(`<button type="button" class="ms-choice">
                    <span class="placeholder">${this.options.placeholder}</span>
                    <div></div>
                </button>`);

                // default position is bottom
                this.$drop = $(`<div
                    class="ms-drop ${this.options.position}"
                    style="width: ${this.options.dropWidth}"}></div>`);

                this.$el.after(this.$parent);
                this.$parent.append(this.$choice);
                this.$parent.append(this.$drop);

                if (this.$el.prop('disabled')) {
                    this.$choice.addClass('disabled');
                }
                this.$parent.css('width', this.options.width || this.$el.css('width') || this.$el.outerWidth() + 20);

                this.selectAllName = `data-name="selectAll${name}"`;
                this.selectGroupName = `data-name="selectGroup${name}"`;
                this.selectItemName = `data-name="selectItem${name}"`;

                if (!this.options.keepOpen) {
                    $(document).click(function (e) {
                        if ($(e.target)[0] === that.$choice[0] || $(e.target).parents('.ms-choice')[0] === that.$choice[0]) {
                            return;
                        }
                        if (($(e.target)[0] === that.$drop[0] || $(e.target).parents('.ms-drop')[0] !== that.$drop[0] && e.target !== $el[0]) && that.options.isOpen) {
                            that.close();
                        }
                    });
                }
            }

            init() {
                const $ul = $('<ul></ul>');

                this.$drop.html('');

                if (this.options.filter) {
                    this.$drop.append(`<div class="ms-search">
                        <input
                            type="text" autocomplete="off" autocorrect="off"
                            autocapitilize="off" spellcheck="false" />
                    </div>`);
                }

                if (this.options.selectAll && !this.options.single) {
                    $ul.append(`<li class="ms-select-all">
                        <label>
                        <input type="checkbox" ${this.selectAllName} />
${this.options.selectAllDelimiter[0] + this.options.selectAllText + this.options.selectAllDelimiter[1]}
                        </label>
                    </li>`);
                }

                $.each(this.$el.children(), (i, elm) => {
                    $ul.append(this.optionToHtml(i, elm));
                });
                $ul.append(`<li class="ms-no-results">${this.options.noMatchesFound}</li>`);
                this.$drop.append($ul);

                this.$drop.find('ul').css('max-height', this.options.maxHeight + 'px');
                this.$drop.find('.multiple').css('width', this.options.multipleWidth + 'px');

                this.$searchInput = this.$drop.find('.ms-search input');
                this.$selectAll = this.$drop.find(`input[${this.selectAllName}]`);
                this.$selectGroups = this.$drop.find(`input[${this.selectGroupName}]`);
                this.$selectItems = this.$drop.find(`input[${this.selectItemName}]:enabled`);
                this.$disableItems = this.$drop.find(`input[${this.selectItemName}]:disabled`);
                this.$noResults = this.$drop.find('.ms-no-results');

                this.events();
                this.updateSelectAll(true);
                this.update(true);

                if (this.options.isOpen) {
                    this.open();
                }
            }

            optionToHtml(i, elm, group, groupDisabled) {
                const that = this,
                      $elm = $(elm),
                      classes = $elm.attr('class') || '',
                      title = `title="${$elm.attr('title')}"`,
                      multiple = this.options.multiple ? 'multiple' : '',
                      type = this.options.single ? 'radio' : 'checkbox';
                let disabled;

                if ($elm.is('option')) {
                    const value = $elm.val(),
                          text = that.options.textTemplate($elm),
                          selected = $elm.prop('selected'),
                          style = `style="${this.options.styler(value)}"`;

                    disabled = groupDisabled || $elm.prop('disabled');

                    const $el = $(`<li class="${multiple} ${classes}" ${title} ${style}>
                    <label class="${disabled ? 'disabled' : ''}">
                    <input type="${type}"
                        ${this.selectItemName}
                        ${selected ? ' checked="checked"' : ''}
                        ${disabled ? ' disabled="disabled"' : ''}
                       data-group="${group}">
                    <span>${text}</span>
                    </label>
                    </li>`);
                    $el.find('input').val(value);
                    return $el;
                }
                if ($elm.is('optgroup')) {
                    const label = that.options.labelTemplate($elm);

                    group = 'group_' + i;
                    disabled = $elm.prop('disabled');

                    const $group = $(`<div>
                    <li class="group">
                    <label class="optgroup ${disabled ? 'disabled' : ''}" data-group="${group}">
${this.options.hideOptgroupCheckboxes || this.options.single ? '' : `<input type="checkbox" ${this.selectGroupName} ${disabled ? 'disabled="disabled"' : ''}>`}
                    ${label}
                    </label>
                    </li>
                </div>`);

                    $.each($elm.children(), function (i, elm) {
                        $group.append(that.optionToHtml(i, elm, group, disabled));
                    });
                    return $group.html();
                }
            }

            events() {
                const that = this;
                function toggleOpen(e) {
                    e.preventDefault();
                    that[that.options.isOpen ? 'close' : 'open']();
                }

                if (this.$label) {
                    this.$label.off('click').on('click', function (e) {
                        if (e.target.nodeName.toLowerCase() !== 'label' || e.target !== this) {
                            return;
                        }
                        toggleOpen(e);
                        if (!that.options.filter || !that.options.isOpen) {
                            that.focus();
                        }
                        e.stopPropagation(); // Causes lost focus otherwise
                    });
                }

                this.$choice.off('click').on('click', toggleOpen).off('focus').on('focus', this.options.onFocus).off('blur').on('blur', this.options.onBlur);

                this.$parent.off('keydown').on('keydown', function (e) {
                    switch (e.which) {
                        case 27:
                            // esc key
                            that.close();
                            that.$choice.focus();
                            break;
                    }
                });

                this.$searchInput.off('keydown').on('keydown', function (e) {
                    // Ensure shift-tab causes lost focus from filter as with clicking away
                    if (e.keyCode === 9 && e.shiftKey) {
                        that.close();
                    }
                }).off('keyup').on('keyup', function (e) {
                    // enter or space
                    // Avoid selecting/deselecting if no choices made
                    if (that.options.filterAcceptOnEnter && (e.which === 13 || e.which === 32) && that.$searchInput.val()) {
                        that.$selectAll.click();
                        that.close();
                        that.focus();
                        return;
                    }
                    that.filter();
                });

                this.$selectAll.off('click').on('click', function () {
                    const checked = $(this).prop('checked'),
                          $items = that.$selectItems.filter(':visible');

                    if ($items.length === that.$selectItems.length) {
                        that[checked ? 'checkAll' : 'uncheckAll']();
                    } else {
                        // when the filter option is true
                        that.$selectGroups.prop('checked', checked);
                        $items.prop('checked', checked);
                        that.options[checked ? 'onCheckAll' : 'onUncheckAll']();
                        that.update();
                    }
                });
                this.$selectGroups.off('click').on('click', function () {
                    const group = $(this).parent().attr('data-group'),
                          $items = that.$selectItems.filter(':visible'),
                          $children = $items.filter(`[data-group="${group}"]`),
                          checked = $children.length !== $children.filter(':checked').length;

                    $children.prop('checked', checked);
                    that.updateSelectAll();
                    that.update();
                    that.options.onOptgroupClick({
                        label: $(this).parent().text(),
                        checked,
                        children: $children.get(),
                        instance: that
                    });
                });
                this.$selectItems.off('click').on('click', function () {
                    that.updateSelectAll();
                    that.update();
                    that.updateOptGroupSelect();
                    that.options.onClick({
                        label: $(this).parent().text(),
                        value: $(this).val(),
                        checked: $(this).prop('checked'),
                        instance: that
                    });

                    if (that.options.single && that.options.isOpen && !that.options.keepOpen) {
                        that.close();
                    }

                    if (that.options.single) {
                        const clickedVal = $(this).val();
                        that.$selectItems.filter(function () {
                            return $(this).val() !== clickedVal;
                        }).each(function () {
                            $(this).prop('checked', false);
                        });
                        that.update();
                    }
                });
            }

            open() {
                if (this.$choice.hasClass('disabled')) {
                    return;
                }
                this.options.isOpen = true;
                this.$choice.find('>div').addClass('open');
                this.$drop[this.animateMethod('show')]();

                // fix filter bug: no results show
                this.$selectAll.parent().show();
                this.$noResults.hide();

                // Fix #77: 'All selected' when no options
                if (!this.$el.children().length) {
                    this.$selectAll.parent().hide();
                    this.$noResults.show();
                }

                if (this.options.container) {
                    const offset = this.$drop.offset();
                    this.$drop.appendTo($(this.options.container));
                    this.$drop.offset({
                        top: offset.top,
                        left: offset.left
                    });
                }

                if (this.options.filter) {
                    this.$searchInput.val('');
                    this.$searchInput.focus();
                    this.filter();
                }
                this.options.onOpen();
            }

            close() {
                this.options.isOpen = false;
                this.$choice.find('>div').removeClass('open');
                this.$drop[this.animateMethod('hide')]();
                if (this.options.container) {
                    this.$parent.append(this.$drop);
                    this.$drop.css({
                        top: 'auto',
                        left: 'auto'
                    });
                }
                this.options.onClose();
            }

            animateMethod(method) {
                const methods = {
                    show: {
                        fade: 'fadeIn',
                        slide: 'slideDown'
                    },
                    hide: {
                        fade: 'fadeOut',
                        slide: 'slideUp'
                    }
                };

                return methods[method][this.options.animate] || method;
            }

            update(isInit) {
                const selects = this.options.displayValues ? this.getSelects() : this.getSelects('text'),
                      $span = this.$choice.find('>span'),
                      sl = selects.length;

                if (sl === 0) {
                    $span.addClass('placeholder').html(this.options.placeholder);
                } else if (this.options.allSelected && sl === this.$selectItems.length + this.$disableItems.length) {
                    $span.removeClass('placeholder').html(this.options.allSelected);
                } else if (this.options.ellipsis && sl > this.options.minimumCountSelected) {
                    $span.removeClass('placeholder').text(selects.slice(0, this.options.minimumCountSelected).join(this.options.delimiter) + '...');
                } else if (this.options.countSelected && sl > this.options.minimumCountSelected) {
                    $span.removeClass('placeholder').html(this.options.countSelected.replace('#', selects.length).replace('%', this.$selectItems.length + this.$disableItems.length));
                } else {
                    $span.removeClass('placeholder').text(selects.join(this.options.delimiter));
                }

                if (this.options.addTitle) {
                    $span.prop('title', this.getSelects('text'));
                }

                // set selects to select
                this.$el.val(this.getSelects()).trigger('change');

                // add selected class to selected li
                this.$drop.find('li').removeClass('selected');
                this.$drop.find('input:checked').each(function () {
                    $(this).parents('li').first().addClass('selected');
                });

                // trigger <select> change event
                if (!isInit) {
                    this.$el.trigger('change');
                }
            }

            updateSelectAll(isInit) {
                let $items = this.$selectItems;

                if (!isInit) {
                    $items = $items.filter(':visible');
                }
                this.$selectAll.prop('checked', $items.length && $items.length === $items.filter(':checked').length);
                if (!isInit && this.$selectAll.prop('checked')) {
                    this.options.onCheckAll();
                }
            }

            updateOptGroupSelect() {
                const $items = this.$selectItems.filter(':visible');
                $.each(this.$selectGroups, function (i, val) {
                    const group = $(val).parent().attr('data-group'),
                          $children = $items.filter(`[data-group="${group}"]`);
                    $(val).prop('checked', $children.length && $children.length === $children.filter(':checked').length);
                });
            }

            // value or text, default: 'value'
            getSelects(type) {
                const that = this,
                      values = [];
                let texts = [];
                this.$drop.find(`input[${this.selectItemName}]:checked`).each(function () {
                    texts.push($(this).parents('li').first().text());
                    values.push($(this).val());
                });

                if (type === 'text' && this.$selectGroups.length) {
                    texts = [];
                    this.$selectGroups.each(function () {
                        const html = [],
                              text = $(this).parent().text().trim(),
                              group = $(this).parent().data('group'),
                              $children = that.$drop.find(`[${that.selectItemName}][data-group="${group}"]`),
                              $selected = $children.filter(':checked');

                        if (!$selected.length) {
                            return;
                        }

                        html.push('[');
                        html.push(text);
                        if ($children.length > $selected.length) {
                            const list = [];
                            $selected.each(function () {
                                list.push($(this).parent().text());
                            });
                            html.push(': ' + list.join(', '));
                        }
                        html.push(']');
                        texts.push(html.join(''));
                    });
                }
                return type === 'text' ? texts : values;
            }

            setSelects(values) {
                this.$selectItems.prop('checked', false);
                this.$disableItems.prop('checked', false);
                $.each(values, (i, value) => {
                    this.$selectItems.filter(`[value="${value}"]`).prop('checked', true);
                    this.$disableItems.filter(`[value="${value}"]`).prop('checked', true);
                });
                this.$selectAll.prop('checked', this.$selectItems.length === this.$selectItems.filter(':checked').length + this.$disableItems.filter(':checked').length);

                $.each(this.$selectGroups, (i, val) => {
                    const group = $(val).parent().attr('data-group'),
                          $children = this.$selectItems.filter('[data-group="' + group + '"]');
                    $(val).prop('checked', $children.length && $children.length === $children.filter(':checked').length);
                });

                this.update();
            }

            enable() {
                this.$choice.removeClass('disabled');
            }

            disable() {
                this.$choice.addClass('disabled');
            }

            checkAll() {
                this.$selectItems.prop('checked', true);
                this.$selectGroups.prop('checked', true);
                this.$selectAll.prop('checked', true);
                this.update();
                this.options.onCheckAll();
            }

            uncheckAll() {
                this.$selectItems.prop('checked', false);
                this.$selectGroups.prop('checked', false);
                this.$selectAll.prop('checked', false);
                this.update();
                this.options.onUncheckAll();
            }

            focus() {
                this.$choice.focus();
                this.options.onFocus();
            }

            blur() {
                this.$choice.blur();
                this.options.onBlur();
            }

            refresh() {
                this.init();
            }

            destroy() {
                this.$el.show();
                this.$parent.remove();
                this.$el.data('multipleSelect', null);
            }

            filter() {
                const that = this,
                      text = this.$searchInput.val().trim().toLowerCase();

                if (text.length === 0) {
                    this.$selectAll.parent().show();
                    this.$selectItems.parent().show();
                    this.$disableItems.parent().show();
                    this.$selectGroups.parent().show();
                    this.$noResults.hide();
                } else {
                    this.$selectItems.each(function () {
                        const $parent = $(this).parent();
                        const strippedParent = removeDiacritics($parent.text().toLowerCase());
                        $parent[strippedParent.includes(removeDiacritics(text)) ? 'show' : 'hide']();
                    });
                    this.$disableItems.parent().hide();
                    this.$selectGroups.each(function () {
                        const $parent = $(this).parent();
                        const group = $parent.attr('data-group'),
                              $items = that.$selectItems.filter(':visible');
                        const groupItemsLength = $items.filter(`[data-group="${group}"]`).length;
                        $parent[groupItemsLength ? 'show' : 'hide']();
                    });

                    // Check if no matches found
                    if (this.$selectItems.parent().filter(':visible').length) {
                        this.$selectAll.parent().show();
                        this.$noResults.hide();
                    } else {
                        this.$selectAll.parent().hide();
                        this.$noResults.show();
                    }
                }
                this.updateOptGroupSelect();
                this.updateSelectAll();
                this.options.onFilter(text);
            }
        }
        function multipleSelect(option, method, ...args) {
            const allowedMethods = ['getSelects', 'setSelects', 'enable', 'disable', 'open', 'close', 'checkAll', 'uncheckAll', 'focus', 'blur', 'refresh', 'destroy'];
            let value;

            this.each(function () {
                const $this = $(this),
                      options = $.extend({}, $.fn.multipleSelect.defaults, $this.data(), typeof option === 'object' && option);
                let data = $this.data('multipleSelect');

                if (!data) {
                    data = new MultipleSelect($this, options);
                    $this.data('multipleSelect', data);
                }

                if (typeof option === 'string') {
                    if (!allowedMethods.includes(option)) {
                        throw new TypeError('Unknown method: ' + option);
                    }
                    value = data[option](method, ...args);
                } else {
                    data.init();
                    if (method) {
                        value = data[method](...args);
                    }
                }
            });

            return typeof value !== 'undefined' ? value : this;
        }

        multipleSelect.defaults = {
            name: '',
            isOpen: false,
            placeholder: '',
            selectAll: true,
            selectAllDelimiter: ['[', ']'],
            minimumCountSelected: 3,
            ellipsis: false,
            multiple: false,
            multipleWidth: 80,
            single: false,
            filter: false,
            width: undefined,
            dropWidth: undefined,
            maxHeight: 250,
            container: null,
            position: 'bottom',
            keepOpen: false,
            animate: 'none', // 'none', 'fade', 'slide'
            displayValues: false,
            delimiter: ', ',
            addTitle: false,
            filterAcceptOnEnter: false,
            hideOptgroupCheckboxes: false,

            selectAllText: 'Select all',
            allSelected: 'All selected',
            countSelected: '# of % selected',
            noMatchesFound: 'No matches found',

            styler: () => false,

            textTemplate($elm) {
                return $elm.html();
            },
            labelTemplate($elm) {
                return $elm.attr('label');
            },

            onOpen: () => false,
            onClose: () => false,
            onCheckAll: () => false,
            onUncheckAll: () => false,
            onFocus: () => false,
            onBlur: () => false,
            onOptgroupClick: () => false,
            onClick: () => false,
            onFilter: () => false
        };

        $.fn.multipleSelect = multipleSelect;
    }

    /* eslint-env webextensions */
    addMultipleSelect(jQuery);

    const uiLanguage = browser.i18n.getUILanguage();
    const dialogs$1 = new Dialog({locale: uiLanguage});

    window.addEventListener('resize', function () {
        browser.storage.local.set({
            windowCoords: [window.outerWidth, window.outerHeight]
        });
    });

    async function getUnpackedCommands () {
        const {commands} = await browser.storage.local.get('commands');
        return JSON.parse(commands || '{}');
    }

    async function packCommands (commands) {
        commands = JSON.stringify(commands);
        await browser.storage.local.set({commands});
    }

    (async () => {
    const {updateContextMenus, tabData, closeAYC} = browser.extension.getBackgroundPage();
    // const platform = browser.runtime.PlatformOs;

    async function save (name, data) {
        const commands = await getUnpackedCommands();
        commands[name] = data;
        await packCommands(commands);
        await updateContextMenus();
        console.log('finished updating/saving');
    }
    async function remove (name) {
        const commands = await getUnpackedCommands();
        delete commands[name];
        await packCommands(commands);
        await updateContextMenus();
    }

    function removeStorage ({commands, keepForm, inputs}) {
        oldStorage = commands;
        rebuildCommandList();
        if (!keepForm) {
            populateEmptyForm(inputs);
        }
    }

    function newStorage ({name, commands, inputs}) {
        oldStorage = commands;
        rebuildCommandList();
        setSelectOfValue('#selectNames', name);
        // Important to update other flags even if just changed,
        //    so convenient to just re-run
        populateFormWithStorage(name, inputs);
    }

    const params = (new URL(window.location)).searchParams;
    async function buttonClick (data) {
        const {name, keepForm, close, detail} = data;
        if (data.remove) {
            await remove(name);
            const commands = await getUnpackedCommands();
            removeStorage({commands, keepForm, inputs: data.inputs});
        }
        if (data.save) {
            await save(name, detail);
            const commands = await getUnpackedCommands();
            newStorage({name, commands, inputs: data.inputs});
        }
        if (data.execute) {
            const result = await execute(detail, tabData);
            await finished(result);
        }
        if (close) { // FF doesn't let us use `window.close`
            closeAYC(params.get('ctr'));
        }
    }

    const optionData = {};
    let currentName = '',
        createNewCommand = true,
        changed = false,
        nameChanged = false;

    // tabData: Passed JSON object
    // sender: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/MessageSender
    // sendResponse: One time callback
    /* browser.runtime.onMessage.addListener(async (tabData, sender, sendResponse) => {
        sendResponse({});
    }); */
    const {itemType} = tabData;
    console.log('tabData', tabData);
    // Has now received arguments, so we can inject...
    // We might `executeScript` to check for
    //  `window.getSelection()` (see append-to-clipboard add-on)
    //  to get raw HTML of a selection (but unfortunately not a clicked
    //  element without a selection)

    const [
        initialStorage,
        executables,
        temps
    ] = await Promise.all([
        getUnpackedCommands(),

        getExePaths(),
        getTempPaths(),
        loadStylesheets([
            '/vendor/dialog-polyfill/dialog-polyfill.css',
            '/vendor/bootstrap/dist/css/bootstrap.css',
            '/vendor/multiple-select/multiple-select.css',
            'one-off.css'
        ])
    ]);
    let oldStorage = initialStorage;
    if (!initialStorage) {
        await packCommands({});
        oldStorage = {};
    }

    const options = { // any JSON-serializable key/values
        itemType,
        executables,
        temps,
        tabData,
        eiLocale: uiLanguage,
        eiLabels: [
            'argsNum', 'urlNum', 'fileNum'
        ].reduce((locale, key) => {
            locale[key] = _('expandable_inputs_' + key);
            return locale;
        }, {})
    };

    // ADD INITIAL CONTENT ONCE DATA AVAILABLE
    document.title = _('atyourcommand_doc_title');

    // Todo: Why are we not seeing this?
    jml('div', {id: 'loading'}, [
        _('loading')
    ], $('body'));

    try {
        init(options);
    } catch (err) { // Get stack trace which Firefox isn't otherwise giving
        console.log('err', err);
        throw err;
    }

    // TEMPLATE UTILITIES

    function rebuildCommandList () {
        while ($('#selectNames').firstChild) {
            $('#selectNames').firstChild.remove();
        }
        jml({'#': [
            ['option', {value: '', selected: 'selected'}, [_('create_new_command')]],
            ...Object.keys(oldStorage).sort().map((commandName) => {
                return ['option', [commandName]];
            })
        ]}, $('#selectNames'));
    }

    /**
    * @param {array} optTexts Array of option text
    * @param {array} [values] Array of values corresponding to text
    * @param {string} [ns] Namespace to add to locale string
    */
    /*
    function buildOptions (optTexts, values, ns) {
        return optTexts.map((optText, i) => {
            const value = values[i] || optText;
            return ['option', {value}, [
                _((ns ? (ns + '_') : '') + optText)
            ]];
        });
    }
    */

    // BEHAVIORAL UTILITIES
    function setMultipleSelectOfValue (sel, vals) {
        const names = typeof sel === 'string' ? $(sel) : sel;
        [...names.options].forEach((option) => {
            option.selected = vals.includes(option.value);
        });
        jQuery('#restrict-contexts').multipleSelect('refresh');
    }

    function setSelectOfValue (sel, val) {
        const names = typeof sel === 'string' ? $(sel) : sel;
        const idx = [...names.options].findIndex(({value}) => {
            return value === val;
        });
        names.selectedIndex = idx === -1 ? 0 : idx;
    }

    function addOptions (type) {
        const {paths} = optionData[type],
            sel = type === 'executables' ? '#' + type : '.ei-files-presets',
            selects = $$(sel);

        selects.forEach((select) => {
            while (select.firstChild) {
                select.firstChild.remove();
            }

            jml({'#': paths.map(([text, value]) => {
                return ['option', {value}, [text]];
            })}, select);

            if (type === 'temps') {
                setSelectOfValue(
                    select,
                    $('#' + select.id.replace('-select-', '-input-')).value
                );
            }
        });
    }

    function handleOptions (typeDataMap) {
        Object.entries(typeDataMap).forEach(([type, data]) => {
            optionData[type] = data;
            addOptions(type);
        });
    }

    function resetChanges () {
        changed = false;
        nameChanged = false;
    }

    // Todo: Set these as defaults and reset (for better modularity)
    function populateEmptyForm (inputs) {
        // Unlike populateFormWithStorage, we will always need to set the name
        $('#selectNames').selectedIndex = 0;
        $('#executablePath').focus();

        createNewCommand = true;
        currentName = '';
        $('#delete').hidden = true;

        $('#command-name').value = '';
        $('#command-name').defaultValue = '';

        $('#executables').selectedIndex = 0;
        $('#executablePath').value = '';
        $('#command-preview').value = '';

        jQuery('#restrict-contexts').multipleSelect('checkAll');

        $('#own-context').value = '';
        $('#text-only').checked = false;

        ['args', 'urls', 'files'].forEach((inputType) => {
            inputs[inputType].setTextValues();
        });
        // Todo: Uncomment if we get directory selection working
        //    (e.g., Ajax+Node.js local file browser)
        // inputs.files.setValues('directory');
        // Todo: make a way for the select to be populated through the ExpandableInputs API
        addOptions('temps');
        resetChanges();
    }

    function populateFormWithStorage (name, inputs) {
        createNewCommand = false;
        currentName = name;
        $('#delete').hidden = false;

        $('#command-name').value = name;
        $('#command-name').defaultValue = name;

        // Todo: Could make class for each type of storage (select,
        //   input, etc.) and just invoke its destroy() or create() methods
        //   here, rather than adding specific details in every place needed.
        const oldStorageForName = oldStorage[currentName];
        const {executablePath, restrictContexts, ownContext, textOnly} = oldStorageForName;
        setSelectOfValue('#executables', executablePath);
        $('#executablePath').value = executablePath;

        setMultipleSelectOfValue('#restrict-contexts', restrictContexts);
        $('#own-context').value = ownContext;
        $('#text-only').checked = textOnly;

        ['args', 'urls', 'files'].forEach((inputType) => {
            inputs[inputType].setTextValues(oldStorageForName[inputType]);
        });
        // Todo: Uncomment if we get directory selection working
        //    (e.g., Ajax+Node.js local file browser)
        // inputs.files.setValues('directory', oldStorageForName.dirs);
        // Todo: make a way for the select to be populated through the ExpandableInputs API
        addOptions('temps');
        $('#main').$setPreview();
        resetChanges();
    }

    function fileOrDirResult ({path, selector}) {
        if (path) {
            $(selector).value = path;
        }
    }

    async function finished (result) {
        $('#processExecuted').style.display = 'block';
        if (!$('#keepOpen').checked) {
            await buttonClick({close: true});
        } else {
            $('#command-results').value = result[0];
            setTimeout(() => {
                $('#processExecuted').style.display = 'none';
            }, 2000);
        }
    }
    /*
    function setOS (os) {
        setSelectOfValue('#export-os-type', os);
    }
    */
    function getSuffixForOS () {
        const type = $('#export-os-type').value,
            osMap = {
                winnt: '.bat'
            };
        if (osMap.hasOwnProperty(type)) {
            return osMap[type];
        }
        return '';
    }

    async function filePick$$1 (data) {
        const {selector} = data;
        const {type, ...args} = await picker({
            ...data,
            locale: uiLanguage
        });
        fileOrDirResult({selector, ...args});
    }

    function init ({
        itemType, executables, temps, tabData,
        eiLocale,
        eiLabels: {argsNum, urlNum, fileNum}
    }) {
        function getDetail () {
            return {
                executablePath: $('#executablePath').value,
                args: inputs.args.getTextValues(),
                files: inputs.files.getTextValues(),
                urls: inputs.urls.getTextValues(),
                textOnly: $('#text-only').checked,
                // Todo: Uncomment if we get directory selection working
                //    (e.g., Ajax+Node.js local file browser)
                // dirs: inputs.files.getValues('directory'),
                restrictContexts: [...$('#restrict-contexts').selectedOptions].map(({value}) => {
                    return value;
                }),
                ownContext: $('#own-context').value
            };
        }
        const inputs = {
            args: new ExpandableInputs({
                locale: eiLocale,
                table: 'executableTable',
                namespace: 'args',
                label: argsNum,
                inputSize: 50,
                // Might perhaps make this optional to save space, but this
                //  triggers creation of a textarea so args could be more
                //  readable (since to auto-escape newlines as needed)
                rows: 1
            }),
            urls: new ExpandableInputs({
                locale: eiLocale,
                table: 'URLArguments',
                namespace: 'urls',
                label: urlNum,
                inputSize: 40,
                inputType: 'url'
            }),
            files: new ExpandableInputs({
                locale: eiLocale,
                table: 'fileArguments',
                namespace: 'files',
                label: fileNum,
                inputSize: 25,
                inputType: 'file',
                selects: true
            })
        };
        $('#loading').remove();
        jml('div', [
            ['div', {
                id: 'names',
                hidden: itemType === 'one-off'
            }, [
                ['select', {id: 'selectNames', size: 39, $on: {
                    async click ({target: {value: name}}) {
                        if (changed) {
                            try {
                                await dialogs$1.confirm(_('have_unsaved_changes'));
                            } catch (cancelled) {
                                return;
                            }
                            setSelectOfValue('#selectNames', currentName);
                        }
                        if (name === '') { // Create new command
                            populateEmptyForm(inputs);
                        } else {
                            populateFormWithStorage(name, inputs);
                        }
                    }
                }}]
            ]],
            ['div', {
                id: 'main',
                class: itemType === 'one-off' ? 'closed' : 'open',
                $custom: {
                    async $setPreview () {
                        const detail = getDetail();
                        const {executablePath} = detail;
                        const args = await getCommandArgs(detail, tabData);
                        $('#command-preview').value = executablePath + ' ' + args.join(' ');
                    }
                },
                $on: {
                    async change ({target: {id}}) {
                        changed = true;
                        if (id === 'command-name') {
                            nameChanged = true;
                            return;
                        }
                        await this.$setPreview();
                    }
                }
            }, [
                ['button', {id: 'showNames', $on: {
                    click () {
                        $('#names').hidden = !$('#names').hidden;
                        const showNames = $('#showNames');
                        if (!$('#names').hidden) {
                            $('#main').className = 'open';
                            showNames.firstChild.replaceWith(_('lt'));
                        } else {
                            $('#main').className = 'closed';
                            showNames.firstChild.replaceWith(_('gt'));
                        }
                    }
                }}, [
                    _(itemType === 'one-off' ? 'gt' : 'lt')
                ]],
                ['div', {id: 'processExecuted', style: 'display:none; float: right;'}, [
                    _('Process_executed')
                ]],
                ['br'],
                ['div', {id: 'substitutions-explanation-container'}, [
                    ['h3', [_('Substitutions_explained')]],
                    ['div', {id: 'substitutions-explanation'}, [
                        _('Substitution_sequences_allow'),
                        ['br'], ['br'],
                        /*
                        _('prefixes_can_be_applied'),
                        ['dl', [
                            'save_temp', 'ucencode_', 'uencode_', 'escquotes_'
                        ].reduce((children, prefix) => {
                            // Todo: Replace with `flatMap` when decided: https://github.com/tc39/proposal-flatMap/pull/56
                            children.push(['dt', [prefix]]);
                            children.push(['dd', [_('prefix_' + prefix)]]);
                            return children;
                        }, [])],
                        */
                        ['b', [_('Sequences')]],
                        ['dl', [
                            // 'eval',
                            'contentType', 'pageURL', 'pageTitle',
                            'pageHTML', 'bodyText',
                            'selectedHTML', 'selectedText', 'contextSelector', 'contextHTML',
                            /* ,
                            'linkPageURLAsNativePath', 'linkPageTitle',
                            'linkBodyText', 'linkPageHTML',
                            'imageDataURL', 'imageDataBinary' */
                            'favIconUrl',
                            'linkText', 'linkUrl',
                            'frameUrl', 'srcUrl', 'mediaType',
                            'modifiers', 'details'
                        ].reduce((children, seq) => {
                            // Todo: Replace with `flatMap` when decided: https://github.com/tc39/proposal-flatMap/pull/56
                            children.push(['dt', [seq]]);
                            children.push(['dd', [_('seq_' + seq)]]);
                            return children;
                        }, [])],
                        ['dl', [
                            'filenum',
                            'urlnum'
                        ].reduce((children, seq) => {
                            // Todo: Replace with `flatMap` when decided: https://github.com/tc39/proposal-flatMap/pull/56
                            children.push(['dt', [
                                _('seqname_' + seq)
                            ]]);
                            children.push(['dd', [_('seq_' + seq)]]);
                            return children;
                        }, [])]
                    ]]
                ]],
                ['div', {id: 'substitutions-used-container'}, [
                    ['h3', [_('Substitutions_available')]],
                    ['div', {id: 'substitutions-used'}, [
                        /*
                        _('currently_available_sequences'),
                        ['br'], ['br'],
                        ['dl', [
                            ['dt', ['save_temp']], ['dd'],
                            ['dt', ['ucencode_']], ['dd'],
                            ['dt', ['uencode_']], ['dd'],
                            ['dt', ['escquotes_']], ['dd']
                        ]],
                        */
                        ['b', [_('Sequences')]],
                        ['dl', [
                            ...[
                                // Todo: While useful to show `eval` result here,
                                //   this would need to occur as the string was
                                //   typed (and thus potentially dangerous)
                                // 'eval',
                                /*
                                // These may be better as user-`eval` given latency
                                //   in retrieving
                                'linkPageURLAsNativePath', 'linkPageTitle',
                                'linkBodyText', 'linkPageHTML',
                                'imageDataURL', 'imageDataBinary'
                                */
                                'contentType', 'pageURL', 'pageTitle',
                                'pageHTML', 'bodyText',
                                'selectedHTML', 'selectedText', 'contextSelector', 'contextHTML',
                                // Supplied by webextensions API
                                'favIconUrl',
                                'linkText', 'linkUrl',
                                'frameUrl', 'srcUrl', 'mediaType',
                                'modifiers', 'details'
                            ].reduce((children, seq) => {
                                // Todo: Replace with `flatMap` when decided: https://github.com/tc39/proposal-flatMap/pull/56
                                children.push(['dt', [seq]]);
                                children.push(['dd', {
                                    style: 'width: 400px; border: 1px solid black; height: 50px; overflow: auto;'
                                }, [String(tabData[seq] || '')]]);
                                return children;
                            }, [])
                        ]]
                    ]]
                ]],
                ['form', {$on: {
                    submit (e) {
                        e.preventDefault();
                    },
                    click: [function (e) {
                        const cl = e.target.classList;
                        // Also "setCustomValidity" and individual items also have
                        //    "validationMessage" property
                        if (!this.checkValidity() &&
                            (cl.contains('execute') || cl.contains('save') ||
                                cl.contains('batch_export'))
                        ) {
                            e.stopPropagation(); // Don't allow it to get to submit
                        }
                    }, !!'capturing']
                }}, [
                    ['div', {id: 'command-name-section'}, [
                        ['label', {title: _('if_present_command_saved')}, [
                            _('Command_name') + ' ',
                            ['input', {
                                id: 'command-name',
                                size: '35',
                                autofocus: itemType === 'commands'
                            }]
                        ]],
                        ['div', {style: 'float: left; width: 49%'}, [
                            _('command_preview'),
                            nbsp,
                            ['textarea', {id: 'command-preview', readonly: 'readonly'}, [
                                _('Preview_here')
                            ]]
                        ]],
                        ['div', {style: 'float: left; width: 49%'}, [
                            _('command_result'),
                            nbsp,
                            ['textarea', {id: 'command-results', readonly: 'readonly'}, [
                                _('Result_here')
                            ]]
                        ]],
                        ['br'],
                        ['label', [
                            _('Restrict_contexts') + ' ',
                            ['select', {
                                multiple: 'multiple',
                                title: _('Italicized_obtained_from_source_page_context'),
                                id: 'restrict-contexts',
                                $on: {
                                    click (e) {
                                        // Not sure why we're losing focus or the click event
                                        //   is going through here but not in my multiple-select demo
                                        // ms.focus();
                                        e.stopPropagation();
                                    }
                                }
                            }, Tags.map(([mainElement, childElements]) => {
                                return ['optgroup', {
                                    label: _(mainElement)
                                }, childElements.map((tagInfo) => {
                                    const atts = {};
                                    let attInfo;
                                    if (typeof tagInfo !== 'string') {
                                        [tagInfo, attInfo] = tagInfo;
                                        if (attInfo.hidden === true) {
                                            atts.class = 'hiddenContext';
                                        }
                                    }
                                    return ['option', atts, [tagInfo]];
                                })];
                            })]
                        ]],
                        ' ' + _('or') + ' ',
                        ['label', [
                            _('Show_if_any_text_highlighted'),
                            ['input', {id: 'text-only', type: 'checkbox'}]
                        ]],
                        ' ' + _('or') + ' ',
                        ['label', [
                            _('Specify_your_own_context') + ' ',
                            ['input', {id: 'own-context', placeholder: 'a[href],img[src]'}]
                        ]]
                    ]],
                    ['table', [
                        /*
                        ['tr', [
                            ['td', [
                                ['label', [_('Label:')]]
                            ]],
                            ['td', [
                                ['input', {id: 'label'}]
                            ]]
                        ]]
                        */
                        ['tr', [
                            ['td', [
                                ['label', {'for': 'executablePath'}, [_('Path_of_executable')]]
                            ]],
                            ['td', [
                                ['select', {id: 'executables', 'class': 'ei-exe-presets', dataset: {
                                    ei_sel: '#executablePath'
                                }}],
                                ' ',
                                ['input', {
                                    type: 'text', size: '55', id: 'executablePath',
                                    class: 'ei-exe-path',
                                    list: 'datalist', autocomplete: 'off', value: '',
                                    required: 'required'
                                }],
                                /*
                                ' ',
                                _('or'),
                                // The following with `webkitRelativePath` will only get
                                //   the direct parent folder name and the file name
                                ['input', {
                                    type: 'file', id: 'executablePick', class: 'ei-exe-picker',
                                    accept: '.exe, .app',
                                    webkitdirectory: 'webkitdirectory',
                                    dataset: {
                                        ei_sel: '#executablePath'
                                    }
                                }],
                                */
                                /*
                                // Todo: We might reenable this if we implement a
                                //   Ajax+Node-based file picker (could even use
                                //   Miller columns, etc.)
                                ['input', {
                                    type: 'button', id: 'executablePick', class: 'ei-exe-picker',
                                    dataset: {
                                        ei_sel: '#executablePath',
                                        'ei_default-extension': 'exe'
                                    },
                                    value: _('Browse')
                                }],
                                */
                                ['datalist', {id: 'datalist'}],
                                ['input', {
                                    type: 'button',
                                    class: 'ei-exe-revealButton',
                                    dataset: {ei_sel: '#executablePath'}
                                }]
                            ]]
                        ]]
                    ]],
                    ['div', {id: 'executableTableContainer'}, [
                        ['table', {id: 'executableTable'}]
                    ]],
                    ['div', {id: 'fileAndURLArgumentContainer'}, [
                        ['b', [_('Hard_coded_files_and_URLs')]],
                        ['br'],
                        ['table', {id: 'fileArguments'}],
                        ['table', {id: 'URLArguments'}]
                    ]]
                    /*
                    Todo:
                    ['div', {'class': 'export'}, [
                        ['label', [
                            _('os_format_for_batch_export'),
                            nbsp.repeat(2),
                            ['select', {id: 'export-os-type'}, buildOptions(
                                ['Linux', 'Mac', 'Windows'],
                                ['linux', 'mac', 'win']
                            )]
                            // Also could add values (and i18n and localize text) for
                            //   these auto-lower-cased values from
                            //       https://developer.mozilla.org/en-US/docs/OS_TARGET:
                            //   'android', 'SunOS', 'FreeBSD', 'OpenBSD',
                            //   'NetBSD', 'OS2', 'BeOS', 'IRIX64', 'AIX',
                            //   'HP-UX', 'DragonFly', 'skyos', 'riscos', 'NTO', 'OSF1'
                        ]],
                        ['br'],
                        ['button', {'class': 'batch_export'}, [_('Export_to_batch')]]
                    ]]
                    */
                ]]
            ]],
            ['br'],
            ['div', {'class': 'execution'}, [
                ['label', [
                    ['input', {type: 'checkbox', id: 'keepOpen'}],
                    ' ',
                    _('keep_dialog_open')
                ]],
                ['br'],
                ['button', {'class': 'passData save'}, [_('Save')]],
                ['button', {
                    id: 'delete',
                    class: 'passData delete',
                    hidden: true
                }, [_('Delete')]],
                // ['br'],
                ['button', {'class': 'passData execute'}, [_('Execute_on_current_page')]],
                ['button', {id: 'cancel'}, [_('Cancel')]]
            ]]
        ], $('body'));

        // setOS(platform);

        // ADD EVENTS

        /* const ms = */
        jQuery('#restrict-contexts').multipleSelect({
            filter: true,
            hideOptgroupCheckboxes: true,
            filterAcceptOnEnter: true,
            width: '150'
        });

        // Todo: put these checks as methods on a class for each type of control
        //        (can still call from body listener)
        $('body').addEventListener('click', async function (e) {
            let value, sel, selVal;
            const {target} = e,
                {dataset, parentNode} = target || {},
                cl = target.classList;

            if (cl.contains('ei-files-presets') ||
                (
                    parentNode &&
                    parentNode.classList.contains('ei-files-presets')
                ) ||
                    cl.contains('ei-exe-presets') ||
                    (
                        parentNode &&
                        parentNode.classList.contains('ei-exe-presets')
                    )
            ) {
                ({value} = target);
                if (!value) {
                    return;
                }
                sel = dataset.ei_sel || (parentNode && parentNode.dataset.ei_sel);
                if (sel) {
                    $(sel).value = value;
                }
            } else if (cl.contains('ei-files-picker') || cl.contains('ei-exe-picker')) {
                sel = dataset.ei_sel;
                // Use .select() on input type=file picker?
                await filePick$$1({
                    dirPath: $(sel).value,
                    selector: sel,
                    defaultExtension: dataset.ei_defaultExtension || undefined,
                    selectFolder: ($(dataset.ei_directory) && $(dataset.ei_directory).checked)
                        ? true
                        : undefined
                });
            } else if (cl.contains('ei-files-revealButton') || cl.contains('ei-exe-revealButton')) {
                sel = dataset.ei_sel;
                selVal = sel && $(sel).value;
                if (selVal) {
                    reveal({fileName: selVal});
                } else {
                    dialogs$1.alert(_('choose_file_to_reveal'));
                }
            } else if (target.id === 'cancel') {
                await buttonClick({close: true});
            } else if (cl.contains('batch_export')) {
                const commandText = 'todo: serialize the form into a batch file here';
                const uri = 'data:,' + encodeURIComponent(commandText);
                const a = jml('a', {
                    style: 'display: none;',
                    download: ($('#command-name').value || 'command') + getSuffixForOS(),
                    href: uri
                }, ['hidden'], $('body'));
                a.click();
                e.preventDefault(); // Avoid blanking out
            } else if (cl.contains('passData')) {
                const name = $('#command-name').value;
                if (cl.contains('delete')) {
                    try {
                        await dialogs$1.confirm(_('sure_wish_delete'));
                    } catch (cancelled) {
                        return;
                    }
                    await buttonClick({name, remove: true, inputs});
                    return;
                }
                if (cl.contains('save')) {
                    if (!name) {
                        await dialogs$1.alert(_('supply_name'));
                        return;
                    }
                    if (nameChanged) {
                        if (oldStorage[name]) {
                            try {
                                await dialogs$1.confirm(_('name_already_exists_overwrite'));
                            } catch (cancelled) {
                                return;
                            }
                        } else if (!createNewCommand) {
                            // User wishes to create a new record (or cancel)
                            try {
                                await dialogs$1.confirm(_('have_unsaved_name_change'));
                            } catch (cancelled) {
                                $('#selectNames').selectedIndex = 0;
                                nameChanged = false;
                                // Return so that user has some way of correcting or
                                //   avoiding (without renaming)
                                return;
                            }
                        }
                        // Proceed with rename, so first delete old value
                        //    (todo: could ensure first added)
                        await buttonClick({
                            name: $('#command-name').defaultValue,
                            remove: true,
                            inputs,
                            keepForm: true
                        });
                    } else if (!changed && !cl.contains('execute')) {
                        await dialogs$1.alert(_('no_changes_to_save'));
                        return;
                    }
                }
                const data = {
                    name,
                    save: cl.contains('save'),
                    inputs,
                    detail: getDetail()
                };
                if (cl.contains('execute')) {
                    data.execute = true;
                }
                console.log('data', data);
                await buttonClick(data);
            }
        });

        $('body').addEventListener('input', async function ({target}) {
            const {value} = target;
            if (target.classList.contains('ei-files-path') ||
                target.classList.contains('ei-exe-path')
            ) {
                const data = await autocompletePaths({
                    value,
                    listID: target.getAttribute('list')
                });
                autocompletePathsResponse(data);
            }
        });

        // COPIED FROM filebrowser-enhanced directoryMod.js (RETURN ALL MODIFICATIONS THERE)
        function autocompletePathsResponse (data) {
            const datalist = $('#' + data.listID);
            while (datalist.firstChild) {
                datalist.firstChild.remove();
            }
            data.optValues.forEach((value) => {
                const option = jml('option', {
                    // text: value,
                    value
                });
                datalist.append(option);
            });
        }

        // INITIAL BEHAVIORS

        jQuery('#restrict-contexts').multipleSelect('checkAll');
        rebuildCommandList();

        // Todo: For prefs when prev. values stored, call multiple times and
        //         populate and reduce when not used
        ['args', 'urls', 'files'].forEach((inputType) => {
            inputs[inputType].add();
        });

        handleOptions({
            executables,
            temps
        });
    }
    })();

}());
//# sourceMappingURL=one-off-bundled.js.map
