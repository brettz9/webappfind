/* eslint-env node */
const {execFile} = require('child_process');

const file = '/Users/brett/Library/Application Support/Mozilla/NativeMessagingHosts/native-app';
const args = [
    '--method=client',
    '--string="abc"',
    '--mode=edit',
    '--site="http://localhost:8005/demos/html.html"'
];
console.log(file);
console.log(args);
execFile(
    file,
    args,
    (err, result) => {
        console.log('err', err);
        console.log('result', result);
    }
);
