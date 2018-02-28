const nativeMessage = require('chrome-native-messaging');
const WebSocket = require('ws');
const {execFile} = require('../polyfills/promise-wrappers');

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
        ws.send(JSON.stringify(argv));
    });

    ws.on('message', (data) => {
        // console.log('msg recd back by client: ' + data);
        ws.close();
    });
    return;
} case 'build-openwith-exec': {
    // Todo: Allow calling this functionality from within the add-on
    const appleScript = `
-- Command line usage example: open ./webappfind-as.app --args /Users/brett/myFile.txt
--   Could pass in other flags at end too, but not usable with "open with"

on run {input}
    tell application "Finder"
        try
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
        -- todo: Could prompt for, and allow input for, multiple files or folder
        set filePath to POSIX path of (input as text) -- cast to posix file object and get path
        -- display dialog filePath -- For debugging
        do shell script "/usr/local/bin/node /Users/brett/webappfind/native-app.js ` +
            `--method=client --file=" & ` +
            ('file' in argv ? escapeBashDoubleQuoted(argv.file) : `quoted form of filePath`) +
            (['mode', 'site', 'args'].reduce((s, param) => {
                if (!(param in argv)) {
                    return s;
                }
                const paramValue = argv[param];
                return `${s} ${param}="${escapeBashDoubleQuoted(paramValue)}"`;
            }, '') || ' ""') + `
    end tell

    return input
end run
`;
    // Todo: evaluate and compile to application, optionally associate to file type and/or add to dock
    console.log('appleScript', appleScript);
    execFile('osacompile', ['-o', 'output.app', '-e', appleScript]);
    return;
}
}

const input = new nativeMessage.Input();
const transform = new nativeMessage.Transform(messageHandler);
const output = new nativeMessage.Output();

process.stdin
    .pipe(input)
    .pipe(transform)
    .pipe(output)
    .pipe(process.stdout);

function messageHandler (msg, push, done) {
    // We'll just echo the message for now
    push(msg);
    done();
}

const backgroundScript = new nativeMessage.Output();
backgroundScript.pipe(process.stdout);

backgroundScript.write('Starting (in native app)');

const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const msgObj = JSON.parse(msg);
        const {method} = msgObj;
        switch (method) {
        case 'client': {
            ['file', 'mode', 'site', 'args'].forEach((prop) => {
                const value = msgObj[prop];
                if (value !== undefined) {
                    backgroundScript.write('Native app server received: ' + prop + ' = ' + value);
                    ws.send(JSON.stringify({prop, value}));
                }
            });
            break;
        }
        }
    });
});
})();
