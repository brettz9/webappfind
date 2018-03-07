/* eslint-env webextensions */
/*
Note on polyfills:

[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
is available but see also:

- <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities>
- <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs>
*/

console.log('Starting webappfind (in background script)');

/**
On startup, connect to the "webappfind" app.
*/
const port = browser.runtime.connectNative('webappfind');

const ports = [];

browser.runtime.onConnect.addListener(function (p) {
    if (p.name !== 'webappfind-postMessage-content-script') {
        return;
    }
    ports[p.sender.tab.id] = p;
});

/**
Listen for messages from the webappfind native messaging app (which listens for websocket connections, ala "Open"/"Open with...").
*/
port.onMessage.addListener(async (msg) => {
    const parsedObj = JSON.parse(msg);
    console.log('msgObj', parsedObj);
    if (typeof parsedObj !== 'object') {
        return;
    }
    // ['file', 'mode', 'site', 'args'];
    const tab = await browser.tabs.create({
        active: true, // Default is true
        url: parsedObj.site
    });
    const p = ports[tab.id];
    p.onMessage.addListener.addListener(function (msgObj) {
        // Todo: We might instead post against *all* tabs in `ports` with the same URL
        // Todo: Check for save messages in this listener too
        p.postMessage(parsedObj);
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
});

// Todo: open tabs, etc. (see old WebAppFind code) and listen to page for write commands (if has write access)

// We can post back to native messaging app (but for file writing, we can probably do this better here in this file instead)
port.postMessage('"Ping from background script"');
