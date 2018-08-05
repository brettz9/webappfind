/* eslint-env webextensions */

let {getNodeJSON} = browser.extension.getBackgroundPage();

/**
* Call the command line with the supplied arguments
* @param {object} Object with property "args"
* @example {args: ['-P', '-no-remote']}
*/
function cmd (args) {
    if (!getNodeJSON) {
        ({getNodeJSON} = browser.extension.getBackgroundPage());
    }
    return getNodeJSON('cmd', args);
}

function execFile (aFile, args = [], options) {
    if (!getNodeJSON) {
        ({getNodeJSON} = browser.extension.getBackgroundPage());
    }
    return getNodeJSON('execFile', aFile, args, options);
}

function client (args) {
    return getNodeJSON('client', args);
}

function buildOpenWithExecutable (args) {
    if (!getNodeJSON) {
        ({getNodeJSON} = browser.extension.getBackgroundPage());
    }
    return getNodeJSON('buildOpenWithExecutable', args);
}

export {
    cmd,
    execFile,
    client,
    buildOpenWithExecutable
};
