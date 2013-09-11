/*globals Element, Attr*/
(function () {
    'use strict';

    // Note: here's a sample bad rule not handled here: font-weight:bold !important;background: url('Punctuat)(io\\'a\\'n\' :;-!') !important;
    // IE8 also drops the "!important" in this case: background: url('abc') !important;
    var _ruleMatch = new RegExp('([\\w\\-]+)\\s*:\\s*([^\\(\\);\\s]+(?:\\([^\\)]*\\))?)\\s*(!\\s*important)?(?:\\s*;\\s*|$)', 'gi'),
        _getAttr = Element.prototype.getAttribute;

    function _toUpperCase (n0) {
        return n0.charAt(1).toUpperCase();
    }
    /**
    * @static
    * @param {RegExp} regex The regular expression to clone and optionally onto which to copy new values
    * @param {String} [newFlags] A string combining any of 'g', 'i', 'm', or 'y'. Polymorphism would allow newFlags to be an array, but would need an Array.prototype.indexOf polyfill
    * @param {Number} [newLastIndex] A different lastIndex to apply to the source RegExp. Defaults to the source's RegExp's lastIndex
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
    function _exec (regex, str, cb, obj) {
        var matches, ret;
        if (!regex.global) { // Avoid infinite loops
            regex = _mixinRegex(regex, 'g');
        }
        while ((matches = regex.exec(str)) !== null) {
            cb.apply(obj || null, matches);
        }
    }

    /**
    *
    * @static
    */
    function _execIntoArray (regex, str, cb, obj, a) {
        var matches, ret;
        if (!regex.global) { // Avoid infinite loops
            regex = _mixinRegex(regex, 'g');
        }
        a = a || [];
        while ((matches = regex.exec(str)) !== null) {
            a.push(cb.apply(obj || null, matches));
        }
        return a;
    }

    /**
    * IE does allow us to override this DOM method, so we standardize behavior to lower-case the properties.
    * For some reason, as of IE 9 (including 10), a semi-colon will be inserted at the end of the rules even if not present,
    *  though this behavior is not present in Mozilla. IE8 has its own issue in that it always omits the semicolon at the
    *  end of rules.
    * Since IE has its own sorting, and Mozilla sorts in document order, and since we apparently have no way to
    * get IE's style attribute information in document order, we override getAttribute when applied to "style" so as to
    * always insert a semi-colon at the end (as in IE > 8 but not in Mozilla), as well as sort the properties into alphabetical
    * order
    * Assumes the style attribute is using well-formed CSS!
    * Unfortunately, we cannot override CSSStyleDeclaration.prototype.cssText nor Element.prototype.style to fix the
    *  upper-casing of property names there since it is already defined on the element itself in IE8.
    *  We could override the property on individual elements, but polyfilling each element (and potentially added
    *  element) would be highly inefficient. Another approach would be to wrap the elements when obtained through other
    *  APIs, e.g., with document methods such as getElementById(), within a polyfill like https://gist.github.com/brettz9/6093483
    * @todo Use a genuine CSS parser or confirm regex is indeed covering all possible cases?
    * @todo Handle IE8's dropping of bad rules or the likes of "background"'s !important?
    */
    Element.prototype.getAttribute = function (attrName) {
        var rules, getAttrResult = _getAttr.apply(this, arguments);
        if (!getAttrResult) {
            return getAttrResult;
        }
        if (attrName === 'style') {
            return _execIntoArray(_ruleMatch, getAttrResult, function (n0, property, propertyValue, important) {
                return property.toLowerCase() + ': ' + propertyValue + (important ? ' !important' : '') + ';'; // Important may be undefined in Firefox instead of an empty string, so we need to default it here (and Firefox oddly adds a space after the exclamation mark when the element's style.cssText is used to set the attribute).
            }).sort().join(' ');
        }
        /* dataset polyfill unfinished
        if (attrName.match(/^data-/i) && this.dataset) { // In case a dataset polyfill exists and was used to set the dataset earlier but it has not yet been able to modify the attributes as it can only do so when done through the dataset property
            // Todo: Validate first (e.g., XML name without uppercase letters)
            return this.dataset[attrName.slice(5).replace(/-[a-z]?/g, _toUpperCase)];
        }
        */
        return getAttrResult;
    };

    // IE lets us override these (at least getters?)--so to be safe, we have to do it here too...
    // Todo: There may still be some obscure (and probably deprecated) ways to get or set attribute info that we have not covered below
    /*
    Object.defineProperty(Element.prototype, 'attributes', {
        enumerable: false,
        get: function () { // We need to check whether to add any missing dataset attributes
            // We need a way to work with the original NamedNodeMap. NamedNodeMap() appears to work with an argument, but not sure what to supply; adding attribute nodes did not work; there is no original Element.prototype.attributes to store, so the best we might do is parse outerHTML for attributes (which itself may need a polyfill)! (Or, as per above with the Element.style, we could wrap elements whenever exposed to us from an API, e.g., document.getElementById(), by polyfilling document, as in
            https://gist.github.com/brettz9/6093483 )
        }
    });
    */

    // We override for the sake of ensuring we are getting the proper standardized "style" property object
    // Attr.nodeValue (as with Attr.nodeName) is now deprecated as of DOM4 as Attr no longer inherits from Node, but we can safely use name and value
    Object.defineProperty(Attr.prototype, 'value', {
        enumerable: false,
        get: function () {
            // Get the overridden getAttribute() result
            return this.ownerElement.getAttribute(this.name);
        }/*,
        set: function (val) {
            // Get the overridden setAttribute() result
            return this.ownerElement.setAttribute(this.name, val);
        }*/
    });

}());
