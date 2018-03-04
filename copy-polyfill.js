const path = require('path');
const {copyFile} = require('./polyfills/promise-wrappers');
const polyfillFile = 'browser-polyfill.js'; // could end in .min.js instead
copyFile(
    path.join(
        __dirname,
        'node_modules/webextension-polyfill/dist/',
        polyfillFile
    ),
    path.join(__dirname, 'polyfills', polyfillFile)
).then(() => {
    console.log('Copied polyfill file.');
}).catch((err) => {
    console.log('Error copying polyfill file', err);
});
