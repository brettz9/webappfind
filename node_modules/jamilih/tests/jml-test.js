/*globals jml, assert, XMLSerializer, Event*/
/*
Todos:
0. Confirm working cross-browser (all browsers); fix IE8 with dataset; remove IE8 processing instruction hack?
0. Add test cases for properties: innerHTML, selected, checked, value, htmlFor, for
0. When CDATA XML-check added, add check for CDATA section in XML
0. Fix bug with IE 10 (but not IE 8) when testing $on events (race condition)
*/
// Note: we always end styles in the tests with a semi-colon, as our standardizing Element.prototype.getAttribute() polyfill used internally will always add a semi-colon, but even modern browsers do not do this (nor are they required to do so) without the harmonizing polyfill (but to harmonize, such an approach is necessary since IE8 always drops the semi-colon with no apparent way to recover whether it was written with or without it); even though our polyfill could handle either case, by adding a semicolon at the end of even the last rule, we are at least ensuring the tests will remain valid in modern browsers regardless of whether the polyfill is present or not; we really should do the same in alphabetizing our properties as well, since our polyfill handles that (since IE has its own order not the same as document order or alphabetical), but modern browsers (at least Firefox) follow document order.

(function () {
'use strict';

// HELPERS
var $ = function (sel) {
        return document.querySelectorAll(sel);
    },
    isIE = window.navigator.appName === 'Microsoft Internet Explorer';

// BEGIN TESTS

var br = document.createElement('br');
br.className = 'a>bc';

assert.matchesXMLString(
    jml('input'),
    '<input xmlns="http://www.w3.org/1999/xhtml" />'
);

assert.matchesXMLString(
    jml('input', {type:'password', id: 'my_pass'}),
    '<input xmlns="http://www.w3.org/1999/xhtml" id="my_pass" type="password" />'
);

assert.matchesXMLString(
    jml('div', [
        ['p', ['no attributes on the div']]
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml"><p>no attributes on the div</p></div>'
);

assert.matchesXMLString(
    jml('div', {'class': 'myClass'}, [
        ['p', ['Some inner text']],
        ['p', ['another child paragraph']]
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml" class="myClass"><p>Some inner text</p><p>another child paragraph</p></div>'
);

assert.matchesXMLString(
    jml('div', {'class': 'myClass'}, [
        'text1',
        ['p', ['Some inner text']],
        'text3'
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml" class="myClass">text1<p>Some inner text</p>text3</div>'
);

if (!document.body) {
    document.body = document.getElementsByTagName('body')[0];
}
var simpleAttachToParent = jml('hr', document.body);

assert.matchesXMLStringOnElement(
    document.getElementsByTagName('body')[0],
    '<hr xmlns="http://www.w3.org/1999/xhtml" />'
);

var table = jml('table', {style: 'position:absolute; left: -1000px;'}, document.body);
var firstTr = jml('tr', [
        ['td', ['row 1 cell 1']],
        ['td', ['row 1 cell 2']]
    ],
    'tr', {className: 'anotherRowSibling'}, [
        ['td', ['row 2 cell 1']],
        ['td', ['row 2 cell 2']]
    ],
    table
);

assert.matchesXMLStringWithinElement(
    table,
    '<tr xmlns="http://www.w3.org/1999/xhtml"><td>row 1 cell 1</td><td>row 1 cell 2</td></tr><tr xmlns="http://www.w3.org/1999/xhtml" class="anotherRowSibling"><td>row 2 cell 1</td><td>row 2 cell 2</td></tr>'
);

var table = jml('table', {style: 'position:absolute; left: -1000px;'}, document.body); // Rebuild
var trsFragment = jml('tr', [
        ['td', ['row 1 cell 1']],
        ['td', ['row 1 cell 2']]
    ],
    'tr', {className: 'anotherRowSibling'}, [
        ['td', ['row 2 cell 1']],
        ['td', ['row 2 cell 2']]
    ],
    null
);

assert.matches(
    new XMLSerializer().serializeToString(trsFragment.childNodes[0]) +
    new XMLSerializer().serializeToString(trsFragment.childNodes[1]),
    '<tr xmlns="http://www.w3.org/1999/xhtml"><td>row 1 cell 1</td><td>row 1 cell 2</td></tr><tr xmlns="http://www.w3.org/1999/xhtml" class="anotherRowSibling"><td>row 2 cell 1</td><td>row 2 cell 2</td></tr>'
);

var parent = document.body;
var div = jml(
    'div', {style: 'position:absolute    !important; left:   -1000px;'}, [
        $('#DOMChildrenMustBeInArray')[0]
    ],
    $('#anotherElementToAddToParent')[0],
    $('#yetAnotherSiblingToAddToParent')[0],
    parent
);
assert.matchesXMLString(
    div,
    '<div xmlns="http://www.w3.org/1999/xhtml" style="left: -1000px; position: absolute !important;"><div id="DOMChildrenMustBeInArray" style="display: none;">test1</div></div>'
    // '<div xmlns="http://www.w3.org/1999/xhtml" style="position: absolute; left: -1000px;"><div id="DOMChildrenMustBeInArray" style="display:none;">test1</div></div><div id="anotherElementToAddToParent" style="display:none;">test2</div><div id="yetAnotherSiblingToAddToParent" style="display:none;">test3</div>'
);
//throw '';

assert.matchesXMLString(
    jml('div', [
        'text0',
        {'#': ['text1', ['span', ['inner text']], 'text2']},
        'text3'
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml">text0text1<span>inner text</span>text2text3</div>'
);

// Allow the following form (fragment INSTEAD of child array rather than the fragment as the only argument of a child array)? If so, add to README as well.
/*
assert.matchesXMLString(
    jml('div',
        {'#': ['text1', ['span', ['inner text']], 'text2']}
    ),
    '<div xmlns="http://www.w3.org/1999/xhtml">text1<span>inner text</span>text2</div>'
);
*/

assert.matchesXMLString(
    jml('div', {dataset: {'abcDefGh': 'fff', 'jkl-mno-pq': 'ggg'}}),
    '<div xmlns="http://www.w3.org/1999/xhtml" data-abc-def-gh="fff" data-jkl-mno-pq="ggg"></div>'
);

var str,
    input = jml('input', {
        type: 'button',
        style: 'position:absolute; left: -1000px;',
        $on: {click: [function () {
            str = 'worked1';
        }, true]}
    }, document.body);
input.click(); // IE won't activate unless the above element is appended to the DOM

assert.matches(str, 'worked1');

var input2 = jml('input', {
    style: 'position:absolute; left: -1000px;',
    $on: {
        click: function () {
            str = 'worked3';
        },
        change: [function () {
            str = 'worked2';
        }, true]
    }
}, document.body); // For focus (or select) event to work, we need to append to the document

if (input2.fireEvent) {
    input2.fireEvent('onchange');
}
else {
    var event = new Event('change');
    input2.dispatchEvent(event);
}
assert.matches(str, 'worked2');

input2.click();
assert.matches(str, 'worked3');


assert.matchesXMLString(
    jml('div', [
        ['!', 'a comment'],
        ['?', 'customPI', 'a processing instruction'],
        ['&', 'copy'],
        ['#', '1234'],
        ['#x', 'ab3'],
        ['![', '&test <CDATA> content']
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml"><!--a comment--' +
    '><' +
    // Any way to overcome the IE problem with pseudo-processing instructions?
    (isIE ? '!--' : '') +
    '?customPI a processing instruction?' +
    (isIE ? '--' : '') +
    '>\u00A9\u04D2\u0AB3&amp;test &lt;CDATA&gt; content</div>'
);

assert.matches(
    jml('abc', {xmlns:'def'}).namespaceURI,
    'def'
);

assert.matchesXMLString(
    jml('abc', {z: 3, xmlns: {'prefix3': 'zzz', 'prefix1': 'def', 'prefix2': 'ghi'}, b: 7, a: 6}),
    '<abc xmlns="http://www.w3.org/1999/xhtml" xmlns:prefix1="def" xmlns:prefix2="ghi" xmlns:prefix3="zzz" a="6" b="7" z="3" />'
);

assert.matchesXMLString(
    jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}}),
    '<abc xmlns="newdefault" xmlns:prefix1="def" xmlns:prefix2="ghi" />'
);

assert.matches(
    jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}}).namespaceURI,
    'newdefault'
);
/*
// lookupNamespaceURI(prefix) is not working in Mozilla, so we test this way
assert.matches(
    jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi'}}, [
        {$: {prefix2: ['prefixedElement']}}
    ]).firstChild.namespaceURI,
    ''
);
*/

assert.matchesXMLString(
    jml("ul", [
        [
            "li",
                { "style" : "color:red;" },
                ["First Item"],
            "li",
                {
                    "title" : "Some hover text.",
                    "style" : "color:green;"
                },
                ["Second Item"],
            "li",
                [
                    ["span",
                        {
                            "class" : "Remove-Me",
                            "style" : "font-weight:bold;"
                        },
                        ["Not Filtered"]
                    ],
                    " Item"
                ],
            "li",
                [
                    ["a",
                        {
                            "href" : "#NewWindow"
                        },
                        ["Special Link"]
                    ]
                ],
            null
        ]
    ], document.body),
    '<ul xmlns="http://www.w3.org/1999/xhtml"><li style="color: red;">First Item</li><li style="color: green;" title="Some hover text.">Second Item</li><li><span class="Remove-Me" style="font-weight: bold;">Not Filtered</span> Item</li><li><a href="#NewWindow">Special Link</a></li></ul>'
);

assert.matchesXMLString(
    jml('style', {id: 'myStyle'}, ['p.test {color:red;}'], document.body),
    '<style xmlns="http://www.w3.org/1999/xhtml" id="myStyle">p.test {color:red;}</style>'
);

jml('p', {'class': 'test'}, ['test'], document.body);

assert.matchesXMLString(
    jml('script', {'class': 'test'}, ['alert("hello!");'], document.body),
    '<script xmlns="http://www.w3.org/1999/xhtml" class="test">alert("hello!");</script>'
);

}());
