/*
See:
- **Firefox, etc.**: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging
- **Chrome**: https://developer.chrome.com/extensions/nativeMessaging#native-messaging-host-location

*/

const allUsers = false;
const path = require('path');

const extensionName = 'webappfind'; // Also used for JSON file name

const isWin = /^win/.test(process.platform);
const isMac = process.platform === 'darwin';
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
                value: path.resolve(`./${extensionName}.json`), // e.g., C:\\webappfind.json
                type: 'REG_DEFAULT'
            }
        }
    }, function (err) {
        if (err) {
            console.log('Erroring saving to (Windows) registry.')
            return;
        }
        console.log('Saved to Windows registry');
    });
} else if (isMac) {
    const manifestPath = (allUsers ? '' : '~') +
        `/Library/Application Support/Mozilla/NativeMessagingHosts/${extensionName}.json`;
    console.log('manifestPath', manifestPath);
} else if (isLinux) {
    // Todo: UNTESTED!!! (but should work)
    const manifestPath = (allUsers
        ? '/usr/lib/' // Could also be '/usr/lib64/'
        : '~/.'
    ) + `mozilla/native-messaging-hosts/${extensionName}.json`;
} else {
    console.log('Unsupported OS!');
    process.exit();
}

console.log('end');
