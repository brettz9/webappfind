/* eslint-env browser, webextensions */
var postMessageRelay; // eslint-disable-line no-var, no-unused-vars
(() => {
'use strict';

const port = browser.runtime.connect({name: 'webappfind-postMessage-content-script'});

function l (...msgs) {
    console.log(...msgs);
}

function sameOriginAndHasType (data) {
    return origin === location.origin && // Security
        data && data.webappfind && data.webappfind.type; // === type;
}
window.addEventListener('unload', () => {
    port.postMessage({type: 'unload'});
});

// Listen for subsequent requests to read the file (necessary also for
//  cases where the 'view' listener cannot be added immediately,
//  e.g., within our SVG-edit extension which is loaded by the main page
//  doing a script tag injection)
window.addEventListener('message', function ({origin, data}) {
    if (!sameOriginAndHasType(data)) {
        return;
    }
    const {type, pathID, content} = data.webappfind;
    // console.log('type', type, origin, data);
    switch (type) {
    case 'read':
        port.postMessage({type: 'read', pathID});
        break;
    case 'save':
        if (!pathID) { // User may be attempting edit with view-only access
            console.log('No path ID provided');
            return;
        }
        // l(content.length);
        l('saving... pathID:', pathID, 'length: ', content.length);
        port.postMessage({type: 'save', pathID, content});
        break;
    }
});

function webappfindStart (result) {
    // l(JSON.stringify(result));
    const {pathID, content, site, mode, binary} = result;
    let {args, error} = result;
    /* if (site !== location.href) { // Not matching with about:newtab, but not needed
        console.log('Mismatch for ' + site + ' and ' + location.href);
        return;
    } */
    l('made it past site check', site);
    try {
        args = JSON.parse(args);
    } catch (err) {
        error = err;
    }

    const message = {
        webappfind: {
            type: 'view',
            pathID: mode === 'edit' ? pathID : null,
            args,
            binary,
            content,
            error: !!error
        }
    };
    console.log('sending', JSON.stringify(message));

    // Todo: make option to enable but indicate this is a major
    //    privacy leak! (at least until such time as a null
    //    origin is allowed)
    // This should work but
    //   [tabs.create](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/create)
    //   does not work with the `file:` protocol
    if (site.match(/^file:/)) {
        l('file protocol');
        // Todo: We could (and should) set this message to the
        //    relevant URL if `file:` support is added
        try {
            window.postMessage(message, '*'); // location.href); // Gives security error while location.origin is `null` for file:
        } catch (e) {
            l('file protocol err: ' + e);
        }
    } else {
        l('pathID', pathID, 'contentlen', content.length || (content.data && content.data.length), 'location.origin', location.origin);
        window.postMessage(message, location.origin);
    }
}

port.onMessage.addListener(function ({type, result, pathID, error}) {
    switch (type) {
    case 'saveEnd':
        window.postMessage({
            webappfind: {
                type: 'save-end',
                pathID,
                // result,
                error: !!error
            }
        }, location.origin);
        break;
    case 'start':
        webappfindStart(result);
    }
});
})();
