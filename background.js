/* eslint-env webextensions */
/*
Note on polyfills:

[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
is available but see also:

- <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities>
- <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs>
*/

console.log('started webappfind');

/**
On startup, connect to the "webappfind" app.
*/
const port = browser.runtime.connectNative('webappfind');

/**
Listen for messages from the webappfind app (which listens for command line invocations, ala "Open"/"Open with...").
*/
port.onMessage.addListener((response) => {
    console.log('Received: ' + response);
});

// Todo: open tabs, etc. (see old WebAppFind code) and listen to page for write commands (if has write access)

// We can post back to app (but for file writing, we can probably do this better here in this file instead)
port.postMessage('ping');
