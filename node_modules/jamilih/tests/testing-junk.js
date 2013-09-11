Element.prototype.style = function () {
    return {cssText: 'eee'};
};
Object.defineProperty(document.getElementById('DOMChildrenMustBeInArray').style, 'cssText', { // the containing cssRule
    enumerable: false, // Should be true, but IE won't allow (and we only need the polyfill for IE? If not, repeat after putting this in a try-catch)
    get: function () { // read-only
        alert('abc');
    }
});

alert(document.getElementById('DOMChildrenMustBeInArray').style.cssText);

throw '';

//alert(new XMLSerializer().serializeToString(document.createElement('div')))
try {
var hrEl = jml('hr', {style: 'font-weight:bold !important;background: url("Punctuat)(io\\"a\\"n\' :;-!") !important;'});
alert(hrEl.style.getPropertyCSSValue('getPropertyCSSValue'))
}catch(e) {
alert(e);
}
//alert(jml('hr', {"font-weight":'bold'}).style.getPropertyValue('font-weight'))
//document.getElementsByTagName('body')[0].style.cssText += ';color:yellow';
//alert(hrEl.getAttribute('style'))
//throw '';