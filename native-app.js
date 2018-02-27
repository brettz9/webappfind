const nativeMessage = require('chrome-native-messaging');

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

const outputOut = new nativeMessage.Output();
outputOut.pipe(process.stdout);

outputOut.write('Starting');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        outputOut.write('server received: ' + msg);
        ws.send('server sending back: ' + msg);
    });
});
