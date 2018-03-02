- LOOK AT demos-samples BRANCH for deleted info!!!

## Possible "Demos" todos

1. Make scrollbars easier to use in CodeMirror demos
1. Utilize https://github.com/brettz9/requirejs-codemirror in CodeMirror demos for cleaner HTML
1. Demos ought to use cookie-using full screen option for HTML and SVG
1. Get HTML CodeMirror to use closetag, html5complete, matchTags (in addition to JS ones if mixed mode can support), use the preview option?; http://codemirror.net/demo/widget.html for line bars in linting (html, css, javascript)? linting for HTML? (JSLint can do some); ensure JSLint (and CSSLint?) applied to mixed HTML
1. JS enhancement: CodeMirror tern support? can this work or be made to work with JSDoc?
1. Use CodeMirror diffs/merge add-ons if version-control trigger types supported
1. Use runmode for getting code syntax highlighting within CKEditor HTML (e.g., for doing blog posts): http://codemirror.net/demo/runmode.html and for a button to copy-HTML-(+css with styles inlined?)-to-clipboard in each of the html/javascript/css/svg/etc. modes
1. Add CodeMirror search/replace?
1. Tweak change CSS autocomplete in CodeMirror to support color/background-color, support CSS lint options
1. Cookie to hold JSHint options (or CSS lint options) and for remembering XML "schemaInfo"
1. XML dialect demo with schema for CodeMirror xmlautocomplete (also a JSON schema for checking JSON dialects if not autocomplete as well?)
1. Images/canvas: http://www.picozu.com/editor/ ? Animated GIFs?
1. Animated SVG?
1. Audio: http://plucked.de/ and https://github.com/plucked/html5-audio-editor ?
1. Video - popcorn?
1. Music notations  - http://www.vexflow.com/
1. MIDI, etc.
1. Better integration of CodeMirror/CKEditor, using full (mixed HTML) features of latest CodeMirror
1. Update my regex support in CodeMirror for regex type and for JS overlay: http://codemirror.net/1/contrib/regex/index.html
1. CKEditor support for popup or inline SVGEdit and SVGEdit support for CKEditor foreign objects (via foreignObject extension?)
1. Add CodeMirror to SVG Edit XML view
1. Sticky app
    1. See https://gist.github.com/brettz9/8687257
    1. power-user support for form controls like checkboxes (underlying events currently supported better in Chrome than in Firefox), paperclip links, etc.
    1. Modify WebAppFind to support display of independent data files (for multiple stickies in this case); or don't only associate a file path with individual URLs (file: or http:), but also allow associations with tab groups or bookmark folders so that if saving a new StickyBrains/CKEditor/word-processing file, it will save to a folder where one's ideas are already grouped
    1. Offer grid-like edit ability using SVG Edit with HTML controls like checkboxes within foreignObject
1. Create demo supporting docx format (rather than requiring export to HTML for Word docs)
1. Demonstrate approach of allowing data files for download (so can store them anywhere)--if not AYW approach for namespaced shared browser access--as well as data files chosen from File selector (and save over such a file if within the protocol and user permits)
1. Ability to build [JHTML](http://brettz9.github.com/jhtml) with autocomplete (usable for saving as JSON or saving as HTML) once spec finalized (once &lt;i> approach used)
1. Integrate HTML/SVG (and then others) with [Together.js](https://togetherjs.com/) to allow peer-to-peer collaboration on one's local files
1. Add http://pagedown.googlecode.com/hg/demo/browser/demo.html buttons to Markdown editor?
1. "Todo" webapp demo
1. CoffeeScript demo
1. Modify the OCR demo to support detection (by WebAppFind-injected URL params) of various image formats, SVG, and as per the Ocrad demo, drawing on a canvas which could in turn be saved to disk as an image or exported as a text file (or even [HTML-to](http://robert.ocallahan.org/2011/11/drawing-dom-content-to-canvas.html)[-canvas](http://people.mozilla.org/~roc/rendering-HTML-elements-to-canvas.html)?) images to OCR; also modify to allow clicks/keypress on arrow buttons to browse the PDF page-by-page
1. PDF demo; might use https://github.com/MrRio/jsPDF (see http://parall.ax/products/jspdf with HTML renderer demo) for writing, integrated into CodeMirror or even CKEditor if modified to support generation of the right format; if the same HTML format could be generated and accepted by the likes of [pdf2htmlEX](https://github.com/coolwanglu/pdf2htmlEX/) and jsPDF, there might be some round-tripping potential.
1. Get CKeditor to allow WYSIWYG tables to be sortable for sake of CSV demo? Create view-only demo (i.e., just build table and insert)
1. Web macro-script program for use with the web (including possibly AsYouWish), esp. for text processing (allowing XPath/CSS selectors or raw text searches, testing for content or replacing)
1. Make especially the text and HTML editor demos extensible via postMessage from add-on site
to editor which allows for introspection of the JavaScript to store for later evaluation and then will
put into its own localStorage as an add-on. Could make the demo post the add-on origin site (and possibly code) back to the server (if not indicated as known within client code) and allow these to be discoverable by other users (though allow opting out of such reporting for privacy reasons).
1. [Ocrad](http://antimatter15.github.io/ocrad.js/demo.html) for text OCR export of an image (once export mode supported)
1. SVG OpenType Font editor (adapt https://github.com/edf825/SVG-OpenType-Utils ? See https://wiki.mozilla.org/SVGOpenTypeFonts )
1. Blockly for arbitrary JavaScript:
    1. Object literals
    1. Variables (arrays or objects like functions, etc.) with right side for property access (static (can be detected for pull-down) or dynamic)
    1. `new` (with or w/o needing function definition)
        `new a()[new b()]`
        won't normally add new directly within property (and can't within static property)
    1. invocation (w/o needing function definition)
1. Email/chat client which stores data locally (and optionally only locally); good open source options to adapt? Tie in together.js with chat (as in whiteboards) or even to write collaborative emails
1. Do a concept for browsing or editing the file contents of a zip using the likes of http://stuk.github.io/jszip/ or those mentioned at http://stackoverflow.com/questions/2095697/unzip-files-using-javascript
1. Since WebAppFind relies on files downloaded to the user's desktop, demonstrate with the HTML5 "download" attribute how sites might deliver a data file that the user could then place and call (and optionally also supplying a `filetypes.json` file). Also demonstrate (once functionality is complete), the downloading of a remote document file and subsequent optional PUT request back to the server to save it there (and AsYouWish requesting to save multiple files at once in a particular directory or the zip example above).
1. Demo plug-in utilizing WebAppFind to pass in data files (from desktop or cross-domain)
1. Desktop file to desktop app demo (using `filetypes.json`)?
1. Demo of same-domain, CORS, or AsYouWish client checking `filetypes.json` on a server to determine how to serve? (as opposed to WebAppFind)
1. Demo of server detecting its own `filetypes.json` (see possible todo above)
1. Give option for demos like txt to add `\r` back to `\r\n`
1. Utilize https://github.com/brettz9/octokit.js to allow HTML, SVG, etc. demos to be pushed directly to a Github repo (no universal REST Git API?); could also use with AsYouWish and command line to update a local repo as well (and use cdn.rawgit.com for public
sharing of content).
1. Demo WebAppFind usage with http://kb.mozillazine.org/View_source.editor.external and http://kb.mozillazine.org/View_source.editor.path
1. Demo WebAppFind usage with external editing editor for textareas using [It's All Text! add-on](https://addons.mozilla.org/en-US/firefox/addon/its-all-text/) ([repo](https://github.com/docwhat/itsalltext/)); or adapt to allow optional embedding of web app in place in iframe?
1. Demo use of [Speech Synthesis](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#tts-section) with an HTML or text file (see [HTML5Rocks](http://updates.html5rocks.com/2014/01/Web-apps-that-talk---Introduction-to-the-Speech-Synthesis-API)) and [Voice recognition](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#speechreco-section) from an audio file. Also allow voice recognition as feature in normal text/HTML demos.
1. Demo to use SendTo webappdir functionality to make a zip within the passed path (using [JSZip](https://github.com/Stuk/jszip)) from right-click (would require no local files besides WebAppFind/AsYouWish and the SendTo batch file). Also ensure demos with files and folders together.
1. Adapt the webappfind.js utility class to reduce demo code (and allow better forward compatibility with any API changes).
