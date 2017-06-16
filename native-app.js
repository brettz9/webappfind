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
    // Just echo the message:
    push(msg);
    done();
}
