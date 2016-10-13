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


// Post back from page under correct conditions (for file writing, we can do in this file instead, however)
// port.postMessage("ping");
