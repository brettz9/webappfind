const nativeMessage = require('chrome-native-messaging');
const WebSocket = require('ws');
const uuid = require('uuid/v4');
const {execFile, readFile, writeFile} = require('./polyfills/promise-wrappers');

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

function messageHandler (msg, push, done) {
    output.write('message handler' + msg);
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
    output.write('"eval1"');
    const {method, file, binary, content, tabID, pathID} = msgObj;
    switch (method) {
    case 'nodeEval': {
        output.write('"Node eval"');
        const {i, string, tabID} = msgObj;
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
