const path = require('path');
const ini = require('ini');
const nativeMessage = require('chrome-native-messaging');
const WebSocket = require('ws');
const uuid = require('uuid/v4');
const {
    execFile, readFile, writeFile, mkdirp, readdir, unlink, stat
} = require('./polyfills/promise-wrappers');

const {MacOSDefaults} = require('macos-defaults');

const argv = require('minimist')(process.argv.slice(2));
const {method} = argv;

// Todo: We could i18nize this, but the command line allows for overriding anyways
const fileSelectMessageDefault = 'Please select a file:';

function escapeBashDoubleQuoted (s) {
    return s.replace(/[$`"\\*@]/g, '\\$&').replace(/"/g, '\\\\"'); // Extra escaping of double-quote
}
function escapeAppleScriptQuoted (s) {
    return s.replace(/[\\"]/g, '\\$&');
}

(() => {
switch (method) { // We're reusing this executable to accept messages for setting up a client
case 'urlshortcut':
    const {url, path} = argv;
    if (!url) {
        console.error('No URL provided');
        return;
    }
    if (!path) {
        console.error('No path provided');
        return;
    }
    if (!(/\.webloc$/).test(path)) {
        console.error('The path must end in ".webloc"');
        return;
    }
    const template = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>URL</key>
\t<string>${url}</string>
</dict>
</plist>
`;
    writeFile(path, template).then(() => {
        console.log(`Wrote file to ${path} for URL: ${url}`);
    }).catch((err) => {
        if (err.code === 'EEXIST') {
            return;
        }
        console.error('Error writing file', err);
    });
    return;
case 'execbuildopen':
case 'webappfind':
case 'client': {
    const ws = new WebSocket('ws://localhost:8080');

    ws.on('open', () => {
        ws.send(JSON.stringify(argv)); // Strings or buffer
    });

    ws.on('message', (data) => {
        // console.log('msg recd back by client: ' + data);
        ws.close();
    });
    return;
} case 'build-openwith-executable': {
    buildOpenWithExecutable(Object.assign({log: true}, argv));
    return;
}
}

function buildOpenWithExecutable (argv) {
    // Todo: Convert this to JavaScript? using `osacompile -l JavaScript`; see:
    // 1) https://developer.telerik.com/featured/javascript-os-x-automation-example/
    // 2) https://www.safaribooksonline.com/library/view/applescript-in-a/1565928415/re154.html

    // -- Command line usage example: open ./webappfind-as.app --args /Users/brett/myFile.txt (doesn't work in all contexts apparently)
    const appleScript = `
-- Command line usage example: osascript ./webappfind-as.app /Users/brett/myFile.txt
--   Could pass in other flags at end too, but not usable with "open with"

on open argv -- For "open with" and drag-and-drop (or baked in file or file selector when none present)
    getFile(argv)
end open

on run argv -- For direct command line (see example above)
    getFile(argv)
end run

on getFile (argv)
    try
        set input to item 1 of argv -- Not needed in Automator AS, but needed in normal AS
        get POSIX path of (input as text)
    on error
        try
            set input to choose file with prompt "` +
    escapeAppleScriptQuoted(
        'fileSelectMessage' in argv ? argv.fileSelectMessage : fileSelectMessageDefault
    ) +
    (
        argv.fileSelectType
            ? `" of type {"${escapeAppleScriptQuoted(argv.fileSelectType)}"}`
            : '"'
    ) + `
        on error -- cancelled
            return
        end try
    end try
    tell application "Finder"
        -- todo: Could prompt for, and allow input for, multiple files or folder
        set filePath to POSIX path of (input as text) -- cast to posix file object and get path
        -- display dialog filePath -- For debugging
        do shell script "/usr/local/bin/node ${__filename} ` +
            `--method=client --file=" & ` +
            ('file' in argv ? `"\\"${escapeBashDoubleQuoted(argv.file)}\\""` : `quoted form of filePath`) +
            ' & ' +
            // Todo: Allow `args` to be passed in at run-time if not baked in (though won't work with normal file opening)
            (['mode', 'site', 'args', 'binary'].reduce((s, param) => {
                if (!(param in argv)) {
                    return s;
                }
                const paramValue = argv[param];
                if (param === 'binary' && paramValue) { // Boolean
                    return `${s} -binary`;
                }
                return `${s} --${param}=\\"${escapeBashDoubleQuoted(paramValue)}\\"`;
            }, '"') || ' "') + `"
    end tell

    return input
end getFile
`;
    // Todo: Ensure native-app.js path works if called in executable form (and invoke bash if not?)
    // Todo: Ensure we can customize server, at least different for each browser and then
    //        make client above customizable here too (though defaulting to this particular executable)
    // Todo: optionally associate to file type
    //        see https://apple.stackexchange.com/questions/9866/programmatically-script-atically-changing-the-default-open-with-setting/9954#9954
    // Todo optionally add to dock and/or execute the result;
    if (argv.log) {
        console.log('appleScript', appleScript);
    }
    const executableName = ((argv.executableName && argv.executableName.replace(/.app$/, '')) || 'output') + '.app';
    const appPath = path.resolve( // Defaults needs absolute path
        'executablePath' in argv ? argv.executablePath : '../',
        executableName
    );
    return execFile('osacompile', ['-o', appPath, '-e', appleScript]).then(() => {
        if (!('id' in argv)) {
            const msg = 'Completed but without `CFBundleIdentifier`';
            if (argv.log) {
                console.log(msg);
            }
            return msg;
        }
        const hasExtensions = 'extensions' in argv;
        const hasContentType = 'contentTypes' in argv;
        let CFBundleDocumentTypesValue;
        if (hasExtensions || hasContentType) {
            let role = 'Viewer';
            if ('mode' in argv) {
                switch (argv.mode) {
                default: {
                    throw new TypeError('Unrecognized mode');
                }
                // Descriptions at https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html
                case 'view':
                    role = 'Viewer';
                    break;
                case 'edit':
                    role = 'Editor';
                    break;
                case 'shell': // "The app provides runtime services for other processes—for example, a Java applet viewer."
                    role = 'Shell';
                    break;
                case 'none':
                    role = 'None';
                    break;
                }
            }
            // Todo (high priority): Switch to `LSItemContentTypes`
            // Todo: Support recommended `CFBundleTypeIconFile`; see https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/TP40009249-SW9
            // Deprecated: CFBundleTypeExtensions, CFBundleTypeMIMETypes, CFBundleTypeOSTypes
            // Also need `NSExportableTypes
            // LSHandlerRank; Values in order of precedence: Owner, Default, Alternate, None; // see https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html
            CFBundleDocumentTypesValue = [{
                // Do we want these defaults or allow override to be empty?
                CFBundleTypeRole: role, // Editor, Viewer, Shell, or None
                CFBundleTypeExtensions: ['*'],
                CFBundleTypeName: argv.executableName, // Todo: Give chance to provide alternative
                CFBundleTypeOSTypes: ['****']
            }];
            if (hasExtensions) {
                CFBundleDocumentTypesValue[0].CFBundleTypeExtensions = argv.extensions;
            }
            if (hasContentType) {
                if (!argv.contentTypes) {
                    // delete CFBundleDocumentTypesValue[0].CFBundleTypeMIMETypes;
                    delete CFBundleDocumentTypesValue[0].CFBundleTypeOSTypes;
                }
                // CFBundleDocumentTypesValue[0].CFBundleTypeMIMETypes = argv.contentTypes;
                CFBundleDocumentTypesValue[0].CFBundleTypeOSTypes = argv.contentTypes;
            }
        }

        const mod = new MacOSDefaults();
        return Promise.all([
            mod.write({
                domain: `${appPath}/Contents/Info`,
                // For others, see https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html
                key: 'CFBundleIdentifier',
                value: argv.id
            }),
            CFBundleDocumentTypesValue
                ? mod.write({
                    domain: `${appPath}/Contents/Info`,
                    key: 'CFBundleDocumentTypes',
                    value: ['array', CFBundleDocumentTypesValue]
                })
                : null
        ]).then(() => {
            const msg = 'Added ' + appPath + ' and associated `CFBundleIdentifier`' +
                (CFBundleDocumentTypesValue ? 'and `CFBundleDocumentTypesValue`' : '') + '.';
            if (argv.log) {
                console.log(msg);
            }
            return msg;
            // chmod ugo+r `${appPath}/Contents/Info.plist` ?
        });
        // defaults read com.apple.LaunchServices/com.apple.launchservices.secure.plist LSHandlers
    });
}

/*
const backgroundScript = new nativeMessage.Output();
backgroundScript.pipe(process.stdout);
backgroundScript.write('"Starting (in native app)"');
*/

const input = new nativeMessage.Input();
const transform = new nativeMessage.Transform(messageHandler);
const output = new nativeMessage.Output();
process.stdin
    .pipe(input)
    .pipe(transform)
    .pipe(output)
    .pipe(process.stdout);

// Todo: Windows below is untested
// https://github.com/NiklasGollenstede/native-ext/blob/master/browser.js#L128-L154
const directories = {};
const homedir = require('os').homedir();

const isFirefox = true; // Todo: Detect; in addon through `browser.runtime.getBrowserInfo()`
if (!isFirefox) {
    // Todo: Set ProfD for other browsers
    throw new Error('Other browser besides Firefox not yet supported');
} else if (process.env.MOZ_CRASHREPORTER_EVENTS_DIRECTORY) {
    directories.ProfD = path.resolve(process.env.MOZ_CRASHREPORTER_EVENTS_DIRECTORY, '../..');
} else {
    throw new Error(`MOZ_CRASHREPORTER_EVENTS_DIRECTORY environment variable not set by Firefox`);
    // either -P / -p "profile_name" or -profile "profile_path" (precedence?) default: fs.readFileSync('%AppData%\Mozilla\Firefox\profiles.ini').trim().split(/(?:\r\n?\n){2}/g).find(_=>_.includes('Default=1')).match(/Path=(.*))[1]
}
directories.Desk = path.join(homedir, 'Desktop');
const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';
directories.Pict = isWin ? '%UserProfile%\\Pictures' : `${homedir}/Pictures`;
directories.Docs = isWin ? '%UserProfile%\\Documents' : `${homedir}/Documents`;
directories.AppData = isWin ? '%AppData%' : '~/Library/Application Support';
directories.ProgF = isWin ? '%ProgramFiles%' : '/Applications';
directories.Strt = isWin ? directories.AppData + '\\Microsoft\\Windows\\Start Menu\\Programs\\Startup' : '/Library/StartupItems';
directories.TmpD = isWin ? '%AppData%\\Local\\Temp' : '/tmp'; // Linux: '/tmp'
if (isWin) {
    directories.SysD = '%WinDir%';
    directories.Progs = directories.AppData + '\\Microsoft\\Windows\\Start Menu\\Programs';
    // Mac apparently doesn't have a folder used for adding items to the dock (apparently it is a preference instead)
    directories.TaskBar = directories.AppData + '\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar';
}
const cmdExe = isWin
    ? path.join(directories.SysD, 'cmd.exe')
    : '/Applications/Utilities/Terminal.app';

// Todo: Detect browser instead (though adjust if they don't have profiles or
//    work as such)
const profilesINI = isWin
    ? '%appdata%\\Mozilla\\Firefox\\profiles.ini'
    : `${homedir}/Library/Application Support/Firefox/profiles.ini`;

// Adapted from XRegExp:
const regexEscape = (str) => String.prototype.replace.call(
    str,
    /[-[\]{}()*+?.,\\^$|#\s]/g,
    '\\$&'
);

const nodeJSONMethods = {
    // Todo: Modularize these (corresponding to `/node-bridges` files), though
    //         moving project-specific dependencies to that folder, e.g.,
    //         TemplateFileBridge is for executable builder templates, and it
    //         should be moved there with a lower-level
    //         FileBridge/EnvironmentBridge dependency
    execFile,
    buildOpenWithExecutable,

    cmd ({args}) {
        return execFile(cmdExe, args);
    },
    reveal ({fileName}) {
        if (isWin) {
            return execFile('Explorer', ['/select', fileName]);
        }
        if (isMac) {
            return execFile('open', ['-R', fileName]);
        }
        // Todo: Check this (and other areas) working for Linux
        return execFile('nautilus', fileName); // Ubuntu
    },

    // Todo: Move to own /node-bridges/ file after exposing readdir, etc.
    autocompletePaths ({value: userVal, dirOnly, listID}) {
        let dir = userVal;
        return readdir(userVal).catch((err) => {
            if (err.code === 'ENOTDIR') { // Exists as file, not directory
                return dirOnly ? [] : [userVal];
            }
            if (err.code === 'ENOENT') { // File doesn't exist
                const base = path.basename(userVal);
                dir = path.dirname(userVal);
                return readdir(dir).then((files) => { // May throw
                    return files.filter((fileInDir) => {
                        // return fileInDir.startsWith(base); // Works for case-sensitive
                        return (new RegExp(regexEscape(base), 'i')).test(fileInDir);
                    });
                });
            }
            throw err;
        }).then((files) => {
            return files.map((fileInDir) => {
                return path.join(dir, fileInDir);
            });
        }).then((optValues) => {
            if (!dirOnly) {
                return optValues;
            }
            // Essentially we want an async reduce here (which we could do with better Promise methods):
            return Promise.all(
                optValues.map((optValue) => {
                    try {
                        return stat(optValue).then((stats) => {
                            return [stats.isDirectory(), optValue];
                        });
                    } catch (err) {
                        return [false];
                    }
                })
            ).then((optValues) => {
                return optValues.reduce((arr, [bool, optValue]) => {
                    if (bool) arr.push(optValue);
                    return arr;
                }, []);
                // return optValues.filter(([bool]) => bool).map(([, optValue]) => optValue);
            });
        }).catch(() => {
            return [];
        }).then((optValues) => {
            return {
                listID,
                optValues,
                userVal // Just for debugging on the other side
            };
        });
    },

    getBrowserExecutableAndDir () {
        // Todo: Detect browser or require browser argument and act accordingly?
        return Promise.resolve([path.join(
            directories.ProgF,
            (isWin ? 'firefox.exe' : 'Firefox.app')
        ), directories.ProgF]);
    },

    // Move to /node-bridges/ProfileBridge.js (copying getHardPaths (and
    //    _makeProfileSubDirectory dependency) methods into files using getHardPaths,
    //    i.e., EnvironmentBridge, executable.js)
    _makeProfileSubDirectory (dir) {
        const profD = directories.ProfD,
            pDir = path.join(profD, dir);
        return mkdirp(pDir).catch((err) => {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }).then(() => pDir);
    },
    getHardPaths () {
        return this._makeProfileSubDirectory('executables').then((Executable) => {
            return Object.assign({
                cmdExe,
                // Todo: Make browser-specific
                browserIcon: path.join(__dirname, 'executable-builder', 'firefox32.ico'),
                // The following was having problems at least for web-ext runner
                // browserIcon: path.join(directories.ProfD, 'webappfind', 'executable-builder', 'firefox32.ico'),
                Executable
            }, directories);
        });
    },
    execBrowser ({args}) {
        return this.getBrowserExecutableAndDir().then(([file]) => {
            return execFile(file, args);
        });
    },
    createProfile ({name}) {
        return this._makeProfileSubDirectory(name).catch((err) => {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }).then((pd) => {
            // Todo: Detect browser to determine args
            let args;
            if (isFirefox) {
                args = ['-no-remote', `-profile ${pd}`];
            }
            return this.execBrowser({args});
        }).then((result) => {
            // Todo: Could add to ini
            return result;
        });
    },
    manageProfiles () {
        // Todo: Detect browser to determine args
        let args;
        if (isFirefox) {
            args = ['-P', '-no-remote'];
        }
        return this.execBrowser({args});
    },
    getProfileInfo () {
        return readFile(profilesINI, 'utf8').then((contents) => {
            return {profiles: ini.parse(contents)};
        });
    },

    // Move to /node-bridges/TemplateFileBridge.js
    _makeECDir () {
        return this._makeProfileSubDirectory('executable-creator');
    },
    saveTemplate ({templateName, content, lastTemplate}) {
        const profD = directories.ProfD,
            template = path.join(profD, 'executable-creator', templateName + '.json');
        lastTemplate = lastTemplate ? path.join(profD, 'executable-creator', lastTemplate + '.json') : null;

        return this._makeECDir().then((ec) => {
            return writeFile(template, content);
        }).then(() => {
            if (lastTemplate) { // Currently not in use
                return writeFile(lastTemplate);
            }
        }).then(() => {
            return {
                templateName,
                message: 'Save successful! in (' + template + ')'
            };
        });
    },
    deleteTemplate ({fileName}) {
        return this._makeECDir().then((ec) => {
            const template = path.join(ec, fileName + '.json');
            return unlink(template).catch((err) => {
                if (err.code === 'ENOENT') { // File doesn't exist
                    return {message: 'File file (' + template + ') + does not exist'};
                }
                return {message: err};
            }).then(() => {
                return {message: 'File removed!', fileName};
            });
        });
    },
    getTemplate ({fileName}) {
        const profD = directories.ProfD,
            template = path.join(profD, 'executable-creator', fileName + '.json');
        return readFile(template, 'utf8');
    },
    getTemplates () {
        return this._makeECDir().then((ec) => {
            return readdir(ec);
        }).then((files) => {
            return files
                .filter((f) => f.match(/\.json$/))
                .map((f) => f.replace(/\.json$/, ''));
        });
    }
};

function messageHandler (msg, push, done) {
    if (!msg || typeof msg !== 'object') {
        push(msg); // We'll just echo the message
        done();
    } else {
        processMessage(msg).then((ret) => {
            if (ret) {
                push(ret);
            }
            done();
        });
    }
}

function processMessage (msgObj) {
    function process (content) {
        Object.assign(msgObj, {content, pathID: uuid()});
        return msgObj;
    }
    const {i, method, args, file, binary, content, tabID, pathID, nodeJSON} = msgObj;
    if (nodeJSON) {
        return nodeJSONMethods[method](...args).catch((error) => {
            return {i, method, error, nodeJSON: true};
        }).then((result) => {
            return {i, method, result, nodeJSON: true};
        });
    }
    switch (method) {
    case 'execbuildopen': {
        // Not working currently due to browser restrictions on opening popup
        //    unless there is a user action
        return Promise.resolve({method});
    } case 'nodeEval': {
        // output.write('"Node eval"');
        const {string, tabID} = msgObj;
        let result;
        try {
            result = eval(string); // eslint-disable-line no-eval
            if (typeof result === 'function') {
                result = result();
            }
            if (result && typeof result.then === 'function') {
                return result.then((result) => {
                    return {nodeEval: true, i, result};
                }).catch((error) => {
                    return {nodeEval: true, i, error};
                });
            }
        } catch (error) {
            return Promise.resolve({nodeEval: true, i, tabID, error});
        }
        return Promise.resolve({nodeEval: true, i, tabID, result});
    }
    case 'save': {
        return writeFile(file, content).catch((error) => {
            /*
            if (error.code === 'EEXIST') {
                return;
            }
            */
            return {saveEnd: true, tabID, pathID, error};
        }).then(() => {
            return {saveEnd: true, tabID, pathID};
        });
    }
    case 'read':
    case 'webappfind':
    case 'client': {
        if ('file' in msgObj) { // Site may still wish args passed to it
            // Todo: Document this and `binary` as command line
            const options = binary ? null : 'utf8';
            // let content = await readFile(file, options);
            return readFile(file, options).then((content) => {
                if (binary) {
                    content = content.buffer;
                }
                return content;
            }).then(process).catch((error) => {
                return {method, error};
            });
        }
        /*
        ['file', 'mode', 'site', 'args', 'pathID'].forEach((prop) => {
            const value = msgObj[prop];
            if (value !== undefined) {
                backgroundScript.write(JSON.stringify({prop, value}));
                // ws.send(JSON.stringify({prop, value})); // Send back to client
            }
        });
        */
        return process();
    }
    }
}

const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
    // output.write('"Begin test"');
    ws.on('message', (msg) => { // Strings or buffer
        const msgObj = JSON.parse(msg);
        processMessage(msgObj).then((msgObj) => {
            ws.send(JSON.stringify(msgObj)); // Send back to client in case it might use
            output.write(msgObj); // Send contents to add-on
        });
    });
});
})();
