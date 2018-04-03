/* eslint-env webextensions */
/* globals _ */

var EnvironmentBridge = (() => { // eslint-disable-line no-var, no-unused-vars
'use strict';

const {getNodeJSON} = browser.extension.getBackgroundPage();

function getHardPaths () {
    return getNodeJSON('getHardPaths');
}

async function getHardPath (dir) {
    const [paths] = await initPromise;
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
    const [paths, firefoxExecutablePath] = await initPromise;
    return {
        type: 'executables',
        paths: [
            [_('Firefox'), firefoxExecutablePath],
            [_('Command_prompt'), paths.cmdExe]
        ]
    };
}

let initPromise;

async function init () {
    if (initPromise) {
        return initPromise;
    }
    initPromise = Promise.all([ /*, profiles */
        getHardPaths(),
        getBrowserExecutable()
    ]);
    return initPromise;
}
init(); // Get things started

return {
    getHardPaths,
    getHardPath,
    getBrowserExecutableAndDir,
    getBrowserExecutable,
    getTempPaths,
    getExePaths
};
})();
