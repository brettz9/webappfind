/*
See:
- **Firefox, etc.**: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging
- **Chrome**: https://developer.chrome.com/extensions/nativeMessaging#native-messaging-host-location
*/

// CONFIG
const allUsers = !!process.argv[2];
const userType = allUsers ? 'allUsers' : 'singleUser';
const browsers = ['Chrome', 'Chromium', 'Firefox'];
const extensionName = 'webappfind'; // Also used for JSON file name

const fs = require('fs');
const os = require('os');
const mkdirp = require('mkdirp');

const isWin = /^win/.test(process.platform);
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
const osType = isMac ? 'Mac' : (isWin ? 'Windows' : 'Linux');
if (!(isWin || isMac || isLinux)) {
    console.log('Unsupported OS!');
    process.exit();
}
const pathMatrix = {
    Chrome: {
        Linux: {
            allUsers: '/etc/opt/chrome/native-messaging-hosts/',
            singleUser: '~/.config/google-chrome/NativeMessagingHosts/'
        },
        Mac: {
            allUsers: '/Library/Google/Chrome/NativeMessagingHosts/',
            singleUser: '~/Library/Application Support/Google/Chrome/NativeMessagingHosts/'
        }
    },
    Chromium: {
        Linux: {
            allUsers: '/etc/chromium/native-messaging-hosts/',
            singleUser: '~/.config/chromium/NativeMessagingHosts/'
        },
        Mac: {
            allUsers: '/Library/Application Support/Chromium/NativeMessagingHosts/',
            singleUser: '~/Library/Application Support/Chromium/NativeMessagingHosts/'
        }
    },
    Firefox: {
        Linux: {
            allUsers: '/usr/lib/mozilla/native-messaging-hosts/', // Could also begin with '/usr/lib64/'
            singleUser: '~/.mozilla/native-messaging-hosts/'
        },
        Mac: {
            allUsers: '/Library/Application Support/Mozilla/NativeMessagingHosts/',
            singleUser: '~/Library/Application Support/Mozilla/NativeMessagingHosts/'
        }
    }
};

// Todo: Test all browser/platform combos
browsers.forEach((browser) => {
    const appManifestDirectory = isWin
        ? __dirname
        : pathMatrix[browser][osType][userType].replace(/^~/, (n0) => os.homedir());

    mkdirp(appManifestDirectory, (err) => {
        if (err && err.code !== 'EEXIST') {
            console.log(
                `Error saving ${browser} app manifest directory (${osType})`,
                err
            );
        }
        const appManifest = {
            name: `${extensionName}`,
            description: 'Node bridge for native messaging',
            type: 'stdio',
            path: '' // Todo: Executable path
        };
        switch (browser) {
        case 'Firefox':
            appManifest.allowed_extensions = [`${extensionName}@brett-zamir.me`];
            break;
        case 'Chrome': case 'Chromium':
            appManifest.allowed_origins = [`chrome-extension://${extensionName}`];
            break;
        }
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
                    if (browsers.includes('Chrome') && browsers.include('Chromium') &&
                        browser === 'Chromium') {
                        // Only need one run
                        return;
                    }
                    writeToWindowRegistery(browser, appManifestPath);
                }
            }
        );
    });
});

function writeToWindowRegistery (browser, appManifestPath) {
    // Todo: UNTESTED!!!
    const regedit = require('regedit');
    const regKey = (allUsers
        ? 'HKEY_LOCAL_MACHINE'
        : 'HKEY_CURRENT_USER'
    ) + `\\SOFTWARE\\` + (browser === 'Firefox'
        ? `Mozilla\\NativeMessagingHosts\\${extensionName}`
        : `Google\\Chrome\\NativeMessagingHosts\\`
    );
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
