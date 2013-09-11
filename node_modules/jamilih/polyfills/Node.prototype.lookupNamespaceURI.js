/*globals Document, HTMLDocument */
// Todo: Still need to confirm working accurately (but namespace features not yet explicitly supported anyhow)

(function () {
'use strict';
var Doc = typeof Document !== 'undefined' ? Document : HTMLDocument; // Support HTMLDocument if Document not present // If Document is present, is this method also present?

addLookupNamespaceURI(Doc);
addLookupNamespaceURI(Element);

function addLookupNamespaceURI (type) {
    if (!type.prototype.lookupNamespaceURI) {
        type.prototype.lookupNamespaceURI = lookupNamespaceURI;
    }
    function lookupNamespaceURI (prefix) {
        return lookupNamespaceURIHelper(this, prefix);
    }
    function lookupNamespaceURIHelper (node, prefix) { // adapted directly from http://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespaceURIAlgo
        var i, att,
            htmlMode = document.contentType, // Mozilla only
            xmlnsPattern = /^xmlns:(.*)$/;

        switch (node.nodeType) {
            case 1: // ELEMENT_NODE (could also just test for Node.ELEMENT_NODE, etc., if supported in all browsers)
                if (node.namespaceURI != null && node.prefix === prefix)  {
                    // Note: prefix could be "null" in the case we are looking for default namespace
                    return node.namespaceURI;
                }
                if (node.attributes.length) {
                    for (i = 0; i < node.attributes.length; i++) {
                        att = node.attributes[i];
                        if (xmlnsPattern.test(att.name) && xmlnsPattern.exec(att.name)[1] === prefix) {
                            if (att.value) {
                                return att.value;
                            }
                            return null; // unknown
                        }
                        if (att.name === 'xmlns' && prefix == null) {
                            // default namespace
                            if (att.value) {
                                return att.value;
                            }
                            return null; // unknown
                        }
                    }
                }
                if (node.parentNode && node.parentNode.nodeType !== 9) {
                    // EntityReferences may have to be skipped to get to it
                    return lookupNamespaceURIHelper(node.parentNode, prefix);
                }
                //return null;
                return 'http://www.w3.org/1999/xhtml';
                // return null;
            case 9: // DOCUMENT_NODE
                return lookupNamespaceURIHelper(node.documentElement, prefix);
            case 6: // ENTITY_NODE
            case 12: // NOTATION_NODE
            case 10: // DOCUMENT_TYPE_NODE
            case 11: // DOCUMENT_FRAGMENT_NODE
                return null; // unknown
            case 2: // ATTRIBUTE_NODE
                if (node.ownerElement) {
                    return lookupNamespaceURIHelper(node.ownerElement, prefix);
                }
                return null; // unknown
            default:
                // TEXT_NODE (3), CDATA_SECTION_NODE (4), ENTITY_REFERENCE_NODE (5),
                // PROCESSING_INSTRUCTION_NODE (7), COMMENT_NODE (8)
                if (node.parentNode) {
                // EntityReferences may have to be skipped to get to it
                    return lookupNamespaceURIHelper(node.parentNode, prefix);
                }
                return null; // unknown
        }
    };
}

}());