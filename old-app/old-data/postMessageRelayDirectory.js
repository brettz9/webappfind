/* globals self */
(function () {
'use strict';
/*
function l (msg) {
  console.log(msg);
}
*/

document.defaultView.addEventListener('message', function (e) {
  try {
    if (e.origin !== window.location.origin ||
      e.data.webappfind.command !== 'directoryPath') {
      return;
    }
  } catch (undesiredMessageFormat) {
    return;
  }
  self.port.emit('webappfindGetDirectoryPath');
});

self.port.on('webappfindDirectoryPath', function (result) {
  const {path} = result;
  document.defaultView.postMessage({webappfind: {directoryPath: path}}, window.location.origin);
});
}());
