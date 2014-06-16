NOTE: This project is currently incomplete and the API is not yet stable.

# Rationale
Provide round-trippable JSON/JavaScript serialization as with JsonML,
but with all items at a given array level being the same type of item
(unless marked with a deeper level of nesting) and with a slightly more
template-friendly capacity to inline insert fragments or child nodes
(e.g., as by function return).

# Rules (summary)

1. String element name (or array of 1-4)
2. Optional object with attributes
3. Optional array of text nodes, DOM nodes, and child elements
4. Optionally repeat for siblings

# Rules (detailed)

1. Last element always the parent (put null if don't want but want to
return) unless only attributes and children (no other elements)
2. Individual elements (DOM elements or sequences of
string[/object/array]) get added to parent first-in, first-added
3. Arrays indicate children (containing nodes, text (to become text
nodes) or arrays encapsulating another Jamilih element structure)
4. Strings indicate elements
5. Non-DOM-element objects indicate attribute-value pairs
6. null always indicates a place-holder (only needed in place of
parent for last argument if want fragment returned)
7. First item must be an element name (to create an element structure)
8. Always returns first created element, unless null as last argument,
in which case, it returns a fragment of all added elements

# Examples

Simple element...

```javascript
var input = jml('input');
```

Simple element with attributes...

```javascript
var input = jml('input', {type:'password', id:'my_pass'});
```

Simple element with just child elements...

```javascript
var div = jml('div', [
    ['p', ['no attributes on the div']]
]);
```

Simple element with attributes and child elements...

```javascript
var div = jml('div', {'class': 'myClass'}, [
    ['p', ['Some inner text']],
    ['p', ['another child paragraph']]
]);
```

Simple element with attributes, child elements, and text nodes...

```javascript
var div = jml('div', {'class': 'myClass'}, [
    'text1',
    ['p', ['Some inner text']],
    'text3'
]);
```

DOM attachment...

```javascript
var simpleAttachToParent = jml('hr', document.body);
```

Returning first element among siblings when appending them to a
DOM element (API unstable)...

```javascript
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
```

Returning element siblings as an array (API unstable)...

```javascript
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
```

Inclusion of regular DOM elements...

```javascript
var div = jml(
    'div', [
        $('#DOMChildrenMustBeInArray')[0]
    ],
    $('#anotherElementToAddToParent')[0],
    $('#yetAnotherSiblingToAddToParent')[0],
    parent
);
```

Document fragments addable anywhere within child elements...

```javascript
jml('div', [
    'text0',
    {'#': ['text1', ['span', ['inner text']], 'text2']},
    'text3'
])
```

Event attachment...

```javascript
var input = jml('input', {
    // Contains events to be added via addEventListener or
	//   attachEvent where available
    $on: {
        click: [function () {
            alert('worked1');
        }
    }, true] // Capturing
}});
```

```javascript
var input2 = jml('input', {
    style: 'position:absolute; left: -1000px;',
    $on: {
        click: function () {
            alert('worked2');
        },
        focus: [function () {
            alert('worked3');
        }, true]
    }
}, document.body);
```

Comments, processing instructions, entities, decimal and hexadecimal
character references, CDATA sections...

```javascript
var div = jml('div', [
    ['!', 'a comment'],
    ['?', 'customPI', 'a processing instruction'],
    ['&', 'copy'],
    ['#', '1234'],
    ['#x', 'ab3'],
    ['![', '&test <CDATA> content']
]);
```

Namespace definitions (default or prefixed)...

```javascript
jml('abc', {xmlns:'def'})
```

```javascript
jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi'}})
```

```javascript
jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}})
```

Not yet implemented...

1. Namespaced elements and attributes
2. Ordered sequences of attributes (or namespace declarations) -
necessary for perfect round-tripping (e.g., for diffs) given that
object iteration order is not reliable across browser

# Possible todos
1. Implement a method building JML by string rather than DOM but create
DOM (including [XPath](https://github.com/goto100/xpath/blob/master/xpath.js))
interfaces for direct manipulation.
1. Allow configuration
	1. Allow auto-namespacing of class and/or dataset keys

# Naming

I originally named the project JML (for JavaScript or Json Markup
Language) and have still kept the abbreviation when used as a global
in a browser (and in the filename and examples), but as other projects
have used the name or similar ones, I am renaming the project to
"Jamilih" for the Arabic word meaning "Beauty". It is named in honor
of the Arabic name of my family's newly-born daughter.

# Design goals

1. Be as succinct as possible while being sufficiently functional; avoid
null place-holders, etc.
2. Allow reliable iteration order (i.e., use arrays over objects except
where order is not needed).
3. Allow for use as a template language, with the opportunity for
function calls to easily add elements, attributes, child content, or
fragments without needing to retool the entire structure or write
complex functions to handle the merging.
4. Use a syntax with a minimum of constructs not familiar to XML/HTML
users (if any), allowing for near immediate adoption by any web developer.
5. Work with XML or HTML and optionally support faithful rebuilding of an
entire XML document
6. Ability to write libraries which support regular XML needs like XPath
expressions (which are more appropriate for HTML than those targeted
for open-ended JSON, such as JSONPath). Avoid need to convert to
DOM where possible (and even implement DOM interfaces for it in a
modular fashion).
7. Work with JSON, but also allow flexible usage within full JavaScript,
such as to allow dropping in DOM nodes or optional DOM mode for
attachment of events (but with a preference or option toward internal
string concatenation for speed).
8. Be intuitive so that one is not likely to be confused about whether
one is looking at element siblings, children, text, etc.

# Related work

The only work which comes close to meeting these goals as far as I
have been able to find is JsonML. JsonML even does a better job of
goal #1 in terms of succinctness than my proposal for Jamilih
(except that Jamilih can represent empty elements more succinctly). However,
for goal #3, I believe Jamilih is slightly more flexible for regular usage
in templates, and to my personal sensibilities, more clear in goal #8
(and with a plan for goal #5 and #7?).
