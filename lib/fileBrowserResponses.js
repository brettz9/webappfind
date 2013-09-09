// fileBrowserResponses.js - webappfind's module
// author: brettz9

/*globals exports, require */

// Todo: Waiting on https://github.com/mozilla/addon-sdk/pull/1220 to see if we can replace a chrome dependency with sdk/io/file reveal calls?

(function () {'use strict';

var chrome = require('chrome'),
    Cc = chrome.Cc,
    Ci = chrome.Ci,
    url = require('sdk/url'),
    file = require('sdk/io/file');

function getFile (path) {
    var localFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    localFile.initWithPath(path);
    return localFile;
}

exports.getNativePathFromFileURL = function (fileURL) {
    // var ph = Cc['@mozilla.org/network/protocol;1?name=file'].createInstance(Ci.nsIFileProtocolHandler);
    // return ph.getFileFromURLSpec(fileURL).path;
    return url.toFilename(fileURL);
};
exports.getFileURLFromNativePath = function (aPath) {
    return url.fromFilename(aPath);
};
exports.pathExists = function (attemptedNewPath) {
    return file.exists(attemptedNewPath);
    // var localFile = getFile(attemptedNewPath);
    // return localFile.exists();
};
exports.reveal = function (path) {
    var localFile = getFile(path);
    localFile.reveal();
};

}());
