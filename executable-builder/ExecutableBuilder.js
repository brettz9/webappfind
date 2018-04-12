/* eslint-env webextensions */
import * as EnvironmentBridge from '/node-bridges/EnvironmentBridge.js';

function l (msg) {
    console.log(msg);
}

function openOrCreateICO () {
    // TODO:
    throw new Error('Not yet implemented');
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
// Todo: Otherwise i18nize, complete, and test (and i18nize
//          fileSelectMessage passed to native-app.js?)
async function createBatchForShortcutCreation (data) {
    if (!data.shortcutPath) {
        throw new Error('A shortcut path must be supplied to createBatchForShortcutCreation()');
    }

    const {
            shortcutPath,
            profileName, // OPTIONAL
            description = 'Browser Shortcut',
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
        [browser, browserDir] = await EnvironmentBridge.getBrowserExecutableAndDir(),
        batch = ':::set WshShell = WScript.CreateObject("WScript.Shell")\n' +
        ':::set oShellLink = WshShell.CreateShortcut(' + batchQuote(shortcutPath) + ')\n' +
        ':::oShellLink.TargetPath = ' + batchQuote(browser) + '\n' +
        // Todo: reconcile the following arguments to each other!
        ':::oShellLink.Arguments = "' +
        // 1. With WebAppFind, tried -remote, -silent; didn't try -no-remote, -tray
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
        ':::oShellLink.WorkingDirectory = ' + batchQuote(browserDir) + '\n' +
        ':::oShellLink.Save\n\n' +
        'findstr "^:::" "%~sf0">tempExecBuilder.vbs & cscript //nologo tempExecBuilder.vbs %1 & del tempExecBuilder.vbs\n';
    return batch;
}

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

function saveExecutables (data) {
    const {templateName, executableNames, dirPaths} = data;
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
export {
    openOrCreateICO,
    saveExecutables
};
