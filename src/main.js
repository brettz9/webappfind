/*
See:
- **Firefox, etc.**: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging
- **Chrome**: https://developer.chrome.com/extensions/nativeMessaging#native-messaging-host-location

*/

const allUsers = !!process.argv[2];
const path = require('path');
const fs = require('fs');

const extensionName = 'webappfind'; // Also used for JSON file name

const isWin = /^win/.test(process.platform);
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
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
                value:
                    // e.g., C:\\webappfind.json
                    path.join(__dirname, extensionName + '.json'),
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
} else if (isMac || isLinux) {
    const manifestDirectory = isMac
        ? (allUsers ? '' : '~') +
            `/Library/Application Support/Mozilla/NativeMessagingHosts/`
        // Todo: Untested on Linux (but should be ok)
        : (allUsers
            ? '/usr/lib/' // Could also be '/usr/lib64/'
            : '~/.'
        ) + `mozilla/native-messaging-hosts/`;

    fs.mkdir(manifestDirectory, (err) => {
        if (err && err.code !== 'EEXIST') {
            console.log('Error saving manifest directory (' + (isMac ? 'Mac' : 'Linux') + ')', err);
        }
        fs.createReadStream(`${path.join(__dirname, extensionName)}.json`).pipe(
            fs.createWriteStream(`${manifestDirectory + extensionName}.json`)
        );
    });
} else {
    console.log('Unsupported OS!');
    process.exit();
}

console.log('end');
