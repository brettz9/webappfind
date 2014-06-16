            lowerCaseCSSPropertiesForIE = function (n0, n1) {
                return n1.toLowerCase() + ' ';
            }
                                    if (tagAttributes[i].name === 'style') {
                                        // This doesn't work as we need to sort the rules in a predictable order as IE varies them
                                        /*
                                        // Streamline serialization due to IE's upper-casing, stripping semi-colons and fixing post-property whitespace to a single space
                                        string += ' style="' +
                                            entify(tagAttributes[i].value.
                                                replace(new RegExp('([\\w\\-]*:)\\s*', 'g'), lowerCaseCSSPropertiesForIE).
                                                replace(/;$/, '') // also for IE
                                            ) + '"';
                                        */

                                    /*
                                    // This works but we instead choose the alternative approach which is to call a streamlining polyfill of node.getAttribute (for 'style') and thereby avoid a need for the CSSStyleDeclaration polyfilling
                                    string += ' style="' + Array.from(node.style).sort().map(function (style) {
                                        // This approach not supported in IE (without a CSSStyleDeclaration polyfill); we can't get IE
                                        //   to polyfill the style object to auto-return lower-cased values, however, since it is already defined
                                        //   and IE does not allow redefining an existing method
                                        var priority = node.style.getPropertyPriority(style);
                                        return style.toLowerCase() + ': ' + node.style.getPropertyValue(style) + (priority ? ' !' + priority : '');
                                    }).join('; ') + '"';
                                    */
                                    // Either of these works now that Attr.prototype has a style-harmonizing value getter as well as a getAttribute harmonizer
                                    // node.getAttribute('style') +