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

/**
Listen for messages from the webappfind native messaging app (which listens for websocket connections, ala "Open"/"Open with...").
*/
port.onMessage.addListener((msg) => {
    // const msgObj = JSON.parse(msg);
    console.log('msgObj', msg); // msgObj);
    // ['file', 'mode', 'site', 'args'];
});

// Todo: open tabs, etc. (see old WebAppFind code) and listen to page for write commands (if has write access)

// We can post back to native messaging app (but for file writing, we can probably do this better here in this file instead)
port.postMessage('Ping from background script');
