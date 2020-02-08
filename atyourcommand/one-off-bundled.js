(function () {
  'use strict';

  /**
   * These may need tweaking or moving out of NormalTags
   * Note that img.src and a.href include base URI.
   * @todo Allow video and audio to be checked for `<source>` tags
   * @todo Do more thorough review of all other tags
   * @todo Include SVG elements
  */
  const Tags = [
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

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

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
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

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
  // istanbul ignore next
  var win = typeof window !== 'undefined' && window; // istanbul ignore next

  var doc = typeof document !== 'undefined' && document || win && win.document; // STATIC PROPERTIES

  var possibleOptions = ['$plugins', // '$mode', // Todo (SVG/XML)
  // '$state', // Used internally
  '$map' // Add any other options here
  ];
  var NS_HTML = 'http://www.w3.org/1999/xhtml',
      hyphenForCamelCase = /\x2D([a-z])/g;
  var ATTR_MAP = {
    readonly: 'readOnly'
  }; // We define separately from ATTR_DOM for clarity (and parity with JsonML) but no current need
  // We don't set attribute esp. for boolean atts as we want to allow setting of `undefined`
  //   (e.g., from an empty variable) on templates to have no effect

  var BOOL_ATTS = ['checked', 'defaultChecked', 'defaultSelected', 'disabled', 'indeterminate', 'open', // Dialog elements
  'readOnly', 'selected']; // From JsonML

  var ATTR_DOM = BOOL_ATTS.concat(['accessKey', // HTMLElement
  'async', 'autocapitalize', // HTMLElement
  'autofocus', 'contentEditable', // HTMLElement through ElementContentEditable
  'defaultValue', 'defer', 'draggable', // HTMLElement
  'formnovalidate', 'hidden', // HTMLElement
  'innerText', // HTMLElement
  'inputMode', // HTMLElement through ElementContentEditable
  'ismap', 'multiple', 'novalidate', 'pattern', 'required', 'spellcheck', // HTMLElement
  'translate', // HTMLElement
  'value', 'willvalidate']); // Todo: Add more to this as useful for templating
  //   to avoid setting through nullish value

  var NULLABLES = ['autocomplete', 'dir', // HTMLElement
  'integrity', // script, link
  'lang', // HTMLElement
  'max', 'min', 'title' // HTMLElement
  ];

  var $$1 = function $(sel) {
    return doc.querySelector(sel);
  };

  var $$ = function $$(sel) {
    return _toConsumableArray(doc.querySelectorAll(sel));
  };
  /**
  * Retrieve the (lower-cased) HTML name of a node.
  * @static
  * @param {Node} node The HTML node
  * @returns {string} The lower-cased node name
  */


  function _getHTMLNodeName(node) {
    return node.nodeName && node.nodeName.toLowerCase();
  }
  /**
  * Apply styles if this is a style tag.
  * @static
  * @param {Node} node The element to check whether it is a style tag
  * @returns {void}
  */


  function _applyAnyStylesheet(node) {
    // Only used in IE
    // istanbul ignore else
    if (!doc.createStyleSheet) {
      return;
    } // istanbul ignore next


    if (_getHTMLNodeName(node) === 'style') {
      // IE
      var ss = doc.createStyleSheet(); // Create a stylesheet to actually do something useful

      ss.cssText = node.cssText; // We continue to add the style tag, however
    }
  }
  /**
   * Need this function for IE since options weren't otherwise getting added.
   * @private
   * @static
   * @param {Element} parent The parent to which to append the element
   * @param {Node} child The element or other node to append to the parent
   * @returns {void}
   */


  function _appendNode(parent, child) {
    var parentName = _getHTMLNodeName(parent); // IE only
    // istanbul ignore if


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
      parent.content.append(child);
      return;
    }

    try {
      parent.append(child); // IE9 is now ok with this
    } catch (e) {
      // istanbul ignore next
      var childName = _getHTMLNodeName(child); // istanbul ignore next


      if (parentName === 'select' && childName === 'option') {
        try {
          // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
          parent.add(child);
        } catch (err) {
          // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
          parent.add(child, null); // IE7 has a problem with this, but IE8+ is ok
        }

        return;
      } // istanbul ignore next


      throw e;
    }
  }
  /**
   * Attach event in a cross-browser fashion.
   * @static
   * @param {Element} el DOM element to which to attach the event
   * @param {string} type The DOM event (without 'on') to attach to the element
   * @param {EventListener} handler The event handler to attach to the element
   * @param {boolean} [capturing] Whether or not the event should be
   *   capturing (W3C-browsers only); default is false; NOT IN USE
   * @returns {void}
   */


  function _addEvent(el, type, handler, capturing) {
    el.addEventListener(type, handler, Boolean(capturing));
  }
  /**
  * Creates a text node of the result of resolving an entity or character reference.
  * @param {'entity'|'decimal'|'hexadecimal'} type Type of reference
  * @param {string} prefix Text to prefix immediately after the "&"
  * @param {string} arg The body of the reference
  * @returns {Text} The text node of the resolved reference
  */


  function _createSafeReference(type, prefix, arg) {
    // For security reasons related to innerHTML, we ensure this string only
    //  contains potential entity characters
    if (!arg.match(/^[0-9A-Z_a-z]+$/)) {
      throw new TypeError('Bad ' + type);
    }

    var elContainer = doc.createElement('div'); // Todo: No workaround for XML?
    // eslint-disable-next-line no-unsanitized/property

    elContainer.textContent = '&' + prefix + arg + ';';
    return doc.createTextNode(elContainer.textContent);
  }
  /**
  * @param {string} n0 Whole expression match (including "-")
  * @param {string} n1 Lower-case letter match
  * @returns {string} Uppercased letter
  */


  function _upperCase(n0, n1) {
    return n1.toUpperCase();
  } // Todo: Make as public utility

  /**
   * @param {any} o
   * @returns {boolean}
   */


  function _isNullish(o) {
    return o === null || o === undefined;
  } // Todo: Make as public utility, but also return types for undefined, boolean, number, document, etc.

  /**
  * @private
  * @static
  * @param {string|JamilihAttributes|JamilihArray|Element|DocumentFragment} item
  * @returns {"string"|"null"|"array"|"element"|"fragment"|"object"|"symbol"|"function"|"number"|"boolean"}
  */


  function _getType(item) {
    var type = _typeof(item);

    switch (type) {
      case 'object':
        if (item === null) {
          return 'null';
        }

        if (Array.isArray(item)) {
          return 'array';
        }

        if ('nodeType' in item) {
          switch (item.nodeType) {
            case 1:
              return 'element';

            case 9:
              return 'document';

            case 11:
              return 'fragment';

            default:
              return 'non-container node';
          }
        }

      // Fallthrough

      default:
        return type;
    }
  }
  /**
  * @private
  * @static
  * @param {DocumentFragment} frag
  * @param {Node} node
  * @returns {DocumentFragment}
  */


  function _fragReducer(frag, node) {
    frag.append(node);
    return frag;
  }
  /**
  * @private
  * @static
  * @param {Object<{string:string}>} xmlnsObj
  * @returns {string}
  */


  function _replaceDefiner(xmlnsObj) {
    return function (n0) {
      var retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : n0; // Preserve XHTML

      for (var _i = 0, _Object$entries = Object.entries(xmlnsObj); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            ns = _Object$entries$_i[0],
            xmlnsVal = _Object$entries$_i[1];

        if (ns !== '') {
          retStr += ' xmlns:' + ns + '="' + xmlnsVal + '"';
        }
      }

      return retStr;
    };
  }
  /**
  * @typedef {JamilihAttributes} AttributeArray
  * @property {string} 0 The key
  * @property {string} 1 The value
  */

  /**
  * @callback ChildrenToJMLCallback
  * @param {JamilihArray|Jamilih} childNodeJML
  * @param {Integer} i
  * @returns {void}
  */

  /**
  * @private
  * @static
  * @param {Node} node
  * @returns {ChildrenToJMLCallback}
  */


  function _childrenToJML(node) {
    return function (childNodeJML, i) {
      var cn = node.childNodes[i];
      var j = Array.isArray(childNodeJML) ? jml.apply(void 0, _toConsumableArray(childNodeJML)) : jml(childNodeJML);
      cn.replaceWith(j);
    };
  }
  /**
  * @callback JamilihAppender
  * @param {JamilihArray} childJML
  * @returns {void}
  */

  /**
  * @private
  * @static
  * @param {Node} node
  * @returns {JamilihAppender}
  */


  function _appendJML(node) {
    return function (childJML) {
      if (Array.isArray(childJML)) {
        node.append(jml.apply(void 0, _toConsumableArray(childJML)));
      } else {
        node.append(jml(childJML));
      }
    };
  }
  /**
  * @callback appender
  * @param {string|JamilihArray} childJML
  * @returns {void}
  */

  /**
  * @private
  * @static
  * @param {Node} node
  * @returns {appender}
  */


  function _appendJMLOrText(node) {
    return function (childJML) {
      if (typeof childJML === 'string') {
        node.append(childJML);
      } else if (Array.isArray(childJML)) {
        node.append(jml.apply(void 0, _toConsumableArray(childJML)));
      } else {
        node.append(jml(childJML));
      }
    };
  }
  /**
  * @private
  * @static
  */

  /*
  function _DOMfromJMLOrString (childNodeJML) {
    if (typeof childNodeJML === 'string') {
      return doc.createTextNode(childNodeJML);
    }
    return jml(...childNodeJML);
  }
  */

  /**
  * @typedef {Element|DocumentFragment} JamilihReturn
  */

  /**
  * @typedef {PlainObject<string, string>} JamilihAttributes
  */

  /**
  * @typedef {GenericArray} JamilihArray
  * @property {string} 0 The element to create (by lower-case name)
  * @property {JamilihAttributes} [1] Attributes to add with the key as the
  *   attribute name and value as the attribute value; important for IE where
  *   the input element's type cannot be added later after already added to the page
  * @param {Element[]} [children] The optional children of this element
  *   (but raw DOM elements required to be specified within arrays since
  *   could not otherwise be distinguished from siblings being added)
  * @param {Element} [parent] The optional parent to which to attach the element
  *   (always the last unless followed by null, in which case it is the
  *   second-to-last)
  * @param {null} [returning] Can use null to indicate an array of elements
  *   should be returned
  */

  /**
  * @typedef {PlainObject} JamilihOptions
  * @property {"root"|"attributeValue"|"fragment"|"children"|"fragmentChildren"} $state
  */

  /**
   * @param {Element} elem
   * @param {string} att
   * @param {string} attVal
   * @param {JamilihOptions} opts
   * @returns {void}
   */


  function checkPluginValue(elem, att, attVal, opts) {
    opts.$state = 'attributeValue';

    if (attVal && _typeof(attVal) === 'object') {
      var matchingPlugin = getMatchingPlugin(opts, Object.keys(attVal)[0]);

      if (matchingPlugin) {
        return matchingPlugin.set({
          opts: opts,
          element: elem,
          attribute: {
            name: att,
            value: attVal
          }
        });
      }
    }

    return attVal;
  }
  /**
   * @param {JamilihOptions} opts
   * @param {string} item
   * @returns {JamilihPlugin}
   */


  function getMatchingPlugin(opts, item) {
    return opts.$plugins && opts.$plugins.find(function (p) {
      return p.name === item;
    });
  }
  /**
   * Creates an XHTML or HTML element (XHTML is preferred, but only in browsers
   * that support); any element after element can be omitted, and any subsequent
   * type or types added afterwards.
   * @param {...JamilihArray} args
   * @returns {JamilihReturn} The newly created (and possibly already appended)
   *   element or array of elements
   */


  var jml = function jml() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var elem = doc.createDocumentFragment();
    /**
     *
     * @param {Object<{string: string}>} atts
     * @returns {void}
     */

    function _checkAtts(atts) {
      for (var _i2 = 0, _Object$entries2 = Object.entries(atts); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            att = _Object$entries2$_i[0],
            attVal = _Object$entries2$_i[1];

        att = att in ATTR_MAP ? ATTR_MAP[att] : att;

        if (NULLABLES.includes(att)) {
          attVal = checkPluginValue(elem, att, attVal, opts);

          if (!_isNullish(attVal)) {
            elem[att] = attVal;
          }

          continue;
        } else if (ATTR_DOM.includes(att)) {
          attVal = checkPluginValue(elem, att, attVal, opts);
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
              opts.$state = 'fragmentChilden';
              nodes[nodes.length] = jml(opts, attVal);
              break;
            }

          case '$shadow':
            {
              var _attVal = attVal,
                  open = _attVal.open,
                  closed = _attVal.closed;
              var _attVal2 = attVal,
                  content = _attVal2.content,
                  template = _attVal2.template;
              var shadowRoot = elem.attachShadow({
                mode: closed || open === false ? 'closed' : 'open'
              });

              if (template) {
                if (Array.isArray(template)) {
                  if (_getType(template[0]) === 'object') {
                    // Has attributes
                    template = jml.apply(void 0, ['template'].concat(_toConsumableArray(template), [doc.body]));
                  } else {
                    // Array is for the children
                    template = jml('template', template, doc.body);
                  }
                } else if (typeof template === 'string') {
                  template = $$1(template);
                }

                jml(template.content.cloneNode(true), shadowRoot);
              } else {
                if (!content) {
                  content = open || closed;
                }

                if (content && typeof content !== 'boolean') {
                  if (Array.isArray(content)) {
                    jml({
                      '#': content
                    }, shadowRoot);
                  } else {
                    jml(content, shadowRoot);
                  }
                }
              }

              break;
            }

          case '$state':
            {
              // Handled internally
              break;
            }

          case 'is':
            {
              // Currently only in Chrome
              // Handled during element creation
              break;
            }

          case '$custom':
            {
              Object.assign(elem, attVal);
              break;
            }

          /* istanbul ignore next */

          case '$define':
            {
              var _ret = function () {
                var localName = elem.localName.toLowerCase(); // Note: customized built-ins sadly not working yet

                var customizedBuiltIn = !localName.includes('-'); // We check attribute in case this is a preexisting DOM element
                // const {is} = atts;

                var is = void 0;

                if (customizedBuiltIn) {
                  is = elem.getAttribute('is');

                  if (!is) {
                    if (!{}.hasOwnProperty.call(atts, 'is')) {
                      throw new TypeError('Expected `is` with `$define` on built-in');
                    }

                    atts.is = checkPluginValue(elem, 'is', atts.is, opts);
                    elem.setAttribute('is', atts.is);
                    is = atts.is;
                  }
                }

                var def = customizedBuiltIn ? is : localName;

                if (customElements.get(def)) {
                  return "break";
                }

                var getConstructor = function getConstructor(cnstrct) {
                  var baseClass = options && options["extends"] ? doc.createElement(options["extends"]).constructor : customizedBuiltIn ? doc.createElement(localName).constructor : HTMLElement;
                  /**
                   * Class wrapping base class.
                   */

                  return cnstrct ?
                  /*#__PURE__*/
                  function (_baseClass) {
                    _inherits(_class, _baseClass);

                    /**
                     * Calls user constructor.
                     */
                    function _class() {
                      var _this;

                      _classCallCheck(this, _class);

                      _this = _possibleConstructorReturn(this, _getPrototypeOf(_class).call(this));
                      cnstrct.call(_assertThisInitialized(_this));
                      return _this;
                    }

                    return _class;
                  }(baseClass) :
                  /*#__PURE__*/
                  function (_baseClass2) {
                    _inherits(_class2, _baseClass2);

                    function _class2() {
                      _classCallCheck(this, _class2);

                      return _possibleConstructorReturn(this, _getPrototypeOf(_class2).apply(this, arguments));
                    }

                    return _class2;
                  }(baseClass);
                };

                var cnstrctr = void 0,
                    options = void 0,
                    mixin = void 0;

                if (Array.isArray(attVal)) {
                  if (attVal.length <= 2) {
                    var _attVal3 = attVal;

                    var _attVal4 = _slicedToArray(_attVal3, 2);

                    cnstrctr = _attVal4[0];
                    options = _attVal4[1];

                    if (typeof options === 'string') {
                      // Todo: Allow creating a definition without using it;
                      //  that may be the only reason to have a string here which
                      //  differs from the `localName` anyways
                      options = {
                        "extends": options
                      };
                    } else if (options && !{}.hasOwnProperty.call(options, 'extends')) {
                      mixin = options;
                    }

                    if (_typeof(cnstrctr) === 'object') {
                      mixin = cnstrctr;
                      cnstrctr = getConstructor();
                    }
                  } else {
                    var _attVal5 = attVal;

                    var _attVal6 = _slicedToArray(_attVal5, 3);

                    cnstrctr = _attVal6[0];
                    mixin = _attVal6[1];
                    options = _attVal6[2];

                    if (typeof options === 'string') {
                      options = {
                        "extends": options
                      };
                    }
                  }
                } else if (typeof attVal === 'function') {
                  cnstrctr = attVal;
                } else {
                  mixin = attVal;
                  cnstrctr = getConstructor();
                }

                if (!cnstrctr.toString().startsWith('class')) {
                  cnstrctr = getConstructor(cnstrctr);
                }

                if (!options && customizedBuiltIn) {
                  options = {
                    "extends": localName
                  };
                }

                if (mixin) {
                  Object.entries(mixin).forEach(function (_ref) {
                    var _ref2 = _slicedToArray(_ref, 2),
                        methodName = _ref2[0],
                        method = _ref2[1];

                    cnstrctr.prototype[methodName] = method;
                  });
                } // console.log('def', def, '::', typeof options === 'object' ? options : undefined);


                customElements.define(def, cnstrctr, _typeof(options) === 'object' ? options : undefined);
                return "break";
              }();

              if (_ret === "break") break;
            }

          case '$symbol':
            {
              var _attVal7 = attVal,
                  _attVal8 = _slicedToArray(_attVal7, 2),
                  symbol = _attVal8[0],
                  func = _attVal8[1];

              if (typeof func === 'function') {
                var funcBound = func.bind(elem);

                if (typeof symbol === 'string') {
                  elem[Symbol["for"](symbol)] = funcBound;
                } else {
                  elem[symbol] = funcBound;
                }
              } else {
                var obj = func;
                obj.elem = elem;

                if (typeof symbol === 'string') {
                  elem[Symbol["for"](symbol)] = obj;
                } else {
                  elem[symbol] = obj;
                }
              }

              break;
            }

          case '$data':
            {
              setMap(attVal);
              break;
            }

          case '$attribute':
            {
              // Attribute node
              var node = attVal.length === 3 ? doc.createAttributeNS(attVal[0], attVal[1]) : doc.createAttribute(attVal[0]);
              node.value = attVal[attVal.length - 1];
              nodes[nodes.length] = node;
              break;
            }

          case '$text':
            {
              // Todo: Also allow as jml(['a text node']) (or should that become a fragment)?
              var _node = doc.createTextNode(attVal);

              nodes[nodes.length] = _node;
              break;
            }

          case '$document':
            {
              // Todo: Conditionally create XML document
              var _node2 = doc.implementation.createHTMLDocument();

              if (attVal.childNodes) {
                // Remove any extra nodes created by createHTMLDocument().
                var j = attVal.childNodes.length;

                while (_node2.childNodes[j]) {
                  var cn = _node2.childNodes[j];
                  cn.remove(); // `j` should stay the same as removing will cause node to be present
                } // eslint-disable-next-line unicorn/no-fn-reference-in-iterator


                attVal.childNodes.forEach(_childrenToJML(_node2));
              } else {
                if (attVal.$DOCTYPE) {
                  var dt = {
                    $DOCTYPE: attVal.$DOCTYPE
                  };
                  var doctype = jml(dt);

                  _node2.firstChild.replaceWith(doctype);
                }

                var html = _node2.childNodes[1];
                var head = html.childNodes[0];
                var _body = html.childNodes[1];

                if (attVal.title || attVal.head) {
                  var meta = doc.createElement('meta');
                  meta.setAttribute('charset', 'utf-8');
                  head.append(meta);

                  if (attVal.title) {
                    _node2.title = attVal.title; // Appends after meta
                  }

                  if (attVal.head) {
                    // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                    attVal.head.forEach(_appendJML(head));
                  }
                }

                if (attVal.body) {
                  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                  attVal.body.forEach(_appendJMLOrText(_body));
                }
              }

              nodes[nodes.length] = _node2;
              break;
            }

          case '$DOCTYPE':
            {
              var _node3 = doc.implementation.createDocumentType(attVal.name, attVal.publicId || '', attVal.systemId || '');

              nodes[nodes.length] = _node3;
              break;
            }

          case '$on':
            {
              // Events
              for (var _i3 = 0, _Object$entries3 = Object.entries(attVal); _i3 < _Object$entries3.length; _i3++) {
                var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
                    p2 = _Object$entries3$_i[0],
                    val = _Object$entries3$_i[1];

                if (typeof val === 'function') {
                  val = [val, false];
                }

                if (typeof val[0] !== 'function') {
                  throw new TypeError('Expect a function for `$on`');
                }

                _addEvent(elem, p2, val[0], val[1]); // element, event name, handler, capturing

              }

              break;
            }

          case 'className':
          case 'class':
            attVal = checkPluginValue(elem, att, attVal, opts);

            if (!_isNullish(attVal)) {
              elem.className = attVal;
            }

            break;

          case 'dataset':
            {
              var _ret2 = function () {
                // Map can be keyed with hyphenated or camel-cased properties
                var recurse = function recurse(atVal, startProp) {
                  var prop = '';
                  var pastInitialProp = startProp !== '';
                  Object.keys(atVal).forEach(function (key) {
                    var value = atVal[key];

                    if (pastInitialProp) {
                      prop = startProp + key.replace(hyphenForCamelCase, _upperCase).replace(/^([a-z])/, _upperCase);
                    } else {
                      prop = startProp + key.replace(hyphenForCamelCase, _upperCase);
                    }

                    if (value === null || _typeof(value) !== 'object') {
                      if (!_isNullish(value)) {
                        elem.dataset[prop] = value;
                      }

                      prop = startProp;
                      return;
                    }

                    recurse(value, prop);
                  });
                };

                recurse(attVal, '');
                return "break"; // Todo: Disable this by default unless configuration explicitly allows (for security)
              }();

              if (_ret2 === "break") break;
            }

          case 'htmlFor':
          case 'for':
            if (elStr === 'label') {
              attVal = checkPluginValue(elem, att, attVal, opts);

              if (!_isNullish(attVal)) {
                elem.htmlFor = attVal;
              }

              break;
            }

            attVal = checkPluginValue(elem, att, attVal, opts);
            elem.setAttribute(att, attVal);
            break;

          case 'xmlns':
            // Already handled
            break;

          default:
            {
              if (att.startsWith('on')) {
                attVal = checkPluginValue(elem, att, attVal, opts);
                elem[att] = attVal; // _addEvent(elem, att.slice(2), attVal, false); // This worked, but perhaps the user wishes only one event

                break;
              }

              if (att === 'style') {
                attVal = checkPluginValue(elem, att, attVal, opts);

                if (_isNullish(attVal)) {
                  break;
                }

                if (_typeof(attVal) === 'object') {
                  for (var _i4 = 0, _Object$entries4 = Object.entries(attVal); _i4 < _Object$entries4.length; _i4++) {
                    var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
                        _p = _Object$entries4$_i[0],
                        styleVal = _Object$entries4$_i[1];

                    if (!_isNullish(styleVal)) {
                      // Todo: Handle aggregate properties like "border"
                      if (_p === 'float') {
                        elem.style.cssFloat = styleVal;
                        elem.style.styleFloat = styleVal; // Harmless though we could make conditional on older IE instead
                      } else {
                        elem.style[_p.replace(hyphenForCamelCase, _upperCase)] = styleVal;
                      }
                    }
                  }

                  break;
                } // setAttribute unfortunately erases any existing styles


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

              var matchingPlugin = getMatchingPlugin(opts, att);

              if (matchingPlugin) {
                matchingPlugin.set({
                  opts: opts,
                  element: elem,
                  attribute: {
                    name: att,
                    value: attVal
                  }
                });
                break;
              }

              attVal = checkPluginValue(elem, att, attVal, opts);
              elem.setAttribute(att, attVal);
              break;
            }
        }
      }
    }

    var nodes = [];
    var elStr;
    var opts;
    var isRoot = false;

    if (_getType(args[0]) === 'object' && Object.keys(args[0]).some(function (key) {
      return possibleOptions.includes(key);
    })) {
      opts = args[0];

      if (opts.$state === undefined) {
        isRoot = true;
        opts.$state = 'root';
      }

      if (opts.$map && !opts.$map.root && opts.$map.root !== false) {
        opts.$map = {
          root: opts.$map
        };
      }

      if ('$plugins' in opts) {
        if (!Array.isArray(opts.$plugins)) {
          throw new TypeError('$plugins must be an array');
        }

        opts.$plugins.forEach(function (pluginObj) {
          if (!pluginObj || _typeof(pluginObj) !== 'object') {
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
    } else {
      opts = {
        $state: undefined
      };
    }

    var argc = args.length;
    var defaultMap = opts.$map && opts.$map.root;

    var setMap = function setMap(dataVal) {
      var map, obj; // Boolean indicating use of default map and object

      if (dataVal === true) {
        var _defaultMap = _slicedToArray(defaultMap, 2);

        map = _defaultMap[0];
        obj = _defaultMap[1];
      } else if (Array.isArray(dataVal)) {
        // Array of strings mapping to default
        if (typeof dataVal[0] === 'string') {
          dataVal.forEach(function (dVal) {
            setMap(opts.$map[dVal]);
          });
          return; // Array of Map and non-map data object
        }

        map = dataVal[0] || defaultMap[0];
        obj = dataVal[1] || defaultMap[1]; // Map
      } else if (/^\[object (?:Weak)?Map\]$/.test([].toString.call(dataVal))) {
        map = dataVal;
        obj = defaultMap[1]; // Non-map data object
      } else {
        map = defaultMap[0];
        obj = dataVal;
      }

      map.set(elem, obj);
    };

    for (var i = 0; i < argc; i++) {
      var arg = args[i];

      var type = _getType(arg);

      switch (type) {
        default:
          throw new TypeError('Unexpected type: ' + type);

        case 'null':
          // null always indicates a place-holder (only needed for last argument if want array returned)
          if (i === argc - 1) {
            _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
            // Todo: Fix to allow application of stylesheets of style tags within fragments?


            return nodes.length <= 1 ? nodes[0] // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
            : nodes.reduce(_fragReducer, doc.createDocumentFragment()); // nodes;
          }

          throw new TypeError('`null` values not allowed except as final Jamilih argument');

        case 'string':
          // Strings normally indicate elements
          switch (arg) {
            case '!':
              nodes[nodes.length] = doc.createComment(args[++i]);
              break;

            case '?':
              {
                arg = args[++i];
                var procValue = args[++i];
                var val = procValue;

                if (val && _typeof(val) === 'object') {
                  procValue = [];

                  for (var _i5 = 0, _Object$entries5 = Object.entries(val); _i5 < _Object$entries5.length; _i5++) {
                    var _Object$entries5$_i = _slicedToArray(_Object$entries5[_i5], 2),
                        p = _Object$entries5$_i[0],
                        procInstVal = _Object$entries5$_i[1];

                    procValue.push(p + '=' + '"' + // https://www.w3.org/TR/xml-stylesheet/#NT-PseudoAttValue
                    procInstVal.replace(/"/g, '&quot;') + '"');
                  }

                  procValue = procValue.join(' ');
                } // Firefox allows instructions with ">" in this method, but not if placed directly!


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

                break; // Browsers don't support doc.createEntityReference, so we just use this as a convenience
              }

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
              nodes[nodes.length] = elem = doc.createDocumentFragment(); // Todo: Report to plugins

              opts.$state = 'fragment';
              break;

            default:
              {
                // An element
                elStr = arg;
                var atts = args[i + 1];

                if (_getType(atts) === 'object' && atts.is) {
                  var is = atts.is; // istanbul ignore else

                  if (doc.createElementNS) {
                    elem = doc.createElementNS(NS_HTML, elStr, {
                      is: is
                    });
                  } else {
                    elem = doc.createElement(elStr, {
                      is: is
                    });
                  }
                } else
                  /* istanbul ignore else */
                  if (doc.createElementNS) {
                    elem = doc.createElementNS(NS_HTML, elStr);
                  } else {
                    elem = doc.createElement(elStr);
                  } // Todo: Report to plugins


                opts.$state = 'element';
                nodes[nodes.length] = elem; // Add to parent

                break;
              }
          }

          break;

        case 'object':
          {
            // Non-DOM-element objects indicate attribute-value pairs
            var _atts = arg;

            if (_atts.xmlns !== undefined) {
              // We handle this here, as otherwise may lose events, etc.
              // As namespace of element already set as XHTML, we need to change the namespace
              // elem.setAttribute('xmlns', atts.xmlns); // Doesn't work
              // Can't set namespaceURI dynamically, renameNode() is not supported, and setAttribute() doesn't work to change the namespace, so we resort to this hack
              var replacer = void 0;

              if (_typeof(_atts.xmlns) === 'object') {
                replacer = _replaceDefiner(_atts.xmlns);
              } else {
                replacer = ' xmlns="' + _atts.xmlns + '"';
              } // try {
              // Also fix DOMParser to work with text/html


              elem = nodes[nodes.length - 1] = new win.DOMParser().parseFromString(new win.XMLSerializer().serializeToString(elem) // Mozilla adds XHTML namespace
              .replace(' xmlns="' + NS_HTML + '"', replacer), 'application/xml').documentElement; // Todo: Report to plugins

              opts.$state = 'element'; // }catch(e) {alert(elem.outerHTML);throw e;}
            }

            _checkAtts(_atts);

            break;
          }

        case 'document':
        case 'fragment':
        case 'element':
          /*
          1) Last element always the parent (put null if don't want parent and want to return array) unless only atts and children (no other elements)
          2) Individual elements (DOM elements or sequences of string[/object/array]) get added to parent first-in, first-added
          */
          if (i === 0) {
            // Allow wrapping of element, fragment, or document
            elem = arg; // Todo: Report to plugins

            opts.$state = 'element';
          }

          if (i === argc - 1 || i === argc - 2 && args[i + 1] === null) {
            // parent
            var elsl = nodes.length;

            for (var k = 0; k < elsl; k++) {
              _appendNode(arg, nodes[k]);
            } // Todo: Apply stylesheets if any style tags were added elsewhere besides the first element?


            _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them

          } else {
            nodes[nodes.length] = arg;
          }

          break;

        case 'array':
          {
            // Arrays or arrays of arrays indicate child nodes
            var child = arg;
            var cl = child.length;

            for (var j = 0; j < cl; j++) {
              // Go through children array container to handle elements
              var childContent = child[j];

              var childContentType = _typeof(childContent);

              if (_isNullish(childContent)) {
                throw new TypeError('Bad children (parent array: ' + JSON.stringify(args) + '; child: ' + child + '; index:' + j + ')');
              }

              switch (childContentType) {
                // Todo: determine whether null or function should have special handling or be converted to text
                case 'string':
                case 'number':
                case 'boolean':
                  _appendNode(elem, doc.createTextNode(childContent));

                  break;

                default:
                  if (Array.isArray(childContent)) {
                    // Arrays representing child elements
                    opts.$state = 'children';

                    _appendNode(elem, jml.apply(void 0, [opts].concat(_toConsumableArray(childContent))));
                  } else if (childContent['#']) {
                    // Fragment
                    opts.$state = 'fragmentChildren';

                    _appendNode(elem, jml(opts, childContent['#']));
                  } else {
                    // Single DOM element children
                    var newChildContent = checkPluginValue(elem, null, childContent, opts);

                    _appendNode(elem, newChildContent);
                  }

                  break;
              }
            }

            break;
          }
      }
    }

    var ret = nodes[0] || elem;

    if (isRoot && opts.$map && opts.$map.root) {
      setMap(true);
    }

    return ret;
  };
  /**
  * Converts a DOM object or a string of HTML into a Jamilih object (or string).
  * @param {string|HTMLElement} dom If a string, will parse as document
  * @param {PlainObject} [config] Configuration object
  * @param {boolean} [config.stringOutput=false] Whether to output the Jamilih object as a string.
  * @param {boolean} [config.reportInvalidState=true] If true (the default), will report invalid state errors
  * @param {boolean} [config.stripWhitespace=false] Strip whitespace for text nodes
  * @returns {JamilihArray|string} Array containing the elements which represent
  * a Jamilih object, or, if `stringOutput` is true, it will be the stringified
  * version of such an object
  */


  jml.toJML = function (dom) {
    var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref3$stringOutput = _ref3.stringOutput,
        stringOutput = _ref3$stringOutput === void 0 ? false : _ref3$stringOutput,
        _ref3$reportInvalidSt = _ref3.reportInvalidState,
        reportInvalidState = _ref3$reportInvalidSt === void 0 ? true : _ref3$reportInvalidSt,
        _ref3$stripWhitespace = _ref3.stripWhitespace,
        stripWhitespace = _ref3$stripWhitespace === void 0 ? false : _ref3$stripWhitespace;

    if (typeof dom === 'string') {
      dom = new win.DOMParser().parseFromString(dom, 'text/html'); // todo: Give option for XML once implemented and change JSDoc to allow for Element
    }

    var ret = [];
    var parent = ret;
    var parentIdx = 0;
    /**
     * @param {string} msg
     * @throws {DOMException}
     * @returns {void}
     */

    function invalidStateError(msg) {
      // These are probably only necessary if working with text/html

      /* eslint-disable no-shadow, unicorn/custom-error-definition */

      /**
       * Polyfill for `DOMException`.
       */
      var DOMException =
      /*#__PURE__*/
      function (_Error) {
        _inherits(DOMException, _Error);

        /* eslint-enable no-shadow, unicorn/custom-error-definition */

        /**
         * @param {string} message
         * @param {string} name
         */
        function DOMException(message, name) {
          var _this2;

          _classCallCheck(this, DOMException);

          _this2 = _possibleConstructorReturn(this, _getPrototypeOf(DOMException).call(this, message)); // eslint-disable-next-line unicorn/custom-error-definition

          _this2.name = name;
          return _this2;
        }

        return DOMException;
      }(_wrapNativeSuper(Error));

      if (reportInvalidState) {
        // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
        var e = new DOMException(msg, 'INVALID_STATE_ERR');
        e.code = 11;
        throw e;
      }
    }
    /**
     *
     * @param {DocumentType|Entity} obj
     * @param {Node} node
     * @returns {void}
     */


    function addExternalID(obj, node) {
      if (node.systemId.includes('"') && node.systemId.includes("'")) {
        invalidStateError('systemId cannot have both single and double quotes.');
      }

      var publicId = node.publicId,
          systemId = node.systemId;

      if (systemId) {
        obj.systemId = systemId;
      }

      if (publicId) {
        obj.publicId = publicId;
      }
    }
    /**
     *
     * @param {any} val
     * @returns {void}
     */


    function set(val) {
      parent[parentIdx] = val;
      parentIdx++;
    }
    /**
     * @returns {void}
     */


    function setChildren() {
      set([]);
      parent = parent[parentIdx - 1];
      parentIdx = 0;
    }
    /**
     *
     * @param {string} prop1
     * @param {string} prop2
     * @returns {void}
     */


    function setObj(prop1, prop2) {
      parent = parent[parentIdx - 1][prop1];
      parentIdx = 0;

      if (prop2) {
        parent = parent[prop2];
      }
    }
    /**
     *
     * @param {Node} node
     * @param {object<{string: string}>} namespaces
     * @returns {void}
     */


    function parseDOM(node, namespaces) {
      // namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

      /*
      if ((node.prefix && node.prefix.includes(':')) || (node.localName && node.localName.includes(':'))) {
        invalidStateError('Prefix cannot have a colon');
      }
      */
      var type = 'nodeType' in node ? node.nodeType : null;
      namespaces = _objectSpread2({}, namespaces);
      var xmlChars = /^([\t\n\r -\uD7FF\uE000-\uFFFD]|(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF]))(?:(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))*$/; // eslint-disable-line no-control-regex

      if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
        invalidStateError('Node has bad XML character value');
      }

      var tmpParent, tmpParentIdx;
      /**
       * @returns {void}
       */

      function setTemp() {
        tmpParent = parent;
        tmpParentIdx = parentIdx;
      }
      /**
       * @returns {void}
       */


      function resetTemp() {
        parent = tmpParent;
        parentIdx = tmpParentIdx;
        parentIdx++; // Increment index in parent container of this element
      }

      switch (type) {
        case 1:
          {
            // ELEMENT
            setTemp();
            var nodeName = node.nodeName.toLowerCase(); // Todo: for XML, should not lower-case

            setChildren(); // Build child array since elements are, except at the top level, encapsulated in arrays

            set(nodeName);
            var start = {};
            var hasNamespaceDeclaration = false;

            if (namespaces[node.prefix || ''] !== node.namespaceURI) {
              namespaces[node.prefix || ''] = node.namespaceURI;

              if (node.prefix) {
                start['xmlns:' + node.prefix] = node.namespaceURI;
              } else if (node.namespaceURI) {
                start.xmlns = node.namespaceURI;
              } else {
                start.xmlns = null;
              }

              hasNamespaceDeclaration = true;
            }

            if (node.attributes.length) {
              set(_toConsumableArray(node.attributes).reduce(function (obj, att) {
                obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value

                return obj;
              }, start));
            } else if (hasNamespaceDeclaration) {
              set(start);
            }

            var childNodes = node.childNodes;

            if (childNodes.length) {
              setChildren(); // Element children array container

              _toConsumableArray(childNodes).forEach(function (childNode) {
                parseDOM(childNode, namespaces);
              });
            }

            resetTemp();
            break;
          }

        case undefined: // Treat as attribute node until this is fixed: https://github.com/jsdom/jsdom/issues/1641 / https://github.com/jsdom/jsdom/pull/1822

        case 2:
          // ATTRIBUTE (should only get here if passing in an attribute node)
          set({
            $attribute: [node.namespaceURI, node.name, node.value]
          });
          break;

        case 3:
          // TEXT
          if (stripWhitespace && /^[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+$/.test(node.nodeValue)) {
            set('');
            return;
          }

          set(node.nodeValue);
          break;

        case 4:
          // CDATA
          if (node.nodeValue.includes(']]' + '>')) {
            invalidStateError('CDATA cannot end with closing ]]>');
          }

          set(['![', node.nodeValue]);
          break;

        case 5:
          // ENTITY REFERENCE (though not in browsers (was already resolved
          //  anyways), ok to keep for parity with our "entity" shorthand)
          set(['&', node.nodeName]);
          break;

        case 7:
          // PROCESSING INSTRUCTION
          if (/^xml$/i.test(node.target)) {
            invalidStateError('Processing instructions cannot be "xml".');
          }

          if (node.target.includes('?>')) {
            invalidStateError('Processing instruction targets cannot include ?>');
          }

          if (node.target.includes(':')) {
            invalidStateError('The processing instruction target cannot include ":"');
          }

          if (node.data.includes('?>')) {
            invalidStateError('Processing instruction data cannot include ?>');
          }

          set(['?', node.target, node.data]); // Todo: Could give option to attempt to convert value back into object if has pseudo-attributes

          break;

        case 8:
          // COMMENT
          if (node.nodeValue.includes('--') || node.nodeValue.length && node.nodeValue.lastIndexOf('-') === node.nodeValue.length - 1) {
            invalidStateError('Comments cannot include --');
          }

          set(['!', node.nodeValue]);
          break;

        case 9:
          {
            // DOCUMENT
            setTemp();
            var docObj = {
              $document: {
                childNodes: []
              }
            };
            set(docObj); // doc.implementation.createHTMLDocument
            // Set position to fragment's array children

            setObj('$document', 'childNodes');
            var _childNodes = node.childNodes;

            if (!_childNodes.length) {
              invalidStateError('Documents must have a child node');
            } // set({$xmlDocument: []}); // doc.implementation.createDocument // Todo: use this conditionally


            _toConsumableArray(_childNodes).forEach(function (childNode) {
              // Can't just do documentElement as there may be doctype, comments, etc.
              // No need for setChildren, as we have already built the container array
              parseDOM(childNode, namespaces);
            });

            resetTemp();
            break;
          }

        case 10:
          {
            // DOCUMENT TYPE
            setTemp(); // Can create directly by doc.implementation.createDocumentType

            var _start = {
              $DOCTYPE: {
                name: node.name
              }
            };
            var pubIdChar = /^( |\r|\n|[0-9A-Za-z]|[!#-%'-\/:;=\?@_])*$/; // eslint-disable-line no-control-regex

            if (!pubIdChar.test(node.publicId)) {
              invalidStateError('A publicId must have valid characters.');
            }

            addExternalID(_start.$DOCTYPE, node); // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD

            set(_start); // Auto-generate the internalSubset instead?

            resetTemp();
            break;
          }

        case 11:
          {
            // DOCUMENT FRAGMENT
            setTemp();
            set({
              '#': []
            }); // Set position to fragment's array children

            setObj('#');
            var _childNodes2 = node.childNodes;

            _toConsumableArray(_childNodes2).forEach(function (childNode) {
              // No need for setChildren, as we have already built the container array
              parseDOM(childNode, namespaces);
            });

            resetTemp();
            break;
          }

        default:
          throw new TypeError('Not an XML type');
      }
    }

    parseDOM(dom, {});

    if (stringOutput) {
      return JSON.stringify(ret[0]);
    }

    return ret[0];
  };

  jml.toJMLString = function (dom, config) {
    return jml.toJML(dom, Object.assign(config || {}, {
      stringOutput: true
    }));
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {JamilihReturn}
   */


  jml.toDOM = function () {
    // Alias for jml()
    return jml.apply(void 0, arguments);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toHTML = function () {
    // Todo: Replace this with version of jml() that directly builds a string
    var ret = jml.apply(void 0, arguments); // Todo: deal with serialization of properties like 'selected',
    //  'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*',
    //  'style'! (i.e., need to build a string ourselves)

    return ret.outerHTML;
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toDOMString = function () {
    // Alias for jml.toHTML for parity with jml.toJMLString
    return jml.toHTML.apply(jml, arguments);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toXML = function () {
    var ret = jml.apply(void 0, arguments);
    return new win.XMLSerializer().serializeToString(ret);
  };
  /**
   *
   * @param {...JamilihArray} args
   * @returns {string}
   */


  jml.toXMLDOMString = function () {
    // Alias for jml.toXML for parity with jml.toJMLString
    return jml.toXML.apply(jml, arguments);
  };
  /**
   * Element-aware wrapper for `Map`.
   */


  var JamilihMap =
  /*#__PURE__*/
  function (_Map) {
    _inherits(JamilihMap, _Map);

    function JamilihMap() {
      _classCallCheck(this, JamilihMap);

      return _possibleConstructorReturn(this, _getPrototypeOf(JamilihMap).apply(this, arguments));
    }

    _createClass(JamilihMap, [{
      key: "get",

      /**
       * @param {string|Element} elem
       * @returns {any}
       */
      value: function get(elem) {
        elem = typeof elem === 'string' ? $$1(elem) : elem;
        return _get(_getPrototypeOf(JamilihMap.prototype), "get", this).call(this, elem);
      }
      /**
       * @param {string|Element} elem
       * @param {any} value
       * @returns {any}
       */

    }, {
      key: "set",
      value: function set(elem, value) {
        elem = typeof elem === 'string' ? $$1(elem) : elem;
        return _get(_getPrototypeOf(JamilihMap.prototype), "set", this).call(this, elem, value);
      }
      /**
       * @param {string|Element} elem
       * @param {string} methodName
       * @param {...any} args
       * @returns {any}
       */

    }, {
      key: "invoke",
      value: function invoke(elem, methodName) {
        var _this$get;

        elem = typeof elem === 'string' ? $$1(elem) : elem;

        for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        return (_this$get = this.get(elem))[methodName].apply(_this$get, [elem].concat(args));
      }
    }]);

    return JamilihMap;
  }(_wrapNativeSuper(Map));
  /**
   * Element-aware wrapper for `WeakMap`.
   */


  var JamilihWeakMap =
  /*#__PURE__*/
  function (_WeakMap) {
    _inherits(JamilihWeakMap, _WeakMap);

    function JamilihWeakMap() {
      _classCallCheck(this, JamilihWeakMap);

      return _possibleConstructorReturn(this, _getPrototypeOf(JamilihWeakMap).apply(this, arguments));
    }

    _createClass(JamilihWeakMap, [{
      key: "get",

      /**
       * @param {string|Element} elem
       * @returns {any}
       */
      value: function get(elem) {
        elem = typeof elem === 'string' ? $$1(elem) : elem;
        return _get(_getPrototypeOf(JamilihWeakMap.prototype), "get", this).call(this, elem);
      }
      /**
       * @param {string|Element} elem
       * @param {any} value
       * @returns {any}
       */

    }, {
      key: "set",
      value: function set(elem, value) {
        elem = typeof elem === 'string' ? $$1(elem) : elem;
        return _get(_getPrototypeOf(JamilihWeakMap.prototype), "set", this).call(this, elem, value);
      }
      /**
       * @param {string|Element} elem
       * @param {string} methodName
       * @param {...any} args
       * @returns {any}
       */

    }, {
      key: "invoke",
      value: function invoke(elem, methodName) {
        var _this$get2;

        elem = typeof elem === 'string' ? $$1(elem) : elem;

        for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          args[_key3 - 2] = arguments[_key3];
        }

        return (_this$get2 = this.get(elem))[methodName].apply(_this$get2, [elem].concat(args));
      }
    }]);

    return JamilihWeakMap;
  }(_wrapNativeSuper(WeakMap));

  jml.Map = JamilihMap;
  jml.WeakMap = JamilihWeakMap;
  /**
  * @typedef {GenericArray} MapAndElementArray
  * @property {JamilihWeakMap|JamilihMap} 0
  * @property {Element} 1
  */

  /**
   * @param {GenericObject} obj
   * @param {...JamilihArray} args
   * @returns {MapAndElementArray}
   */

  jml.weak = function (obj) {
    var map = new JamilihWeakMap();

    for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];
    }

    var elem = jml.apply(void 0, [{
      $map: [map, obj]
    }].concat(args));
    return [map, elem];
  };
  /**
   * @param {any} obj
   * @param {...JamilihArray} args
   * @returns {MapAndElementArray}
   */


  jml.strong = function (obj) {
    var map = new JamilihMap();

    for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      args[_key5 - 1] = arguments[_key5];
    }

    var elem = jml.apply(void 0, [{
      $map: [map, obj]
    }].concat(args));
    return [map, elem];
  };
  /**
   * @param {string|Element} elem If a string, will be interpreted as a selector
   * @param {symbol|string} sym If a string, will be used with `Symbol.for`
   * @returns {any} The value associated with the symbol
   */


  jml.symbol = jml.sym = jml["for"] = function (elem, sym) {
    elem = typeof elem === 'string' ? $$1(elem) : elem;
    return elem[_typeof(sym) === 'symbol' ? sym : Symbol["for"](sym)];
  };
  /**
   * @param {string|Element} elem If a string, will be interpreted as a selector
   * @param {symbol|string|Map|WeakMap} symOrMap If a string, will be used with `Symbol.for`
   * @param {string|any} methodName Can be `any` if the symbol or map directly
   *   points to a function (it is then used as the first argument).
   * @param {any[]} args
   * @returns {any}
   */


  jml.command = function (elem, symOrMap, methodName) {
    var _func3;

    elem = typeof elem === 'string' ? $$1(elem) : elem;
    var func;

    for (var _len6 = arguments.length, args = new Array(_len6 > 3 ? _len6 - 3 : 0), _key6 = 3; _key6 < _len6; _key6++) {
      args[_key6 - 3] = arguments[_key6];
    }

    if (['symbol', 'string'].includes(_typeof(symOrMap))) {
      var _func;

      func = jml.sym(elem, symOrMap);

      if (typeof func === 'function') {
        return func.apply(void 0, [methodName].concat(args)); // Already has `this` bound to `elem`
      }

      return (_func = func)[methodName].apply(_func, args);
    }

    func = symOrMap.get(elem);

    if (typeof func === 'function') {
      var _func2;

      return (_func2 = func).call.apply(_func2, [elem, methodName].concat(args));
    }

    return (_func3 = func)[methodName].apply(_func3, [elem].concat(args)); // return func[methodName].call(elem, ...args);
  };
  /**
   * Expects properties `document`, `XMLSerializer`, and `DOMParser`.
   * Also updates `body` with `document.body`.
   * @param {Window} wind
   * @returns {void}
   */


  jml.setWindow = function (wind) {
    win = wind;
    doc = win.document;

    if (doc && doc.body) {
      var _doc = doc;
      body = _doc.body;
    }
  };
  /**
   * @returns {Window}
   */


  jml.getWindow = function () {
    return win;
  };


  var body = doc && doc.body; // eslint-disable-line import/no-mutable-exports

  var nbsp = "\xA0"; // Very commonly needed in templates

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
  * @class
  * @param {PlainObject} cfg Configuration object
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
  class ExpandableInputs {
    constructor (cfg) {
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
      this.localeStrings = {
        ...defaultLocaleStrings.en,
        ...defaultLocaleStrings[cfg.locale],
        ...cfg.localeStrings
      };

      // State variables
      this.fileType = 'inputType' in cfg && cfg.inputType === 'file';
      this.resetCount();
    }

    resetCount () {
      this.id = 1;
      this.num = 1;
    }

    getLabel (num) {
      return this.label.replace(this.pattern, num);
    }

    getPrefixedNamespace () {
      return this.prefix + this.ns;
    }

    remove (id) {
      const prefixedNS = this.getPrefixedNamespace(),
        rowIDSel = '#' + prefixedNS + 'row-' + id;
      if ($$('.' + prefixedNS + 'row').length === 1) { // Don't delete if only one remaining
        return true;
      }
      $$1(rowIDSel).remove();
      // Renumber to ensure inputs remain incrementing by one
      this.num = 1;
      $$('.' + prefixedNS + 'number').forEach((numHolder) => {
        numHolder.firstChild.replaceWith(
          this.getLabel(this.num++)
        );
      });
      return false;
    }
    addTableEvent () {
      const that = this;
      $$1('#' + this.table).addEventListener('click', function (e) {
        const {dataset} = e.target;
        if (!dataset || !dataset.ei_type) {
          return;
        }
        switch (dataset.ei_type) {
        default:
          throw new TypeError('Unexpected type');
        case 'remove': {
          const noneToRemove = that.remove(dataset.ei_id);

          // Allow DOM listening for removal
          if (!noneToRemove) {
            const e = new Event('change', {
              bubbles: true,
              cancelable: true
            });
            $$1('#' + that.table).dispatchEvent(e);
          }

          break;
        } case 'add':
          that.add();
          break;
        }
      });
    }

    getValues (type) {
      const selector = '.' + this.getPrefixedNamespace() + type;
      return $$(selector).map(({type, checked, value}) => {
        return type === 'checkbox' ? checked : value;
      });
    }
    getTextValues () {
      return this.getValues('input');
    }

    setValues (type, storage) {
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
    }

    setTextValues (storage) {
      return this.setValues('input', storage);
    }

    add () {
      const prefixedNS = this.getPrefixedNamespace();
      if (!this.tableEventAdded) {
        this.addTableEvent();
        this.tableEventAdded = true;
      }
      $$1('#' + this.table).append(jml(
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
                  const select = $$1('.' + prefixedNS + 'presets').cloneNode(true);
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
            [({}.hasOwnProperty.call(this, 'rows') ? 'textarea' : 'input'), (() => {
              const atts = {
                id: prefixedNS + 'input-' + this.id,
                class: prefixedNS + 'input ' + prefixedNS + 'path'
              };
              if ({}.hasOwnProperty.call(this, 'rows')) { // textarea
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
            //    reveal button, etc. has functionality, and
            //    ensure only those desired are added
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
    }
  }

  /* eslint-env webextensions */

  let {getNodeJSON} = browser.extension.getBackgroundPage();

  function execFile (aFile, args = [], options = undefined) {
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
        //      is dynamic based on selection?
        executablePath,
        // Todo: handle hard-coded `dirs`;
        //   ability to invoke with link to or contents of a sequence of
        //   hand-typed (auto-complete drop-down) local files and/or URLs
        //   (including option to encode, etc.)
        // Todo: If `dirs` shows something is a directory, confirm the
        //     supplied path is also (no UI enforcement on this currently)
        args
      );
      console.log('resultExec', result);
      return result;
    } catch (err) {
      console.log('Exec Erred:', err, err.toString(), executablePath, args);
      return undefined;
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
      //    use within `eval()`)
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
      //  or `eval` with variables replaced using
      //  https://github.com/brettz9/js-string-escape
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
        }
        const urlNum = n1.match(/^url(\d+)$/);
        if (urlNum) {
          return escapeValue(urls[parseInt(urlNum[1]) - 1]);
        }
        const fileNum = n1.match(/^file(\d+)$/);
        if (fileNum) {
          return escapeValue(files[parseInt(fileNum[1]) - 1]);
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
          //  the location and "overwrite" is "no" or "prompt"
          //  with a resulting "no" answer by the user.
          //  Can be followed by %N where "N" is the number of
          //   the directory argument below
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
            //  `messages.json` `prefix_save_temp` text)
          }
          // Other args here

          // Todo: Ensure substitutions take place within `eval()` first
          // Todo: Ensure escaping occurs in proper order
          // `ucencode` needs `encodeURIComponent` applied
          // For `linkPageURLAsNativePath`, convert to native path
          // Allow `eval()`
          // Todo: Implement `save_temp` and all arguments
          // Retrieve "linkPageTitle", "linkBodyText", or "linkPageHTML"
          //  as needed and cache
          // Retrieve "imageDataBinary" and "imageDataURL" (available
          //  via canvas?) as needed (available from cache?)
          // Move ones found to be used here to the top of the
          //  list/mark in red/asterisked
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
    //    resolved value is the command line output
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

  const $$2 = (sel) => document.querySelector(sel);

  const $e = (el, descendentsSel) => {
    el = typeof el === 'string' ? $$2(el) : el;
    return el.querySelector(descendentsSel);
  };

  // nb. This is for IE10 and lower _only_.
  var supportCustomEvent = window.CustomEvent;
  if (!supportCustomEvent || typeof supportCustomEvent === 'object') {
    supportCustomEvent = function CustomEvent(event, x) {
      x = x || {};
      var ev = document.createEvent('CustomEvent');
      ev.initCustomEvent(event, !!x.bubbles, !!x.cancelable, x.detail || null);
      return ev;
    };
    supportCustomEvent.prototype = window.Event.prototype;
  }

  /**
   * @param {Element} el to check for stacking context
   * @return {boolean} whether this el or its parents creates a stacking context
   */
  function createsStackingContext(el) {
    while (el && el !== document.body) {
      var s = window.getComputedStyle(el);
      var invalid = function(k, ok) {
        return !(s[k] === undefined || s[k] === ok);
      };
      
      if (s.opacity < 1 ||
          invalid('zIndex', 'auto') ||
          invalid('transform', 'none') ||
          invalid('mixBlendMode', 'normal') ||
          invalid('filter', 'none') ||
          invalid('perspective', 'none') ||
          s['isolation'] === 'isolate' ||
          s.position === 'fixed' ||
          s.webkitOverflowScrolling === 'touch') {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  /**
   * Finds the nearest <dialog> from the passed element.
   *
   * @param {Element} el to search from
   * @return {HTMLDialogElement} dialog found
   */
  function findNearestDialog(el) {
    while (el) {
      if (el.localName === 'dialog') {
        return /** @type {HTMLDialogElement} */ (el);
      }
      el = el.parentElement;
    }
    return null;
  }

  /**
   * Blur the specified element, as long as it's not the HTML body element.
   * This works around an IE9/10 bug - blurring the body causes Windows to
   * blur the whole application.
   *
   * @param {Element} el to blur
   */
  function safeBlur(el) {
    if (el && el.blur && el !== document.body) {
      el.blur();
    }
  }

  /**
   * @param {!NodeList} nodeList to search
   * @param {Node} node to find
   * @return {boolean} whether node is inside nodeList
   */
  function inNodeList(nodeList, node) {
    for (var i = 0; i < nodeList.length; ++i) {
      if (nodeList[i] === node) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {HTMLFormElement} el to check
   * @return {boolean} whether this form has method="dialog"
   */
  function isFormMethodDialog(el) {
    if (!el || !el.hasAttribute('method')) {
      return false;
    }
    return el.getAttribute('method').toLowerCase() === 'dialog';
  }

  /**
   * @param {!HTMLDialogElement} dialog to upgrade
   * @constructor
   */
  function dialogPolyfillInfo(dialog) {
    this.dialog_ = dialog;
    this.replacedStyleTop_ = false;
    this.openAsModal_ = false;

    // Set a11y role. Browsers that support dialog implicitly know this already.
    if (!dialog.hasAttribute('role')) {
      dialog.setAttribute('role', 'dialog');
    }

    dialog.show = this.show.bind(this);
    dialog.showModal = this.showModal.bind(this);
    dialog.close = this.close.bind(this);

    if (!('returnValue' in dialog)) {
      dialog.returnValue = '';
    }

    if ('MutationObserver' in window) {
      var mo = new MutationObserver(this.maybeHideModal.bind(this));
      mo.observe(dialog, {attributes: true, attributeFilter: ['open']});
    } else {
      // IE10 and below support. Note that DOMNodeRemoved etc fire _before_ removal. They also
      // seem to fire even if the element was removed as part of a parent removal. Use the removed
      // events to force downgrade (useful if removed/immediately added).
      var removed = false;
      var cb = function() {
        removed ? this.downgradeModal() : this.maybeHideModal();
        removed = false;
      }.bind(this);
      var timeout;
      var delayModel = function(ev) {
        if (ev.target !== dialog) { return; }  // not for a child element
        var cand = 'DOMNodeRemoved';
        removed |= (ev.type.substr(0, cand.length) === cand);
        window.clearTimeout(timeout);
        timeout = window.setTimeout(cb, 0);
      };
      ['DOMAttrModified', 'DOMNodeRemoved', 'DOMNodeRemovedFromDocument'].forEach(function(name) {
        dialog.addEventListener(name, delayModel);
      });
    }
    // Note that the DOM is observed inside DialogManager while any dialog
    // is being displayed as a modal, to catch modal removal from the DOM.

    Object.defineProperty(dialog, 'open', {
      set: this.setOpen.bind(this),
      get: dialog.hasAttribute.bind(dialog, 'open')
    });

    this.backdrop_ = document.createElement('div');
    this.backdrop_.className = 'backdrop';
    this.backdrop_.addEventListener('click', this.backdropClick_.bind(this));
  }

  dialogPolyfillInfo.prototype = {

    get dialog() {
      return this.dialog_;
    },

    /**
     * Maybe remove this dialog from the modal top layer. This is called when
     * a modal dialog may no longer be tenable, e.g., when the dialog is no
     * longer open or is no longer part of the DOM.
     */
    maybeHideModal: function() {
      if (this.dialog_.hasAttribute('open') && document.body.contains(this.dialog_)) { return; }
      this.downgradeModal();
    },

    /**
     * Remove this dialog from the modal top layer, leaving it as a non-modal.
     */
    downgradeModal: function() {
      if (!this.openAsModal_) { return; }
      this.openAsModal_ = false;
      this.dialog_.style.zIndex = '';

      // This won't match the native <dialog> exactly because if the user set top on a centered
      // polyfill dialog, that top gets thrown away when the dialog is closed. Not sure it's
      // possible to polyfill this perfectly.
      if (this.replacedStyleTop_) {
        this.dialog_.style.top = '';
        this.replacedStyleTop_ = false;
      }

      // Clear the backdrop and remove from the manager.
      this.backdrop_.parentNode && this.backdrop_.parentNode.removeChild(this.backdrop_);
      dialogPolyfill.dm.removeDialog(this);
    },

    /**
     * @param {boolean} value whether to open or close this dialog
     */
    setOpen: function(value) {
      if (value) {
        this.dialog_.hasAttribute('open') || this.dialog_.setAttribute('open', '');
      } else {
        this.dialog_.removeAttribute('open');
        this.maybeHideModal();  // nb. redundant with MutationObserver
      }
    },

    /**
     * Handles clicks on the fake .backdrop element, redirecting them as if
     * they were on the dialog itself.
     *
     * @param {!Event} e to redirect
     */
    backdropClick_: function(e) {
      if (!this.dialog_.hasAttribute('tabindex')) {
        // Clicking on the backdrop should move the implicit cursor, even if dialog cannot be
        // focused. Create a fake thing to focus on. If the backdrop was _before_ the dialog, this
        // would not be needed - clicks would move the implicit cursor there.
        var fake = document.createElement('div');
        this.dialog_.insertBefore(fake, this.dialog_.firstChild);
        fake.tabIndex = -1;
        fake.focus();
        this.dialog_.removeChild(fake);
      } else {
        this.dialog_.focus();
      }

      var redirectedEvent = document.createEvent('MouseEvents');
      redirectedEvent.initMouseEvent(e.type, e.bubbles, e.cancelable, window,
          e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey,
          e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
      this.dialog_.dispatchEvent(redirectedEvent);
      e.stopPropagation();
    },

    /**
     * Focuses on the first focusable element within the dialog. This will always blur the current
     * focus, even if nothing within the dialog is found.
     */
    focus_: function() {
      // Find element with `autofocus` attribute, or fall back to the first form/tabindex control.
      var target = this.dialog_.querySelector('[autofocus]:not([disabled])');
      if (!target && this.dialog_.tabIndex >= 0) {
        target = this.dialog_;
      }
      if (!target) {
        // Note that this is 'any focusable area'. This list is probably not exhaustive, but the
        // alternative involves stepping through and trying to focus everything.
        var opts = ['button', 'input', 'keygen', 'select', 'textarea'];
        var query = opts.map(function(el) {
          return el + ':not([disabled])';
        });
        // TODO(samthor): tabindex values that are not numeric are not focusable.
        query.push('[tabindex]:not([disabled]):not([tabindex=""])');  // tabindex != "", not disabled
        target = this.dialog_.querySelector(query.join(', '));
      }
      safeBlur(document.activeElement);
      target && target.focus();
    },

    /**
     * Sets the zIndex for the backdrop and dialog.
     *
     * @param {number} dialogZ
     * @param {number} backdropZ
     */
    updateZIndex: function(dialogZ, backdropZ) {
      if (dialogZ < backdropZ) {
        throw new Error('dialogZ should never be < backdropZ');
      }
      this.dialog_.style.zIndex = dialogZ;
      this.backdrop_.style.zIndex = backdropZ;
    },

    /**
     * Shows the dialog. If the dialog is already open, this does nothing.
     */
    show: function() {
      if (!this.dialog_.open) {
        this.setOpen(true);
        this.focus_();
      }
    },

    /**
     * Show this dialog modally.
     */
    showModal: function() {
      if (this.dialog_.hasAttribute('open')) {
        throw new Error('Failed to execute \'showModal\' on dialog: The element is already open, and therefore cannot be opened modally.');
      }
      if (!document.body.contains(this.dialog_)) {
        throw new Error('Failed to execute \'showModal\' on dialog: The element is not in a Document.');
      }
      if (!dialogPolyfill.dm.pushDialog(this)) {
        throw new Error('Failed to execute \'showModal\' on dialog: There are too many open modal dialogs.');
      }

      if (createsStackingContext(this.dialog_.parentElement)) {
        console.warn('A dialog is being shown inside a stacking context. ' +
            'This may cause it to be unusable. For more information, see this link: ' +
            'https://github.com/GoogleChrome/dialog-polyfill/#stacking-context');
      }

      this.setOpen(true);
      this.openAsModal_ = true;

      // Optionally center vertically, relative to the current viewport.
      if (dialogPolyfill.needsCentering(this.dialog_)) {
        dialogPolyfill.reposition(this.dialog_);
        this.replacedStyleTop_ = true;
      } else {
        this.replacedStyleTop_ = false;
      }

      // Insert backdrop.
      this.dialog_.parentNode.insertBefore(this.backdrop_, this.dialog_.nextSibling);

      // Focus on whatever inside the dialog.
      this.focus_();
    },

    /**
     * Closes this HTMLDialogElement. This is optional vs clearing the open
     * attribute, however this fires a 'close' event.
     *
     * @param {string=} opt_returnValue to use as the returnValue
     */
    close: function(opt_returnValue) {
      if (!this.dialog_.hasAttribute('open')) {
        throw new Error('Failed to execute \'close\' on dialog: The element does not have an \'open\' attribute, and therefore cannot be closed.');
      }
      this.setOpen(false);

      // Leave returnValue untouched in case it was set directly on the element
      if (opt_returnValue !== undefined) {
        this.dialog_.returnValue = opt_returnValue;
      }

      // Triggering "close" event for any attached listeners on the <dialog>.
      var closeEvent = new supportCustomEvent('close', {
        bubbles: false,
        cancelable: false
      });
      this.dialog_.dispatchEvent(closeEvent);
    }

  };

  var dialogPolyfill = {};

  dialogPolyfill.reposition = function(element) {
    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    var topValue = scrollTop + (window.innerHeight - element.offsetHeight) / 2;
    element.style.top = Math.max(scrollTop, topValue) + 'px';
  };

  dialogPolyfill.isInlinePositionSetByStylesheet = function(element) {
    for (var i = 0; i < document.styleSheets.length; ++i) {
      var styleSheet = document.styleSheets[i];
      var cssRules = null;
      // Some browsers throw on cssRules.
      try {
        cssRules = styleSheet.cssRules;
      } catch (e) {}
      if (!cssRules) { continue; }
      for (var j = 0; j < cssRules.length; ++j) {
        var rule = cssRules[j];
        var selectedNodes = null;
        // Ignore errors on invalid selector texts.
        try {
          selectedNodes = document.querySelectorAll(rule.selectorText);
        } catch(e) {}
        if (!selectedNodes || !inNodeList(selectedNodes, element)) {
          continue;
        }
        var cssTop = rule.style.getPropertyValue('top');
        var cssBottom = rule.style.getPropertyValue('bottom');
        if ((cssTop && cssTop !== 'auto') || (cssBottom && cssBottom !== 'auto')) {
          return true;
        }
      }
    }
    return false;
  };

  dialogPolyfill.needsCentering = function(dialog) {
    var computedStyle = window.getComputedStyle(dialog);
    if (computedStyle.position !== 'absolute') {
      return false;
    }

    // We must determine whether the top/bottom specified value is non-auto.  In
    // WebKit/Blink, checking computedStyle.top == 'auto' is sufficient, but
    // Firefox returns the used value. So we do this crazy thing instead: check
    // the inline style and then go through CSS rules.
    if ((dialog.style.top !== 'auto' && dialog.style.top !== '') ||
        (dialog.style.bottom !== 'auto' && dialog.style.bottom !== '')) {
      return false;
    }
    return !dialogPolyfill.isInlinePositionSetByStylesheet(dialog);
  };

  /**
   * @param {!Element} element to force upgrade
   */
  dialogPolyfill.forceRegisterDialog = function(element) {
    if (window.HTMLDialogElement || element.showModal) {
      console.warn('This browser already supports <dialog>, the polyfill ' +
          'may not work correctly', element);
    }
    if (element.localName !== 'dialog') {
      throw new Error('Failed to register dialog: The element is not a dialog.');
    }
    new dialogPolyfillInfo(/** @type {!HTMLDialogElement} */ (element));
  };

  /**
   * @param {!Element} element to upgrade, if necessary
   */
  dialogPolyfill.registerDialog = function(element) {
    if (!element.showModal) {
      dialogPolyfill.forceRegisterDialog(element);
    }
  };

  /**
   * @constructor
   */
  dialogPolyfill.DialogManager = function() {
    /** @type {!Array<!dialogPolyfillInfo>} */
    this.pendingDialogStack = [];

    var checkDOM = this.checkDOM_.bind(this);

    // The overlay is used to simulate how a modal dialog blocks the document.
    // The blocking dialog is positioned on top of the overlay, and the rest of
    // the dialogs on the pending dialog stack are positioned below it. In the
    // actual implementation, the modal dialog stacking is controlled by the
    // top layer, where z-index has no effect.
    this.overlay = document.createElement('div');
    this.overlay.className = '_dialog_overlay';
    this.overlay.addEventListener('click', function(e) {
      this.forwardTab_ = undefined;
      e.stopPropagation();
      checkDOM([]);  // sanity-check DOM
    }.bind(this));

    this.handleKey_ = this.handleKey_.bind(this);
    this.handleFocus_ = this.handleFocus_.bind(this);

    this.zIndexLow_ = 100000;
    this.zIndexHigh_ = 100000 + 150;

    this.forwardTab_ = undefined;

    if ('MutationObserver' in window) {
      this.mo_ = new MutationObserver(function(records) {
        var removed = [];
        records.forEach(function(rec) {
          for (var i = 0, c; c = rec.removedNodes[i]; ++i) {
            if (!(c instanceof Element)) {
              continue;
            } else if (c.localName === 'dialog') {
              removed.push(c);
            }
            removed = removed.concat(c.querySelectorAll('dialog'));
          }
        });
        removed.length && checkDOM(removed);
      });
    }
  };

  /**
   * Called on the first modal dialog being shown. Adds the overlay and related
   * handlers.
   */
  dialogPolyfill.DialogManager.prototype.blockDocument = function() {
    document.documentElement.addEventListener('focus', this.handleFocus_, true);
    document.addEventListener('keydown', this.handleKey_);
    this.mo_ && this.mo_.observe(document, {childList: true, subtree: true});
  };

  /**
   * Called on the first modal dialog being removed, i.e., when no more modal
   * dialogs are visible.
   */
  dialogPolyfill.DialogManager.prototype.unblockDocument = function() {
    document.documentElement.removeEventListener('focus', this.handleFocus_, true);
    document.removeEventListener('keydown', this.handleKey_);
    this.mo_ && this.mo_.disconnect();
  };

  /**
   * Updates the stacking of all known dialogs.
   */
  dialogPolyfill.DialogManager.prototype.updateStacking = function() {
    var zIndex = this.zIndexHigh_;

    for (var i = 0, dpi; dpi = this.pendingDialogStack[i]; ++i) {
      dpi.updateZIndex(--zIndex, --zIndex);
      if (i === 0) {
        this.overlay.style.zIndex = --zIndex;
      }
    }

    // Make the overlay a sibling of the dialog itself.
    var last = this.pendingDialogStack[0];
    if (last) {
      var p = last.dialog.parentNode || document.body;
      p.appendChild(this.overlay);
    } else if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  };

  /**
   * @param {Element} candidate to check if contained or is the top-most modal dialog
   * @return {boolean} whether candidate is contained in top dialog
   */
  dialogPolyfill.DialogManager.prototype.containedByTopDialog_ = function(candidate) {
    while (candidate = findNearestDialog(candidate)) {
      for (var i = 0, dpi; dpi = this.pendingDialogStack[i]; ++i) {
        if (dpi.dialog === candidate) {
          return i === 0;  // only valid if top-most
        }
      }
      candidate = candidate.parentElement;
    }
    return false;
  };

  dialogPolyfill.DialogManager.prototype.handleFocus_ = function(event) {
    if (this.containedByTopDialog_(event.target)) { return; }

    if (document.activeElement === document.documentElement) { return; }

    event.preventDefault();
    event.stopPropagation();
    safeBlur(/** @type {Element} */ (event.target));

    if (this.forwardTab_ === undefined) { return; }  // move focus only from a tab key

    var dpi = this.pendingDialogStack[0];
    var dialog = dpi.dialog;
    var position = dialog.compareDocumentPosition(event.target);
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      if (this.forwardTab_) {
        // forward
        dpi.focus_();
      } else if (event.target !== document.documentElement) {
        // backwards if we're not already focused on <html>
        document.documentElement.focus();
      }
    }

    return false;
  };

  dialogPolyfill.DialogManager.prototype.handleKey_ = function(event) {
    this.forwardTab_ = undefined;
    if (event.keyCode === 27) {
      event.preventDefault();
      event.stopPropagation();
      var cancelEvent = new supportCustomEvent('cancel', {
        bubbles: false,
        cancelable: true
      });
      var dpi = this.pendingDialogStack[0];
      if (dpi && dpi.dialog.dispatchEvent(cancelEvent)) {
        dpi.dialog.close();
      }
    } else if (event.keyCode === 9) {
      this.forwardTab_ = !event.shiftKey;
    }
  };

  /**
   * Finds and downgrades any known modal dialogs that are no longer displayed. Dialogs that are
   * removed and immediately readded don't stay modal, they become normal.
   *
   * @param {!Array<!HTMLDialogElement>} removed that have definitely been removed
   */
  dialogPolyfill.DialogManager.prototype.checkDOM_ = function(removed) {
    // This operates on a clone because it may cause it to change. Each change also calls
    // updateStacking, which only actually needs to happen once. But who removes many modal dialogs
    // at a time?!
    var clone = this.pendingDialogStack.slice();
    clone.forEach(function(dpi) {
      if (removed.indexOf(dpi.dialog) !== -1) {
        dpi.downgradeModal();
      } else {
        dpi.maybeHideModal();
      }
    });
  };

  /**
   * @param {!dialogPolyfillInfo} dpi
   * @return {boolean} whether the dialog was allowed
   */
  dialogPolyfill.DialogManager.prototype.pushDialog = function(dpi) {
    var allowed = (this.zIndexHigh_ - this.zIndexLow_) / 2 - 1;
    if (this.pendingDialogStack.length >= allowed) {
      return false;
    }
    if (this.pendingDialogStack.unshift(dpi) === 1) {
      this.blockDocument();
    }
    this.updateStacking();
    return true;
  };

  /**
   * @param {!dialogPolyfillInfo} dpi
   */
  dialogPolyfill.DialogManager.prototype.removeDialog = function(dpi) {
    var index = this.pendingDialogStack.indexOf(dpi);
    if (index === -1) { return; }

    this.pendingDialogStack.splice(index, 1);
    if (this.pendingDialogStack.length === 0) {
      this.unblockDocument();
    }
    this.updateStacking();
  };

  dialogPolyfill.dm = new dialogPolyfill.DialogManager();
  dialogPolyfill.formSubmitter = null;
  dialogPolyfill.useValue = null;

  /**
   * Installs global handlers, such as click listers and native method overrides. These are needed
   * even if a no dialog is registered, as they deal with <form method="dialog">.
   */
  if (window.HTMLDialogElement === undefined) {

    /**
     * If HTMLFormElement translates method="DIALOG" into 'get', then replace the descriptor with
     * one that returns the correct value.
     */
    var testForm = document.createElement('form');
    testForm.setAttribute('method', 'dialog');
    if (testForm.method !== 'dialog') {
      var methodDescriptor = Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, 'method');
      if (methodDescriptor) {
        // nb. Some older iOS and older PhantomJS fail to return the descriptor. Don't do anything
        // and don't bother to update the element.
        var realGet = methodDescriptor.get;
        methodDescriptor.get = function() {
          if (isFormMethodDialog(this)) {
            return 'dialog';
          }
          return realGet.call(this);
        };
        var realSet = methodDescriptor.set;
        methodDescriptor.set = function(v) {
          if (typeof v === 'string' && v.toLowerCase() === 'dialog') {
            return this.setAttribute('method', v);
          }
          return realSet.call(this, v);
        };
        Object.defineProperty(HTMLFormElement.prototype, 'method', methodDescriptor);
      }
    }

    /**
     * Global 'click' handler, to capture the <input type="submit"> or <button> element which has
     * submitted a <form method="dialog">. Needed as Safari and others don't report this inside
     * document.activeElement.
     */
    document.addEventListener('click', function(ev) {
      dialogPolyfill.formSubmitter = null;
      dialogPolyfill.useValue = null;
      if (ev.defaultPrevented) { return; }  // e.g. a submit which prevents default submission

      var target = /** @type {Element} */ (ev.target);
      if (!target || !isFormMethodDialog(target.form)) { return; }

      var valid = (target.type === 'submit' && ['button', 'input'].indexOf(target.localName) > -1);
      if (!valid) {
        if (!(target.localName === 'input' && target.type === 'image')) { return; }
        // this is a <input type="image">, which can submit forms
        dialogPolyfill.useValue = ev.offsetX + ',' + ev.offsetY;
      }

      var dialog = findNearestDialog(target);
      if (!dialog) { return; }

      dialogPolyfill.formSubmitter = target;

    }, false);

    /**
     * Replace the native HTMLFormElement.submit() method, as it won't fire the
     * submit event and give us a chance to respond.
     */
    var nativeFormSubmit = HTMLFormElement.prototype.submit;
    var replacementFormSubmit = function () {
      if (!isFormMethodDialog(this)) {
        return nativeFormSubmit.call(this);
      }
      var dialog = findNearestDialog(this);
      dialog && dialog.close();
    };
    HTMLFormElement.prototype.submit = replacementFormSubmit;

    /**
     * Global form 'dialog' method handler. Closes a dialog correctly on submit
     * and possibly sets its return value.
     */
    document.addEventListener('submit', function(ev) {
      var form = /** @type {HTMLFormElement} */ (ev.target);
      if (!isFormMethodDialog(form)) { return; }
      ev.preventDefault();

      var dialog = findNearestDialog(form);
      if (!dialog) { return; }

      // Forms can only be submitted via .submit() or a click (?), but anyway: sanity-check that
      // the submitter is correct before using its value as .returnValue.
      var s = dialogPolyfill.formSubmitter;
      if (s && s.form === form) {
        dialog.close(dialogPolyfill.useValue || s.value);
      } else {
        dialog.close();
      }
      dialogPolyfill.formSubmitter = null;

    }, true);
  }

  // Todo: Make as own module dependency

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
      this.localeStrings = {
        ...localeStrings[defaultLocale],
        ...localeStrings[locale],
        ...localeObject
      };
    }
    // eslint-disable-next-line class-methods-use-this
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
  }
  async function getExePaths () {
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
    initPromise = Promise.all([
      /*, profiles */
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
  //  (RETURN ALL MODIFICATIONS THERE)
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
  //       maybe this? https://github.com/Joker-Jelly/nfb
  //       or perhaps more simply, use `filepicker` in `dialog-node`?
  function picker ({dirPath, selectFolder, defaultExtension, filterMap = [], locale, localeStrings}) {
    localeStrings = Object.assign(
      {},
      defaultLocaleStrings$1.en,
      defaultLocaleStrings$1[locale],
      localeStrings
    );
    // Note: could use https://developer.mozilla.org/en-US/docs/Extensions/Using_the_DOM_File_API_in_chrome_code
    //     but this appears to be less feature rich
    const Cc = 0, Ci = 0, file = 0;
    const windowMediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator),
      {nsIFilePicker} = Ci,
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

    // eslint-disable-next-line promise/avoid-new
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

  function _slicedToArray$1(arr, i) {
    return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _nonIterableRest$1();
  }

  function _arrayWithHoles$1(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit$1(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

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
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest$1() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function loadStylesheets(stylesheets) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        beforeDefault = _ref.before,
        afterDefault = _ref.after,
        faviconDefault = _ref.favicon,
        canvasDefault = _ref.canvas,
        _ref$image = _ref.image,
        imageDefault = _ref$image === void 0 ? true : _ref$image,
        acceptErrors = _ref.acceptErrors;

    stylesheets = Array.isArray(stylesheets) ? stylesheets : [stylesheets];

    function setupLink(stylesheetURL) {
      var options = {};

      if (Array.isArray(stylesheetURL)) {
        var _stylesheetURL = stylesheetURL;

        var _stylesheetURL2 = _slicedToArray$1(_stylesheetURL, 2);

        stylesheetURL = _stylesheetURL2[0];
        var _stylesheetURL2$ = _stylesheetURL2[1];
        options = _stylesheetURL2$ === void 0 ? {} : _stylesheetURL2$;
      }

      var _options = options,
          _options$favicon = _options.favicon,
          favicon = _options$favicon === void 0 ? faviconDefault : _options$favicon;
      var _options2 = options,
          _options2$before = _options2.before,
          before = _options2$before === void 0 ? beforeDefault : _options2$before,
          _options2$after = _options2.after,
          after = _options2$after === void 0 ? afterDefault : _options2$after,
          _options2$canvas = _options2.canvas,
          canvas = _options2$canvas === void 0 ? canvasDefault : _options2$canvas,
          _options2$image = _options2.image,
          image = _options2$image === void 0 ? imageDefault : _options2$image;

      function addLink() {
        if (before) {
          before.before(link);
        } else if (after) {
          after.after(link);
        } else {
          // eslint-disable-next-line unicorn/prefer-node-append
          document.head.appendChild(link);
        }
      }

      var link = document.createElement('link'); // eslint-disable-next-line promise/avoid-new

      return new Promise(function (resolve, reject) {
        var rej = reject;

        if (acceptErrors) {
          rej = typeof acceptErrors === 'function' ? function (error) {
            acceptErrors({
              error: error,
              stylesheetURL: stylesheetURL,
              options: options,
              resolve: resolve,
              reject: reject
            });
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

          var cnv = document.createElement('canvas');
          cnv.width = 16;
          cnv.height = 16;
          var context = cnv.getContext('2d');
          var img = document.createElement('img');
          img.addEventListener('error', function (error) {
            reject(error);
          });
          img.addEventListener('load', function () {
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
        link.addEventListener('error', function (error) {
          rej(error);
        });
        link.addEventListener('load', function () {
          resolve(link);
        });
      });
    }

    return Promise.all(stylesheets.map(function (stylesheetURL) {
      return setupLink(stylesheetURL);
    }));
  }

  function _typeof$1(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof$1 = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof$1 = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof$1(obj);
  }

  function _classCallCheck$1(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$1(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$1(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$1(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray$2(arr, i) {
    return _arrayWithHoles$2(arr) || _iterableToArrayLimit$2(arr, i) || _nonIterableRest$2();
  }

  function _toConsumableArray$1(arr) {
    return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _nonIterableSpread$1();
  }

  function _arrayWithoutHoles$1(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles$2(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray$1(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit$2(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

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
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread$1() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest$2() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var O = 'object';
  var check = function (it) {
    return it && it.Math == Math && it;
  };

  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global_1 =
    // eslint-disable-next-line no-undef
    check(typeof globalThis == O && globalThis) ||
    check(typeof window == O && window) ||
    check(typeof self == O && self) ||
    check(typeof commonjsGlobal == O && commonjsGlobal) ||
    // eslint-disable-next-line no-new-func
    Function('return this')();

  var fails = function (exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var descriptors = !fails(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

  // Nashorn ~ JDK8 bug
  var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

  // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
  var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
    var descriptor = getOwnPropertyDescriptor(this, V);
    return !!descriptor && descriptor.enumerable;
  } : nativePropertyIsEnumerable;

  var objectPropertyIsEnumerable = {
  	f: f
  };

  var createPropertyDescriptor = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var toString = {}.toString;

  var classofRaw = function (it) {
    return toString.call(it).slice(8, -1);
  };

  var split = ''.split;

  // fallback for non-array-like ES3 and non-enumerable old V8 strings
  var indexedObject = fails(function () {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins
    return !Object('z').propertyIsEnumerable(0);
  }) ? function (it) {
    return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
  } : Object;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible = function (it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };

  // toObject with fallback for non-array-like ES3 strings



  var toIndexedObject = function (it) {
    return indexedObject(requireObjectCoercible(it));
  };

  var isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  // `ToPrimitive` abstract operation
  // https://tc39.github.io/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var toPrimitive = function (input, PREFERRED_STRING) {
    if (!isObject(input)) return input;
    var fn, val;
    if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
    if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var hasOwnProperty = {}.hasOwnProperty;

  var has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var document$1 = global_1.document;
  // typeof document.createElement is 'object' in old IE
  var EXISTS = isObject(document$1) && isObject(document$1.createElement);

  var documentCreateElement = function (it) {
    return EXISTS ? document$1.createElement(it) : {};
  };

  // Thank's IE8 for his funny defineProperty
  var ie8DomDefine = !descriptors && !fails(function () {
    return Object.defineProperty(documentCreateElement('div'), 'a', {
      get: function () { return 7; }
    }).a != 7;
  });

  var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
  var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
    O = toIndexedObject(O);
    P = toPrimitive(P, true);
    if (ie8DomDefine) try {
      return nativeGetOwnPropertyDescriptor(O, P);
    } catch (error) { /* empty */ }
    if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
  };

  var objectGetOwnPropertyDescriptor = {
  	f: f$1
  };

  var anObject = function (it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + ' is not an object');
    } return it;
  };

  var nativeDefineProperty = Object.defineProperty;

  // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty
  var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (ie8DomDefine) try {
      return nativeDefineProperty(O, P, Attributes);
    } catch (error) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var objectDefineProperty = {
  	f: f$2
  };

  var hide = descriptors ? function (object, key, value) {
    return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var setGlobal = function (key, value) {
    try {
      hide(global_1, key, value);
    } catch (error) {
      global_1[key] = value;
    } return value;
  };

  var shared = createCommonjsModule(function (module) {
  var SHARED = '__core-js_shared__';
  var store = global_1[SHARED] || setGlobal(SHARED, {});

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.2.1',
    mode:  'global',
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
  });
  });

  var functionToString = shared('native-function-to-string', Function.toString);

  var WeakMap$1 = global_1.WeakMap;

  var nativeWeakMap = typeof WeakMap$1 === 'function' && /native code/.test(functionToString.call(WeakMap$1));

  var id = 0;
  var postfix = Math.random();

  var uid = function (key) {
    return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
  };

  var keys = shared('keys');

  var sharedKey = function (key) {
    return keys[key] || (keys[key] = uid(key));
  };

  var hiddenKeys = {};

  var WeakMap$1$1 = global_1.WeakMap;
  var set, get, has$1;

  var enforce = function (it) {
    return has$1(it) ? get(it) : set(it, {});
  };

  var getterFor = function (TYPE) {
    return function (it) {
      var state;
      if (!isObject(it) || (state = get(it)).type !== TYPE) {
        throw TypeError('Incompatible receiver, ' + TYPE + ' required');
      } return state;
    };
  };

  if (nativeWeakMap) {
    var store = new WeakMap$1$1();
    var wmget = store.get;
    var wmhas = store.has;
    var wmset = store.set;
    set = function (it, metadata) {
      wmset.call(store, it, metadata);
      return metadata;
    };
    get = function (it) {
      return wmget.call(store, it) || {};
    };
    has$1 = function (it) {
      return wmhas.call(store, it);
    };
  } else {
    var STATE = sharedKey('state');
    hiddenKeys[STATE] = true;
    set = function (it, metadata) {
      hide(it, STATE, metadata);
      return metadata;
    };
    get = function (it) {
      return has(it, STATE) ? it[STATE] : {};
    };
    has$1 = function (it) {
      return has(it, STATE);
    };
  }

  var internalState = {
    set: set,
    get: get,
    has: has$1,
    enforce: enforce,
    getterFor: getterFor
  };

  var redefine = createCommonjsModule(function (module) {
  var getInternalState = internalState.get;
  var enforceInternalState = internalState.enforce;
  var TEMPLATE = String(functionToString).split('toString');

  shared('inspectSource', function (it) {
    return functionToString.call(it);
  });

  (module.exports = function (O, key, value, options) {
    var unsafe = options ? !!options.unsafe : false;
    var simple = options ? !!options.enumerable : false;
    var noTargetGet = options ? !!options.noTargetGet : false;
    if (typeof value == 'function') {
      if (typeof key == 'string' && !has(value, 'name')) hide(value, 'name', key);
      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
    }
    if (O === global_1) {
      if (simple) O[key] = value;
      else setGlobal(key, value);
      return;
    } else if (!unsafe) {
      delete O[key];
    } else if (!noTargetGet && O[key]) {
      simple = true;
    }
    if (simple) O[key] = value;
    else hide(O, key, value);
  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, 'toString', function toString() {
    return typeof this == 'function' && getInternalState(this).source || functionToString.call(this);
  });
  });

  var path = global_1;

  var aFunction = function (variable) {
    return typeof variable == 'function' ? variable : undefined;
  };

  var getBuiltIn = function (namespace, method) {
    return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
      : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
  };

  var ceil = Math.ceil;
  var floor = Math.floor;

  // `ToInteger` abstract operation
  // https://tc39.github.io/ecma262/#sec-tointeger
  var toInteger = function (argument) {
    return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
  };

  var min = Math.min;

  // `ToLength` abstract operation
  // https://tc39.github.io/ecma262/#sec-tolength
  var toLength = function (argument) {
    return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min;

  // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).
  var toAbsoluteIndex = function (index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
  };

  // `Array.prototype.{ indexOf, includes }` methods implementation
  var createMethod = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) {
        if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  var arrayIncludes = {
    // `Array.prototype.includes` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    includes: createMethod(true),
    // `Array.prototype.indexOf` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod(false)
  };

  var indexOf = arrayIncludes.indexOf;


  var objectKeysInternal = function (object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (has(O, key = names[i++])) {
      ~indexOf(result, key) || result.push(key);
    }
    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys = [
    'constructor',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'valueOf'
  ];

  var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

  // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
  var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return objectKeysInternal(O, hiddenKeys$1);
  };

  var objectGetOwnPropertyNames = {
  	f: f$3
  };

  var f$4 = Object.getOwnPropertySymbols;

  var objectGetOwnPropertySymbols = {
  	f: f$4
  };

  // all object keys, includes non-enumerable and symbols
  var ownKeys$1 = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
    var keys = objectGetOwnPropertyNames.f(anObject(it));
    var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
    return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
  };

  var copyConstructorProperties = function (target, source) {
    var keys = ownKeys$1(source);
    var defineProperty = objectDefineProperty.f;
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  };

  var replacement = /#|\.prototype\./;

  var isForced = function (feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL ? true
      : value == NATIVE ? false
      : typeof detection == 'function' ? fails(detection)
      : !!detection;
  };

  var normalize = isForced.normalize = function (string) {
    return String(string).replace(replacement, '.').toLowerCase();
  };

  var data = isForced.data = {};
  var NATIVE = isForced.NATIVE = 'N';
  var POLYFILL = isForced.POLYFILL = 'P';

  var isForced_1 = isForced;

  var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






  /*
    options.target      - name of the target object
    options.global      - target is the global object
    options.stat        - export as static methods of target
    options.proto       - export as prototype methods of target
    options.real        - real prototype method for the `pure` version
    options.forced      - export even if the native feature is available
    options.bind        - bind methods to the target, required for the `pure` version
    options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
    options.unsafe      - use the simple assignment of property instead of delete + defineProperty
    options.sham        - add a flag to not completely full polyfills
    options.enumerable  - export as enumerable property
    options.noTargetGet - prevent calling a getter on target
  */
  var _export = function (options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;
    if (GLOBAL) {
      target = global_1;
    } else if (STATIC) {
      target = global_1[TARGET] || setGlobal(TARGET, {});
    } else {
      target = (global_1[TARGET] || {}).prototype;
    }
    if (target) for (key in source) {
      sourceProperty = source[key];
      if (options.noTargetGet) {
        descriptor = getOwnPropertyDescriptor$1(target, key);
        targetProperty = descriptor && descriptor.value;
      } else targetProperty = target[key];
      FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
      // contained in target
      if (!FORCED && targetProperty !== undefined) {
        if (typeof sourceProperty === typeof targetProperty) continue;
        copyConstructorProperties(sourceProperty, targetProperty);
      }
      // add a flag to not completely full polyfills
      if (options.sham || (targetProperty && targetProperty.sham)) {
        hide(sourceProperty, 'sham', true);
      }
      // extend global
      redefine(target, key, sourceProperty, options);
    }
  };

  var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
    // Chrome 38 Symbol has incorrect toString conversion
    // eslint-disable-next-line no-undef
    return !String(Symbol());
  });

  var Symbol$1 = global_1.Symbol;
  var store$1 = shared('wks');

  var wellKnownSymbol = function (name) {
    return store$1[name] || (store$1[name] = nativeSymbol && Symbol$1[name]
      || (nativeSymbol ? Symbol$1 : uid)('Symbol.' + name));
  };

  // `Object.keys` method
  // https://tc39.github.io/ecma262/#sec-object.keys
  var objectKeys = Object.keys || function keys(O) {
    return objectKeysInternal(O, enumBugKeys);
  };

  // `Object.defineProperties` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperties
  var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject(O);
    var keys = objectKeys(Properties);
    var length = keys.length;
    var index = 0;
    var key;
    while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
    return O;
  };

  var html = getBuiltIn('document', 'documentElement');

  var IE_PROTO = sharedKey('IE_PROTO');

  var PROTOTYPE = 'prototype';
  var Empty = function () { /* empty */ };

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = documentCreateElement('iframe');
    var length = enumBugKeys.length;
    var lt = '<';
    var script = 'script';
    var gt = '>';
    var js = 'java' + script + ':';
    var iframeDocument;
    iframe.style.display = 'none';
    html.appendChild(iframe);
    iframe.src = String(js);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + script + gt + 'document.F=Object' + lt + '/' + script + gt);
    iframeDocument.close();
    createDict = iframeDocument.F;
    while (length--) delete createDict[PROTOTYPE][enumBugKeys[length]];
    return createDict();
  };

  // `Object.create` method
  // https://tc39.github.io/ecma262/#sec-object.create
  var objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty[PROTOTYPE] = anObject(O);
      result = new Empty();
      Empty[PROTOTYPE] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : objectDefineProperties(result, Properties);
  };

  hiddenKeys[IE_PROTO] = true;

  var UNSCOPABLES = wellKnownSymbol('unscopables');
  var ArrayPrototype = Array.prototype;

  // Array.prototype[@@unscopables]
  // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
  if (ArrayPrototype[UNSCOPABLES] == undefined) {
    hide(ArrayPrototype, UNSCOPABLES, objectCreate(null));
  }

  // add a key to Array.prototype[@@unscopables]
  var addToUnscopables = function (key) {
    ArrayPrototype[UNSCOPABLES][key] = true;
  };

  var $includes = arrayIncludes.includes;


  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  _export({ target: 'Array', proto: true }, {
    includes: function includes(el /* , fromIndex = 0 */) {
      return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
  addToUnscopables('includes');

  // `ToObject` abstract operation
  // https://tc39.github.io/ecma262/#sec-toobject
  var toObject = function (argument) {
    return Object(requireObjectCoercible(argument));
  };

  var nativeAssign = Object.assign;

  // `Object.assign` method
  // https://tc39.github.io/ecma262/#sec-object.assign
  // should work with symbols and should have deterministic property order (V8 bug)
  var objectAssign = !nativeAssign || fails(function () {
    var A = {};
    var B = {};
    // eslint-disable-next-line no-undef
    var symbol = Symbol();
    var alphabet = 'abcdefghijklmnopqrst';
    A[symbol] = 7;
    alphabet.split('').forEach(function (chr) { B[chr] = chr; });
    return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
  }) ? function assign(target, source) { // eslint-disable-line no-unused-vars
    var T = toObject(target);
    var argumentsLength = arguments.length;
    var index = 1;
    var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
    var propertyIsEnumerable = objectPropertyIsEnumerable.f;
    while (argumentsLength > index) {
      var S = indexedObject(arguments[index++]);
      var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
      var length = keys.length;
      var j = 0;
      var key;
      while (length > j) {
        key = keys[j++];
        if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
      }
    } return T;
  } : nativeAssign;

  // `Object.assign` method
  // https://tc39.github.io/ecma262/#sec-object.assign
  _export({ target: 'Object', stat: true, forced: Object.assign !== objectAssign }, {
    assign: objectAssign
  });

  var MATCH = wellKnownSymbol('match');

  // `IsRegExp` abstract operation
  // https://tc39.github.io/ecma262/#sec-isregexp
  var isRegexp = function (it) {
    var isRegExp;
    return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
  };

  var notARegexp = function (it) {
    if (isRegexp(it)) {
      throw TypeError("The method doesn't accept regular expressions");
    } return it;
  };

  var MATCH$1 = wellKnownSymbol('match');

  var correctIsRegexpLogic = function (METHOD_NAME) {
    var regexp = /./;
    try {
      '/./'[METHOD_NAME](regexp);
    } catch (e) {
      try {
        regexp[MATCH$1] = false;
        return '/./'[METHOD_NAME](regexp);
      } catch (f) { /* empty */ }
    } return false;
  };

  // `String.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.includes
  _export({ target: 'String', proto: true, forced: !correctIsRegexpLogic('includes') }, {
    includes: function includes(searchString /* , position = 0 */) {
      return !!~String(requireObjectCoercible(this))
        .indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // a string of all valid unicode whitespaces
  // eslint-disable-next-line max-len
  var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

  var whitespace = '[' + whitespaces + ']';
  var ltrim = RegExp('^' + whitespace + whitespace + '*');
  var rtrim = RegExp(whitespace + whitespace + '*$');

  // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
  var createMethod$1 = function (TYPE) {
    return function ($this) {
      var string = String(requireObjectCoercible($this));
      if (TYPE & 1) string = string.replace(ltrim, '');
      if (TYPE & 2) string = string.replace(rtrim, '');
      return string;
    };
  };

  var stringTrim = {
    // `String.prototype.{ trimLeft, trimStart }` methods
    // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
    start: createMethod$1(1),
    // `String.prototype.{ trimRight, trimEnd }` methods
    // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
    end: createMethod$1(2),
    // `String.prototype.trim` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.trim
    trim: createMethod$1(3)
  };

  var non = '\u200B\u0085\u180E';

  // check that a method works with the correct list
  // of whitespaces and has a correct name
  var forcedStringTrimMethod = function (METHOD_NAME) {
    return fails(function () {
      return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
    });
  };

  var $trim = stringTrim.trim;


  // `String.prototype.trim` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
  _export({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
    trim: function trim() {
      return $trim(this);
    }
  });

  var VERSION = '1.5.2';
  var BLOCK_ROWS = 50;
  var CLUSTER_BLOCKS = 4;
  var DEFAULTS = {
    name: '',
    placeholder: '',
    data: undefined,
    locale: undefined,
    selectAll: true,
    single: undefined,
    singleRadio: false,
    multiple: false,
    hideOptgroupCheckboxes: false,
    multipleWidth: 80,
    width: undefined,
    dropWidth: undefined,
    maxHeight: 250,
    maxHeightUnit: 'px',
    position: 'bottom',
    displayValues: false,
    displayTitle: false,
    displayDelimiter: ', ',
    minimumCountSelected: 3,
    ellipsis: false,
    isOpen: false,
    keepOpen: false,
    openOnHover: false,
    container: null,
    filter: false,
    filterGroup: false,
    filterPlaceholder: '',
    filterAcceptOnEnter: false,
    filterByDataLength: undefined,
    customFilter: function customFilter(label, text) {
      // originalLabel, originalText
      return label.includes(text);
    },
    showClear: false,
    animate: undefined,
    styler: function styler() {
      return false;
    },
    textTemplate: function textTemplate($elm) {
      return $elm[0].innerHTML.trim();
    },
    labelTemplate: function labelTemplate($elm) {
      return $elm[0].getAttribute('label');
    },
    onOpen: function onOpen() {
      return false;
    },
    onClose: function onClose() {
      return false;
    },
    onCheckAll: function onCheckAll() {
      return false;
    },
    onUncheckAll: function onUncheckAll() {
      return false;
    },
    onFocus: function onFocus() {
      return false;
    },
    onBlur: function onBlur() {
      return false;
    },
    onOptgroupClick: function onOptgroupClick() {
      return false;
    },
    onClick: function onClick() {
      return false;
    },
    onFilter: function onFilter() {
      return false;
    },
    onClear: function onClear() {
      return false;
    },
    onAfterCreate: function onAfterCreate() {
      return false;
    }
  };
  var EN = {
    formatSelectAll: function formatSelectAll() {
      return '[Select all]';
    },
    formatAllSelected: function formatAllSelected() {
      return 'All selected';
    },
    formatCountSelected: function formatCountSelected(count, total) {
      return count + ' of ' + total + ' selected';
    },
    formatNoMatchesFound: function formatNoMatchesFound() {
      return 'No matches found';
    }
  };
  var METHODS = ['getOptions', 'refreshOptions', 'getSelects', 'setSelects', 'enable', 'disable', 'open', 'close', 'check', 'uncheck', 'checkAll', 'uncheckAll', 'checkInvert', 'focus', 'blur', 'refresh', 'destroy'];
  Object.assign(DEFAULTS, EN);
  var Constants = {
    VERSION: VERSION,
    BLOCK_ROWS: BLOCK_ROWS,
    CLUSTER_BLOCKS: CLUSTER_BLOCKS,
    DEFAULTS: DEFAULTS,
    METHODS: METHODS,
    LOCALES: {
      en: EN,
      'en-US': EN
    }
  };

  // `IsArray` abstract operation
  // https://tc39.github.io/ecma262/#sec-isarray
  var isArray = Array.isArray || function isArray(arg) {
    return classofRaw(arg) == 'Array';
  };

  var nativeGetOwnPropertyNames = objectGetOwnPropertyNames.f;

  var toString$1 = {}.toString;

  var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
    ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function (it) {
    try {
      return nativeGetOwnPropertyNames(it);
    } catch (error) {
      return windowNames.slice();
    }
  };

  // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
  var f$5 = function getOwnPropertyNames(it) {
    return windowNames && toString$1.call(it) == '[object Window]'
      ? getWindowNames(it)
      : nativeGetOwnPropertyNames(toIndexedObject(it));
  };

  var objectGetOwnPropertyNamesExternal = {
  	f: f$5
  };

  var f$6 = wellKnownSymbol;

  var wrappedWellKnownSymbol = {
  	f: f$6
  };

  var defineProperty = objectDefineProperty.f;

  var defineWellKnownSymbol = function (NAME) {
    var Symbol = path.Symbol || (path.Symbol = {});
    if (!has(Symbol, NAME)) defineProperty(Symbol, NAME, {
      value: wrappedWellKnownSymbol.f(NAME)
    });
  };

  var defineProperty$1 = objectDefineProperty.f;



  var TO_STRING_TAG = wellKnownSymbol('toStringTag');

  var setToStringTag = function (it, TAG, STATIC) {
    if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
      defineProperty$1(it, TO_STRING_TAG, { configurable: true, value: TAG });
    }
  };

  var aFunction$1 = function (it) {
    if (typeof it != 'function') {
      throw TypeError(String(it) + ' is not a function');
    } return it;
  };

  // optional / simple context binding
  var bindContext = function (fn, that, length) {
    aFunction$1(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 0: return function () {
        return fn.call(that);
      };
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var SPECIES = wellKnownSymbol('species');

  // `ArraySpeciesCreate` abstract operation
  // https://tc39.github.io/ecma262/#sec-arrayspeciescreate
  var arraySpeciesCreate = function (originalArray, length) {
    var C;
    if (isArray(originalArray)) {
      C = originalArray.constructor;
      // cross-realm fallback
      if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
      else if (isObject(C)) {
        C = C[SPECIES];
        if (C === null) C = undefined;
      }
    } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
  };

  var push = [].push;

  // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
  var createMethod$2 = function (TYPE) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    return function ($this, callbackfn, that, specificCreate) {
      var O = toObject($this);
      var self = indexedObject(O);
      var boundFunction = bindContext(callbackfn, that, 3);
      var length = toLength(self.length);
      var index = 0;
      var create = specificCreate || arraySpeciesCreate;
      var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
      var value, result;
      for (;length > index; index++) if (NO_HOLES || index in self) {
        value = self[index];
        result = boundFunction(value, index, O);
        if (TYPE) {
          if (IS_MAP) target[index] = result; // map
          else if (result) switch (TYPE) {
            case 3: return true;              // some
            case 5: return value;             // find
            case 6: return index;             // findIndex
            case 2: push.call(target, value); // filter
          } else if (IS_EVERY) return false;  // every
        }
      }
      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
    };
  };

  var arrayIteration = {
    // `Array.prototype.forEach` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
    forEach: createMethod$2(0),
    // `Array.prototype.map` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.map
    map: createMethod$2(1),
    // `Array.prototype.filter` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.filter
    filter: createMethod$2(2),
    // `Array.prototype.some` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.some
    some: createMethod$2(3),
    // `Array.prototype.every` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.every
    every: createMethod$2(4),
    // `Array.prototype.find` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.find
    find: createMethod$2(5),
    // `Array.prototype.findIndex` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
    findIndex: createMethod$2(6)
  };

  var $forEach = arrayIteration.forEach;

  var HIDDEN = sharedKey('hidden');
  var SYMBOL = 'Symbol';
  var PROTOTYPE$1 = 'prototype';
  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
  var setInternalState = internalState.set;
  var getInternalState = internalState.getterFor(SYMBOL);
  var ObjectPrototype = Object[PROTOTYPE$1];
  var $Symbol = global_1.Symbol;
  var JSON$1 = global_1.JSON;
  var nativeJSONStringify = JSON$1 && JSON$1.stringify;
  var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
  var nativeDefineProperty$1 = objectDefineProperty.f;
  var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNamesExternal.f;
  var nativePropertyIsEnumerable$1 = objectPropertyIsEnumerable.f;
  var AllSymbols = shared('symbols');
  var ObjectPrototypeSymbols = shared('op-symbols');
  var StringToSymbolRegistry = shared('string-to-symbol-registry');
  var SymbolToStringRegistry = shared('symbol-to-string-registry');
  var WellKnownSymbolsStore = shared('wks');
  var QObject = global_1.QObject;
  // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
  var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

  // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
  var setSymbolDescriptor = descriptors && fails(function () {
    return objectCreate(nativeDefineProperty$1({}, 'a', {
      get: function () { return nativeDefineProperty$1(this, 'a', { value: 7 }).a; }
    })).a != 7;
  }) ? function (O, P, Attributes) {
    var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype, P);
    if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
    nativeDefineProperty$1(O, P, Attributes);
    if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
      nativeDefineProperty$1(ObjectPrototype, P, ObjectPrototypeDescriptor);
    }
  } : nativeDefineProperty$1;

  var wrap = function (tag, description) {
    var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
    setInternalState(symbol, {
      type: SYMBOL,
      tag: tag,
      description: description
    });
    if (!descriptors) symbol.description = description;
    return symbol;
  };

  var isSymbol = nativeSymbol && typeof $Symbol.iterator == 'symbol' ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    return Object(it) instanceof $Symbol;
  };

  var $defineProperty = function defineProperty(O, P, Attributes) {
    if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
    anObject(O);
    var key = toPrimitive(P, true);
    anObject(Attributes);
    if (has(AllSymbols, key)) {
      if (!Attributes.enumerable) {
        if (!has(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor(1, {}));
        O[HIDDEN][key] = true;
      } else {
        if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
        Attributes = objectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
      } return setSymbolDescriptor(O, key, Attributes);
    } return nativeDefineProperty$1(O, key, Attributes);
  };

  var $defineProperties = function defineProperties(O, Properties) {
    anObject(O);
    var properties = toIndexedObject(Properties);
    var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
    $forEach(keys, function (key) {
      if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
    });
    return O;
  };

  var $create = function create(O, Properties) {
    return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
  };

  var $propertyIsEnumerable = function propertyIsEnumerable(V) {
    var P = toPrimitive(V, true);
    var enumerable = nativePropertyIsEnumerable$1.call(this, P);
    if (this === ObjectPrototype && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
    return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
  };

  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
    var it = toIndexedObject(O);
    var key = toPrimitive(P, true);
    if (it === ObjectPrototype && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
    var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);
    if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
      descriptor.enumerable = true;
    }
    return descriptor;
  };

  var $getOwnPropertyNames = function getOwnPropertyNames(O) {
    var names = nativeGetOwnPropertyNames$1(toIndexedObject(O));
    var result = [];
    $forEach(names, function (key) {
      if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
    });
    return result;
  };

  var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
    var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
    var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
    var result = [];
    $forEach(names, function (key) {
      if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype, key))) {
        result.push(AllSymbols[key]);
      }
    });
    return result;
  };

  // `Symbol` constructor
  // https://tc39.github.io/ecma262/#sec-symbol-constructor
  if (!nativeSymbol) {
    $Symbol = function Symbol() {
      if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
      var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
      var tag = uid(description);
      var setter = function (value) {
        if (this === ObjectPrototype) setter.call(ObjectPrototypeSymbols, value);
        if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
        setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
      };
      if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
      return wrap(tag, description);
    };

    redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
      return getInternalState(this).tag;
    });

    objectPropertyIsEnumerable.f = $propertyIsEnumerable;
    objectDefineProperty.f = $defineProperty;
    objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
    objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
    objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

    if (descriptors) {
      // https://github.com/tc39/proposal-Symbol-description
      nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
        configurable: true,
        get: function description() {
          return getInternalState(this).description;
        }
      });
      {
        redefine(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
      }
    }

    wrappedWellKnownSymbol.f = function (name) {
      return wrap(wellKnownSymbol(name), name);
    };
  }

  _export({ global: true, wrap: true, forced: !nativeSymbol, sham: !nativeSymbol }, {
    Symbol: $Symbol
  });

  $forEach(objectKeys(WellKnownSymbolsStore), function (name) {
    defineWellKnownSymbol(name);
  });

  _export({ target: SYMBOL, stat: true, forced: !nativeSymbol }, {
    // `Symbol.for` method
    // https://tc39.github.io/ecma262/#sec-symbol.for
    'for': function (key) {
      var string = String(key);
      if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
      var symbol = $Symbol(string);
      StringToSymbolRegistry[string] = symbol;
      SymbolToStringRegistry[symbol] = string;
      return symbol;
    },
    // `Symbol.keyFor` method
    // https://tc39.github.io/ecma262/#sec-symbol.keyfor
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
      if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
    },
    useSetter: function () { USE_SETTER = true; },
    useSimple: function () { USE_SETTER = false; }
  });

  _export({ target: 'Object', stat: true, forced: !nativeSymbol, sham: !descriptors }, {
    // `Object.create` method
    // https://tc39.github.io/ecma262/#sec-object.create
    create: $create,
    // `Object.defineProperty` method
    // https://tc39.github.io/ecma262/#sec-object.defineproperty
    defineProperty: $defineProperty,
    // `Object.defineProperties` method
    // https://tc39.github.io/ecma262/#sec-object.defineproperties
    defineProperties: $defineProperties,
    // `Object.getOwnPropertyDescriptor` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor
  });

  _export({ target: 'Object', stat: true, forced: !nativeSymbol }, {
    // `Object.getOwnPropertyNames` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
    getOwnPropertyNames: $getOwnPropertyNames,
    // `Object.getOwnPropertySymbols` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
    getOwnPropertySymbols: $getOwnPropertySymbols
  });

  // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
  // https://bugs.chromium.org/p/v8/issues/detail?id=3443
  _export({ target: 'Object', stat: true, forced: fails(function () { objectGetOwnPropertySymbols.f(1); }) }, {
    getOwnPropertySymbols: function getOwnPropertySymbols(it) {
      return objectGetOwnPropertySymbols.f(toObject(it));
    }
  });

  // `JSON.stringify` method behavior with symbols
  // https://tc39.github.io/ecma262/#sec-json.stringify
  JSON$1 && _export({ target: 'JSON', stat: true, forced: !nativeSymbol || fails(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return nativeJSONStringify([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || nativeJSONStringify({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || nativeJSONStringify(Object(symbol)) != '{}';
  }) }, {
    stringify: function stringify(it) {
      var args = [it];
      var index = 1;
      var replacer, $replacer;
      while (arguments.length > index) args.push(arguments[index++]);
      $replacer = replacer = args[1];
      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return nativeJSONStringify.apply(JSON$1, args);
    }
  });

  // `Symbol.prototype[@@toPrimitive]` method
  // https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive
  if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) hide($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
  // `Symbol.prototype[@@toStringTag]` property
  // https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag
  setToStringTag($Symbol, SYMBOL);

  hiddenKeys[HIDDEN] = true;

  var defineProperty$2 = objectDefineProperty.f;


  var NativeSymbol = global_1.Symbol;

  if (descriptors && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
    // Safari 12 bug
    NativeSymbol().description !== undefined
  )) {
    var EmptyStringDescriptionStore = {};
    // wrap Symbol constructor for correct work with undefined description
    var SymbolWrapper = function Symbol() {
      var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
      var result = this instanceof SymbolWrapper
        ? new NativeSymbol(description)
        // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
        : description === undefined ? NativeSymbol() : NativeSymbol(description);
      if (description === '') EmptyStringDescriptionStore[result] = true;
      return result;
    };
    copyConstructorProperties(SymbolWrapper, NativeSymbol);
    var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
    symbolPrototype.constructor = SymbolWrapper;

    var symbolToString = symbolPrototype.toString;
    var native = String(NativeSymbol('test')) == 'Symbol(test)';
    var regexp = /^Symbol\((.*)\)[^)]+$/;
    defineProperty$2(symbolPrototype, 'description', {
      configurable: true,
      get: function description() {
        var symbol = isObject(this) ? this.valueOf() : this;
        var string = symbolToString.call(symbol);
        if (has(EmptyStringDescriptionStore, symbol)) return '';
        var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
        return desc === '' ? undefined : desc;
      }
    });

    _export({ global: true, forced: true }, {
      Symbol: SymbolWrapper
    });
  }

  // `Symbol.iterator` well-known symbol
  // https://tc39.github.io/ecma262/#sec-symbol.iterator
  defineWellKnownSymbol('iterator');

  var createProperty = function (object, key, value) {
    var propertyKey = toPrimitive(key);
    if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
    else object[propertyKey] = value;
  };

  var SPECIES$1 = wellKnownSymbol('species');

  var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
    return !fails(function () {
      var array = [];
      var constructor = array.constructor = {};
      constructor[SPECIES$1] = function () {
        return { foo: 1 };
      };
      return array[METHOD_NAME](Boolean).foo !== 1;
    });
  };

  var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
  var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
  var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

  var IS_CONCAT_SPREADABLE_SUPPORT = !fails(function () {
    var array = [];
    array[IS_CONCAT_SPREADABLE] = false;
    return array.concat()[0] !== array;
  });

  var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

  var isConcatSpreadable = function (O) {
    if (!isObject(O)) return false;
    var spreadable = O[IS_CONCAT_SPREADABLE];
    return spreadable !== undefined ? !!spreadable : isArray(O);
  };

  var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

  // `Array.prototype.concat` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.concat
  // with adding support of @@isConcatSpreadable and @@species
  _export({ target: 'Array', proto: true, forced: FORCED }, {
    concat: function concat(arg) { // eslint-disable-line no-unused-vars
      var O = toObject(this);
      var A = arraySpeciesCreate(O, 0);
      var n = 0;
      var i, k, length, len, E;
      for (i = -1, length = arguments.length; i < length; i++) {
        E = i === -1 ? O : arguments[i];
        if (isConcatSpreadable(E)) {
          len = toLength(E.length);
          if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
          for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
        } else {
          if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
          createProperty(A, n++, E);
        }
      }
      A.length = n;
      return A;
    }
  });

  var $filter = arrayIteration.filter;


  // `Array.prototype.filter` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
  // with adding support of @@species
  _export({ target: 'Array', proto: true, forced: !arrayMethodHasSpeciesSupport('filter') }, {
    filter: function filter(callbackfn /* , thisArg */) {
      return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var $find = arrayIteration.find;


  var FIND = 'find';
  var SKIPS_HOLES = true;

  // Shouldn't skip holes
  if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

  // `Array.prototype.find` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  _export({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
    find: function find(callbackfn /* , that = undefined */) {
      return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
  addToUnscopables(FIND);

  var correctPrototypeGetter = !fails(function () {
    function F() { /* empty */ }
    F.prototype.constructor = null;
    return Object.getPrototypeOf(new F()) !== F.prototype;
  });

  var IE_PROTO$1 = sharedKey('IE_PROTO');
  var ObjectPrototype$1 = Object.prototype;

  // `Object.getPrototypeOf` method
  // https://tc39.github.io/ecma262/#sec-object.getprototypeof
  var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
    O = toObject(O);
    if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectPrototype$1 : null;
  };

  var ITERATOR = wellKnownSymbol('iterator');
  var BUGGY_SAFARI_ITERATORS = false;

  var returnThis = function () { return this; };

  // `%IteratorPrototype%` object
  // https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
  var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

  if ([].keys) {
    arrayIterator = [].keys();
    // Safari 8 has buggy iterators w/o `next`
    if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
    else {
      PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
      if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
    }
  }

  if (IteratorPrototype == undefined) IteratorPrototype = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  if ( !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);

  var iteratorsCore = {
    IteratorPrototype: IteratorPrototype,
    BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
  };

  var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

  var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
    var TO_STRING_TAG = NAME + ' Iterator';
    IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
    setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
    return IteratorConstructor;
  };

  var aPossiblePrototype = function (it) {
    if (!isObject(it) && it !== null) {
      throw TypeError("Can't set " + String(it) + ' as a prototype');
    } return it;
  };

  // `Object.setPrototypeOf` method
  // https://tc39.github.io/ecma262/#sec-object.setprototypeof
  // Works with __proto__ only. Old v8 can't work with null proto objects.
  /* eslint-disable no-proto */
  var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
    var CORRECT_SETTER = false;
    var test = {};
    var setter;
    try {
      setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
      setter.call(test, []);
      CORRECT_SETTER = test instanceof Array;
    } catch (error) { /* empty */ }
    return function setPrototypeOf(O, proto) {
      anObject(O);
      aPossiblePrototype(proto);
      if (CORRECT_SETTER) setter.call(O, proto);
      else O.__proto__ = proto;
      return O;
    };
  }() : undefined);

  var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
  var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
  var ITERATOR$1 = wellKnownSymbol('iterator');
  var KEYS = 'keys';
  var VALUES = 'values';
  var ENTRIES = 'entries';

  var returnThis$1 = function () { return this; };

  var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
    createIteratorConstructor(IteratorConstructor, NAME, next);

    var getIterationMethod = function (KIND) {
      if (KIND === DEFAULT && defaultIterator) return defaultIterator;
      if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
      switch (KIND) {
        case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
        case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
        case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
      } return function () { return new IteratorConstructor(this); };
    };

    var TO_STRING_TAG = NAME + ' Iterator';
    var INCORRECT_VALUES_NAME = false;
    var IterablePrototype = Iterable.prototype;
    var nativeIterator = IterablePrototype[ITERATOR$1]
      || IterablePrototype['@@iterator']
      || DEFAULT && IterablePrototype[DEFAULT];
    var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
    var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
    var CurrentIteratorPrototype, methods, KEY;

    // fix native
    if (anyNativeIterator) {
      CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
      if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
        if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
          if (objectSetPrototypeOf) {
            objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
          } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
            hide(CurrentIteratorPrototype, ITERATOR$1, returnThis$1);
          }
        }
        // Set @@toStringTag to native iterators
        setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
      }
    }

    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return nativeIterator.call(this); };
    }

    // define iterator
    if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
      hide(IterablePrototype, ITERATOR$1, defaultIterator);
    }

    // export additional methods
    if (DEFAULT) {
      methods = {
        values: getIterationMethod(VALUES),
        keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
        entries: getIterationMethod(ENTRIES)
      };
      if (FORCED) for (KEY in methods) {
        if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
          redefine(IterablePrototype, KEY, methods[KEY]);
        }
      } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
    }

    return methods;
  };

  var ARRAY_ITERATOR = 'Array Iterator';
  var setInternalState$1 = internalState.set;
  var getInternalState$1 = internalState.getterFor(ARRAY_ITERATOR);

  // `Array.prototype.entries` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.entries
  // `Array.prototype.keys` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.keys
  // `Array.prototype.values` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.values
  // `Array.prototype[@@iterator]` method
  // https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
  // `CreateArrayIterator` internal method
  // https://tc39.github.io/ecma262/#sec-createarrayiterator
  var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
    setInternalState$1(this, {
      type: ARRAY_ITERATOR,
      target: toIndexedObject(iterated), // target
      index: 0,                          // next index
      kind: kind                         // kind
    });
  // `%ArrayIteratorPrototype%.next` method
  // https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
  }, function () {
    var state = getInternalState$1(this);
    var target = state.target;
    var kind = state.kind;
    var index = state.index++;
    if (!target || index >= target.length) {
      state.target = undefined;
      return { value: undefined, done: true };
    }
    if (kind == 'keys') return { value: index, done: false };
    if (kind == 'values') return { value: target[index], done: false };
    return { value: [index, target[index]], done: false };
  }, 'values');

  // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
  addToUnscopables('keys');
  addToUnscopables('values');
  addToUnscopables('entries');

  var sloppyArrayMethod = function (METHOD_NAME, argument) {
    var method = [][METHOD_NAME];
    return !method || !fails(function () {
      // eslint-disable-next-line no-useless-call,no-throw-literal
      method.call(null, argument || function () { throw 1; }, 1);
    });
  };

  var nativeJoin = [].join;

  var ES3_STRINGS = indexedObject != Object;
  var SLOPPY_METHOD = sloppyArrayMethod('join', ',');

  // `Array.prototype.join` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.join
  _export({ target: 'Array', proto: true, forced: ES3_STRINGS || SLOPPY_METHOD }, {
    join: function join(separator) {
      return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
    }
  });

  var $map = arrayIteration.map;


  // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  // with adding support of @@species
  _export({ target: 'Array', proto: true, forced: !arrayMethodHasSpeciesSupport('map') }, {
    map: function map(callbackfn /* , thisArg */) {
      return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var SPECIES$2 = wellKnownSymbol('species');
  var nativeSlice = [].slice;
  var max$1 = Math.max;

  // `Array.prototype.slice` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.slice
  // fallback for not array-like ES3 strings and DOM objects
  _export({ target: 'Array', proto: true, forced: !arrayMethodHasSpeciesSupport('slice') }, {
    slice: function slice(start, end) {
      var O = toIndexedObject(this);
      var length = toLength(O.length);
      var k = toAbsoluteIndex(start, length);
      var fin = toAbsoluteIndex(end === undefined ? length : end, length);
      // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
      var Constructor, result, n;
      if (isArray(O)) {
        Constructor = O.constructor;
        // cross-realm fallback
        if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
          Constructor = undefined;
        } else if (isObject(Constructor)) {
          Constructor = Constructor[SPECIES$2];
          if (Constructor === null) Constructor = undefined;
        }
        if (Constructor === Array || Constructor === undefined) {
          return nativeSlice.call(O, k, fin);
        }
      }
      result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
      for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
      result.length = n;
      return result;
    }
  });

  var defineProperty$3 = objectDefineProperty.f;

  var FunctionPrototype = Function.prototype;
  var FunctionPrototypeToString = FunctionPrototype.toString;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = 'name';

  // Function instances `.name` property
  // https://tc39.github.io/ecma262/#sec-function-instances-name
  if (descriptors && !(NAME in FunctionPrototype)) {
    defineProperty$3(FunctionPrototype, NAME, {
      configurable: true,
      get: function () {
        try {
          return FunctionPrototypeToString.call(this).match(nameRE)[1];
        } catch (error) {
          return '';
        }
      }
    });
  }

  var propertyIsEnumerable = objectPropertyIsEnumerable.f;

  // `Object.{ entries, values }` methods implementation
  var createMethod$3 = function (TO_ENTRIES) {
    return function (it) {
      var O = toIndexedObject(it);
      var keys = objectKeys(O);
      var length = keys.length;
      var i = 0;
      var result = [];
      var key;
      while (length > i) {
        key = keys[i++];
        if (!descriptors || propertyIsEnumerable.call(O, key)) {
          result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
        }
      }
      return result;
    };
  };

  var objectToArray = {
    // `Object.entries` method
    // https://tc39.github.io/ecma262/#sec-object.entries
    entries: createMethod$3(true),
    // `Object.values` method
    // https://tc39.github.io/ecma262/#sec-object.values
    values: createMethod$3(false)
  };

  var $entries = objectToArray.entries;

  // `Object.entries` method
  // https://tc39.github.io/ecma262/#sec-object.entries
  _export({ target: 'Object', stat: true }, {
    entries: function entries(O) {
      return $entries(O);
    }
  });

  var FAILS_ON_PRIMITIVES = fails(function () { objectKeys(1); });

  // `Object.keys` method
  // https://tc39.github.io/ecma262/#sec-object.keys
  _export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
    keys: function keys(it) {
      return objectKeys(toObject(it));
    }
  });

  var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
  // ES3 wrong here
  var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (error) { /* empty */ }
  };

  // getting tag from ES6+ `Object.prototype.toString`
  var classof = function (it) {
    var O, tag, result;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$1)) == 'string' ? tag
      // builtinTag case
      : CORRECT_ARGUMENTS ? classofRaw(O)
      // ES3 arguments fallback
      : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
  };

  var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
  var test = {};

  test[TO_STRING_TAG$2] = 'z';

  // `Object.prototype.toString` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.tostring
  var objectToString = String(test) !== '[object z]' ? function toString() {
    return '[object ' + classof(this) + ']';
  } : test.toString;

  var ObjectPrototype$2 = Object.prototype;

  // `Object.prototype.toString` method
  // https://tc39.github.io/ecma262/#sec-object.prototype.tostring
  if (objectToString !== ObjectPrototype$2.toString) {
    redefine(ObjectPrototype$2, 'toString', objectToString, { unsafe: true });
  }

  // `String.prototype.{ codePointAt, at }` methods implementation
  var createMethod$4 = function (CONVERT_TO_STRING) {
    return function ($this, pos) {
      var S = String(requireObjectCoercible($this));
      var position = toInteger(pos);
      var size = S.length;
      var first, second;
      if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
      first = S.charCodeAt(position);
      return first < 0xD800 || first > 0xDBFF || position + 1 === size
        || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
          ? CONVERT_TO_STRING ? S.charAt(position) : first
          : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
    };
  };

  var stringMultibyte = {
    // `String.prototype.codePointAt` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
    codeAt: createMethod$4(false),
    // `String.prototype.at` method
    // https://github.com/mathiasbynens/String.prototype.at
    charAt: createMethod$4(true)
  };

  var charAt = stringMultibyte.charAt;



  var STRING_ITERATOR = 'String Iterator';
  var setInternalState$2 = internalState.set;
  var getInternalState$2 = internalState.getterFor(STRING_ITERATOR);

  // `String.prototype[@@iterator]` method
  // https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
  defineIterator(String, 'String', function (iterated) {
    setInternalState$2(this, {
      type: STRING_ITERATOR,
      string: String(iterated),
      index: 0
    });
  // `%StringIteratorPrototype%.next` method
  // https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
  }, function next() {
    var state = getInternalState$2(this);
    var string = state.string;
    var index = state.index;
    var point;
    if (index >= string.length) return { value: undefined, done: true };
    point = charAt(string, index);
    state.index += point.length;
    return { value: point, done: false };
  });

  // `RegExp.prototype.flags` getter implementation
  // https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
  var regexpFlags = function () {
    var that = anObject(this);
    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.dotAll) result += 's';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  var nativeExec = RegExp.prototype.exec;
  // This always refers to the native implementation, because the
  // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
  // which loads this file before patching the method.
  var nativeReplace = String.prototype.replace;

  var patchedExec = nativeExec;

  var UPDATES_LAST_INDEX_WRONG = (function () {
    var re1 = /a/;
    var re2 = /b*/g;
    nativeExec.call(re1, 'a');
    nativeExec.call(re2, 'a');
    return re1.lastIndex !== 0 || re2.lastIndex !== 0;
  })();

  // nonparticipating capturing group, copied from es5-shim's String#split patch.
  var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

  if (PATCH) {
    patchedExec = function exec(str) {
      var re = this;
      var lastIndex, reCopy, match, i;

      if (NPCG_INCLUDED) {
        reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
      }
      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

      match = nativeExec.call(re, str);

      if (UPDATES_LAST_INDEX_WRONG && match) {
        re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
      }
      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
        nativeReplace.call(match[0], reCopy, function () {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }

      return match;
    };
  }

  var regexpExec = patchedExec;

  var SPECIES$3 = wellKnownSymbol('species');

  var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
    // #replace needs built-in support for named groups.
    // #match works fine because it just return the exec results, even if it has
    // a "grops" property.
    var re = /./;
    re.exec = function () {
      var result = [];
      result.groups = { a: '7' };
      return result;
    };
    return ''.replace(re, '$<a>') !== '7';
  });

  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  // Weex JS has frozen built-in prototypes, so use try / catch wrapper
  var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
    var re = /(?:)/;
    var originalExec = re.exec;
    re.exec = function () { return originalExec.apply(this, arguments); };
    var result = 'ab'.split(re);
    return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
  });

  var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
    var SYMBOL = wellKnownSymbol(KEY);

    var DELEGATES_TO_SYMBOL = !fails(function () {
      // String methods call symbol-named RegEp methods
      var O = {};
      O[SYMBOL] = function () { return 7; };
      return ''[KEY](O) != 7;
    });

    var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
      // Symbol-named RegExp methods call .exec
      var execCalled = false;
      var re = /a/;
      re.exec = function () { execCalled = true; return null; };

      if (KEY === 'split') {
        // RegExp[@@split] doesn't call the regex's exec method, but first creates
        // a new one. We need to return the patched regex when creating the new one.
        re.constructor = {};
        re.constructor[SPECIES$3] = function () { return re; };
      }

      re[SYMBOL]('');
      return !execCalled;
    });

    if (
      !DELEGATES_TO_SYMBOL ||
      !DELEGATES_TO_EXEC ||
      (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
      (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
    ) {
      var nativeRegExpMethod = /./[SYMBOL];
      var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
          }
          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
        }
        return { done: false };
      });
      var stringMethod = methods[0];
      var regexMethod = methods[1];

      redefine(String.prototype, KEY, stringMethod);
      redefine(RegExp.prototype, SYMBOL, length == 2
        // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
        // 21.2.5.11 RegExp.prototype[@@split](string, limit)
        ? function (string, arg) { return regexMethod.call(string, this, arg); }
        // 21.2.5.6 RegExp.prototype[@@match](string)
        // 21.2.5.9 RegExp.prototype[@@search](string)
        : function (string) { return regexMethod.call(string, this); }
      );
      if (sham) hide(RegExp.prototype[SYMBOL], 'sham', true);
    }
  };

  var SPECIES$4 = wellKnownSymbol('species');

  // `SpeciesConstructor` abstract operation
  // https://tc39.github.io/ecma262/#sec-speciesconstructor
  var speciesConstructor = function (O, defaultConstructor) {
    var C = anObject(O).constructor;
    var S;
    return C === undefined || (S = anObject(C)[SPECIES$4]) == undefined ? defaultConstructor : aFunction$1(S);
  };

  var charAt$1 = stringMultibyte.charAt;

  // `AdvanceStringIndex` abstract operation
  // https://tc39.github.io/ecma262/#sec-advancestringindex
  var advanceStringIndex = function (S, index, unicode) {
    return index + (unicode ? charAt$1(S, index).length : 1);
  };

  // `RegExpExec` abstract operation
  // https://tc39.github.io/ecma262/#sec-regexpexec
  var regexpExecAbstract = function (R, S) {
    var exec = R.exec;
    if (typeof exec === 'function') {
      var result = exec.call(R, S);
      if (typeof result !== 'object') {
        throw TypeError('RegExp exec method returned something other than an Object or null');
      }
      return result;
    }

    if (classofRaw(R) !== 'RegExp') {
      throw TypeError('RegExp#exec called on incompatible receiver');
    }

    return regexpExec.call(R, S);
  };

  var arrayPush = [].push;
  var min$2 = Math.min;
  var MAX_UINT32 = 0xFFFFFFFF;

  // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
  var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

  // @@split logic
  fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
    var internalSplit;
    if (
      'abbc'.split(/(b)*/)[1] == 'c' ||
      'test'.split(/(?:)/, -1).length != 4 ||
      'ab'.split(/(?:ab)*/).length != 2 ||
      '.'.split(/(.?)(.?)/).length != 4 ||
      '.'.split(/()()/).length > 1 ||
      ''.split(/.?/).length
    ) {
      // based on es5-shim implementation, need to rework it
      internalSplit = function (separator, limit) {
        var string = String(requireObjectCoercible(this));
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (separator === undefined) return [string];
        // If `separator` is not a regex, use native split
        if (!isRegexp(separator)) {
          return nativeSplit.call(string, separator, lim);
        }
        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') +
                    (separator.multiline ? 'm' : '') +
                    (separator.unicode ? 'u' : '') +
                    (separator.sticky ? 'y' : '');
        var lastLastIndex = 0;
        // Make `global` and avoid `lastIndex` issues by working with a copy
        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var match, lastIndex, lastLength;
        while (match = regexpExec.call(separatorCopy, string)) {
          lastIndex = separatorCopy.lastIndex;
          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
            lastLength = match[0].length;
            lastLastIndex = lastIndex;
            if (output.length >= lim) break;
          }
          if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
        }
        if (lastLastIndex === string.length) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));
        return output.length > lim ? output.slice(0, lim) : output;
      };
    // Chakra, V8
    } else if ('0'.split(undefined, 0).length) {
      internalSplit = function (separator, limit) {
        return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
      };
    } else internalSplit = nativeSplit;

    return [
      // `String.prototype.split` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.split
      function split(separator, limit) {
        var O = requireObjectCoercible(this);
        var splitter = separator == undefined ? undefined : separator[SPLIT];
        return splitter !== undefined
          ? splitter.call(separator, O, limit)
          : internalSplit.call(String(O), separator, limit);
      },
      // `RegExp.prototype[@@split]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
      //
      // NOTE: This cannot be properly polyfilled in engines that don't support
      // the 'y' flag.
      function (regexp, limit) {
        var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
        if (res.done) return res.value;

        var rx = anObject(regexp);
        var S = String(this);
        var C = speciesConstructor(rx, RegExp);

        var unicodeMatching = rx.unicode;
        var flags = (rx.ignoreCase ? 'i' : '') +
                    (rx.multiline ? 'm' : '') +
                    (rx.unicode ? 'u' : '') +
                    (SUPPORTS_Y ? 'y' : 'g');

        // ^(? + rx + ) is needed, in combination with some S slicing, to
        // simulate the 'y' flag.
        var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
        var p = 0;
        var q = 0;
        var A = [];
        while (q < S.length) {
          splitter.lastIndex = SUPPORTS_Y ? q : 0;
          var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
          var e;
          if (
            z === null ||
            (e = min$2(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
          ) {
            q = advanceStringIndex(S, q, unicodeMatching);
          } else {
            A.push(S.slice(p, q));
            if (A.length === lim) return A;
            for (var i = 1; i <= z.length - 1; i++) {
              A.push(z[i]);
              if (A.length === lim) return A;
            }
            q = p = e;
          }
        }
        A.push(S.slice(p));
        return A;
      }
    ];
  }, !SUPPORTS_Y);

  // iterable DOM collections
  // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
  var domIterables = {
    CSSRuleList: 0,
    CSSStyleDeclaration: 0,
    CSSValueList: 0,
    ClientRectList: 0,
    DOMRectList: 0,
    DOMStringList: 0,
    DOMTokenList: 1,
    DataTransferItemList: 0,
    FileList: 0,
    HTMLAllCollection: 0,
    HTMLCollection: 0,
    HTMLFormElement: 0,
    HTMLSelectElement: 0,
    MediaList: 0,
    MimeTypeArray: 0,
    NamedNodeMap: 0,
    NodeList: 1,
    PaintRequestList: 0,
    Plugin: 0,
    PluginArray: 0,
    SVGLengthList: 0,
    SVGNumberList: 0,
    SVGPathSegList: 0,
    SVGPointList: 0,
    SVGStringList: 0,
    SVGTransformList: 0,
    SourceBufferList: 0,
    StyleSheetList: 0,
    TextTrackCueList: 0,
    TextTrackList: 0,
    TouchList: 0
  };

  var $forEach$1 = arrayIteration.forEach;


  // `Array.prototype.forEach` method implementation
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
  var arrayForEach = sloppyArrayMethod('forEach') ? function forEach(callbackfn /* , thisArg */) {
    return $forEach$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  } : [].forEach;

  for (var COLLECTION_NAME in domIterables) {
    var Collection = global_1[COLLECTION_NAME];
    var CollectionPrototype = Collection && Collection.prototype;
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
      hide(CollectionPrototype, 'forEach', arrayForEach);
    } catch (error) {
      CollectionPrototype.forEach = arrayForEach;
    }
  }

  var ITERATOR$2 = wellKnownSymbol('iterator');
  var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
  var ArrayValues = es_array_iterator.values;

  for (var COLLECTION_NAME$1 in domIterables) {
    var Collection$1 = global_1[COLLECTION_NAME$1];
    var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
    if (CollectionPrototype$1) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype$1[ITERATOR$2] !== ArrayValues) try {
        hide(CollectionPrototype$1, ITERATOR$2, ArrayValues);
      } catch (error) {
        CollectionPrototype$1[ITERATOR$2] = ArrayValues;
      }
      if (!CollectionPrototype$1[TO_STRING_TAG$3]) hide(CollectionPrototype$1, TO_STRING_TAG$3, COLLECTION_NAME$1);
      if (domIterables[COLLECTION_NAME$1]) for (var METHOD_NAME in es_array_iterator) {
        // some Chrome versions have non-configurable methods on DOMTokenList
        if (CollectionPrototype$1[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
          hide(CollectionPrototype$1, METHOD_NAME, es_array_iterator[METHOD_NAME]);
        } catch (error) {
          CollectionPrototype$1[METHOD_NAME] = es_array_iterator[METHOD_NAME];
        }
      }
    }
  }

  var VirtualScroll =
  /*#__PURE__*/
  function () {
    function VirtualScroll(options) {
      var _this = this;

      _classCallCheck$1(this, VirtualScroll);

      this.rows = options.rows;
      this.scrollEl = options.scrollEl;
      this.contentEl = options.contentEl;
      this.callback = options.callback;
      this.cache = {};
      this.scrollTop = this.scrollEl.scrollTop;
      this.initDOM(this.rows);
      this.scrollEl.scrollTop = this.scrollTop;
      this.lastCluster = 0;

      var onScroll = function onScroll() {
        if (_this.lastCluster !== (_this.lastCluster = _this.getNum())) {
          _this.initDOM(_this.rows);

          _this.callback();
        }
      };

      this.scrollEl.addEventListener('scroll', onScroll, false);

      this.destroy = function () {
        _this.contentEl.innerHtml = '';

        _this.scrollEl.removeEventListener('scroll', onScroll, false);
      };
    }

    _createClass$1(VirtualScroll, [{
      key: "initDOM",
      value: function initDOM(rows) {
        if (typeof this.clusterHeight === 'undefined') {
          this.cache.scrollTop = this.scrollEl.scrollTop;
          this.cache.data = this.contentEl.innerHTML = rows[0] + rows[0] + rows[0];
          this.getRowsHeight(rows);
        }

        var data = this.initData(rows, this.getNum());
        var thisRows = data.rows.join('');
        var dataChanged = this.checkChanges('data', thisRows);
        var topOffsetChanged = this.checkChanges('top', data.topOffset);
        var bottomOffsetChanged = this.checkChanges('bottom', data.bottomOffset);
        var html = [];

        if (dataChanged && topOffsetChanged) {
          if (data.topOffset) {
            html.push(this.getExtra('top', data.topOffset));
          }

          html.push(thisRows);

          if (data.bottomOffset) {
            html.push(this.getExtra('bottom', data.bottomOffset));
          }

          this.contentEl.innerHTML = html.join('');
        } else if (bottomOffsetChanged) {
          this.contentEl.lastChild.style.height = "".concat(data.bottomOffset, "px");
        }
      }
    }, {
      key: "getRowsHeight",
      value: function getRowsHeight() {
        if (typeof this.itemHeight === 'undefined') {
          var nodes = this.contentEl.children;
          var node = nodes[Math.floor(nodes.length / 2)];
          this.itemHeight = node.offsetHeight;
        }

        this.blockHeight = this.itemHeight * Constants.BLOCK_ROWS;
        this.clusterRows = Constants.BLOCK_ROWS * Constants.CLUSTER_BLOCKS;
        this.clusterHeight = this.blockHeight * Constants.CLUSTER_BLOCKS;
      }
    }, {
      key: "getNum",
      value: function getNum() {
        this.scrollTop = this.scrollEl.scrollTop;
        return Math.floor(this.scrollTop / (this.clusterHeight - this.blockHeight)) || 0;
      }
    }, {
      key: "initData",
      value: function initData(rows, num) {
        if (rows.length < Constants.BLOCK_ROWS) {
          return {
            topOffset: 0,
            bottomOffset: 0,
            rowsAbove: 0,
            rows: rows
          };
        }

        var start = Math.max((this.clusterRows - Constants.BLOCK_ROWS) * num, 0);
        var end = start + this.clusterRows;
        var topOffset = Math.max(start * this.itemHeight, 0);
        var bottomOffset = Math.max((rows.length - end) * this.itemHeight, 0);
        var thisRows = [];
        var rowsAbove = start;

        if (topOffset < 1) {
          rowsAbove++;
        }

        for (var i = start; i < end; i++) {
          rows[i] && thisRows.push(rows[i]);
        }

        this.dataStart = start;
        this.dataEnd = end;
        return {
          topOffset: topOffset,
          bottomOffset: bottomOffset,
          rowsAbove: rowsAbove,
          rows: thisRows
        };
      }
    }, {
      key: "checkChanges",
      value: function checkChanges(type, value) {
        var changed = value !== this.cache[type];
        this.cache[type] = value;
        return changed;
      }
    }, {
      key: "getExtra",
      value: function getExtra(className, height) {
        var tag = document.createElement('li');
        tag.className = "virtual-scroll-".concat(className);

        if (height) {
          tag.style.height = "".concat(height, "px");
        }

        return tag.outerHTML;
      }
    }]);

    return VirtualScroll;
  }();

  var max$2 = Math.max;
  var min$3 = Math.min;
  var floor$1 = Math.floor;
  var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
  var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

  var maybeToString = function (it) {
    return it === undefined ? it : String(it);
  };

  // @@replace logic
  fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative) {
    return [
      // `String.prototype.replace` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.replace
      function replace(searchValue, replaceValue) {
        var O = requireObjectCoercible(this);
        var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
        return replacer !== undefined
          ? replacer.call(searchValue, O, replaceValue)
          : nativeReplace.call(String(O), searchValue, replaceValue);
      },
      // `RegExp.prototype[@@replace]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
      function (regexp, replaceValue) {
        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
        if (res.done) return res.value;

        var rx = anObject(regexp);
        var S = String(this);

        var functionalReplace = typeof replaceValue === 'function';
        if (!functionalReplace) replaceValue = String(replaceValue);

        var global = rx.global;
        if (global) {
          var fullUnicode = rx.unicode;
          rx.lastIndex = 0;
        }
        var results = [];
        while (true) {
          var result = regexpExecAbstract(rx, S);
          if (result === null) break;

          results.push(result);
          if (!global) break;

          var matchStr = String(result[0]);
          if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        }

        var accumulatedResult = '';
        var nextSourcePosition = 0;
        for (var i = 0; i < results.length; i++) {
          result = results[i];

          var matched = String(result[0]);
          var position = max$2(min$3(toInteger(result.index), S.length), 0);
          var captures = [];
          // NOTE: This is equivalent to
          //   captures = result.slice(1).map(maybeToString)
          // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
          // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
          // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
          for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
          var namedCaptures = result.groups;
          if (functionalReplace) {
            var replacerArgs = [matched].concat(captures, position, S);
            if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
            var replacement = String(replaceValue.apply(undefined, replacerArgs));
          } else {
            replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
          }
          if (position >= nextSourcePosition) {
            accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
            nextSourcePosition = position + matched.length;
          }
        }
        return accumulatedResult + S.slice(nextSourcePosition);
      }
    ];

    // https://tc39.github.io/ecma262/#sec-getsubstitution
    function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
      var tailPos = position + matched.length;
      var m = captures.length;
      var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
      if (namedCaptures !== undefined) {
        namedCaptures = toObject(namedCaptures);
        symbols = SUBSTITUTION_SYMBOLS;
      }
      return nativeReplace.call(replacement, symbols, function (match, ch) {
        var capture;
        switch (ch.charAt(0)) {
          case '$': return '$';
          case '&': return matched;
          case '`': return str.slice(0, position);
          case "'": return str.slice(tailPos);
          case '<':
            capture = namedCaptures[ch.slice(1, -1)];
            break;
          default: // \d\d?
            var n = +ch;
            if (n === 0) return match;
            if (n > m) {
              var f = floor$1(n / 10);
              if (f === 0) return match;
              if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
              return match;
            }
            capture = captures[n - 1];
        }
        return capture === undefined ? '' : capture;
      });
    }
  });

  var compareObjects = function compareObjects(objectA, objectB, compareLength) {
    var aKeys = Object.keys(objectA);
    var bKeys = Object.keys(objectB);

    if (compareLength && aKeys.length !== bKeys.length) {
      return false;
    }

    for (var _i = 0, _aKeys = aKeys; _i < _aKeys.length; _i++) {
      var key = _aKeys[_i];

      if (bKeys.includes(key) && objectA[key] !== objectB[key]) {
        return false;
      }
    }

    return true;
  };

  var removeDiacritics = function removeDiacritics(str) {
    if (str.normalize) {
      return str.normalize('NFD').replace(/[\u0300-\u036F]/g, '');
    }

    var defaultDiacriticsRemovalMap = [{
      'base': 'A',
      'letters': /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g
    }, {
      'base': 'AA',
      'letters': /[\uA732]/g
    }, {
      'base': 'AE',
      'letters': /[\u00C6\u01FC\u01E2]/g
    }, {
      'base': 'AO',
      'letters': /[\uA734]/g
    }, {
      'base': 'AU',
      'letters': /[\uA736]/g
    }, {
      'base': 'AV',
      'letters': /[\uA738\uA73A]/g
    }, {
      'base': 'AY',
      'letters': /[\uA73C]/g
    }, {
      'base': 'B',
      'letters': /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g
    }, {
      'base': 'C',
      'letters': /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g
    }, {
      'base': 'D',
      'letters': /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g
    }, {
      'base': 'DZ',
      'letters': /[\u01F1\u01C4]/g
    }, {
      'base': 'Dz',
      'letters': /[\u01F2\u01C5]/g
    }, {
      'base': 'E',
      'letters': /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g
    }, {
      'base': 'F',
      'letters': /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g
    }, {
      'base': 'G',
      'letters': /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g
    }, {
      'base': 'H',
      'letters': /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g
    }, {
      'base': 'I',
      'letters': /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g
    }, {
      'base': 'J',
      'letters': /[\u004A\u24BF\uFF2A\u0134\u0248]/g
    }, {
      'base': 'K',
      'letters': /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g
    }, {
      'base': 'L',
      'letters': /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g
    }, {
      'base': 'LJ',
      'letters': /[\u01C7]/g
    }, {
      'base': 'Lj',
      'letters': /[\u01C8]/g
    }, {
      'base': 'M',
      'letters': /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g
    }, {
      'base': 'N',
      'letters': /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g
    }, {
      'base': 'NJ',
      'letters': /[\u01CA]/g
    }, {
      'base': 'Nj',
      'letters': /[\u01CB]/g
    }, {
      'base': 'O',
      'letters': /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g
    }, {
      'base': 'OI',
      'letters': /[\u01A2]/g
    }, {
      'base': 'OO',
      'letters': /[\uA74E]/g
    }, {
      'base': 'OU',
      'letters': /[\u0222]/g
    }, {
      'base': 'P',
      'letters': /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g
    }, {
      'base': 'Q',
      'letters': /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g
    }, {
      'base': 'R',
      'letters': /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g
    }, {
      'base': 'S',
      'letters': /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g
    }, {
      'base': 'T',
      'letters': /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g
    }, {
      'base': 'TZ',
      'letters': /[\uA728]/g
    }, {
      'base': 'U',
      'letters': /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g
    }, {
      'base': 'V',
      'letters': /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g
    }, {
      'base': 'VY',
      'letters': /[\uA760]/g
    }, {
      'base': 'W',
      'letters': /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g
    }, {
      'base': 'X',
      'letters': /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g
    }, {
      'base': 'Y',
      'letters': /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g
    }, {
      'base': 'Z',
      'letters': /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g
    }, {
      'base': 'a',
      'letters': /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g
    }, {
      'base': 'aa',
      'letters': /[\uA733]/g
    }, {
      'base': 'ae',
      'letters': /[\u00E6\u01FD\u01E3]/g
    }, {
      'base': 'ao',
      'letters': /[\uA735]/g
    }, {
      'base': 'au',
      'letters': /[\uA737]/g
    }, {
      'base': 'av',
      'letters': /[\uA739\uA73B]/g
    }, {
      'base': 'ay',
      'letters': /[\uA73D]/g
    }, {
      'base': 'b',
      'letters': /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g
    }, {
      'base': 'c',
      'letters': /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g
    }, {
      'base': 'd',
      'letters': /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g
    }, {
      'base': 'dz',
      'letters': /[\u01F3\u01C6]/g
    }, {
      'base': 'e',
      'letters': /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g
    }, {
      'base': 'f',
      'letters': /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g
    }, {
      'base': 'g',
      'letters': /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g
    }, {
      'base': 'h',
      'letters': /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g
    }, {
      'base': 'hv',
      'letters': /[\u0195]/g
    }, {
      'base': 'i',
      'letters': /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g
    }, {
      'base': 'j',
      'letters': /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g
    }, {
      'base': 'k',
      'letters': /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g
    }, {
      'base': 'l',
      'letters': /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g
    }, {
      'base': 'lj',
      'letters': /[\u01C9]/g
    }, {
      'base': 'm',
      'letters': /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g
    }, {
      'base': 'n',
      'letters': /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g
    }, {
      'base': 'nj',
      'letters': /[\u01CC]/g
    }, {
      'base': 'o',
      'letters': /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g
    }, {
      'base': 'oi',
      'letters': /[\u01A3]/g
    }, {
      'base': 'ou',
      'letters': /[\u0223]/g
    }, {
      'base': 'oo',
      'letters': /[\uA74F]/g
    }, {
      'base': 'p',
      'letters': /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g
    }, {
      'base': 'q',
      'letters': /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g
    }, {
      'base': 'r',
      'letters': /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g
    }, {
      'base': 's',
      'letters': /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g
    }, {
      'base': 't',
      'letters': /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g
    }, {
      'base': 'tz',
      'letters': /[\uA729]/g
    }, {
      'base': 'u',
      'letters': /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g
    }, {
      'base': 'v',
      'letters': /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g
    }, {
      'base': 'vy',
      'letters': /[\uA761]/g
    }, {
      'base': 'w',
      'letters': /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g
    }, {
      'base': 'x',
      'letters': /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g
    }, {
      'base': 'y',
      'letters': /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g
    }, {
      'base': 'z',
      'letters': /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g
    }];
    return defaultDiacriticsRemovalMap.reduce(function (string, _ref) {
      var letters = _ref.letters,
          base = _ref.base;
      return string.replace(letters, base);
    }, str);
  };

  var setDataKeys = function setDataKeys(data) {
    var total = 0;
    data.forEach(function (row, i) {
      if (row.type === 'optgroup') {
        row._key = "group_".concat(i);
        row.visible = typeof row.visible === 'undefined' ? true : row.visible;
        row.children.forEach(function (child, j) {
          child._key = "option_".concat(i, "_").concat(j);
          child.visible = typeof child.visible === 'undefined' ? true : child.visible;
        });
        total += row.children.length;
      } else {
        row._key = "option_".concat(i);
        row.visible = typeof row.visible === 'undefined' ? true : row.visible;
        total += 1;
      }
    });
    return total;
  };

  var findByParam = function findByParam(data, param, value) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var row = _step.value;

        if (row[param] === value || row[param] === +row[param] + '' && +row[param] === value) {
          return row;
        }

        if (row.type === 'optgroup') {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = row.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var child = _step2.value;

              if (child[param] === value || child[param] === +child[param] + '' && +child[param] === value) {
                return child;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };

  var removeUndefined = function removeUndefined(obj) {
    Object.keys(obj).forEach(function (key) {
      return obj[key] === undefined ? delete obj[key] : '';
    });
    return obj;
  };

  var getDocumentClickEvent = function getDocumentClickEvent() {
    var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    id = id || "".concat(+new Date()).concat(~~(Math.random() * 1000000));
    return "click.multiple-select-".concat(id);
  };

  var MultipleSelect =
  /*#__PURE__*/
  function () {
    function MultipleSelect($el, options) {
      _classCallCheck$1(this, MultipleSelect);

      this.$el = $el;
      this.options = $.extend({}, Constants.DEFAULTS, options);
    }

    _createClass$1(MultipleSelect, [{
      key: "init",
      value: function init() {
        this.initLocale();
        this.initContainer();
        this.initData();
        this.initSelected(true);
        this.initFilter();
        this.initDrop();
        this.initView();
        this.options.onAfterCreate();
      }
    }, {
      key: "initLocale",
      value: function initLocale() {
        if (this.options.locale) {
          var locales = $.fn.multipleSelect.locales;
          var parts = this.options.locale.split(/-|_/);
          parts[0] = parts[0].toLowerCase();

          if (parts[1]) {
            parts[1] = parts[1].toUpperCase();
          }

          if (locales[this.options.locale]) {
            $.extend(this.options, locales[this.options.locale]);
          } else if (locales[parts.join('-')]) {
            $.extend(this.options, locales[parts.join('-')]);
          } else if (locales[parts[0]]) {
            $.extend(this.options, locales[parts[0]]);
          }
        }
      }
    }, {
      key: "initContainer",
      value: function initContainer() {
        var _this = this;

        var el = this.$el[0];
        var name = el.getAttribute('name') || this.options.name || ''; // hide select element

        this.$el.hide(); // label element

        this.$label = this.$el.closest('label');

        if (!this.$label.length && this.$el.attr('id')) {
          this.$label = $("label[for=\"".concat(this.$el.attr('id'), "\"]"));
        }

        if (this.$label.find('>input').length) {
          this.$label = null;
        } // single or multiple


        if (typeof this.options.single === 'undefined') {
          this.options.single = el.getAttribute('multiple') === null;
        } // restore class and title from select element


        this.$parent = $("\n      <div class=\"ms-parent ".concat(el.getAttribute('class') || '', "\"\n      title=\"").concat(el.getAttribute('title') || '', "\" />\n    ")); // add placeholder to choice button

        this.options.placeholder = this.options.placeholder || el.getAttribute('placeholder') || '';
        this.tabIndex = el.getAttribute('tabindex');
        var tabIndex = '';

        if (this.tabIndex !== null) {
          this.$el.attr('tabindex', -1);
          tabIndex = this.tabIndex && "tabindex=\"".concat(this.tabIndex, "\"");
        }

        this.$choice = $("\n      <button type=\"button\" class=\"ms-choice\"".concat(tabIndex, ">\n      <span class=\"placeholder\">").concat(this.options.placeholder, "</span>\n      ").concat(this.options.showClear ? '<div class="icon-close"></div>' : '', "\n      <div class=\"icon-caret\"></div>\n      </button>\n    ")); // default position is bottom

        this.$drop = $("<div class=\"ms-drop ".concat(this.options.position, "\" />"));
        this.$close = this.$choice.find('.icon-close');

        if (this.options.dropWidth) {
          this.$drop.css('width', this.options.dropWidth);
        }

        this.$el.after(this.$parent);
        this.$parent.append(this.$choice);
        this.$parent.append(this.$drop);

        if (el.disabled) {
          this.$choice.addClass('disabled');
        }

        this.selectAllName = "data-name=\"selectAll".concat(name, "\"");
        this.selectGroupName = "data-name=\"selectGroup".concat(name, "\"");
        this.selectItemName = "data-name=\"selectItem".concat(name, "\"");

        if (!this.options.keepOpen) {
          var clickEvent = getDocumentClickEvent(this.$el.attr('id'));
          $(document).off(clickEvent).on(clickEvent, function (e) {
            if ($(e.target)[0] === _this.$choice[0] || $(e.target).parents('.ms-choice')[0] === _this.$choice[0]) {
              return;
            }

            if (($(e.target)[0] === _this.$drop[0] || $(e.target).parents('.ms-drop')[0] !== _this.$drop[0] && e.target !== el) && _this.options.isOpen) {
              _this.close();
            }
          });
        }
      }
    }, {
      key: "initData",
      value: function initData() {
        var _this2 = this;

        var data = [];

        if (this.options.data) {
          if (Array.isArray(this.options.data)) {
            this.data = this.options.data.map(function (it) {
              if (typeof it === 'string' || typeof it === 'number') {
                return {
                  text: it,
                  value: it
                };
              }

              return it;
            });
          } else if (_typeof$1(this.options.data) === 'object') {
            for (var _i = 0, _Object$entries = Object.entries(this.options.data); _i < _Object$entries.length; _i++) {
              var _Object$entries$_i = _slicedToArray$2(_Object$entries[_i], 2),
                  value = _Object$entries$_i[0],
                  text = _Object$entries$_i[1];

              data.push({
                value: value,
                text: text
              });
            }

            this.data = data;
          }
        } else {
          $.each(this.$el.children(), function (i, elm) {
            var row = _this2.initRow(i, elm);

            if (row) {
              data.push(_this2.initRow(i, elm));
            }
          });
          this.options.data = data;
          this.data = data;
          this.fromHtml = true;
        }

        this.dataTotal = setDataKeys(this.data);
      }
    }, {
      key: "initRow",
      value: function initRow(i, elm, groupDisabled) {
        var _this3 = this;

        var row = {};
        var $elm = $(elm);

        if ($elm.is('option')) {
          row.type = 'option';
          row.text = this.options.textTemplate($elm);
          row.value = elm.value;
          row.visible = true;
          row.selected = !!elm.selected;
          row.disabled = groupDisabled || elm.disabled;
          row.classes = elm.getAttribute('class') || '';
          row.title = elm.getAttribute('title') || '';

          if ($elm.data('value')) {
            row._value = $elm.data('value'); // value for object
          }

          if (Object.keys($elm.data()).length) {
            row._data = $elm.data();
          }

          return row;
        }

        if ($elm.is('optgroup')) {
          row.type = 'optgroup';
          row.label = this.options.labelTemplate($elm);
          row.visible = true;
          row.selected = !!elm.selected;
          row.disabled = elm.disabled;
          row.children = [];

          if (Object.keys($elm.data()).length) {
            row._data = $elm.data();
          }

          $.each($elm.children(), function (j, elem) {
            row.children.push(_this3.initRow(j, elem, row.disabled));
          });
          return row;
        }

        return null;
      }
    }, {
      key: "initSelected",
      value: function initSelected(ignoreTrigger) {
        var selectedTotal = 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var row = _step.value;

            if (row.type === 'optgroup') {
              var selectedCount = row.children.filter(function (child) {
                return child.selected && !child.disabled && child.visible;
              }).length;
              row.selected = selectedCount && selectedCount === row.children.filter(function (child) {
                return !child.disabled && child.visible;
              }).length;
              selectedTotal += selectedCount;
            } else {
              selectedTotal += row.selected && !row.disabled && row.visible ? 1 : 0;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.allSelected = this.data.filter(function (row) {
          return row.selected && !row.disabled && row.visible;
        }).length === this.data.filter(function (row) {
          return !row.disabled && row.visible;
        }).length;

        if (!ignoreTrigger) {
          if (this.allSelected) {
            this.options.onCheckAll();
          } else if (selectedTotal === 0) {
            this.options.onUncheckAll();
          }
        }
      }
    }, {
      key: "initFilter",
      value: function initFilter() {
        this.filterText = '';

        if (this.options.filter || !this.options.filterByDataLength) {
          return;
        }

        var length = 0;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var option = _step2.value;

            if (option.type === 'optgroup') {
              length += option.children.length;
            } else {
              length += 1;
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        this.options.filter = length > this.options.filterByDataLength;
      }
    }, {
      key: "initDrop",
      value: function initDrop() {
        var _this4 = this;

        this.initList();
        this.update(true);

        if (this.options.isOpen) {
          setTimeout(function () {
            _this4.open();
          }, 50);
        }

        if (this.options.openOnHover) {
          this.$parent.hover(function () {
            _this4.open();
          }, function () {
            _this4.close();
          });
        }
      }
    }, {
      key: "initList",
      value: function initList() {
        var html = [];

        if (this.options.filter) {
          html.push("\n        <div class=\"ms-search\">\n          <input type=\"text\" autocomplete=\"off\" autocorrect=\"off\"\n            autocapitalize=\"off\" spellcheck=\"false\"\n            placeholder=\"".concat(this.options.filterPlaceholder, "\">\n        </div>\n      "));
        }

        html.push('<ul></ul>');
        this.$drop.html(html.join(''));
        this.$ul = this.$drop.find('>ul');
        this.initListItems();
      }
    }, {
      key: "initListItems",
      value: function initListItems() {
        var _this5 = this;

        var rows = this.getListRows();
        var offset = 0;

        if (this.options.selectAll && !this.options.single) {
          offset = -1;
        }

        if (rows.length > Constants.BLOCK_ROWS * Constants.CLUSTER_BLOCKS) {
          if (this.virtualScroll) {
            this.virtualScroll.destroy();
          }

          var dropVisible = this.$drop.is(':visible');

          if (!dropVisible) {
            this.$drop.css('left', -10000).show();
          }

          var updateDataOffset = function updateDataOffset() {
            _this5.updateDataStart = _this5.virtualScroll.dataStart + offset;
            _this5.updateDataEnd = _this5.virtualScroll.dataEnd + offset;

            if (_this5.updateDataStart < 0) {
              _this5.updateDataStart = 0;
            }

            if (_this5.updateDataEnd > _this5.data.length) {
              _this5.updateDataEnd = _this5.data.length;
            }
          };

          this.virtualScroll = new VirtualScroll({
            rows: rows,
            scrollEl: this.$ul[0],
            contentEl: this.$ul[0],
            callback: function callback() {
              updateDataOffset();

              _this5.events();
            }
          });
          updateDataOffset();

          if (!dropVisible) {
            this.$drop.css('left', 0).hide();
          }
        } else {
          this.$ul.html(rows.join(''));
          this.updateDataStart = 0;
          this.updateDataEnd = this.updateData.length;
          this.virtualScroll = null;
        }

        this.events();
      }
    }, {
      key: "getListRows",
      value: function getListRows() {
        var _this6 = this;

        var rows = [];

        if (this.options.selectAll && !this.options.single) {
          rows.push("\n        <li class=\"ms-select-all\">\n        <label>\n        <input type=\"checkbox\" ".concat(this.selectAllName).concat(this.allSelected ? ' checked="checked"' : '', " />\n        <span>").concat(this.options.formatSelectAll(), "</span>\n        </label>\n        </li>\n      "));
        }

        this.updateData = [];
        this.data.forEach(function (row) {
          rows.push.apply(rows, _toConsumableArray$1(_this6.initListItem(row)));
        });
        rows.push("<li class=\"ms-no-results\">".concat(this.options.formatNoMatchesFound(), "</li>"));
        return rows;
      }
    }, {
      key: "initListItem",
      value: function initListItem(row) {
        var _this7 = this;

        var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var title = row.title ? "title=\"".concat(row.title, "\"") : '';
        var multiple = this.options.multiple ? 'multiple' : '';
        var type = this.options.single ? 'radio' : 'checkbox';
        var classes = '';

        if (!row.visible) {
          return [];
        }

        this.updateData.push(row);

        if (this.options.single && !this.options.singleRadio) {
          classes = 'hide-radio ';
        }

        if (row.selected) {
          classes += 'selected ';
        }

        if (row.type === 'optgroup') {
          var _customStyle = this.options.styler(row);

          var _style = _customStyle ? "style=\"".concat(_customStyle, "\"") : '';

          var html = [];
          var group = this.options.hideOptgroupCheckboxes || this.options.single ? "<span ".concat(this.selectGroupName, " data-key=\"").concat(row._key, "\"></span>") : "<input type=\"checkbox\"\n          ".concat(this.selectGroupName, "\n          data-key=\"").concat(row._key, "\"\n          ").concat(row.selected ? ' checked="checked"' : '', "\n          ").concat(row.disabled ? ' disabled="disabled"' : '', "\n        >");

          if (!classes.includes('hide-radio') && (this.options.hideOptgroupCheckboxes || this.options.single)) {
            classes += 'hide-radio ';
          }

          html.push("\n        <li class=\"group ".concat(classes, "\" ").concat(_style, ">\n        <label class=\"optgroup").concat(this.options.single || row.disabled ? ' disabled' : '', "\">\n        ").concat(group).concat(row.label, "\n        </label>\n        </li>\n      "));
          row.children.forEach(function (child) {
            html.push.apply(html, _toConsumableArray$1(_this7.initListItem(child, 1)));
          });
          return html;
        }

        var customStyle = this.options.styler(row);
        var style = customStyle ? "style=\"".concat(customStyle, "\"") : '';
        classes += row.classes || '';

        if (level && this.options.single) {
          classes += "option-level-".concat(level, " ");
        }

        return ["\n      <li class=\"".concat(multiple, " ").concat(classes, "\" ").concat(title, " ").concat(style, ">\n      <label class=\"").concat(row.disabled ? 'disabled' : '', "\">\n      <input type=\"").concat(type, "\"\n        value=\"").concat(row.value, "\"\n        data-key=\"").concat(row._key, "\"\n        ").concat(this.selectItemName, "\n        ").concat(row.selected ? ' checked="checked"' : '', "\n        ").concat(row.disabled ? ' disabled="disabled"' : '', "\n      >\n      <span>").concat(row.text, "</span>\n      </label>\n      </li>\n    ")];
      }
    }, {
      key: "events",
      value: function events() {
        var _this8 = this;

        this.$searchInput = this.$drop.find('.ms-search input');
        this.$selectAll = this.$drop.find("input[".concat(this.selectAllName, "]"));
        this.$selectGroups = this.$drop.find("input[".concat(this.selectGroupName, "],span[").concat(this.selectGroupName, "]"));
        this.$selectItems = this.$drop.find("input[".concat(this.selectItemName, "]:enabled"));
        this.$disableItems = this.$drop.find("input[".concat(this.selectItemName, "]:disabled"));
        this.$noResults = this.$drop.find('.ms-no-results');

        var toggleOpen = function toggleOpen(e) {
          e.preventDefault();

          if ($(e.target).hasClass('icon-close')) {
            return;
          }

          _this8[_this8.options.isOpen ? 'close' : 'open']();
        };

        if (this.$label && this.$label.length) {
          this.$label.off('click').on('click', function (e) {
            if (e.target.nodeName.toLowerCase() !== 'label') {
              return;
            }

            toggleOpen(e);

            if (!_this8.options.filter || !_this8.options.isOpen) {
              _this8.focus();
            }

            e.stopPropagation(); // Causes lost focus otherwise
          });
        }

        this.$choice.off('click').on('click', toggleOpen).off('focus').on('focus', this.options.onFocus).off('blur').on('blur', this.options.onBlur);
        this.$parent.off('keydown').on('keydown', function (e) {
          // esc key
          if (e.which === 27 && !_this8.options.keepOpen) {
            _this8.close();

            _this8.$choice.focus();
          }
        });
        this.$close.off('click').on('click', function (e) {
          e.preventDefault();

          _this8._checkAll(false, true);

          _this8.initSelected(false);

          _this8.updateSelected();

          _this8.update();

          _this8.options.onClear();
        });
        this.$searchInput.off('keydown').on('keydown', function (e) {
          // Ensure shift-tab causes lost focus from filter as with clicking away
          if (e.keyCode === 9 && e.shiftKey) {
            _this8.close();
          }
        }).off('keyup').on('keyup', function (e) {
          // enter or space
          // Avoid selecting/deselecting if no choices made
          if (_this8.options.filterAcceptOnEnter && [13, 32].includes(e.which) && _this8.$searchInput.val()) {
            if (_this8.options.single) {
              var $items = _this8.$selectItems.closest('li').filter(':visible');

              if ($items.length) {
                _this8.setSelects([$items.first().find("input[".concat(_this8.selectItemName, "]")).val()]);
              }
            } else {
              _this8.$selectAll.click();
            }

            _this8.close();

            _this8.focus();

            return;
          }

          _this8.filter();
        });
        this.$selectAll.off('click').on('click', function (e) {
          _this8._checkAll($(e.currentTarget).prop('checked'));
        });
        this.$selectGroups.off('click').on('click', function (e) {
          var $this = $(e.currentTarget);
          var checked = $this.prop('checked');
          var group = findByParam(_this8.data, '_key', $this.data('key'));

          _this8._checkGroup(group, checked);

          _this8.options.onOptgroupClick(removeUndefined({
            label: group.label,
            selected: group.selected,
            data: group._data,
            children: group.children.map(function (child) {
              return removeUndefined({
                text: child.text,
                value: child.value,
                selected: child.selected,
                disabled: child.disabled,
                data: child._data
              });
            })
          }));
        });
        this.$selectItems.off('click').on('click', function (e) {
          var $this = $(e.currentTarget);
          var checked = $this.prop('checked');
          var option = findByParam(_this8.data, '_key', $this.data('key'));

          _this8._check(option, checked);

          _this8.options.onClick(removeUndefined({
            text: option.text,
            value: option.value,
            selected: option.selected,
            data: option._data
          }));

          if (_this8.options.single && _this8.options.isOpen && !_this8.options.keepOpen) {
            _this8.close();
          }
        });
      }
    }, {
      key: "initView",
      value: function initView() {
        var computedWidth;

        if (window.getComputedStyle) {
          computedWidth = window.getComputedStyle(this.$el[0]).width;

          if (computedWidth === 'auto') {
            computedWidth = this.$drop.outerWidth() + 20;
          }
        } else {
          computedWidth = this.$el.outerWidth() + 20;
        }

        this.$parent.css('width', this.options.width || computedWidth);
        this.$el.show().addClass('ms-offscreen');
      }
    }, {
      key: "open",
      value: function open() {
        if (this.$choice.hasClass('disabled')) {
          return;
        }

        this.options.isOpen = true;
        this.$choice.find('>div').addClass('open');
        this.$drop[this.animateMethod('show')](); // fix filter bug: no results show

        this.$selectAll.parent().show();
        this.$noResults.hide(); // Fix #77: 'All selected' when no options

        if (!this.data.length) {
          this.$selectAll.parent().hide();
          this.$noResults.show();
        }

        if (this.options.container) {
          var offset = this.$drop.offset();
          this.$drop.appendTo($(this.options.container));
          this.$drop.offset({
            top: offset.top,
            left: offset.left
          }).css('min-width', 'auto').outerWidth(this.$parent.outerWidth());
        }

        var maxHeight = this.options.maxHeight;

        if (this.options.maxHeightUnit === 'row') {
          maxHeight = this.$drop.find('>ul>li').first().outerHeight() * this.options.maxHeight;
        }

        this.$drop.find('>ul').css('max-height', "".concat(maxHeight, "px"));
        this.$drop.find('.multiple').css('width', "".concat(this.options.multipleWidth, "px"));

        if (this.data.length && this.options.filter) {
          this.$searchInput.val('');
          this.$searchInput.focus();
          this.filter(true);
        }

        this.options.onOpen();
      }
    }, {
      key: "close",
      value: function close() {
        this.options.isOpen = false;
        this.$choice.find('>div').removeClass('open');
        this.$drop[this.animateMethod('hide')]();

        if (this.options.container) {
          this.$parent.append(this.$drop);
          this.$drop.css({
            'top': 'auto',
            'left': 'auto'
          });
        }

        this.options.onClose();
      }
    }, {
      key: "animateMethod",
      value: function animateMethod(method) {
        var methods = {
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
    }, {
      key: "update",
      value: function update(ignoreTrigger) {
        var valueSelects = this.getSelects();
        var textSelects = this.getSelects('text');

        if (this.options.displayValues) {
          textSelects = valueSelects;
        }

        var $span = this.$choice.find('>span');
        var sl = valueSelects.length;
        var html = '';

        if (sl === 0) {
          $span.addClass('placeholder').html(this.options.placeholder);
        } else if (sl < this.options.minimumCountSelected) {
          html = textSelects.join(this.options.displayDelimiter);
        } else if (this.options.formatAllSelected() && sl === this.dataTotal) {
          html = this.options.formatAllSelected();
        } else if (this.options.ellipsis && sl > this.options.minimumCountSelected) {
          html = "".concat(textSelects.slice(0, this.options.minimumCountSelected).join(this.options.displayDelimiter), "...");
        } else if (this.options.formatCountSelected() && sl > this.options.minimumCountSelected) {
          html = this.options.formatCountSelected(sl, this.dataTotal);
        } else {
          html = textSelects.join(this.options.displayDelimiter);
        }

        if (html) {
          $span.removeClass('placeholder').html(html);
        }

        if (this.options.displayTitle) {
          $span.prop('title', this.getSelects('text'));
        } // set selects to select


        this.$el.val(this.getSelects()); // trigger <select> change event

        if (!ignoreTrigger) {
          this.$el.trigger('change');
        }
      }
    }, {
      key: "updateSelected",
      value: function updateSelected() {
        for (var i = this.updateDataStart; i < this.updateDataEnd; i++) {
          var row = this.updateData[i];
          this.$drop.find("input[data-key=".concat(row._key, "]")).prop('checked', row.selected).closest('li').toggleClass('selected', row.selected);
        }

        var noResult = this.data.filter(function (row) {
          return row.visible;
        }).length === 0;

        if (this.$selectAll.length) {
          this.$selectAll.prop('checked', this.allSelected).closest('li').toggle(!noResult);
        }

        this.$noResults.toggle(noResult);

        if (this.virtualScroll) {
          this.virtualScroll.rows = this.getListRows();
        }
      }
    }, {
      key: "getOptions",
      value: function getOptions() {
        // deep copy and remove data
        var options = $.extend({}, this.options);
        delete options.data;
        return $.extend(true, {}, options);
      }
    }, {
      key: "refreshOptions",
      value: function refreshOptions(options) {
        // If the objects are equivalent then avoid the call of destroy / init methods
        if (compareObjects(this.options, options, true)) {
          return;
        }

        this.options = $.extend(this.options, options);
        this.destroy();
        this.init();
      } // value html, or text, default: 'value'

    }, {
      key: "getSelects",
      value: function getSelects() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'value';
        var values = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var row = _step3.value;

            if (row.type === 'optgroup') {
              var selectedChildren = row.children.filter(function (child) {
                return child.selected;
              });

              if (!selectedChildren.length) {
                continue;
              }

              if (type === 'value' || this.options.single) {
                values.push.apply(values, _toConsumableArray$1(selectedChildren.map(function (child) {
                  return type === 'value' ? child._value || child[type] : child[type];
                })));
              } else {
                var value = [];
                value.push('[');
                value.push(row.label);
                value.push(": ".concat(selectedChildren.map(function (child) {
                  return child[type];
                }).join(', ')));
                value.push(']');
                values.push(value.join(''));
              }
            } else if (row.selected) {
              values.push(type === 'value' ? row._value || row[type] : row[type]);
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return values;
      }
    }, {
      key: "setSelects",
      value: function setSelects(values, ignoreTrigger) {
        var hasChanged = false;

        var _setSelects = function _setSelects(rows) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = rows[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var row = _step4.value;
              var selected = values.includes(row._value || row.value);

              if (!selected && row.value === +row.value + '') {
                selected = values.includes(+row.value);
              }

              if (row.selected !== selected) {
                hasChanged = true;
              }

              row.selected = selected;
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        };

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = this.data[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var row = _step5.value;

            if (row.type === 'optgroup') {
              _setSelects(row.children);
            } else {
              _setSelects([row]);
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        if (hasChanged) {
          this.initSelected(ignoreTrigger);
          this.updateSelected();
          this.update(ignoreTrigger);
        }
      }
    }, {
      key: "enable",
      value: function enable() {
        this.$choice.removeClass('disabled');
      }
    }, {
      key: "disable",
      value: function disable() {
        this.$choice.addClass('disabled');
      }
    }, {
      key: "check",
      value: function check(value) {
        var option = findByParam(this.data, 'value', value);

        if (!option) {
          return;
        }

        this._check(option, true);
      }
    }, {
      key: "uncheck",
      value: function uncheck(value) {
        var option = findByParam(this.data, 'value', value);

        if (!option) {
          return;
        }

        this._check(option, false);
      }
    }, {
      key: "_check",
      value: function _check(option, checked) {
        if (this.options.single) {
          this._checkAll(false, true);
        }

        option.selected = checked;
        this.initSelected();
        this.updateSelected();
        this.update();
      }
    }, {
      key: "checkAll",
      value: function checkAll() {
        this._checkAll(true);
      }
    }, {
      key: "uncheckAll",
      value: function uncheckAll() {
        this._checkAll(false);
      }
    }, {
      key: "_checkAll",
      value: function _checkAll(checked, ignoreUpdate) {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = this.data[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var row = _step6.value;

            if (row.type === 'optgroup') {
              this._checkGroup(row, checked, true);
            } else if (!row.disabled && (ignoreUpdate || row.visible)) {
              row.selected = checked;
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }

        if (!ignoreUpdate) {
          this.initSelected();
          this.updateSelected();
          this.update();
        }
      }
    }, {
      key: "_checkGroup",
      value: function _checkGroup(group, checked, ignoreUpdate) {
        group.selected = checked;
        group.children.forEach(function (row) {
          if (!row.disabled && (ignoreUpdate || row.visible)) {
            row.selected = checked;
          }
        });

        if (!ignoreUpdate) {
          this.initSelected();
          this.updateSelected();
          this.update();
        }
      }
    }, {
      key: "checkInvert",
      value: function checkInvert() {
        if (this.options.single) {
          return;
        }

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = this.data[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var row = _step7.value;

            if (row.type === 'optgroup') {
              var _iteratorNormalCompletion8 = true;
              var _didIteratorError8 = false;
              var _iteratorError8 = undefined;

              try {
                for (var _iterator8 = row.children[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                  var child = _step8.value;
                  child.selected = !child.selected;
                }
              } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
                    _iterator8.return();
                  }
                } finally {
                  if (_didIteratorError8) {
                    throw _iteratorError8;
                  }
                }
              }
            } else {
              row.selected = !row.selected;
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        this.initSelected();
        this.updateSelected();
        this.update();
      }
    }, {
      key: "focus",
      value: function focus() {
        this.$choice.focus();
        this.options.onFocus();
      }
    }, {
      key: "blur",
      value: function blur() {
        this.$choice.blur();
        this.options.onBlur();
      }
    }, {
      key: "refresh",
      value: function refresh() {
        this.destroy();
        this.init();
      }
    }, {
      key: "filter",
      value: function filter(ignoreTrigger) {
        var originalText = $.trim(this.$searchInput.val());
        var text = originalText.toLowerCase();

        if (this.filterText === text) {
          return;
        }

        this.filterText = text;
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = this.data[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var row = _step9.value;

            if (row.type === 'optgroup') {
              if (this.options.filterGroup) {
                var visible = this.options.customFilter(removeDiacritics(row.label.toLowerCase()), removeDiacritics(text), row.label, originalText);
                row.visible = visible;
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                  for (var _iterator10 = row.children[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var child = _step10.value;
                    child.visible = visible;
                  }
                } catch (err) {
                  _didIteratorError10 = true;
                  _iteratorError10 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
                      _iterator10.return();
                    }
                  } finally {
                    if (_didIteratorError10) {
                      throw _iteratorError10;
                    }
                  }
                }
              } else {
                var _iteratorNormalCompletion11 = true;
                var _didIteratorError11 = false;
                var _iteratorError11 = undefined;

                try {
                  for (var _iterator11 = row.children[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var _child = _step11.value;
                    _child.visible = this.options.customFilter(removeDiacritics(_child.text.toLowerCase()), removeDiacritics(text), _child.text, originalText);
                  }
                } catch (err) {
                  _didIteratorError11 = true;
                  _iteratorError11 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
                      _iterator11.return();
                    }
                  } finally {
                    if (_didIteratorError11) {
                      throw _iteratorError11;
                    }
                  }
                }

                row.visible = row.children.filter(function (child) {
                  return child.visible;
                }).length > 0;
              }
            } else {
              row.visible = this.options.customFilter(removeDiacritics(row.text.toLowerCase()), removeDiacritics(text), row.text, originalText);
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }

        this.initListItems();
        this.initSelected(ignoreTrigger);
        this.updateSelected();

        if (!ignoreTrigger) {
          this.options.onFilter(text);
        }
      }
    }, {
      key: "destroy",
      value: function destroy() {
        if (!this.$parent) {
          return;
        }

        this.$el.before(this.$parent).removeClass('ms-offscreen');

        if (this.tabIndex !== null) {
          this.$el.attr('tabindex', this.tabIndex);
        }

        this.$parent.remove();

        if (this.fromHtml) {
          delete this.options.data;
          this.fromHtml = false;
        }
      }
    }]);

    return MultipleSelect;
  }();

  $.fn.multipleSelect = function (option) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var value;
    this.each(function (i, el) {
      var $this = $(el);
      var data = $this.data('multipleSelect');
      var options = $.extend({}, $this.data(), _typeof$1(option) === 'object' && option);

      if (!data) {
        data = new MultipleSelect($this, options);
        $this.data('multipleSelect', data);
      }

      if (typeof option === 'string') {
        var _data;

        if ($.inArray(option, Constants.METHODS) < 0) {
          throw new Error("Unknown method: ".concat(option));
        }

        value = (_data = data)[option].apply(_data, args);

        if (option === 'destroy') {
          $this.removeData('multipleSelect');
        }
      } else {
        data.init();
      }
    });
    return typeof value !== 'undefined' ? value : this;
  };

  $.fn.multipleSelect.defaults = Constants.DEFAULTS;
  $.fn.multipleSelect.locales = Constants.LOCALES;
  $.fn.multipleSelect.methods = Constants.METHODS;

  /* eslint-disable node/no-unsupported-features/node-builtins */

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
    //  so convenient to just re-run
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
      '/vendor/multiple-select/dist/multiple-select.css',
      'one-off.css'
    ])
  ]);
  let oldStorage = initialStorage;
  if (!initialStorage) {
    await packCommands({});
    oldStorage = {};
  }

  const options = {
    // any JSON-serializable key/values
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
  ], $$1('body'));

  try {
    init(options);
  } catch (err) { // Get stack trace which Firefox isn't otherwise giving
    console.log('err', err);
    throw err;
  }

  // TEMPLATE UTILITIES

  function rebuildCommandList () {
    while ($$1('#selectNames').firstChild) {
      $$1('#selectNames').firstChild.remove();
    }
    jml({'#': [
      ['option', {value: '', selected: 'selected'}, [_('create_new_command')]],
      ...Object.keys(oldStorage).sort().map((commandName) => {
        return ['option', [commandName]];
      })
    ]}, $$1('#selectNames'));
  }

  /**
  * @param {string[]} optTexts Array of option text
  * @param {string[]} [values] Array of values corresponding to text
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
    const names = typeof sel === 'string' ? $$1(sel) : sel;
    [...names.options].forEach((option) => {
      option.selected = vals.includes(option.value);
    });
    jQuery('#restrict-contexts').multipleSelect('refresh');
  }

  function setSelectOfValue (sel, val) {
    const names = typeof sel === 'string' ? $$1(sel) : sel;
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
          $$1('#' + select.id.replace('-select-', '-input-')).value
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
    $$1('#selectNames').selectedIndex = 0;
    $$1('#executablePath').focus();

    createNewCommand = true;
    currentName = '';
    $$1('#delete').hidden = true;

    $$1('#command-name').value = '';
    $$1('#command-name').defaultValue = '';

    $$1('#executables').selectedIndex = 0;
    $$1('#executablePath').value = '';
    $$1('#command-preview').value = '';

    jQuery('#restrict-contexts').multipleSelect('checkAll');

    $$1('#own-context').value = '';
    $$1('#text-only').checked = false;

    ['args', 'urls', 'files'].forEach((inputType) => {
      inputs[inputType].setTextValues();
    });
    // Todo: Uncomment if we get directory selection working
    //  (e.g., Ajax+Node.js local file browser)
    // inputs.files.setValues('directory');
    // Todo: make a way for the select to be populated through the ExpandableInputs API
    addOptions('temps');
    resetChanges();
  }

  function populateFormWithStorage (name, inputs) {
    createNewCommand = false;
    currentName = name;
    $$1('#delete').hidden = false;

    $$1('#command-name').value = name;
    $$1('#command-name').defaultValue = name;

    // Todo: Could make class for each type of storage (select,
    //   input, etc.) and just invoke its destroy() or create() methods
    //   here, rather than adding specific details in every place needed.
    const oldStorageForName = oldStorage[currentName];
    const {executablePath, restrictContexts, ownContext, textOnly} = oldStorageForName;
    setSelectOfValue('#executables', executablePath);
    $$1('#executablePath').value = executablePath;

    setMultipleSelectOfValue('#restrict-contexts', restrictContexts);
    $$1('#own-context').value = ownContext;
    $$1('#text-only').checked = textOnly;

    ['args', 'urls', 'files'].forEach((inputType) => {
      inputs[inputType].setTextValues(oldStorageForName[inputType]);
    });
    // Todo: Uncomment if we get directory selection working
    //  (e.g., Ajax+Node.js local file browser)
    // inputs.files.setValues('directory', oldStorageForName.dirs);
    // Todo: make a way for the select to be populated through the ExpandableInputs API
    addOptions('temps');
    $$1('#main').$setPreview();
    resetChanges();
  }

  function fileOrDirResult ({path, selector}) {
    if (path) {
      $$1(selector).value = path;
    }
  }

  async function finished (result) {
    $$1('#processExecuted').style.display = 'block';
    if (!$$1('#keepOpen').checked) {
      await buttonClick({close: true});
    } else {
      $$1('#command-results').value = result[0];
      setTimeout(() => {
        $$1('#processExecuted').style.display = 'none';
      }, 2000);
    }
  }
  /*
  function setOS (os) {
    setSelectOfValue('#export-os-type', os);
  }
  */
  function getSuffixForOS () {
    const type = $$1('#export-os-type').value,
      osMap = {
        winnt: '.bat'
      };
    if ({}.hasOwnProperty.call(osMap, type)) {
      return osMap[type];
    }
    return '';
  }

  async function filePick (data) {
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
        executablePath: $$1('#executablePath').value,
        args: inputs.args.getTextValues(),
        files: inputs.files.getTextValues(),
        urls: inputs.urls.getTextValues(),
        textOnly: $$1('#text-only').checked,
        // Todo: Uncomment if we get directory selection working
        //  (e.g., Ajax+Node.js local file browser)
        // dirs: inputs.files.getValues('directory'),
        restrictContexts: [...$$1('#restrict-contexts').selectedOptions].map(({value}) => {
          return value;
        }),
        ownContext: $$1('#own-context').value
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
    $$1('#loading').remove();
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
            $$1('#command-preview').value = executablePath + ' ' + args.join(' ');
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
            $$1('#names').hidden = !$$1('#names').hidden;
            const showNames = $$1('#showNames');
            if (!$$1('#names').hidden) {
              $$1('#main').className = 'open';
              showNames.firstChild.replaceWith(_('lt'));
            } else {
              $$1('#main').className = 'closed';
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
            //  "validationMessage" property
            if (!this.checkValidity() &&
              (cl.contains('execute') || cl.contains('save') ||
                cl.contains('batch_export'))
            ) {
              e.stopPropagation(); // Don't allow it to get to submit
            }
          }, Boolean('capturing')]
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
                ['label', {for: 'executablePath'}, [_('Path_of_executable')]]
              ]],
              ['td', [
                ['select', {id: 'executables', class: 'ei-exe-presets', dataset: {
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
          ['div', {class: 'export'}, [
            ['label', [
              _('os_format_for_batch_export'),
              nbsp.repeat(2),
              ['select', {id: 'export-os-type'}, buildOptions(
                ['Linux', 'Mac', 'Windows'],
                ['linux', 'mac', 'win']
              )]
              // Also could add values (and i18n and localize text) for
              //   these auto-lower-cased values from
              //     https://developer.mozilla.org/en-US/docs/OS_TARGET:
              //   'android', 'SunOS', 'FreeBSD', 'OpenBSD',
              //   'NetBSD', 'OS2', 'BeOS', 'IRIX64', 'AIX',
              //   'HP-UX', 'DragonFly', 'skyos', 'riscos', 'NTO', 'OSF1'
            ]],
            ['br'],
            ['button', {class: 'batch_export'}, [_('Export_to_batch')]]
          ]]
          */
        ]]
      ]],
      ['br'],
      ['div', {class: 'execution'}, [
        ['label', [
          ['input', {type: 'checkbox', id: 'keepOpen'}],
          ' ',
          _('keep_dialog_open')
        ]],
        ['br'],
        ['button', {class: 'passData save'}, [_('Save')]],
        ['button', {
          id: 'delete',
          class: 'passData delete',
          hidden: true
        }, [_('Delete')]],
        // ['br'],
        ['button', {class: 'passData execute'}, [_('Execute_on_current_page')]],
        ['button', {id: 'cancel'}, [_('Cancel')]]
      ]]
    ], $$1('body'));

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
    //    (can still call from body listener)
    $$1('body').addEventListener('click', async function (e) {
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
          $$1(sel).value = value;
        }
      } else if (cl.contains('ei-files-picker') || cl.contains('ei-exe-picker')) {
        sel = dataset.ei_sel;
        // Use .select() on input type=file picker?
        await filePick({
          dirPath: $$1(sel).value,
          selector: sel,
          defaultExtension: dataset.ei_defaultExtension || undefined,
          selectFolder: ($$1(dataset.ei_directory) && $$1(dataset.ei_directory).checked)
            ? true
            : undefined
        });
      } else if (cl.contains('ei-files-revealButton') || cl.contains('ei-exe-revealButton')) {
        sel = dataset.ei_sel;
        selVal = sel && $$1(sel).value;
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
          download: ($$1('#command-name').value || 'command') + getSuffixForOS(),
          href: uri
        }, ['hidden'], $$1('body'));
        a.click();
        e.preventDefault(); // Avoid blanking out
      } else if (cl.contains('passData')) {
        const name = $$1('#command-name').value;
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
                $$1('#selectNames').selectedIndex = 0;
                nameChanged = false;
                // Return so that user has some way of correcting or
                //   avoiding (without renaming)
                return;
              }
            }
            // Proceed with rename, so first delete old value
            //  (todo: could ensure first added)
            await buttonClick({
              name: $$1('#command-name').defaultValue,
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

    $$1('body').addEventListener('input', async function ({target}) {
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
      const datalist = $$1('#' + data.listID);
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
    //     populate and reduce when not used
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
