/* eslint-env webextensions */
// Todo: Merge this with `executableResponses.js` and add as dependency for both
var AYC; // eslint-disable-line no-var, no-unused-vars
(async () => {
'use strict';

const {getNodeJSON} = browser.extension.getBackgroundPage();

function l (msg) {
    console.log(msg);
}

function getHardPaths () {
    return getNodeJSON('getHardPaths');
}

function getHardPath (dir) {
    return paths[dir];
}

async function getFirefoxExecutable () {
    const [aFile] = await getNodeJSON('getFirefoxExecutableAndDir');
    return aFile;
}

AYC.getTempPaths = function () {
    return {
        type: 'temps',
        paths: [
            ['System temp', getHardPath('TmpD')]
        ]
    };
};
AYC.getExePaths = function () {
    return {
        type: 'executables',
        paths: [
            ['Firefox', firefoxExecutablePath],
            ['Command prompt', paths.cmdExe]
        ]
    };
};

AYC.autocompleteValues = function (data) {
    return getNodeJSON('autocompleteValues', data);
};

AYC.reveal = function (data) {
    return getNodeJSON('reveal', data);
};

// Todo: Apply these changes in other add-ons using it;
//   also add this as a filterMap where needed [{type: '*.ico', message: "Icon file"}]
AYC.picker = function ({dirPath, selectFolder, defaultExtension, filterMap = [], locale}) {
    // TODO: Could reimplement as a Node-based file/directory picker;
    //           maybe this? https://github.com/Joker-Jelly/nfb
    // Note: could use https://developer.mozilla.org/en-US/docs/Extensions/Using_the_DOM_File_API_in_chrome_code
    //         but this appears to be less feature rich
    const Cc = 0, Ci = 0, file = 0;
    const windowMediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator),
        nsIFilePicker = Ci.nsIFilePicker,
        fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
    if (!selectFolder) {
        fp.defaultExtension = defaultExtension;
        // fp.appendFilter('ICO (.ico)', '*.ico');
        // fp.appendFilter('SVG (.svg)', '*.svg');
        // fp.appendFilter('Icon file', '*.ico; *.svg');
        filterMap.forEach(({message, type}) => {
            fp.appendFilter(message, type);
        });
    }

    if (dirPath) {
        try {
            const dir = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
            dir.initWithPath(dirPath);
            if (!dir.isDirectory()) { // Todo: Return this change to other add-ons
                dir.initWithPath(file.dirname(dirPath));
            }
            fp.displayDirectory = dir;
        } catch (err) {
            l('initWithPath error: ' + err);
        }
    }
    // Todo: i18nize messages
    fp.init(
        windowMediator.getMostRecentWindow(null),
        selectFolder ? locale.pickFolder : locale.pickFile,
        selectFolder ? nsIFilePicker.modeGetFolder : nsIFilePicker.modeOpen
    );

    return new Promise((resolve, reject) => {
        fp.open({done (rv) {
            let path = '';
            if (rv === nsIFilePicker.returnOK || rv === nsIFilePicker.returnReplace) {
                ({file: {path}} = fp);
            }
            if (selectFolder) {
                resolve({type: 'dirPickResult', path, selectFolder});
            } else {
                resolve({type: 'filePickResult', path});
            }
            return false;
        }});
        /*
        const rv = fp.show();
        if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
            const {file: {path}} = fp;
        } */
    });
};

const [paths, firefoxExecutablePath] = await Promise.all([ /*, profiles */
    getHardPaths(),
    getFirefoxExecutable()
]);
})();
