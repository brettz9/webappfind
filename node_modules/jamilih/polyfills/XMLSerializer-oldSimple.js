// Todo: replace with require polyfill plugin
if (!window.XMLSerializer) {
    window.XMLSerializer = function () {};
    window.XMLSerializer.prototype.serializeToString = function (dom) {
        if (dom.xml) {
            return dom.xml;
        }
        var x = document.createElement('_');
        x.appendChild(dom.cloneNode(true));
        return x.innerHTML;
        return x.innerHTML.replace('><', '>' + dom.innerHTML + '<'). // <BR class=abc> or <DIV></DIV>
            replace(/^<(\w*)\s.*>([\s\S]*<\/\1>)?/, function (n0, n1, n2) {
                return '<' + n1.toLowerCase() + ' xmlns="http://www.w3.org/1999/xhtml">';
            }).replace(/<\/(\w*)>$/, function (n0, n1) {
            return '</' + n1.toLowerCase() + '>';
        });
    };
}
