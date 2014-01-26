// componentRegistration.js - webappfind's module
// author: brettz9
/*globals require, module */
/*jslint todo: true, regexp: true*/
/**
 * @todo Waiting on https://github.com/mozilla/addon-sdk/pull/1220 to see if we can replace a chrome dependency with sdk/io/file reveal calls?
 */
(function () { 'use strict';

var listenerHolder,
    fileTypeProtocolDict = {},
    permittedURIDict = {},
    chrome = require('chrome'),
    Cc = chrome.Cc,
    Ci = chrome.Ci,
    data = require('sdk/self').data,
    file = require('sdk/io/file'),
    url = require('sdk/url'),
    uuid = require('sdk/util/uuid').uuid,
    tabs = require('sdk/tabs'),
    registerComponent = require('./commandLineHandlerComponent'),
    prefs = require('sdk/simple-prefs').prefs;

function l (str) {
    console.log(str);
}

// Todo: Don't maintain in storage unless revamping use of protocols to maintain our own list (in which case use should probably use site prefs)
function registerPermittedPathForURI (uri, mode, customMode, path) {
    if (!permittedURIDict[uri]) {
        permittedURIDict[uri] = {};
    }
    if (!permittedURIDict[uri][mode]) {
        permittedURIDict[uri][mode] = [];
    }
    if (!permittedURIDict[uri][mode][customMode]) {
        permittedURIDict[uri][mode][customMode] = [];
    }
    if (permittedURIDict[uri][mode][customMode].indexOf(path) === -1) {
        permittedURIDict[uri][mode][customMode].push(path);
    }
}
function isPermittedPathForURI (uri, mode, customMode, path) {
    return permittedURIDict && permittedURIDict[uri] && permittedURIDict[uri][mode] && permittedURIDict[uri][mode][customMode] && permittedURIDict[uri][mode][customMode].indexOf(path) > -1;
}
function removePermittedPathForURI (uri, mode, customMode, path) {
    if (!permittedURIDict || !permittedURIDict[uri] || !permittedURIDict[uri][mode] || !permittedURIDict[uri][mode][customMode]) {
        return;
    }
    var pos = permittedURIDict[uri][mode][customMode].indexOf(path);
    if (pos > -1) {
        permittedURIDict[uri][mode][customMode].splice(pos, 1);
    }
}

function getPathID (path) {
    return prefs.revealFilePaths ? path : uuid().toString(); // .slice(1, -1); // Strip off curly braces for easier URL-friendliness (but slightly harder detection)?
}

function getProtocol (mode, customMode, fileType) {
    // We unfortunately can't separate these components from each other with a
    // delimiter as only lower-case ASCII is allowed after the "web+" per
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-navigator-registerprotocolhandler
    return 'web+local' + mode + (customMode || '') + fileType;
}

function substituteParams (uri, mode, customMode, fileType, pathID) {
    // Privacy/security concern to supply path so can supply ID instead

    // For some reason, although encodeURIComponent() encodes pathID curly braces, when FF resolves, it unescapes them back

    var scheme = url.URL(uri).scheme,
        params = {
            fileType: fileType,
            mode: mode,
            customMode: customMode,
            pathID: pathID
        };

    params = encodeURIComponent(JSON.stringify(params)); // We encode in this manner because registerProtocolHandler only allows for one variable; it also happens to be easier to parse at the moment than standard query strings (though one must strip off the "web+local:" portion as per below)!

    if (scheme.match(/^web\+local/)) {
        return scheme + ':' + params;
    }
    return uri.replace(/%s/, encodeURIComponent(getProtocol(mode, customMode, fileType) + ':') + params); // We add protocol for parity with actual protocol handler (so that the same JavaScript code can process them; there should be no need for awareness within the web app about whether it is being invoked by use of filetypes.json or by a registered protocol handler
}

function startURIWithPermittedPath (uri, mode, customMode, path, fileType, isConfirmedWebLocalProtocol) {
    var queryBeginPos, base = uri, queryStr = '', pathID = getPathID(path);
    if (!isConfirmedWebLocalProtocol) {
        queryBeginPos = uri.indexOf('?');
        if (queryBeginPos !== -1) {
            base = uri.slice(0, queryBeginPos);
            queryStr = uri.slice(queryBeginPos);
        }
        try {
            if (file.exists(base)) { // }!url.isValidURI(uri)) { // This was returning true for a normal file path, so we instead check if we can find the path
                uri = url.fromFilename(base) + queryStr;
            }
        }catch(e) {
            // It was a regular URI after all, so just continue on
        }
    }
    uri = substituteParams(uri, mode, customMode, fileType, pathID);

    registerPermittedPathForURI(uri, mode, customMode, path);

    tabs.activeTab.on('ready', function (tab) {
        var worker = tab.attach({
            contentScriptFile: data.url('postMessageRelay.js')
        });
        function start () {
            worker.port.emit('webappfindStart', {
                uri: tab.url,
                pathID: pathID,
                content: mode.indexOf('binary') > -1 ? file.read(path, 'b') : file.read(path)
            }); // , path:path
        }
        if (mode === 'edit' || mode === 'binaryedit') {
            worker.port.on('webappfindSave', function (data) {
                var pathID = data[0],
                    newContents = data[1],
                    ws = mode === 'binaryedit' ? file.open(path, 'wb') : file.open(path, 'w');
                ws.write(newContents);
                ws.close();
                worker.port.emit('webappfindSaveEnd', pathID);
            });
        }
        worker.port.on('webappfindRead', function () { // Allow reading after initial load
            start();
        });
        start();
    });
    tabs.activeTab.url = uri;
}

function getFile (path) {
    var localFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    localFile.initWithPath(path);
    return localFile;
}
function protocolIsRegistered (protocol) {
    // https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIExternalProtocolService
    // see also http://mdn.beonex.com/en/XPCOM_Interface_Reference/nsIProtocolHandler.html
    var serv = Cc['@mozilla.org/uriloader/external-protocol-service;1'].getService(Ci.nsIExternalProtocolService);
    return serv.externalProtocolHandlerExists(protocol);
}
function validateProtocolComponent (comp) {
    return (/^[a-z]*$/).test(comp);
}
function visitProtocol (mode, customMode, fileType, path) {
    var protocol = getProtocol(mode, customMode, fileType);
    startURIWithPermittedPath(protocol + ':', mode, customMode, path, fileType, true);
}
function handleError (errorMsg) {
    console.error(errorMsg);
    if (prefs.displayErrors) {
        tabs.activeTab.attach({
            contentScriptWhen: 'ready',
            contentScript: 'document.getElementById("newtab-horizontal-margin").appendChild(document.createTextNode("' + errorMsg.replace(/"/g, '\\"') + '"));' // Using ID within about:newtab
        });
        // Close the tab if alerting the user of errors in a way different from using the opened URL
        // tabs.activeTab.close();
    }
    else {
        tabs.activeTab.close(); // The command line is called with an open tab which we weren't able to use, so close it
    }
}
function getFileExtension (path) {
    if (path.match(/\.[^\.\/]+$/)) { // Ensure that this is not a folder and that there is an extension to get
        // Should always be truthy as we required at least one character after the final '.'
        return path.slice(path.lastIndexOf('.') + 1).toLowerCase(); // We lower-case the result to ensure it will work in a protocol
    }
    return false;
}
function xhtmlEscape (str) {
    return str.replace(/&/g, '&amp;'); // Apparently only need to replace ampersands and single quotes for Windows as it does not appear to allow files with <, >, or "
}
function noProtocolFoundSoHandleFallbacks (mode, customMode, path) {
    var isRegistered, uri,
        fileType = getFileExtension(path),
        errorMsg = "A file extension was not found on the supplied file path",
        errorMsgEnd = " and your configuration did not allow other options.";

    if (fileType) {
        if (prefs.fallbackToWebProtocolUsingFileExtension) {
            isRegistered = protocolIsRegistered(getProtocol(mode, customMode, fileType));
            if (isRegistered) {
                visitProtocol(mode, customMode, fileType, path);
                return;
            }
        }
        errorMsg = "A handler was not found for the supplied file's extension: " + xhtmlEscape(getProtocol(mode, customMode, fileType));
    }
    if (prefs.fallbackToBrowserUsingFilePath) {
        startURIWithPermittedPath(uri, mode, customMode, path, fileType);
        return;
    }
    if (prefs.fallbackToDesktopUsingFilePath) {
        tabs.activeTab.close(); // The command line is called with an open tab which we don't need if the user is launching from the desktop
        getFile(path).launch();
        return;
    }
    handleError(errorMsg + errorMsgEnd);
}

function findUniqueProtocolOrFallbacks (mode, customMode, path, fileType, fileTypesJSON) {
    var defaultHandlersForType = fileTypesJSON.defaultHandlers && fileTypesJSON.defaultHandlers[fileType],
        fullMode = mode + (customMode || ''),
        hierarchy = fileTypesJSON.hierarchy && fileTypesJSON.hierarchy[fileType];
    if (!validateProtocolComponent(fileType)) {
        handleError('The supplied file type "' + fileType + '" did not match the requirement to use lower-case ASCII letters exclusively.');
        return true;
    }
    if (protocolIsRegistered(getProtocol(mode, customMode, fileType))) {
        visitProtocol(mode, customMode, fileType, path);
        return true;
    }
    if (defaultHandlersForType) {
        if (prefs.noProtocolFallbackToRegistrationMode && defaultHandlersForType.register) {
            startURIWithPermittedPath(defaultHandlersForType.register, mode, customMode, path, fileType);
            return true;
        }
        if (prefs.noProtocolFallbackToDefaultHandlers && defaultHandlersForType[fullMode]) {
            startURIWithPermittedPath(defaultHandlersForType[fullMode], mode, customMode, path, fileType);
            return true;
        }
    }
    if (prefs.noProtocolFallbackToHierarchy && Array.isArray(hierarchy)) {
        // We disallow subsequent visits to the same level of the
        // hierarchy (thereby preventing recursion), though we allow multi-level checks
        if (!fileTypeProtocolDict[fileType]) {
            fileTypeProtocolDict[fileType] = true;
            return hierarchy.some(function (fileType) {
                return findUniqueProtocolOrFallbacks(mode, customMode, path, fileType, fileTypesJSON);
            });
        }
    }
    return false;
}

function findProtocolOrFallbacks (mode, customMode, path, fileType, fileTypesJSON) {
    fileTypeProtocolDict = {};
    return findUniqueProtocolOrFallbacks (mode, customMode, path, fileType, fileTypesJSON);
}

module.exports = function (listener) {
    listenerHolder = listener;
    var commandLineName = 'webappdoc',
        standardModes = ['view', 'edit', 'binaryview', 'binaryedit'];
    registerComponent({
        name: commandLineName,
        help: '  -' + commandLineName + "               Open My Application\n", // Not apparently used
        handler: function clh_handle(cmdLine) {
            var i, path, mode, customMode,
                fileTypesFile, fileTypesJSON, fileMatches, filePattern, fileMatch, filePatternStr, fileType,
                modeCommandName = 'webappmode',
                customModeCommandName = 'webappcustommode';
            cmdLine.preventDefault = true; // Todo: Do we want or need this?
            try {
                path = cmdLine.handleFlagWithParam(commandLineName, false);
            }
            catch (e) {
                handleError('incorrect parameter passed to -' + commandLineName + ' on the command line.');
                return;
            }
            try {
                mode = cmdLine.handleFlagWithParam(modeCommandName, false);
                if (standardModes.indexOf(mode) === -1) { // Default instead to "view"?
                    throw 'go to catch';
                }
            }
            catch (e2) {
                handleError('WebAppFind expects one of the following fundamental modes to be passed to ' + modeCommandName + ': ' + standardModes.join(', '));
                return;
            }

            try { // Optional param
                customMode = cmdLine.handleFlagWithParam(customModeCommandName, false);
            }
            catch (e3) {
            }

            if (path && mode) {
                fileTypesFile = file.join(file.dirname(path), 'filetypes.json');
                if (file.exists(fileTypesFile)) {
                    fileTypesJSON = file.read(fileTypesFile);
                    try {
                        fileTypesJSON = JSON.parse(fileTypesJSON);
                        if (!fileTypesJSON || typeof fileTypesJSON !== 'object') {
                            throw 'goto next error';
                        }
                    }
                    catch (jsonError) {
                        handleError('JSON file at path "' + fileTypesFile + '" is not a valid JSON object: ' + jsonError);
                        return;
                    }
                    fileMatches = fileTypesJSON.fileMatches;
                    for (i = 0; i < fileMatches.length; i++) { // Do not use forEach as we potentially may wish to break out
                        fileMatch = fileMatches[i];
                        try {
                            filePatternStr = fileMatch[0];
                            fileType = fileMatch[1];
                        }
                        catch(fileMatchesError) {
                            handleError('There was an error processing file matches array item at index ' + i);
                            return;
                        }
                        try {
                            filePattern = new RegExp(filePatternStr, 'i'); // file paths should be case-insensitive, so let's offer some convenience
                        }
                        catch(regexError) {
                            handleError('The regular expression pattern "' + filePattern + '" in file "' +
                                    fileTypesFile + '" had an error: ' + regexError);
                            return;
                        }
                        if (filePattern.test(path)) {
                            console.log('matched fileType: '+ fileType);
                            //tabs.activeTab.activate(); // When opening from command line, without this, the "active tab" won't actually be active.

                            if (findProtocolOrFallbacks(mode, customMode, path, fileType, fileTypesJSON)) {
                                return;
                            }
                        }
                    }
                    fileType = getFileExtension(path);
                    // Todo: Only check if there is an option to do this? Use different options?
                    if (findProtocolOrFallbacks(mode, customMode, path, fileType, fileTypesJSON)) { // Try again with the file extension
                        return;
                    }
                }
                noProtocolFoundSoHandleFallbacks(mode, customMode, path);
                return;
            }
            if (cmdLine.handleFlag(commandLineName, false)) {
                handleError('A valid ID must be provided to ' + commandLineName);
                return;
              // openWindow(CHROME_URI, null);
              // cmdLine.preventDefault = true;
            }
        }
   });

    return { // Public API
        isPermittedPathForURI: isPermittedPathForURI,
        removePermittedPathForURI: removePermittedPathForURI
    };
};

}());
