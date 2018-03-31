(function () {
'use strict';

function l (msg) {
    console.log(msg);
}

const chrome = require('chrome'),
    Cc = chrome.Cc,
    Ci = chrome.Ci,
    file = require('sdk/io/file');

function createProcess (aNsIFile, args, observer) {
    const process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
    observer = (observer && observer.observe)
        ? observer
        : {observe: function () {}}; // aSubject, aTopic, data
    process.init(aNsIFile);
    process.runAsync(args, args.length, observer);
}
function getFile (path) {
    const localFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    localFile.initWithPath(path);
    return localFile;
}
function createProcessAtPath (path, args, observer) {
    try {
        const aFile = getFile(path);
        createProcess(aFile, args, observer);
    } catch (e) {
        if (observer && observer.errorHandler) {
            observer.errorHandler(e);
        }
    }
}
function getHardFile (dir) {
    return Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get(dir, Ci.nsIFile);
}
/**
* @see getHardPaths()
*/
function getHardPath (dir) {
    return getHardFile(dir).path;
}
function getFirefoxExecutable () {
    let aFile = getHardFile('CurProcD');
    aFile = aFile.parent; // Otherwise, points to "browser" subdirectory
    aFile.append('firefox.exe');
    return aFile;
}
function getTempPaths () {
    return {
        type: 'temps',
        paths: [
            ['System temp', getHardPath('TmpD')]
        ]
    };
}
function getExePaths () {
    return {
        type: 'executables',
        paths: [
            ['Firefox', getFirefoxExecutable().path],
            ['Command prompt', file.join(getHardPath('SysD'), 'cmd.exe')]
        ]
    };
}

function autocompleteValues (data) { // , emit
    let optValues;
    const userVal = data.value,
        dir = file.dirname(userVal),
        base = file.basename(userVal);

    if (file.exists(userVal)) {
        if (userVal.match(/(?:\/|\\)$/)) {
            optValues = file.list(userVal).map(function (fileInDir) {
                return file.join(userVal, fileInDir);
            });
        } else {
            optValues = [userVal];
        }
    } else if (file.exists(dir)) {
        optValues = file.list(dir).filter(function (fileInDir) {
            return fileInDir.indexOf(base) === 0;
        }).map(function (fileInDir) {
            return file.join(dir, fileInDir);
        });
    }

    optValues = data.dirOnly
        ? optValues.filter(function (optValue) {
            try {
                return getFile(optValue).isDirectory();
            } catch (e) {
                return false;
            }
        })
        : optValues;

    return {
        listID: data.listID,
        optValues: optValues,
        userVal: userVal // Just for debugging on the other side
    };
}

function reveal (path) {
    const localFile = getFile(path);
    localFile.reveal();
}

// Todo: Apply these changes in other add-ons using it; also add this as a filterMap where needed [{type: '*.ico', message: "Icon file"}]
function picker (data, filterMap, locale, emit) {
    // Note: could use https://developer.mozilla.org/en-US/docs/Extensions/Using_the_DOM_File_API_in_chrome_code
    //         but this appears to be less feature rich
    let dir;
    const {dirPath, selector, selectFolder, defaultExtension} = data,
        windowMediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator),
        nsIFilePicker = Ci.nsIFilePicker,
        fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);

    if (!selectFolder) {
        fp.defaultExtension = defaultExtension;
        // fp.appendFilter('ICO (.ico)', '*.ico');
        // fp.appendFilter('SVG (.svg)', '*.svg');
        // fp.appendFilter('Icon file', '*.ico; *.svg');
        (filterMap || []).forEach((filters) => {
            fp.appendFilter(filters.message, filters.type);
        });
    }

    if (dirPath) {
        try {
            dir = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
            dir.initWithPath(dirPath);
            if (!dir.isDirectory()) { // Todo: Return this change to other add-ons
                dir.initWithPath(file.dirname(dirPath));
            }
            fp.displayDirectory = dir;
        } catch (e) {
            l('initWithPath error: ' + e);
        }
    }
    fp.init(
        windowMediator.getMostRecentWindow(null),
        selectFolder ? locale.pickFolder : locale.pickFile,
        selectFolder ? nsIFilePicker.modeGetFolder : nsIFilePicker.modeOpen
    );

    fp.open({done: function (rv) {
        let res = '';
        if (rv === nsIFilePicker.returnOK || rv === nsIFilePicker.returnReplace) {
            const aFile = fp.file;
            const {path} = aFile;
            res = path;
        }
        if (selectFolder) {
            emit('dirPickResult', {path: res, selector, selectFolder});
        } else {
            emit('filePickResult', {path: res, selector});
        }
        return false;
    }});
    /*
    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        var file = fp.file;
        var path = fp.file.path;

    } */
}

exports.createProcessAtPath = createProcessAtPath;
exports.getExePaths = getExePaths;
exports.getTempPaths = getTempPaths;
exports.autocompleteValues = autocompleteValues;
exports.picker = picker;
exports.reveal = reveal;
}());
