/* eslint-env node */
const {execFile} = require('child_process');

execFile(
    '/Users/brett/Library/Application Support/Mozilla/NativeMessagingHosts/native-app',
    [
        '--method=client',
        '--string="abc"',
        '--mode=edit',
        '--site="http://localhost:8005/demos/html.html"'
    ],
    (err, result) => {
        console.log('err', err);
        console.log('result', result);
    }
);
