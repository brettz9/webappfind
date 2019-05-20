/* eslint-env webextensions */

const {getNodeJSON} = browser.extension.getBackgroundPage();

function l (msg) {
    console.log(msg);
}

function autocompletePaths (data) {
    return getNodeJSON('autocompletePaths', data);
}

function reveal (data) {
    return getNodeJSON('reveal', data);
}

// THE REMAINING WAS COPIED FROM filebrowser-enhanced fileBrowserResponses.js
//    (RETURN ALL MODIFICATIONS THERE)
// Todo: Apply these changes in other add-ons using it;
//   also add this as a filterMap where needed [{type: '*.ico', message: _('Icon_file')}]
// Todo: Fix so not using Firefox/Mozilla code!
const defaultLocaleStrings = {
    en: {
        pickFolder: 'Pick a folder for the executable',
        pickFile: 'Pick an executable file'
    }
};
// TODO: Could reimplement as a Node-based file/directory picker;
//           maybe this? https://github.com/Joker-Jelly/nfb
//           or perhaps more simply, use `filepicker` in `dialog-node`?
function picker ({dirPath, selectFolder, defaultExtension, filterMap = [], locale, localeStrings}) {
    localeStrings = Object.assign(
        {},
        defaultLocaleStrings.en,
        defaultLocaleStrings[locale],
        localeStrings
    );
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
        selectFolder ? localeStrings.pickFolder : localeStrings.pickFile,
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
}
const filePick = picker, dirPick = picker;

export {
    autocompletePaths,
    reveal,
    picker,
    filePick,
    dirPick
};
