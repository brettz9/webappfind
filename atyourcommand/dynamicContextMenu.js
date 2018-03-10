/* globals self */
self.on('click', function (node, data) {
    'use strict';
    window.postMessage({name: data});
});
