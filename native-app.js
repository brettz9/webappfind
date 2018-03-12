const path = require('path');
const ini = require('ini');
const nativeMessage = require('chrome-native-messaging');
const WebSocket = require('ws');
const uuid = require('uuid/v4');
const {
    execFile, readFile, writeFile, mkdirp, readdir, unlink, stat
} = require('./polyfills/promise-wrappers');

const argv = require('minimist')(process.argv.slice(2));
const {method} = argv;

function escapeBashDoubleQuoted (s) {
    return s.replace(/[$`"\\*@]/g, '\\$&');
}
function escapeAppleScriptQuoted (s) {
    return s.replace(/[\\"]/g, '\\$&');
}

(() => {
switch (method) { // We're reusing this executable to accept messages for setting up a client
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
} case 'build-openwith-exec': {
    // Todo: Convert this to JavaScript? using `osacompile -l JavaScript`; see:
    // 1) https://developer.telerik.com/featured/javascript-os-x-automation-example/
    // 2) https://www.safaribooksonline.com/library/view/applescript-in-a/1565928415/re154.html

    // Todo: Allow calling this functionality from within the add-on
    const appleScript = `
-- Command line usage example: open ./webappfind-as.app --args /Users/brett/myFile.txt
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
        'fileSelectMessage' in argv ? argv.fileSelectMessage : 'Please select a file:'
    ) + (
            argv.fileSelectType
                ? `" of type {"${escapeAppleScriptQuoted(argv.fileSelectType)}"}`
                : ''
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
            (['mode', 'site', 'args', 'binary'].reduce((s, param) => {
                if (!(param in argv)) {
                    return s;
                }
                const paramValue = argv[param];
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
    console.log('appleScript', appleScript);
    execFile('osacompile', ['-o', '../output.app', '-e', appleScript]);
    return;
}
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
if (process.env.MOZ_CRASHREPORTER_EVENTS_DIRECTORY) {
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
directories.Progs = isWin ? '%ProgramFiles%' : '/Applications';
if (isWin) {
    directories.SysD = '%WinDir%';
    directories.Strt = directories.AppData + '\\Microsoft\\Windows\\Start Menu';
    directories.TaskBar = directories.AppData + '\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar';
}
const profilesINI = isWin
    ? '%appdata%\\Mozilla\\Firefox\\profiles.ini'
    : `${homedir}/Library/Application Support/Firefox/profiles.ini`;

const nodeJSONMethods = {
    execFile,
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
    createProfile ({name}) {
        return this._makeProfileDir(name).catch((err) => {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }).then((pd) => {
            return this.execFirefox({args: ['-no-remote', `-profile ${pd}`]});
        }).then((result) => {
            // Todo: Could add to ini
            return result;
        });
    },
    execFirefox ({args}) {
        return this.getFirefoxExecutableAndDir().then(([file]) => {
            return execFile(file, args);
        });
    },
    manageProfiles () {
        return this.execFirefox({args: ['-P', '-no-remote']});
    },
    cmd ({args}) {
        const cmdDir = path.join(directories.SysD, 'cmd.exe');
        return execFile(cmdDir, args);
    },
    getProfileInfo () {
        return readFile(profilesINI, 'utf8').then((contents) => {
            return {profiles: ini.parse(contents)};
        });
    },
    getHardPaths () {
        return this._makeProfileDir('executables').then((Executable) => {
            return Object.assign({Executable}, directories);
        });
    },
    getFirefoxExecutableAndDir () {
        return Promise.resolve([path.join(
            directories.Progs,
            (isWin ? 'firefox.exe' : 'Firefox.app')
        ), directories.Progs]);
    },
    saveTemplate ({templateName, content, lastTemplate}) {
        const profD = directories.ProfD,
            template = path.join(profD, 'executable-creator', templateName + '.html');
        lastTemplate = lastTemplate ? path.join(profD, 'executable-creator', lastTemplate + '.html') : null;

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
            const template = path.join(ec, fileName + '.html');
            unlink(template).catch((err) => {
                if (err.code === 'ENOENT') { // File doens't exist
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
            template = path.join(profD, 'executable-creator', fileName + '.html');
        return readFile(template, 'utf8');
    },
    _makeProfileDir (dir) {
        const profD = directories.ProfD,
            pDir = path.join(profD, dir);
        return mkdirp(pDir).catch((err) => {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }).then(() => pDir);
    },
    _makeECDir () {
        return this._makeProfileDir('executable-creator');
    },
    getTemplates () {
        return this._makeECDir().then((ec) => {
            return readdir(ec);
        }).then((files) => {
            return files
                .filter((f) => f.match(/\.html$/))
                .map((f) => f.replace(/\.html$/, ''));
        });
    },
    autocompleteURLHistory ({listID, value: userVal}) {
        /*
        // TODO:
        const historyService = Cc['@mozilla.org/browser/nav-history-service;1'].getService(Ci.nsINavHistoryService),
            // No query options set will get all history, sorted in database order,
            // which is nsINavHistoryQueryOptions.SORT_BY_NONE.
            options = historyService.getNewQueryOptions(),
            query = historyService.getNewQuery(), // No query parameters will return everything
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

        return Promise.resolve({
            listID,
            optValues,
            optIcons,
            userVal // Just for debugging on the other side
        });
        */
    },
    autocompleteValues ({value: userVal, dirOnly, listID}) {
        console.log('stat', stat);
        /*
        const dir = path.dirname(userVal),
            base = path.basename(userVal);
        let optValues;

        if (file.exists(userVal)) {
            if (userVal.match(/(?:\/|\\)$/)) {
                optValues = file.list(userVal).map(function (fileInDir) {
                    return path.join(userVal, fileInDir);
                });
            } else {
                optValues = [userVal];
            }
        } else if (file.exists(dir)) {
            optValues = file.list(dir).filter((fileInDir) => {
                return fileInDir.indexOf(base) === 0;
            }).map((fileInDir) => {
                return path.join(dir, fileInDir);
            });
        }

        const optValuesRetrieved = dirOnly
            ? Promise.all(optValues.map((optValue) => {
                try {
                    return stat(optValue).then((stats) => {
                        return [stats.isDirectory(), optValue];
                    });
                } catch (err) {
                    return [false];
                }
            })).then((optValues) => {
                return optValues.filter(([bool]) => bool).map(([, optValue]) => optValue);
            })
            : Promise.resolve(optValues);
        return optValuesRetrieved.then((optValues) => {
            return {
                listID,
                optValues,
                userVal // Just for debugging on the other side
            };
        });
        */
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
    case 'nodeEval': {
        output.write('"Node eval"');
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
    output.write('"Begin test"');
    ws.on('message', (msg) => { // Strings or buffer
        const msgObj = JSON.parse(msg);
        processMessage(msgObj).then((msgObj) => {
            ws.send(JSON.stringify(msgObj)); // Send back to client in case it might use
            output.write(msgObj); // Send contents to add-on
        });
    });
});
})();
