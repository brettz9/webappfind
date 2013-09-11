/*globals DOMImplementation, ActiveXObject */
// Todo: Use within DOMParser

(function () {
'use strict';
var DOMImplementation;
if (DOMImplementation === undefined || !DOMImplementation.prototype.createDocument) {
    DOMImplementation = DOMImplementation || function () {};
    var i, docObj, docObjType,
        docObjs = [
            'MSXML6.DOMDocument', 'MSXML5.DOMDocument', 'MSXML4.DOMDocument',
            'MSXML3.DOMDocument', 'MSXML2.DOMDocument.5.0', 'MSXML2.DOMDocument.4.0',
            'MSXML2.DOMDocument.3.0', 'MSXML2.DOMDocument', 'MSXML.DomDocument',
            'Microsoft.XmlDom'
        ],
        dol = docObjs.length;

    for (i=0; i < dol; i++) {
        try {
            docObj = new ActiveXObject(docObjs[i]);
            docObjType = docObjs[i]; // Set this after ActiveXObject to ensure only set if no errors thrown
            break;
        }
        catch (e) {
        }
    }

    /**
    * This polyfill implementation does not provide any support for doctype, nor does it wrap the resulting
    * document so as to support all current DOM methods and properties
    */
    DOMImplementation.prototype.createDocument = function (namespace, qualifiedName, doctype) {
        if (doctype) {
            throw 'This is not a complete polyfill for ' +
                            'DOMImplementation.prototype.createDocument.';
        }
        if (!docObjType) {
            throw 'Could not create a DOM document object';
        }
        var pos, prefix,
            prefixedNs = '',
            doc = new ActiveXObject(docObjType);

        if (qualifiedName) {
             pos = qualifiedName.indexOf(':');
            if (pos > -1) {
                prefix = qualifiedName.slice(0, pos);
                prefixedNs = ' xmlns:' + prefix + '="' + namespace + '"';
            }
            else if (namespace) {
                prefixedNs = ' xmlns="' + namespace + '"';
            }
            doc.loadXML('<' + qualifiedName + prefixedNs + '/>');
        }
        return doc;
    };

    if (!document.implementation.createDocument) { // IE 7
        document.implementation = new DOMImplementation();
    }

}

}());
