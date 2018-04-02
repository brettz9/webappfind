/*
// For "context" events, "node" will always be the SelectorContext node,
//  even if a child node is the one responsible for activating the menu
self.on('context', function (node) {'use strict';
});
*/
// For "click" events where "SelectorContext" was used, "node" will be
//  the SelectorContext node; otherwise, it will be the actual node clicked
'use strict';

// Get around eslint-config-standard limitation on "exported" directive
//   by exporting as follows:
//   https://github.com/standard/standard/issues/614
const getPageData = window.getPageData = function getPageData ({
    customProperties = []
} = {customProperties: []}) {
    // Todo: Support retrieval of current selected element
    //   (by selector?) once it may be supported:
    //   https://bugzilla.mozilla.org/show_bug.cgi?id=1325814
    // Todo: retrieve "linkPageTitle", "linkBodyText", and "linkPageHTML"
    // Todo: Allow passing in to get custom properties?
    const selection = window.getSelection();
    const msg = {
        // Todo: ensure all of the following are documented
        // Other non-element magic items?
        contentType: document.contentType,
        pageURL: document.URL,
        characterSet: document.characterSet,
        lastModified: document.lastModified,
        referrer: document.referrer,
        // Todo: allow user to designate individual:
        //   cookies/FileSystem/indexedDB/localStorage/
        //   sessionStorage/cache!!!!!;
        //   comma-separated list (or using privileges, get all of
        //   cookies/localStorage for the page); means to supply
        //   privileged write (or listen)-access
        //   back to these local storage items?
        // Todo: Document anchors (name/text), designMode, plugins useful?
        // Todo: Window name, fullScreen, parent/top/opener location/title, performance.now, etc.
        // Todo: Investigate navigator: http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#the-navigator-object or
        //             any other items e.g., on window object, which
        //             may not be needed by websites (since can detect
        //             themselves) but desktop apps may need

        // Todo: add to these magic items, depending also on whether there is a context or not
        selectedHTML: selection && selection.outerHTML,
        selectedText: selection && selection.textContent,
        nodeName: selection && (selection.nodeName || (selection.firstElementChild && selection.firstElementChild.nodeName.toLowerCase())),
        // Todo: Change to require user to specify these (since associatable with specific tags)
        pageTitle: document.title, // hidden
        pageHTML: document.documentElement.outerHTML, // Treat like hidden to avoid need to select anything
        bodyText: document.body.textContent // Treat like hidden to avoid need to select anything
    };
    customProperties.forEach((customProperty) => {
        msg[customProperty] = selection[customProperty];
    });
    return msg; // We need privs on the dialogs we open
};
// Can't clone above export
// 'end on a note which Firefox approves'; // eslint-disable-line no-unused-expressions
getPageData();
