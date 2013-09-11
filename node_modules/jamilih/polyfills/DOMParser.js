// Todo: allow IE to use polyfill for DOMImplementation.prototype.createDocument, etc.
// Todo: replace with require polyfill plugin
/*
 * DOMParser HTML extension
 * 2012-09-04
 *
 * By Eli Grey, http://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*! @source https://gist.github.com/1129031 */
/*global document, DOMParser, ActiveXObject*/

(function() {
    'use strict';

    // Brett modified to add object when not present at all (for IE8 + ActiveXObject)
    window.DOMParser = window.DOMParser || function () {};

    var DOMParser_proto = window.DOMParser.prototype,
        real_parseFromString = DOMParser_proto.parseFromString;

    // Firefox/Opera/IE throw errors on unsupported types
    try {
        // WebKit returns null on unsupported types
        if ((new window.DOMParser()).parseFromString('', 'text/html')) {
            // text/html parsing is natively supported
            return;
        }
    } catch (ex) {}

    DOMParser_proto.parseFromString = function(markup, type) {
        var doc;
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            doc = document.implementation.createHTMLDocument('');
            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                doc.documentElement.innerHTML = markup;
            }
            else {
                doc.body.innerHTML = markup;
            }
            return doc;
        }
        if (real_parseFromString) {
            return real_parseFromString.apply(this, arguments);
        }
        doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async = false;
        doc.loadXML(markup);
        return doc;
    };
}());
