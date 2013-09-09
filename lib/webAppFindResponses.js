// webAppFindResponses.js - webappfind's module
// author: brettz9
/*globals exports*/

(function () {'use strict';

var file = require('sdk/io/file'),
    commandLineObj = require('./componentRegistrations')();

exports.webappfindRequest = function (uri, path, emit) {
    
    var permitted = commandLineObj.isPermittedPathForURI(uri, path);
    if (!permitted) {
        return {disable:true};
    }
    // Todo: need to check for method/path then send back, using the filetypes.json in that
    //   file path's directory to determine the right handler path
    return {disable: false, content: file.read(path), uri:uri, path:path}; // Todo: allow binary ('b') as 2nd argument to file.read?
};


}());
