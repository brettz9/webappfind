// executableResponses.js - Executable Builder's module
// author: brettz9
/* globals exports, require */

(function () {
'use strict';

const chrome = require('chrome'),
    Cc = chrome.Cc,
    Ci = chrome.Ci,
    file = require('sdk/io/file'),
    system = require('sdk/system');

function l (msg) {
    console.log(msg);
}
function makeURI (aURL, aOriginCharset, aBaseURI) {
    const ioService = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
    return ioService.newURI(aURL, aOriginCharset || null, aBaseURI || null);
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

function createProcess (aNsIFile, args, observer, emit) {
    const process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
    observer = (emit && observer && observer.observe)
        ? observer
        : {observe: function (aSubject, aTopic, data) {}};
    process.init(aNsIFile);
    process.runAsync(args, args.length, observer);
}

/*
In case we decide to create profiles on behalf of the user (without the need to visit the profile manager)
http://stackoverflow.com/questions/18711327/programmatically-create-firefox-profiles
https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIToolkitProfileService
https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIToolkitProfile
http://kb.mozillazine.org/Profiles.ini_file
*/

exports.createProfile = function (name) {
    // https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIToolkitProfileService#createProfile%28%29
    const toolkitProfileService = Cc['@mozilla.org/toolkit/profile-service;1'].createInstance(Ci.nsIToolkitProfileService);
    toolkitProfileService.createProfile(null, null, name); // aRootDir, aTempDir, aName
    return true;
};

exports.getProfiles = function () {
    // Instead cycle over profiles.ini (within "%appdata%/Mozilla/Firefox/")
    let profileObj;
    const profiles = [],
        toolkitProfileService = Cc['@mozilla.org/toolkit/profile-service;1'].createInstance(Ci.nsIToolkitProfileService),
        profileObjs = toolkitProfileService.profiles;
    while (profileObjs.hasMoreElements()) {
        profileObj = profileObjs.getNext();
        profileObj.QueryInterface(Ci.nsIToolkitProfile);
        profiles.push(profileObj.name);
    }
    return profiles;
};

function getFirefoxExecutable () {
    let file = getHardFile('CurProcD');
    file = file.parent; // Otherwise, points to "browser" subdirectory
    file.append('firefox.exe');
    return file;
}

exports.manageProfiles = function (cb) {
    const file = getFirefoxExecutable();
    createProcess(file, ['-P', '-no-remote'], cb);
};

/**
* @todo Ensure OS independent
* @see {@link https://developer.mozilla.org/en-US/docs/Code_snippets/File_I_O#Getting_files_in_special_directories}
* @see {@link http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsAppDirectoryServiceDefs.h}
* @see {@link http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsDirectoryServiceDefs.h}
*/
exports.getHardPaths = function (emit) {
    const profD = system.pathFor('ProfD'),
        ex = file.join(profD, 'executables');
    if (!file.exists(ex)) {
        file.mkpath(ex);
    }

    // Todo: handle QuickLaunch for before Win7: C:\Documents and Settings\UserName\Application Data\Microsoft\Internet Explorer\Quick Launch
    return ['Desk', 'Strt', 'Progs', 'AppData', 'Pict', 'ProfD', 'Docs'].reduce(function (obj, name) {
        obj[name] = getHardPath(name);
        return obj;
    }, {
        // Todo: Make OS-specific
        Programs: getHardFile('CurProcD').parent.parent.path, // Is this reliable?
        TaskBar: getHardPath('AppData') + '\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar',
        Executable: ex
    });
};

exports.autocompleteURLHistory = function (data, emit) {
    const historyService = Cc['@mozilla.org/browser/nav-history-service;1'].getService(Ci.nsINavHistoryService),
        // No query options set will get all history, sorted in database order,
        // which is nsINavHistoryQueryOptions.SORT_BY_NONE.
        options = historyService.getNewQueryOptions(),
        query = historyService.getNewQuery(), // No query parameters will return everything
        userVal = data.value,
        optValues = [],
        optIcons = [];
    let i, node, result, cont;

    query.uriIsPrefix = true;
    options.maxResults = 20;
    try {
        query.uri = makeURI(userVal); // May throw here (would be better
        // if this were pure strings rather than nsiURI but now at least
        // it works when user types valid URI which is only part of a larger one)

        // execute the query
        result = historyService.executeQuery(query, options);
        cont = result.root;
        cont.containerOpen = true;

        for (i = 0; i < cont.childCount; i++) {
            node = cont.getChild(i);
            // "node" attributes contains the information (e.g. URI, title, time, icon...)
            // see : https://developer.mozilla.org/en/nsINavHistoryResultNode
            optValues.push(node.uri);
            optIcons.push(node.icon);
        }

        // Close container when done
        // see : https://developer.mozilla.org/en/nsINavHistoryContainerResultNode
        cont.containerOpen = false;
    } catch (err) {
        // l('autocompleteURLHistory error: ' + err);
    }

    return {
        listID: data.listID,
        optValues: optValues,
        optIcons: optIcons,
        userVal: userVal // Just for debugging on the other side
    };
};

exports.openOrCreateICO = function () {
    return 'Not yet implemented';
};

exports.saveTemplate = function (data, emit) {
    // get profile directory
    /*
    var profD = Cc['@mozilla.org/file/directory_service;1'].
               getService(Ci.nsIProperties).get('ProfD', Ci.nsIFile);
    profD.append(data.fileName);
    */
    const profD = system.pathFor('ProfD'),
        ec = file.join(profD, 'executable-creator'),
        template = file.join(profD, 'executable-creator', data.fileName + '.html'),
        lastTemplate = data.lastTemplate ? file.join(profD, 'executable-creator', data.lastTemplate + '.html') : null;

    if (!file.exists(ec)) {
        file.mkpath(ec);
    }

    const ws = file.open(template, 'w');
    ws.writeAsync(data.content, function () {
        if (lastTemplate) { // Currently not in use
            file.remove(lastTemplate);
        }
        emit('saveTemplateResult', {templateName: data.fileName, message: 'Save successful! in (' + template + ')'});
    });
};

exports.deleteTemplate = function (data, emit) {
    const profD = system.pathFor('ProfD'),
        ec = file.join(profD, 'executable-creator'),
        template = file.join(profD, 'executable-creator', data.fileName + '.html');
    if (!file.exists(ec)) {
        file.mkpath(ec);
    }
    if (!file.exists(template)) {
        return {message: 'File file (' + template + ') + does not exist', fileName: data.fileName};
    }
    file.remove(template);
    return {message: 'File removed!', fileName: data.fileName};
};

exports.getTemplate = function (data, emit) {
    const profD = system.pathFor('ProfD'),
        // ec = file.join(profD, 'executable-creator'),
        template = file.join(profD, 'executable-creator', data.fileName + '.html'),
        rs = file.open(template, 'r');
    return {
        content: rs.read(),
        fileName: data.fileName
    };
};

exports.getTemplates = function (emit) {
    const profD = system.pathFor('ProfD'),
        ec = file.join(profD, 'executable-creator');
    if (!file.exists(ec)) {
        file.mkpath(ec);
    }
    return file.list(ec).filter(function (files) {
        return files.match(/\.html$/);
    }).map(function (f) {
        return f.replace(/\.html$/, '');
    });
};

function batchQuote (item) {
    return '"' + item.replace(/"/g, '\\"') + '"';
}

function stripQuotes (str) {
    return str.replace(/"/g, '');
}

// Todo: Option to preserve shortcut, SED, and, if converting to exe, the batch file
// Todo: Otherwise complete and test
function createBatchForShortcutCreation (data, emit) {
    if (!data.shortcutPath) {
        throw new Error('A shortcut path must be supplied to createBatchForShortcutCreation()');
    }

    const {
            shortcutPath,
            profileName, // OPTIONAL
            description = 'Firefox Shortcut',
            iconPath, // OPTIONAL
            hotKey, // OPTIONAL // Todo: Give user a non-textual way to input
            /*
            1 Activates and displays a window. If the window is minimized or maximized, the system restores it to its original size and position.
            3 Activates the window and displays it as a maximized window.
            7 Minimizes the window and activates the next top-level window.
            */
            windowStyle = '1',
            webappdoc, // Todo: convert to native path if in file:// form; handle differently if a URL or desktop file and support URLs in WebAppFind!
            // Todo: If user opts for (dynamic) webappdoc, do some simple checking for HTTP(S) and if it is, change the argument to webappurl instead
            webappurl,
            webappmode,
            webappcustommode
        } = data,
        ff = getFirefoxExecutable().path,
        ffDir = ff.parent.path,
        batch = ':::set WshShell = WScript.CreateObject("WScript.Shell")\n' +
        ':::set oShellLink = WshShell.CreateShortcut(' + batchQuote(shortcutPath) + ')\n' +
        ':::oShellLink.TargetPath = ' + batchQuote(ff) + '\n' +
        // Todo: reconcile the following arguments to each other!
        ':::oShellLink.Arguments = "' +
        '-no-remote' + (profileName ? ' -P """' + stripQuotes(profileName) + '""' : '') + // Quotes not allowed in profile names anyways and double quotes could present an issue if already inside double quotes
        '::: -remote ""openurl(about:newtab)"""\n' +
        '::: -webappdoc ' + batchQuote(webappdoc) + '\n' +
        '::: -webappurl ' + batchQuote(webappurl) + '\n' + // Todo: Implement this first in WebAppFind!
        '::: -webappmode ' + batchQuote(webappmode) + '\n' +
        '::: -webappcustommode ' + batchQuote(webappcustommode) + '\n' +

        '"\n' +

        // Todo: Avoid this if desktop file being hard-coded
        '::: & WScript.Arguments.Item(0)\n' + // Open With will pass the desktop file path to be opened here
        ':::oShellLink.Description = ' + batchQuote(description) + '\n' +
        (iconPath ? ':::oShellLink.IconLocation = ' + batchQuote(iconPath) + '\n' : '') +
        (hotKey ? ':::oShellLink.HotKey = ' + batchQuote(hotKey) + '\n' : '') +
        ':::oShellLink.WindowStyle = ' + stripQuotes(windowStyle) + '\n' +
        ':::oShellLink.WorkingDirectory = ' + batchQuote(ffDir) + '\n' +
        ':::oShellLink.Save\n\n' +
        'findstr "^:::" "%~sf0">tempExecBuilder.vbs & cscript //nologo tempExecBuilder.vbs %1 & del tempExecBuilder.vbs\n';
    return batch;
}

/**
* Call the command line with the supplied arguments
* @param {object} Object with properties "args" and "observe"
* @example ['-P', '-no-remote']
*/
exports.cmd = function (data) {
    const cmdDir = getHardFile('SysD');
    cmdDir.append('cmd.exe');
    createProcess(cmdDir, data.args, data);
};

function buildSED (userSED) {
    // Possible values from http://www.mdgx.com/INF_web/cdfinfo.htm
    const defaultSED = [
        {Version: { // Does order within a section matter (or between sections)?
            Class: 'IEXPRESS',
            SEDVersion: '3'
        }},
        {Options: {
            PackagePurpose: 'InstallApp', // Not present at http://www.mdgx.com/INF_web/cdfinfo.htm
            // ExtractOnly: 0|1
            ShowInstallProgramWindow: '0', // 0/1/2/3
            HideExtractAnimation: '1', // 1/0
            // ShowRebootUI: 1/0
            UseLongFileName: '0', // Not present at http://www.mdgx.com/INF_web/cdfinfo.htm
            // "PackageInstallSpace(KB)": xxxx
            InsideCompressed: '0', // 1
            // CompressionType: [ MSZIP | LZX | QUANTUM ]
            // Quantum: 7
            // KeepCabinet: 1/0
            CAB_FixedSize: '0', // 0
            CAB_ResvCodeSigning: '0', // 6144
            RebootMode: 'N', // 0/1/2 or A/I/N/S
            InstallPrompt: '%InstallPrompt%', // '%InstallPrompt%'
            DisplayLicense: '%DisplayLicense%', // '%DisplayLicense%'
            FinishMessage: '%FinishMessage%', // Not present at http://www.mdgx.com/INF_web/cdfinfo.htm
            TargetName: '%TargetName%', // '%TargetName%'
            FriendlyName: '%FriendlyName%', // '%FriendlyName%'
            AppLaunched: '%AppLaunched%', // "#Setup"
            // EndMessage: '%FinishMessage%'
            PostInstallCmd: '%PostInstallCmd%', // Not present at http://www.mdgx.com/INF_web/cdfinfo.htm
            AdminQuietInstCmd: '%AdminQuietInstCmd%', // Not present at http://www.mdgx.com/INF_web/cdfinfo.htm
            UserQuietInstCmd: '%UserQuietInstCmd%', // Not present at http://www.mdgx.com/INF_web/cdfinfo.htm
            SourceFiles: 'SourceFiles'
            // Strings="Strings"
        }},
        {Strings: {
            InstallPrompt: '', // '"Do you wish to install this Sample App?"'
            DisplayLicense: '', // 'License.txt'
            FinishMessage: '', // Not present at http://www.mdgx.com/INF_web/cdfinfo.htm
            // EndMessage: 'Thank you installing Sample App',
            // PackageName: 'Sample.exe',
            // TargetName: 'C:\\Users\\Brett\\Desktop\\test1.exe',
            // FriendlyName: 'WebAppFind1',
            // AppLaunched: 'cmd /c test1.bat', // "Setup.exe" or "#Setup"
            PostInstallCmd: '<None>', // Not present at http://www.mdgx.com/INF_web/cdfinfo.htm
            AdminQuietInstCmd: '', // Not present at http://www.mdgx.com/INF_web/cdfinfo.htm
            UserQuietInstCmd: '' // Not present at http://www.mdgx.com/INF_web/cdfinfo.htm
            // FILE0: 'test1.bat'
        }},
        {SourceFiles: { // Path to source files. UNC or C:\<sourcedir>
            // SourceFiles0: 'C:\\Users\\Brett\\Desktop\\'
        }},
        {SourceFiles0: {
            '%FILE0%': ''
        }}
    ];
    function getSectionName (sectionObject) {
        return Object.keys(sectionObject)[0];
    }
    function findSection (userSectionName) {
        return function (sectionObject) {
            return getSectionName(sectionObject) === userSectionName;
        };
    }
    function addUserSections (userSectionObject) {
        const userSectionName = getSectionName(userSectionObject),
            defaultSEDIdx = defaultSED.findIndex(findSection(userSectionName));
        let subsec, subsecs;
        if (defaultSEDIdx !== -1) {
            subsecs = userSectionObject[userSectionName];
            for (subsec in subsecs) {
                if (subsecs.hasOwnProperty(subsec)) {
                    defaultSED[defaultSEDIdx][userSectionName][subsec] = subsecs[subsec];
                }
            }
        } else {
            defaultSED.push(userSectionObject);
        }
    }
    function sedSerializer (str, sectionObject) {
        const sectionName = getSectionName(sectionObject),
            subObj = sectionObject[sectionName];
        let sub,
            ret = str + '[' + sectionName + ']\n';
        for (sub in subObj) {
            if (subObj[sub] !== undefined) { // Give chance for user to delete a default
                ret += sub + '=' + subObj[sub] + '\n';
            }
        }
        return ret;
    }
    function serializeSED (sed) {
        return sed.reduce(sedSerializer, '');
    }
    userSED.forEach(addUserSections);
    return serializeSED(defaultSED);
}

exports.saveExecutables = function (data, emit) {
    const templateName = data.templateName,
        executableNames = data.executableNames,
        dirPaths = data.dirPaths;
    /*
    let sed,
        description = data.description,
        preserveShortcuts = data.preserveShortcuts,
        convertToExes = data.convertToExes,
        pinApps = data.pinApps,
        sedPreserves = data.sedPreserves,
        batchPreserves = data.batchPreserves;
    */
    executableNames.forEach(function (exeName, i) {
        const baseName = exeName.replace(/\.exe$/, ''),
            batName = baseName + '.bat',
            dirPath = dirPaths[i].replace(/\\$/, '') + '\\';
        exeName = baseName + '.exe';

        // Todo: only create batch if there isn't one there already
        createBatchForShortcutCreation(data, emit);
        // Todo: only build a new SED file if there isn't one there already
        const sed = buildSED([
            {Strings: {
                TargetName: batchQuote(dirPath + exeName),
                FriendlyName: batchQuote(templateName),
                AppLaunched:
                    'cmd /c ' + // For XP, apparently shouldn't have (or at least don't need) this
                    batchQuote(batName), // "Setup.exe" or "#Setup"
                FILE0: batchQuote(batName)
            }},
            {SourceFiles: { // Path to source files. UNC or C:\<sourcedir>
                SourceFiles0: batchQuote(dirPath)
            }}
        ]);
        l(sed);
    });
};

// THE REMAINING WAS COPIED FROM filebrowser-enhanced fileBrowserResponses.js (RETURN ALL MODIFICATIONS THERE)
function getFile (path) {
    const localFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    localFile.initWithPath(path);
    return localFile;
}

function picker (data, emit) {
    // Note: could use https://developer.mozilla.org/en-US/docs/Extensions/Using_the_DOM_File_API_in_chrome_code
    //         but this appears to be less feature rich
    const {dirPath, selector, selectFolder, defaultExtension} = data,
        windowMediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator),
        nsIFilePicker = Ci.nsIFilePicker,
        fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
    let dir;
    if (!selectFolder) {
        fp.defaultExtension = defaultExtension;
        // fp.appendFilter('ICO (.ico)', '*.ico');
        // fp.appendFilter('SVG (.svg)', '*.svg');
        // fp.appendFilter('Icon file', '*.ico; *.svg');
        if (defaultExtension === 'ico') {
            fp.appendFilter('Icon file', '*.ico');
        }
    }

    if (dirPath) {
        try {
            dir = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
            dir.initWithPath(dirPath);
            fp.displayDirectory = dir;
        } catch (err) {
            l('initWithPath error: ' + err);
        }
    }
    fp.init(
        windowMediator.getMostRecentWindow(null),
        selectFolder ? 'Pick a folder for the executable' : 'Pick an icon file',
        selectFolder ? nsIFilePicker.modeGetFolder : nsIFilePicker.modeOpen
    );

    fp.open({done: function (rv) {
        let file, path,
            res = '';
        if (rv === nsIFilePicker.returnOK || rv === nsIFilePicker.returnReplace) {
            file = fp.file;
            path = file.path;
            res = path;
        }
        if (selectFolder) {
            emit('dirPickResult', {path: res, selector: selector, selectFolder: selectFolder});
        } else {
            emit('filePickResult', {path: res, selector: selector});
        }
        return false;
    }});
    /* var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        var file = fp.file;
        var path = fp.file.path;

    } */
}

exports.dirPick = picker;
exports.filePick = picker;

exports.reveal = function (path) {
    const localFile = getFile(path);
    localFile.reveal();
};

exports.autocompleteValues = function (data, emit) {
    const userVal = data.value,
        dir = file.dirname(userVal),
        base = file.basename(userVal);
    let optValues;

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
            } catch (err) {
                return false;
            }
        })
        : optValues;

    return {
        listID: data.listID,
        optValues: optValues,
        userVal: userVal // Just for debugging on the other side
    };
};
}());
