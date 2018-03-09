/* eslint-env webextensions */
/*
Note on polyfills:

[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
is available but see also:

- <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities>
- <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs>
*/

console.log('Starting webappfind (in background script)');

browser.contextMenus.create({
    id: 'asyouwish',
    title: browser.i18n.getMessage('enable-asyouwish'),
    contexts: ['all']
});
browser.contextMenus.onClicked.addListener(async (info, tab) => {
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
    console.log('pppp', p && p.name, p);
    if (p.name === 'webappfind-eval-content-script') {
        p.onMessage.addListener(async function ({string, i}) {
            console.log('ppp2 inside listener', string, i);
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
                p.postMessage({i, error});
                return;
            }
            p.postMessage({i, result});
        });
        return;
    }
    if (p.name !== 'webappfind-postMessage-content-script') {
        return;
    }
    csPorts[p.sender.tab.id] = p;
});

/**
Listen for messages from the webappfind native messaging app (which listens for websocket connections, ala "Open"/"Open with...").
*/
nativePort.onMessage.addListener(async (parsedObj) => {
    console.log('parsedObj', parsedObj);
    if (typeof parsedObj !== 'object') {
        return;
    }
    if (parsedObj.saveEnd) {
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
        console.log('no results');
        const results2 = await browser.tabs.executeScript({
            allFrames: true,
            file: '/lib/postMessageRelay.js', // Cross-browser to use absolute path
            runAt: 'document_start'
        });
        console.log('results2', results2);
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
            console.log('unloading');
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
        console.log('setting to path map');
        pathMessageMap[parsedObj.pathID] = parsedObj;
    }
    csPort.postMessage({result: parsedObj, type: 'start'});
});

// Todo: open tabs, etc. (see old WebAppFind code) and listen to page for write commands (if has write access)

// We can post back to native messaging app (but for file writing, we can probably do this better here in this file instead)
nativePort.postMessage('"Ping from background script"');
