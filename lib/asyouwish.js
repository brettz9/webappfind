/* eslint-env webextensions, browser */
function _ (...args) {
    try {
        return browser.i18n.getMessage(...args);
    } catch (err) {
        return `(Non-internationalized string--FIXME!) ${args.join(', ')}`;
    }
}

const portEvl = browser.runtime.connect({name: 'webappfind-eval-content-script'});

const orig = (/^file:/).test(location.href) ? '*' : location.origin;

let i = 0;
portEvl.onMessage.addListener(function ({i, error, result, type}) {
    window.postMessage({webappfind: {i, result, error, type}}, orig);
});

// Todo: We ought to give some site-based permissions here
window.addEventListener('message', ({data}) => {
    const {string, method} = data.webappfind;
    i++;
    switch (method) {
    case 'addonEval': {
        const ok = confirm(
            _('trust_site_addon_code')
        );
        if (ok) {
            portEvl.postMessage({string, i, method});
        }
        break;
    } case 'nodeEval': {
        const ok = confirm(
            _('trust_site_node_code')
        );
        if (ok) {
            portEvl.postMessage({string, i, method});
        }
        break;
    }
    }
});

window.postMessage({webappfind: {
    evalReady: true
}}, orig);
