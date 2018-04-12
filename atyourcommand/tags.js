/**
These may need tweaking or moving out of NormalTags
Note that img.src and a.href include base URI
 @todo Allow video and audio to be checked for <source> tags
 @todo Do more thorough review of all other tags
 @todo Include SVG elements
*/
export default [
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
    ['plugins', [['object', {selector: 'object:not([hidden])', prop: 'data'}], ['object (hidden)', {selector: 'object[hidden)', prop: 'data'}], ['applet', {selector: 'applet:not([hidden])', prop: 'code'}], ['applet (hidden)', {selector: 'applet[hidden]', prop: 'code'}], ['embed', {selector: 'embed:not([hidden])', prop: 'src'}], ['embed (hidden)', {selector: 'embed[hidden]', prop: 'src'}], ['param', {hidden: true, prop: 'value'}]]],
    ['empty_but_visible', ['br', 'hr', 'spacer', 'wbr']],
    ['hidden', [['DOCTYPE', {hidden: true, type: 'special'}], ['comments', {hidden: true, type: 'special'}], ['processing instructions', {hidden: true, type: 'special'}], ['CDATA', {type: 'special'}], 'html', ['head', {hidden: true}], ['meta', {hidden: true}], ['title', {hidden: true, textContents: true}], ['base', {hidden: true}], ['style', {hidden: true, textContents: true}], ['link', {prop: 'href', hidden: true}], ['datalist', {hidden: true}], ['track', {hidden: true}], ['basefont', {hidden: true}]]],
    ['templates', [['content', {hidden: true}], ['decorator', {hidden: true}], ['element', {hidden: true}], ['shadow', {hidden: true}], ['template', {hidden: true}]]],
    ['scripting', [['script', {prop: 'src', hidden: true, textContents: true}], ['noscript', {hidden: 'feature-present'}]]]
];
