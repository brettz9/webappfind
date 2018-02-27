const nativeMessage = require('chrome-native-messaging');
const WebSocket = require('ws');

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
