/* eslint-env webextensions */
/*
Note on polyfills:

[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
is available but see also:

- <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities>
- <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs>
*/

console.log('Starting webappfind (in background script)');

function _ (...args) {
    return browser.i18n.getMessage(...args);
}

browser.webNavigation.onDOMContentLoaded.addListener(async ({tabId, url}) => {
    if (!(/^(?:https|file)?:/).test(url)) {
        return;
    }
    // console.log('url', url);
    // Todo: Replace with equivalent to `Array.prototype.flatten` when decided:
    //    https://github.com/tc39/proposal-flatMap/pull/56
    function flatten (arr) {
        return [].concat(...arr);
    }

    try {
        const metas = flatten(await browser.tabs.executeScript(tabId, {
            allFrames: true,
            code: `
    [...document.querySelectorAll('meta[name="webappfind"]')].map((m) => m.content)
    `,
            runAt: 'document_end'
        }));
        // console.log('metas', metas);

        if (metas.length) {
            // Todo if metas present but already associated, we probably want yet another icon
            // Todo: Replace `path` with a special icon
            browser.browserAction.setIcon({path: null, tabId});
        } else {
            browser.browserAction.setIcon({path: '/executable-builder/executable.svg', tabId});
        }
    } catch (err) {
        console.log('err', tabId, err);
    }
}); // , {url: []});

browser.contextMenus.create({
    id: 'atyourcommand',
    title: _('open-oneoff-atyourcommand'),
    contexts: ['all']
});
browser.contextMenus.create({
    id: 'asyouwish',
    title: _('enable-asyouwish'),
    contexts: ['all']
});
browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'atyourcommand') {
        const popupURL = browser.extension.getURL('/atyourcommand/one-off.html');

        /*
        // Currently available items (until we can actually get the
        //   element selector!!!): https://bugzilla.mozilla.org/show_bug.cgi?id=1325814
        const {
            selectionText,
            linkText, linkUrl,

            pageUrl, frameUrl, srcUrl/mediaType (image|video|audio),

            // Potentially usable for retrieving other info
            // bookmarkId, frameId,

            // Potentially usuable for flagging extra info to script (should be universal, however)
            modifiers, checked, wasChecked // menuItemId, parentMenuItemId
        } = info;
        const {
            title, favIconUrl // Need tabs permission
        } = tab;
        tabs.captureTab(), tabs.captureVisibleTab() // Snapshot page as data URL
        */

        /* const win = */ await browser.windows.create({
            // focused: true,
            // top/left: 100, // Pixels from top
            // incognito: true,
            // state: minimized|maximized|fullscreen
            // allowScriptsToClose: true,
            titlePreface: _('atyourcommand-window-title'),
            url: popupURL,
            type: 'popup', // or panel?
            height: 600,
            width: 800
        });
        return;
    }
    if (info.menuItemId !== 'asyouwish') {
        return;
    }
    const results = await browser.tabs.executeScript({
        code: "typeof WebAppFind === 'object';"
    });
    if (!results || results[0] !== true) {
        await browser.tabs.executeScript({
            allFrames: true,
            file: '/lib/asyouwish.js', // Cross-browser to use absolute path
            runAt: 'document_start'
        });
    }
});

/**
On startup, connect to the "webappfind" app.
*/
const nativePort = browser.runtime.connectNative('webappfind');

const pathMessageMap = {};
const csPorts = [];

function getContentScriptPortForTabID (tabID) {
    return csPorts[tabID];
}
function deleteContentScriptPortByTabID (tabID) {
    delete csPorts[tabID];
}

browser.runtime.onConnect.addListener(function (p) {
    if (p.name === 'webappfind-eval-content-script') {
        p.onMessage.addListener(async function ({string, i, method}) {
            switch (method) {
            case 'addonEval': {
                let result;
                try {
                    result = eval(string); // eslint-disable-line no-eval
                    if (typeof result === 'function') {
                        result = result();
                    }
                    if (result && typeof result.then === 'function') {
                        result = await result;
                    }
                } catch (error) {
                    p.postMessage({type: 'addonEval', i, error});
                    return;
                }
                p.postMessage({type: 'addonEval', i, result});
                break;
            }
            case 'nodeEval': {
                csPorts[p.sender.tab.id] = p;
                // console.log('np', {string, i, method, tabID: p.sender.tab.id});
                nativePort.postMessage({string, i, method, tabID: p.sender.tab.id});
                break;
            }
            }
        });
        return;
    }
    if (p.name !== 'webappfind-postMessage-content-script') {
        return;
    }
    csPorts[p.sender.tab.id] = p;
});

let i = 0;
const proms = {};
function getNodeJSON (method, ...args) { // eslint-disable-line no-unused-vars
    return new Promise((resolve, reject) => {
        proms[++i] = {resolve, reject};
        nativePort.postMessage({i, method, args, nodeJSON: true});
    });
}

/**
Listen for messages from the webappfind native messaging app (which listens for websocket connections, ala "Open"/"Open with...").
*/
nativePort.onMessage.addListener(async (parsedObj) => {
    console.log('parsedObj', typeof parsedObj, parsedObj);
    if (typeof parsedObj !== 'object') {
        return;
    }
    const {method, nodeEval, saveEnd, nodeJSON} = parsedObj;
    switch (method) {
    case 'execbuildopen': {
        // Doesn't work as can only be activated by user action!
        // browser.browserAction.openPopup();
        return;
    }
    }
    if (nodeJSON) {
        const {i, error, result} = parsedObj;
        const prom = proms[i];
        if (error) {
            prom.reject(error);
            return;
        }
        prom.resolve(result);
        return;
    }
    // Todo: We might leverage `nodeJSON` above for refactoring these out
    if (nodeEval) {
        const {i, error, result} = parsedObj;
        const csPort = getContentScriptPortForTabID(parsedObj.tabID);
        if (!csPort) {
            console.log('`nodeEval` message cannot find content script port', parsedObj.tabID, csPorts);
            return;
        }
        csPort.postMessage(
            {type: 'nodeEval', i, result, error}
        );
        return;
    }
    if (saveEnd) {
        const csPort = getContentScriptPortForTabID(parsedObj.tabID);
        if (!csPort) {
            console.log('`saveEnd` message cannot find content script port', csPorts);
            return;
        }
        csPort.postMessage(
            {type: 'saveEnd', pathID: parsedObj.pathID, error: !!parsedObj.error}
        );
        return;
    }
    // ['file', 'mode', 'site', 'args'];
    const tab = await browser.tabs.create({
        active: true, // Default is true
        url: parsedObj.site
    });

    // console.log('tab', tab);
    const results = await browser.tabs.executeScript(tab.id, {
        code: "typeof postMessageRelay !== 'undefined';"
    });
    // console.log('results', results);
    // Might reinvoke this on the same tab in the future
    if (!results || results[0] !== true) {
        /* const results2 = */ await browser.tabs.executeScript({
            allFrames: true,
            file: '/lib/postMessageRelay.js', // Cross-browser to use absolute path
            runAt: 'document_start'
        });
    } /* else {
        browser.tabs.executeScript({
            allFrames: true,
            code: 'postMessageRelay();',
            runAt: 'document_start'
        });
    } */

    const csPort = getContentScriptPortForTabID(tab.id);
    if (!csPort) {
        console.log('`start` message cannot find content script port');
        return;
    }
    csPort.onMessage.addListener(function ({type, pathID, content}) {
        // Todo: We might instead post against *all* tabs in `ports` with the same URL
        switch (type) {
        case 'unload': // Avoid memory leaks
            deleteContentScriptPortByTabID(tab.id);
            break;
        case 'read': case 'save':
            nativePort.postMessage(Object.assign(
                {},
                pathMessageMap[pathID],
                {method: type, tabID: tab.id},
                type === 'save' ? {content} : {}
            ));
            break;
        }
    });
    if ('file' in parsedObj) {
        pathMessageMap[parsedObj.pathID] = parsedObj;
    }
    csPort.postMessage({result: parsedObj, type: 'start'});
});

// Todo: open tabs, etc. (see old WebAppFind code) and listen to page for write commands (if has write access)

// We can post back to native messaging app (but for file writing, we can probably do this better here in this file instead)
nativePort.postMessage('"Ping from background script"');
