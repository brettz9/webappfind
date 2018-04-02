/* eslint-env webextensions */

var ExecBridge = (() => { // eslint-disable-line no-var, no-unused-vars
'use strict';

const {getNodeJSON} = browser.extension.getBackgroundPage();

/**
* Call the command line with the supplied arguments
* @param {object} Object with property "args"
* @example {args: ['-P', '-no-remote']}
*/
function cmd (args) {
    return getNodeJSON('cmd', args);
}

function execFile (aFile, args = [], options) {
    return getNodeJSON('execFile', aFile, args, options);
}

return {
    cmd,
    execFile
};
})();
