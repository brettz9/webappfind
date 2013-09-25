# webappfind

Allows double-click or "Open with..." right-click on "view" or "edit" executable files on one's desktop (currently, executables are for Windows only) to be sent to Firefox (via command line arguments) which are intercepted by a Firefox add-on which checks for an optional filetypes.json file within the same directory as the right-clicked file to determine more precise handling. Based on what is chosen/found and on user preferences, a handler web application will be sought to open the file of the designated type (including generic or custom types) as well as allow saves to be made back to the file, if the "edit" type was chosen and a suitable handler found.

Unlike a more generic solution, such as with a Firefox add-on or [AsYouWish](https://github.com/brettz9/asyouwish/)-enabled site, *webappfind* minimizes security and privacy risks by only allowing files designated in the above manner to be available to the relevant web application.

# Possible future API changes
1. Change filetypes.json to .filetypes.json or at least support the latter for those not wishing to distract users or let them mess things up.
1. Possible changes to parameters passed to registered protocol handlers and/or default handlers (if any, as may only be passed through postMessage or some other means)
    1. Change what is passed within URL? method, filetype, path? or just pass through postMessage? Bookmarkability vs. clean API?

# Higher priority todos planned

1. Create tests with using registerProtocolHandler (also for JS/JSON/mytype)
1. Command line argument to hard-code a specific URL for opening (optionally looking for fallbacks if the supplied one is a protocol but not found)
1. Arbitrary command line args to pass on to webapps
1. Support hard-coding to transmit file paths regardless of prefs?
1. Submit to AMO, Bower, etc.
1. Rewrite C++ exe's as batch scripts
    1. Auto-generate these batch scripts for users (though we can supply the ones not using hard-coded URLs) via our Firefox add-on based on their supplying:
        1. Method (view, edit, etc.) for opening files via webappfind
        1. Optional "hidden" flag (in conjunction with, or only from, AsYouWish?) to embed a hidden DOM window script (use for batch-script-like functionality)
            1. Potentially privileged via AsYouWish, and aware of file path, could, e.g., create 10 copies of a supplied file name in the same directory or some other pipeline
            1. Allow args to webappfind to avoid adding a window, e.g., for a type to handling .jsbatch files to cause a them to be launched with privileges (via AYW? though better to avoid need for any HTML--just JS) in a hidden window (or manage files to run on a schedule; integrate with a Windows task scheduler in case not open?), so work like AYW but without a footprint (but without working each restart as with "add-on sites"); may still be useful with other privs, e.g., to get (send to network) and save file contents, and if asking for privs, will prompt dialog (e.g., to read a file and then use privs--though this would be redundant, perhaps in this mode we can always pass the real path so it adds value, e.g., if script wants to do something in same directory); see also todos in ExecuteBuilder for more on
            command-line-like approach
        1. An optional, hard-coded web app URL (to circumvent the normal detection procedures and always open with a given web app)
        1. Option for any web app to open by default in full-screen mode
        1. An optional icon, so as to distinguish in task bar, etc. (making shortcuts via command line: http://ss64.com/nt/shortcut.html )
        1. Whether to auto-create a new profile just for this combination of options and a -no-remote call to allow executable-like behavior (separate icon instance in task bar though not icon)
        1. Another browser path if other browsers ever support
1. Executable Creator (skeleton at https://builder.addons.mozilla.org/package/204099/latest/ )
1. Disable further save attempts with bad ID supplied
1. Unregister command line handler, etc. on add-on uninstall
1. Complete [ExecuteBuilder](https://builder.addons.mozilla.org/package/204099/latest/)

# Possible future todos

1. Command line flag additions:
    1. 
1. Integrate functionality into https://github.com/brettz9/filebrowser-enhanced
1. When [AsYouWish](https://github.com/brettz9/asyouwish/) is in use, allow path-reading as long as site is AYW-approved and the page is registered for the protocol--so one can bookmark a path and always load it or load with other approved paths (e.g., in different tabs within a webapp); also can remember paths to invoke upon FF start up ("website addons")
1. Option to enable file: protocol (though mention it is risky for security and privacy); report issue to FF if issue not already added (also for better means than '*' for add-on communication?)
1. Option to confirm reading and/or saving of data upon each attempt
1. Piggyback on drag-and-drop file capabilities (or create own) to allow files dropped in this way to be saved back to disk and/or path provided to the app.
1. Add a mode to get notifications for updates to files (e.g., in case the "view"'d contents get updated by another app after the initial load into WebAppFind)
1. Listen for unregistration of protocols to disable acting on future messages from them (only relevant for pages already loaded in this session)
1. Option to avoid or allow new tabs for same URI/method/filetype/path? (option to get the same tab or new tabs for them?); option to push to all open windows in different manner so can notify user of updates but not change focus, etc.
1. "Demos"
    1. Demos ought to use cookie-using full screen option for HTML and SVG
    1. Get HTML CodeMirror to use closetag, html5complete, matchTags (in addition to JS ones if mixed mode can support), use the preview option?; http://codemirror.net/demo/widget.html for line bars in linting (html, css, javascript)? linting for HTML? (jslint can do some)
    1. JS enhancement: CodeMirror tern support? can this work or be made to work with JSDoc?
    1. use CodeMirror diffs/merge add-ons if version-control trigger types supported
    1. use runmode for getting code syntax highlighting within CKEditor HTML (e.g., for doing blog posts): http://codemirror.net/demo/runmode.html and for a button to copy-HTML-(+css with styles inlined?)-to-clipboard in each of the html/javascript/css/svg/etc. modes
    1. Add CodeMirror search/replace?
    1. Tweak change CSS autocomplete in CodeMirror to support color/background-color, support CSS lint options
    1. Cookie to hold JSHint options (or CSS lint options))
    1. JSON and XML demos including CodeMirror xmlautocomplete
    1. images/canvas: http://www.picozu.com/editor/ ?
    1. audio: http://plucked.de/ and https://github.com/plucked/html5-audio-editor ?
    1. video - popcorn?
    1. music notations  - http://www.vexflow.com/
    1. MIDI, etc.
    1. better integration of CodeMirror/CKEditor, using full (mixed HTML) features of latest CodeMirror
    1. update my regex support in CodeMirror for regex type and for JS overlay: http://codemirror.net/1/contrib/regex/index.html
    1. CKEditor support for popup SVGEdit and SVGEdit support for CKEditor foreign objects
    1. Add CodeMirror to SVG Edit XML view
    1. For SVG Edit demo, add own SVG icon for saving to file
    1. Sticky app
        1. power-user support for form controls like checkboxes (underlying events currently supported better in Chrome than in Firefox), paperclip links, etc.
        1. Modify WebAppFind to support display of independent data files (for multiple stickies in this case); or don't only associate a file path with individual URLs (file: or http:), but also allow associations with tab groups or bookmark folders so that if saving a new StickyBrains/CKEditor/word-processing file, it will save to a folder where one's ideas are already grouped
        1. 
    1. Create demo supporting docx format (rather than requiring export to HTML for Word docs)
    1. Demonstrate approach of allowing data files for download (so can store them anywhere)--if not AYW approach for namespaced shared browser access--as well as data files chosen from File selector (and save over such a file if within the protocol and user permits)
1. (more)
