/**
* @param {Array} arr Array of objects containing the properties, "type" (type info to be added after 'web+local' withint the protocol), "instructions" (for the visible button text), and "info" (for the browser's own protocol message)
*/
function addRegistrationHandlers (arr, url) {
    'use strict';
    function $ (sel) {
        return document.querySelector(sel);
    }
    url = url || (window.location.href.replace(/\?.*$/, '') + '?uri=%s');
    arr.forEach(function (method) {
        var button = document.createElement('button');
        button.id = method.type;
        button.style.margin = '7px';
        button.appendChild(document.createTextNode(method.instructions));
        button.addEventListener('click', function (e) {
            try {
                navigator.registerProtocolHandler(
                    'web+local' + e.target.id, // e.g., web+localviewhtmltype:
                    url,
                    method.info
                );
            }
            catch(err) {
                if (url.match(/file:/)) {
                    alert('You must host this file on a server in order to register a protocol.');
                    return;
                }
                alert(err);
            }
        });
        $('#actions').appendChild(button);
        $('#actions').appendChild(document.createElement('br'));
    });
}
