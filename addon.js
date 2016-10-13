console.log('started webappfind');

/**
On startup, connect to the "webappfind" app.
*/
var port = browser.runtime.connectNative("webappfind");

/**
Listen for messages from the webappfind app (which listens for command line invocations, ala "Open"/"Open with...").
*/
port.onMessage.addListener((response) => {
    console.log("Received: " + response);
});

// Todo: open tabs, etc. (see old WebAppFind code)


// We can post back to app (but for file writing, we can probably do this better here in this file instead)
// port.postMessage("ping");
