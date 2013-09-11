/*globals CSSStyleDeclaration, DOMException*/
/**
* The only properties still part of the standard spec on CSSStyleDeclaration for IE < 9 (i.e., IE's IHTMLStyle2) are: 
* 1. cssText
* 2. (Any explicitly added) styles
* 3. The following which are apparently always present even when not explicitly set: textDecorationBlink, textDecorationNone, textDecorationOverline, textDecorationLineThrough, textDecorationUnderline, posLeft, posBottom, posWidth, posTop, posHeight, posRight, accelerator
* The only methods (or properties) on the IE < 9 version of CSSStyleDeclaration or its prototype (at least enumerable ones) are: setAttribute, getAttribute, removeAttribute, setExpression, getExpression, removeExpression (not working), and toString.
* Given a lack of access per these available methods, the parentRule property would not be easy to polyfill (see parentRule below).
* Mozilla also has getPropertyCSSValue for its version of window.computedStyle(), but CSSStyleDeclaration's is not cross-browser nor part of the latest CSSOM spec: http://dev.w3.org/csswg/cssom/
* Unfortunately, we cannot override CSSStyleDeclaration.prototype.cssText (nor Element.prototype.style) to fix the
*  upper-casing of property names there since it is already defined in IE8 and IE8 does not allow overriding here.
*  IE does allow us to override the property on individual elements, but polyfilling each element (and potentially added 
*  element) would be highly inefficient.
* It is possible, however, to polyfill Element.prototype.getAttribute() to harmonize at least in that context (and the latest DOM spec does not appear to require or disallow any particular serialization of the attribute value).
* @requires polyfill: Object.defineProperty
* @requires polyfill: DOMException
* @todo Use a genuine CSS parser or confirm regex is indeed covering all possible cases?
* @todo Handle IE8's dropping of bad rules or the likes of "background"'s !important?
*/
if (!CSSStyleDeclaration.prototype.getPropertyValue) {
    (function () {
        'use strict';

        // Note: here's a sample bad rule not handled here: font-weight:bold !important;background: url('Punctuat)(io\\'a\\'n\' :;-!') !important;
        // IE8 also drops the "!important" in this case: background: url('abc') !important;
        var _ruleMatch = new RegExp('([\\w\\-]+)\\s*:\\s*([^\\(\\);\\s]+(?:\\([^\\)]*\\))?)\\s*(!\\s*important)?(?:\\s*;\\s*|$)', 'gi');

        function _notSupportedError () {
            throw DOMException && DOMException.create ?
                DOMException.create(9) :
                // If the (nonstandard) polyfill plugin-helper is not loaded (e.g., to reduce overhead and/or modifying a global's property), we'll throw our own light DOMException
                {message: 'NOT_SUPPORTED_ERR: DOM Exception 9', code: 9};
        }

        /**
        * @static
        * @param {RegExp} regex The regular expression to clone and optionally onto which to copy new values
        * @param {String} [newFlags] A string combining any of 'g', 'i', 'm', or 'y'. Polymorphism would allow newFlags to be an array, but would need an Array.prototype.indexOf polyfill
        * @param {Number} [newLastIndex] A different lastIndex to apply from the source RegExp. Defaults to the source's RegExp's lastIndex
        * @returns {RegExp}
        */
        function _mixinRegex (regex, newFlags, newLastIndex) {
            newLastIndex = newLastIndex === undefined ? regex.lastIndex : newLastIndex;
            newFlags = newFlags || '';
            regex = new RegExp(
                regex.source,
                (newFlags.indexOf('g') > -1 ? 'g' : regex.global ? 'g' : '') +
                    (newFlags.indexOf('i') > -1 ? 'i' : regex.ignoreCase ? 'i' : '') +
                    (newFlags.indexOf('m') > -1 ? 'm' : regex.multiline ? 'm' : '') +
                    (newFlags.indexOf('y') > -1 ? 'y' : regex.sticky ? 'y' : '') // Non-standard but harmless if already being used
            );
            regex.lastIndex = newLastIndex;
            return regex;
        }

        /**
        *
        * @static
        */
        function _execExitOnMatch (regex, str, cb, obj, retExclusionValue, unmatchedValue) {
            var matches, ret;
            if (!regex.global) { // Avoid infinite loops
                regex = _mixinRegex(regex, 'g');
            }
            while ((matches = regex.exec(str)) !== null) {
                ret = cb.apply(obj || null, matches);
                if (ret !== retExclusionValue) {
                    return ret;
                }
            }
            return unmatchedValue;
        }

        /**
        *
        * @static
        */
        function _execExitOnMatchWithCount (regex, str, cb, obj, retExclusionValue) {
            var ret, i = 0;
            _execExitOnMatch(regex, str, function () {
                i++;
                if (cb) {
                    ret = cb.apply(obj || null, [i].concat([].slice.call(arguments)));
                    if (ret !== retExclusionValue) {
                        return ret;
                    }
                }
            });
            return i;
        }

        /**
        *
        * @static
        */
        function _execCount (regex, str, cb, obj, retExclusionValue) {
            var matches, ret, i = 0;

            if (!regex.global) { // Avoid infinite loops
                regex = _mixinRegex(regex, 'g');
            }

            while ((matches = regex.exec(str)) !== null) {
                i++;
                if (cb) {
                    ret = cb.apply(obj || null, matches);
                    if (ret !== retExclusionValue) {
                        return ret;
                    }
                }
            }
            return i;
        }

        CSSStyleDeclaration.prototype.getPropertyValue = function (prop) {
            if (!arguments.length) {
                throw new TypeError('Not enough arguments to CSSStyleDeclaration.getPropertyValue');
            }
            return this.getAttribute(String(prop));
        };
        CSSStyleDeclaration.prototype.setProperty = function (prop1, prop2) {
            if (arguments.length < 2) {
                throw new TypeError('Not enough arguments to CSSStyleDeclaration.setProperty');
            }
            return this.setAttribute(String(prop1), String(prop2));
        };
        CSSStyleDeclaration.prototype.removeProperty = function (prop) {
            if (!arguments.length) {
                throw new TypeError('Not enough arguments to CSSStyleDeclaration.removeProperty');
            }
            return this.removeAttribute(String(prop));
        };
        Object.defineProperty(CSSStyleDeclaration.prototype, 'length', {
            enumerable: false, // Should be true, but IE won't allow (and we only need the polyfill for IE? If not, repeat after putting this in a try-catch)
            get: function () { // read-only
                return _execCount(_ruleMatch, this.cssText);
            }
        });
        CSSStyleDeclaration.prototype.item = function (index) {
            if (!arguments.length) {
                throw new TypeError('Not enough arguments to CSSStyleDeclaration.item');
            }
            var idx = index.valueOf();
            return _execExitOnMatchWithCount(_ruleMatch, this.cssText, function (i, n0) {
                if (i === idx) {
                    return n0;
                }
            }) || '';
        };
        CSSStyleDeclaration.prototype.getPropertyPriority = function (propToMatch) {
            if (!arguments.length) {
                throw new TypeError('Not enough arguments to CSSStyleDeclaration.getPropertyPriority');
            }
            // The addition of "\\)" toward the beginning is to prevent a match within parentheses
            // This should work since it should grab ALL rules (though invalid ones might in rare cases throw things off)
            return _execExitOnMatch(_ruleMatch, this.cssText, function (n0, property, propertyValue, important) {
                if (property.toLowerCase() === String(propToMatch).toLowerCase() && important) {
                    return 'important';
                }
            }) || '';
        };
        /*
        Commenting out as probably shouldn't be present here at all
        // getPropertyCSSValue from Mozilla's window.computedStyle CSSStyleDeclaration's is not cross-browser nor part of the latest CSSOM spec: http://dev.w3.org/csswg/cssom/
        CSSStyleDeclaration.prototype.getPropertyCSSValue = function (prop) {
            _notSupportedError();
        };
        */
        // Todo: Might do by introspecting on IE's non-standard
        // document.styleSheets[idx].cssText, but one would need to match
        // it with the specific child rule (or rather, the child rule's style
        // property (CSSRuleStyleDeclaration))
        Object.defineProperty(CSSStyleDeclaration.prototype, 'parentRule', { // the containing cssRule
            enumerable: false, // Should be true, but IE won't allow (and we only need the polyfill for IE? If not, repeat after putting this in a try-catch)
            get: function () { // read-only
                _notSupportedError();
            }
        });
    }());
}
