/* eslint-env webextensions */
/* globals _ */

var EnvironmentBridge = (() => { // eslint-disable-line no-var, no-unused-vars
'use strict';

const {getNodeJSON} = browser.extension.getBackgroundPage();

function getHardPaths () {
    return getNodeJSON('getHardPaths');
}

async function getHardPath (dir) {
    await init();
    return paths[dir];
}

function getBrowserExecutableAndDir () {
    return getNodeJSON('getBrowserExecutableAndDir');
}

async function getBrowserExecutable () {
    const [aFile] = await getBrowserExecutableAndDir();
    return aFile;
}
async function getTempPaths () {
    return {
        type: 'temps',
        paths: [
            [_('System_temp'), await getHardPath('TmpD')]
        ]
    };
};
async function getExePaths () {
    await init();
    return {
        type: 'executables',
        paths: [
            [_('Firefox'), firefoxExecutablePath],
            [_('Command_prompt'), paths.cmdExe]
        ]
    };
}

let paths, firefoxExecutablePath;

async function init () {
    if (paths) {
        return;
    }
    ([paths, firefoxExecutablePath] = await Promise.all([ /*, profiles */
        getHardPaths(),
        getBrowserExecutable()
    ]));
};
init();

return {
    getHardPaths,
    getHardPath,
    getBrowserExecutableAndDir,
    getBrowserExecutable,
    getTempPaths,
    getExePaths
};
})();
