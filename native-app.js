const nativeMessage = require('chrome-native-messaging');
const WebSocket = require('ws');

const argv = require('minimist')(process.argv.slice(2));
const {method} = argv;

(() => {
switch (method) { // We're reusing this executable to accept messages for setting up a client
case 'webappfind':
case 'client': {
    const ws = new WebSocket('ws://localhost:8080');

    ws.on('open', () => {
        ws.send(JSON.stringify(argv));
    });

    ws.on('message', (data) => {
        // console.log('msg recd by client: ' + data);
        ws.close();
    });
    return;
} case 'build-openwith-exec': {
    // Todo: Allow calling this functionality from within the add-on
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
            ['file', 'directory', 'mode', 'site', 'args'].forEach((prop) => {
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
