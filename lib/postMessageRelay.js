/* eslint-env browser, webextensions */
var postMessageRelay; // eslint-disable-line no-var, no-unused-vars
(function () {
'use strict';

let addedMessageListener; // , permittedPathToContentDict = {};

const port = browser.runtime.connect({name: 'webappfind-postMessage-content-script'});

function l (...msgs) {
    console.log(...msgs);
}

function sameOriginAndType (type, data) {
    return origin === location.origin && // Security
        data && data.webappfind && data.webappfind.type === type;
}

// Listen for subsequent requests to read the file (necessary also for
//  cases where the 'view' listener cannot be added immediately,
//  e.g., within our SVG-edit extension which is loaded by the main page
//  doing a script tag injection)
window.addEventListener('message', function ({origin, data}) {
    if (!sameOriginAndType('read', data)) {
        return;
    }
    port.postMessage({type: 'read'});
});

function webappfindStart (result) {
    if (!addedMessageListener) {
        window.addEventListener('message', function ({origin, data}) {
            if (!sameOriginAndType('save', data)) {
                return;
            }
            const {pathID, content} = data.webappfind;
            // l(content.length);
            port.postMessage({type: 'save', pathID, content});
        });
        addedMessageListener = true;
    }

    // l(JSON.stringify(result));
    const {pathID, content, uri} = result;
    /* if (uri !== location.href) { // Not matching with about:newtab, but not needed
        console.log('Mismatch for ' + uri + ' and ' + location.href);
        return;
    } */
    l('made it past uri check', uri);

    // permittedPathToContentDict[path] = content;

    const message = {
        webappfind: {
            type: 'view',
            pathID,
            content
        }
    };

    // Todo: make option to enable but indicate this is a major privacy leak! (at least until such time as a null origin is allowed)
    if (0 && uri.match(/file:/)) {
        l('file protocol');
        // Todo: We could (and should) set this message to the relevant URL if file: support is added
        try {
            window.postMessage(message, '*'); // window.location.href); // Gives security error while window.location.origin is null for file:
        } catch (e) {
            l('file protocol err: ' + e);
        }
    } else {
        l('pathID', pathID, 'contentlen', content.length);
        window.postMessage(message, location.origin);
    }
}

port.onMessage.addListener(function ({type, result}) {
    switch (type) {
    case 'saveEnd':
        window.postMessage({
            webappfind: {
                type: 'save-end',
                result
            }
        }, location.origin);
        break;
    case 'start':
        webappfindStart(result);
    }
});
}());
