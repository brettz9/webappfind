/*globals self*/
// We have to use document.defaultView for now per https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/guides/content-scripts/communicating-with-other-scripts.html#Using%20the%20DOM%20postMessage%20API
var addedMessageListener, disableAdditionalRequests, permittedPathToContentDict = {};

function l (msg) {
    console.log(msg);
}


self.port.on('webappfindSaveEnd', function (path) {
    document.defaultView.postMessage(['webapp-save-end', path], window.location.origin);
});

self.port.on('webappfindStart', function (result) {'use strict';

    if (!addedMessageListener) {
        document.defaultView.addEventListener('message', function (e) {
        
            if (e.origin !== window.location.origin || !Array.isArray(e.data) || e.data[0] !== 'webapp-save') {
                return;
            }
            var pathID = e.data[1],
                newContents = e.data[2];
l(newContents.length);
            self.port.emit('webappfindSave', [pathID, newContents]);
        
        });
        addedMessageListener = true;        
    }

//l(JSON.stringify(result));
    var content = result.content,
        uri = result.uri,
        pathID = result.pathID;
    /*if (uri !== window.location.href) { // Not matching with about:newtab, but not needed
        console.log('Mismatch for ' + uri + ' and ' + window.location.href);
        return;
    }*/
l('made it past uri check' + uri);

    //permittedPathToContentDict[path] = content;
    

    // Todo: make option to enable but indicate this is a major privacy leak!
    if (0 && uri.match(/file:/)) {
l('file protocol');
        // Todo: We could (and should) set this message to the relevant URL if file: support is added
        document.defaultView.postMessage(['webapp-view', pathID, content], '*'); // window.location.href); // Gives security error while window.location.origin is null for file:
    }
    else {
l(pathID);
l('contentlen'+content.length);
        document.defaultView.postMessage(['webapp-view', pathID, content], window.location.origin);
    }
});
