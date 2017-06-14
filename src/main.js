/*
See:
- **Firefox, etc.**: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging
- **Chrome**: https://developer.chrome.com/extensions/nativeMessaging#native-messaging-host-location
*/

const allUsers = !!process.argv[2];
const fs = require('fs');

const extensionName = 'webappfind'; // Also used for JSON file name

const isWin = /^win/.test(process.platform);
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
if (!(isWin || isMac || isLinux)) {
    console.log('Unsupported OS!');
    process.exit();
}

const appManifestDirectory = isMac
    ? (allUsers ? '' : '~') +
        `/Library/Application Support/Mozilla/NativeMessagingHosts/`
    : (isWin
        ? __dirname
        // Todo: Untested on Linux (but should be ok)
        : (allUsers
            ? '/usr/lib/' // Could also be '/usr/lib64/'
            : '~/.'
        ) + `mozilla/native-messaging-hosts/`
    );

fs.mkdir(appManifestDirectory, (err) => {
    if (err && err.code !== 'EEXIST') {
        console.log(
            'Error saving app manifest directory (' +
            (isMac ? 'Mac' : 'Linux') + ')',
            err
        );
    }
    const appManifest = {
        name: 'webappfind',
        description: 'WebAppFind host for native messaging',
        type: 'stdio',
        allowed_extensions: [ 'webappfind@brett-zamir.me' ],
        path: '' // Todo: Executable path
    };
    const appManifestPath = `${appManifestDirectory + extensionName}.json`;
    fs.writeFile(
        appManifestPath,
        JSON.stringify(appManifest, null, 2),
        (err) => {
            if (err) {
                console.log('Error writing app manifest file', err);
                return;
            }
            console.log('ok');
            if (isWin) {
                writeToWindowRegistery(appManifestPath);
            }
        }
    );
});

function writeToWindowRegistery (appManifestPath) {
    if (isWin) {
        // Todo: UNTESTED!!!
        const regedit = require('regedit');
        const regKey = (allUsers
            ? 'HKEY_LOCAL_MACHINE'
            : 'HKEY_CURRENT_USER'
        ) + `\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\${extensionName}`;
        regedit.putValue({
            [regKey]: {
                appManifestPath: { // Name (here `appManifestPath`) is unused for defaults
                    value: appManifestPath, // e.g., C:\\webappfind/src/webappfind.json
                    type: 'REG_DEFAULT'
                }
            }
        }, (err) => {
            if (err) {
                console.log('Erroring saving to (Windows) registry.');
                return;
            }
            console.log('Saved to Windows registry');
        });
    }
}
