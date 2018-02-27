const fs = require('fs');
const path = require('path');
const os = require('os');
const {mkdirp, writeFile, copyExecutable, regedit} = require('./promise-wrappers');

const browsers = ['Chrome', 'Chromium', 'Firefox'];
const extensionName = 'webappfind'; // Also used for JSON file name
const extensionID = 'efhdimmjkephclkpmlhpdhcikmmeohip'; // Todo: Set programmatically?

const platform = process.platform;
const isWin = /^win/.test(platform);
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';
const osType = isMac ? 'macos' : (isWin ? 'win' : 'linux');
const arch = process.arch;

const pathMatrix = {
    Chrome: {
        linux: {
            allUsers: '/etc/opt/chrome/native-messaging-hosts',
            singleUser: '~/.config/google-chrome/NativeMessagingHosts'
        },
        macos: {
            allUsers: '/Library/Google/Chrome/NativeMessagingHosts',
            singleUser: '~/Library/Application Support/Google/Chrome/NativeMessagingHosts'
        }
    },
    Chromium: {
        linux: {
            allUsers: '/etc/chromium/native-messaging-hosts',
            singleUser: '~/.config/chromium/NativeMessagingHosts'
        },
        macos: {
            allUsers: '/Library/Application Support/Chromium/NativeMessagingHosts',
            singleUser: '~/Library/Application Support/Chromium/NativeMessagingHosts'
        }
    },
    Firefox: {
        linux: {
            allUsers: '/usr/lib/mozilla/native-messaging-hosts', // Could also begin with '/usr/lib64/'
            singleUser: '~/.mozilla/native-messaging-hosts'
        },
        macos: {
            allUsers: '/Library/Application Support/Mozilla/NativeMessagingHosts',
            singleUser: '~/Library/Application Support/Mozilla/NativeMessagingHosts'
        }
    }
};

exports.localInstall = function localInstall ({
    userInstallType,
    buildInfoIntoName = false,
    pkg = false,
    nodeVersion = process.version.match(/v(\d+)/)[1]
}) {
    /*
    See:
    - **Firefox, etc.**: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging
    - **Chrome**: https://developer.chrome.com/extensions/nativeMessaging#native-messaging-host-location
    */

    // CONFIG
    const userType = userInstallType === 'all-users' ? 'allUsers' : 'singleUser';

    if (!(isWin || isMac || isLinux)) {
        throw new Error('Unsupported OS!', platform);
    }
    if (!['x64', 'x86', 'armv6', 'armv7'].includes(arch)) {
        throw new Error('Unsupported system architecture detected: ', arch);
    }

    // const executableSuffix = isMac ? '.app' : (isWin ? '.exe' : ''); // Todo: Address permissions for Linux
    const nativeAppFileName = (pkg && buildInfoIntoName
        ? 'node' + nodeVersion + '-' + osType + '-' + arch + '-'
        : ''
    ) + 'native-app' + (pkg ? '' : (isWin ? '.bat' : '.sh')); // + executableSuffix;

    // Todo: Test all browser/platform combos
    return Promise.all(browsers.map((browser) => {
        const appManifestDirectory = isWin
            ? __dirname
            : pathMatrix[browser][osType][userType].replace(/^~/, (n0) => os.homedir());
        const mainNativeScriptPath = path.join(appManifestDirectory, nativeAppFileName);
        const appManifestPath = path.join(appManifestDirectory, extensionName + '.json');

        if (!pkg) {
            const mainNativeScriptJS = path.join(__dirname, '../native-app.js');
            if (isMac || isLinux) {
                fs.writeFileSync(mainNativeScriptPath, `#!/bin/bash
node "${mainNativeScriptJS}"
            `);
            } else if (isWin) {
                fs.writeFileSync(mainNativeScriptPath, `${mainNativeScriptJS}
            `);
            }
            fs.chmodSync(mainNativeScriptPath, '755');
        }

        // Todo: Avoid rewriting directory if Windows
        return Promise.all([
            mkdirp(appManifestDirectory)
                .catch((err) => {
                    console.log(`Error saving ${browser} app manifest directory (${osType}) at ${appManifestDirectory}`, err);
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
                        pkg ? copyExecutable(
                            // We install this file where there is a known directory and so it
                            //   can be discovered
                            path.join(__dirname, '../bin/', nativeAppFileName),
                            mainNativeScriptPath
                        ).catch((err) => {
                            console.log('Error copying native messaging executable.', err);
                            throw err;
                        }) : Promise.resolve()
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
        const regKey = (userType === 'allUsers'
            ? 'HKEY_LOCAL_MACHINE'
            : 'HKEY_CURRENT_USER'
        ) + `\\SOFTWARE\\` +
        (browser === 'Firefox'
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
};
