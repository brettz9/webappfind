/* eslint-env webextensions */

var EB = {}; // eslint-disable-line no-var

(() => {
'use strict';

function l (msg) {
    console.log(msg);
}

const {getNodeJSON} = browser.extension.getBackgroundPage();

/*
In case we decide to create profiles on behalf of the user (without the need to visit the profile manager)
http://stackoverflow.com/questions/18711327/programmatically-create-firefox-profiles
https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIToolkitProfileService
https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIToolkitProfile
http://kb.mozillazine.org/Profiles.ini_file
*/
EB.createProfile = function ({name}) {
    // https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIToolkitProfileService#createProfile%28%29
    return getNodeJSON('createProfile', {name});
};

EB.getProfiles = function () {
    return getNodeJSON('getProfileInfo').then(({profiles}) => {
        return Object.entries(profiles).filter(([p, profile]) => {
            return p.startsWith('Profile');
        }).map(([, profile]) => profile.Name);
    });
};

function getFirefoxExecutableAndDir () {
    return getNodeJSON('getFirefoxExecutableAndDir');
}

EB.manageProfiles = function () {
    return getNodeJSON('manageProfiles');
};

EB.getHardPaths = function () {
    return getNodeJSON('getHardPaths');
};

EB.autocompleteURLHistory = function (data) {
    /*
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
        query.uri = (userVal); // makeURI: May throw here (would be better
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
    */
};

EB.openOrCreateICO = function () {
    return 'Not yet implemented';
};

EB.saveTemplate = function (data) {
    return getNodeJSON('saveTemplate', data);
};

EB.deleteTemplate = function (data) {
    return getNodeJSON('deleteTemplate', data);
};

EB.getTemplate = function (data) {
    return getNodeJSON('getTemplate', data);
};

EB.getTemplates = function () {
    return getNodeJSON('getTemplates');
};

function batchQuote (item) {
    return `"${
        item.replace(/"/g, '\\"')
    }"`;
}

function stripQuotes (str) {
    return str.replace(/"/g, '');
}

// Todo: Option to preserve shortcut, SED, and, if converting to exe, the batch file
// Todo: Otherwise complete and test
async function createBatchForShortcutCreation (data) {
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
        [ff, ffDir] = await getFirefoxExecutableAndDir(),
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
* @param {object} Object with property "args"
* @example {args: ['-P', '-no-remote']}
*/
EB.cmd = function (args) {
    return getNodeJSON('cmd', args);
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

EB.saveExecutables = function (data) {
    const templateName = data.templateName,
        executableNames = data.executableNames,
        dirPaths = data.dirPaths;
    /*
    let sed,
        {description, preserveShortcuts, convertToExes, pinApps, sedPreserves, batchPreserves} = data;
    */
    executableNames.forEach(async function (exeName, i) {
        const baseName = exeName.replace(/\.exe$/, ''),
            batName = baseName + '.bat',
            dirPath = dirPaths[i].replace(/\\$/, '') + '\\';
        exeName = baseName + '.exe';

        // Todo: only create batch if there isn't one there already
        await createBatchForShortcutCreation(data);
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
function picker (data) {
    /*
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

EB.dirPick = picker;
EB.filePick = picker;

EB.reveal = function (data) {
    return getNodeJSON('reveal', data);
};

EB.autocompleteValues = function (data) {
    /*
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
                return (optValue).isDirectory();
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
    */
};
})();
