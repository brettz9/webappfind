/* eslint-env webextensions */
var postMessageRelay; // eslint-disable-line no-var, no-unused-vars
(function () {
'use strict';

let addedMessageListener; // , permittedPathToContentDict = {};

const port = browser.runtime.connect({name: 'webappfind-postMessage-content-script'});

function l (msg) {
    console.log(msg);
}

window.addEventListener('message', function (e) { // Listen for subsequent requests to read the file (necessary also for cases where the 'webapp-view' listener cannot be added immediately, e.g., within our SVG-edit extension which is loaded by the main page doing a script tag injection)
    if (e.origin !== window.location.origin ||
        !Array.isArray(e.data) || e.data[0] !== 'webapp-read') {
        return;
    }
    port.postMessage('webappfindRead');
});

function webappfindStart (result) {
    if (!addedMessageListener) {
        window.addEventListener('message', function (e) {
            if (e.origin !== window.location.origin ||
                !Array.isArray(e.data) || e.data[0] !== 'webapp-save') {
                return;
            }
            const [, pathID, newContents] = e.data;
            // l(newContents.length);
            port.postMessage('webappfindSave', [pathID, newContents]);
        });
        addedMessageListener = true;
    }

    // l(JSON.stringify(result));
    const {content, uri, pathID} = result.content;
    /* if (uri !== window.location.href) { // Not matching with about:newtab, but not needed
        console.log('Mismatch for ' + uri + ' and ' + window.location.href);
        return;
    } */
    l('made it past uri check' + uri);

    // permittedPathToContentDict[path] = content;

    // Todo: make option to enable but indicate this is a major privacy leak! (at least until such time as a null origin is allowed)
    if (0 && uri.match(/file:/)) {
        l('file protocol');
        // Todo: We could (and should) set this message to the relevant URL if file: support is added
        try {
            window.postMessage(['webapp-view', pathID, content], '*'); // window.location.href); // Gives security error while window.location.origin is null for file:
        } catch (e) {
            l('file protocol err: ' + e);
        }
    } else {
        l(pathID);
        l('contentlen' + content.length);
        window.postMessage(['webapp-view', pathID, content], window.location.origin);
    }
}

port.onMessage.addListener(function ({type, result}) {
    switch (type) {
    case 'webappfindSaveEnd':
        window.postMessage(['webapp-save-end', result], window.location.origin);
        break;
    case 'webappfindStart':
        webappfindStart(result);
    }
});
}());
