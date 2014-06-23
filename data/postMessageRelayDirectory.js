/*globals self*/
(function () {'use strict';
function l (msg) {
    console.log(msg);
}

document.defaultView.addEventListener('message', function (e) {
    if (e.origin !== window.location.origin || !Array.isArray(e.data) || e.data[0] !== 'webapp-getDirectoryPath') {
        return;
    }
    self.port.emit('webappfindGetDirectoryPath');
});

self.port.on('webappfindDirectoryPath', function (result) {
    var path = result.path;
    document.defaultView.postMessage(['webapp-directoryPath', path], window.location.origin);
});

}());