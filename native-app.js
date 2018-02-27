const nativeMessage = require('chrome-native-messaging');
const WebSocket = require('ws');

const argType = process.argv[2];
const clientMessage = process.argv[3];

(() => {
switch (argType) { // We're reusing this executable to accept messages for setting up a client
case 'webappfind':
case 'webappfind-client': {
    const ws = new WebSocket('ws://localhost:8080');

    ws.on('open', () => {
        ws.send(clientMessage);
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
        backgroundScript.write('Native app server received: ' + msg);
        ws.send('Native app server sending back: ' + msg);
    });
});
})();
