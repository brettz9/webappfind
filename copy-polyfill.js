const fs = require('fs');
const path = require('path');
const polyfillFile = 'browser-polyfill.js'; // could end in .min.js instead
fs.writeFile(
    path.join(__dirname, polyfillFile),
    fs.readFileSync(
        path.join(
            __dirname,
            'node_modules/webextension-polyfill/dist/',
            polyfillFile
        )
    ),
    (err) => {
        if (err) {
            console.log('Error copying polyfill file', err);
            return;
        }
        console.log('Copied polyfill file.');
    }
);
