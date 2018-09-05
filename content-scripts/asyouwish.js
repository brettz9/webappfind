/* eslint-env webextensions, browser */

var AsYouWish; // eslint-disable-line no-var, no-unused-vars

// import {_} from '/utils/i18n.js';
// Todo: Replace this with the line above once
//        https://bugzilla.mozilla.org/show_bug.cgi?id=1451545
//        may be implemented
const _ = function _ (...args) {
    try {
        return browser.i18n.getMessage(...args);
    } catch (err) {
        return `(Non-internationalized string--FIXME!) ${args.join(', ')}`;
    }
};

// Todo: Ask for permissions at run-time? <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Request_the_right_permissions>
const portEvl = browser.runtime.connect({name: 'webappfind-eval-content-script'});

const orig = (/^file:/).test(location.href) ? '*' : location.origin;

let i = 0;
portEvl.onMessage.addListener(function ({i, error, result, type}) {
    window.postMessage({webappfind: {i, result, error, type}}, orig);
});

window.addEventListener('message', async ({data}) => {
    const {string, method} = data.webappfind;

    const {origin, pathname, search} = new URL(location);
    const currentSite = origin + pathname + search;
    let allowedSites = [];
    try {
        ({
            allowedSites: {optionValues: allowedSites = []}
        } = await browser.storage.local.get());
    } catch (err) {}

    const avoidConfirm = allowedSites.includes(currentSite);

    i++;
    switch (method) {
    case 'addonEval': {
        const ok = avoidConfirm || confirm(
            _('trust_site_addon_code')
        );
        if (ok) {
            portEvl.postMessage({string, i, method});
        }
        break;
    } case 'nodeEval': {
        const ok = avoidConfirm || confirm(
            _('trust_site_node_code')
        );
        if (ok) {
            portEvl.postMessage({string, i, method});
        }
        break;
    }
    }
});

// For AsYouWish privileges permitted after load
window.postMessage({webappfind: {
    evalReady: true
}}, orig);
