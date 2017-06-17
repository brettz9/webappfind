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
const extensionID = 'efhdimmjkephclkpmlhpdhcikmmeohip'; // Todo: Set programmatically?

const path = require('path');
const os = require('os');
const {mkdirp, writeFile, copyExecutable, regedit} = require('./promise-wrappers');

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
            allUsers: '/etc/opt/chrome/native-messaging-hosts',
            singleUser: '~/.config/google-chrome/NativeMessagingHosts'
        },
        Mac: {
            allUsers: '/Library/Google/Chrome/NativeMessagingHosts',
            singleUser: '~/Library/Application Support/Google/Chrome/NativeMessagingHosts'
        }
    },
    Chromium: {
        Linux: {
            allUsers: '/etc/chromium/native-messaging-hosts',
            singleUser: '~/.config/chromium/NativeMessagingHosts'
        },
        Mac: {
            allUsers: '/Library/Application Support/Chromium/NativeMessagingHosts',
            singleUser: '~/Library/Application Support/Chromium/NativeMessagingHosts'
        }
    },
    Firefox: {
        Linux: {
            allUsers: '/usr/lib/mozilla/native-messaging-hosts', // Could also begin with '/usr/lib64/'
            singleUser: '~/.mozilla/native-messaging-hosts'
        },
        Mac: {
            allUsers: '/Library/Application Support/Mozilla/NativeMessagingHosts',
            singleUser: '~/Library/Application Support/Mozilla/NativeMessagingHosts'
        }
    }
};

// Todo: Test all browser/platform combos
Promise.all(browsers.map((browser) => {
    const appManifestDirectory = isWin
        ? __dirname
        : pathMatrix[browser][osType][userType].replace(/^~/, (n0) => os.homedir());
    // const executableSuffix = isMac ? '.app' : (isWin ? '.exe' : ''); // Todo: Address permissions for Linux
    const nativeAppFileName = 'native-app'; // + executableSuffix;
    const mainNativeScriptPath = path.join(appManifestDirectory, nativeAppFileName);
    const appManifestPath = path.join(appManifestDirectory, extensionName + '.json');

    // Todo: Avoid rewriting directory if Windows
    return Promise.all([
        mkdirp(appManifestDirectory)
        .catch((err) => {
            console.log(`Error saving ${browser} app manifest directory (${osType})`, err);
            throw err;
        })
        .then(() => {
            const appManifest = {
                name: `${extensionName}`,
                description: 'Node bridge for native messaging',
                type: 'stdio',
                path: mainNativeScriptPath
                /*
                Todo: Could add? Or just rely on default of it being added as an asset?
                "pkg": {
                    "assets": ["bin/native-app"]
                },
                */
            };
            switch (browser) {
            case 'Firefox':
                appManifest.allowed_extensions = [`${extensionName}@brett-zamir.me`];
                break;
            case 'Chrome': case 'Chromium':
                appManifest.allowed_origins = [`chrome-extension://${extensionID}`];
                break;
            }
            return Promise.all([
                writeFile(
                    appManifestPath,
                    JSON.stringify(appManifest, null, 2)
                ).catch((err) => {
                    if (err.code === 'EEXIST') {
                        return;
                    }
                    console.log(
                        `Error saving ${browser} app manifest file (${osType})`,
                        err
                    );
                    throw err;
                }),
                copyExecutable(
                    // We install this file where there is a known directory and so it
                    //   can be discovered
                    path.join(__dirname, '../bin/native-app'), // Hard-coded name here for `pkg`
                    mainNativeScriptPath
                ).catch((err) => {
                    console.log('Error copying native messaging executable.', err);
                    throw err;
                })
            ]);
        }),
        (isWin && (!browsers.includes('Chrome') || !browsers.include('Chromium') ||
            browser !== 'Chromium') // Avoid re-running for Chrome/Chromium
            ? writeToWindowRegistery(browser, appManifestPath)
            : Promise.resolve()
        )
    ]);
})).then(() => {
    console.log('Finished installation.');
}).catch(() => {
    console.log('Exiting with errors');
});

function writeToWindowRegistery (browser, appManifestPath) {
    // Todo: UNTESTED!!!
    // For REG EDIT: see https://technet.microsoft.com/en-us/library/cc742162(v=ws.11).aspx
    const regKey = (allUsers
        ? 'HKEY_LOCAL_MACHINE'
        : 'HKEY_CURRENT_USER'
    ) + `\\SOFTWARE\\` + (browser === 'Firefox'
        ? `Mozilla\\NativeMessagingHosts\\${extensionName}`
        : `Google\\Chrome\\NativeMessagingHosts\\`
    );
    return regedit.putValue({
        [regKey]: {
            appManifestPath: { // Name (here `appManifestPath`) is unused for defaults
                value: appManifestPath, // e.g., C:\\webappfind/src/webappfind.json
                type: 'REG_DEFAULT'
            }
        }
    }).catch((err) => {
        console.log('Erroring saving app manifest info to (Windows) registry.');
        throw err;
    });
}
