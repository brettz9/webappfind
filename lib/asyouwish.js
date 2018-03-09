/* eslint-env webextensions, browser */
const portEvl = browser.runtime.connect({name: 'webappfind-eval-content-script'});

let i = 0;
portEvl.onMessage.addListener(function ({i, error, result, type}) {
    window.postMessage({webappfind: {i, result, error, type}}, '*');
});

// Todo: We ought to give some site-based permissions here
window.addEventListener('message', ({data}) => {
    const {string, method} = data.webappfind;
    i++;
    switch (method) {
    case 'addonEval': {
        const ok = confirm(
            `Are you sure you trust this site to
            evaluate potentially dangerous add-on code?`
        );
        if (ok) {
            portEvl.postMessage({string, i, method});
        }
        break;
    } case 'nodeEval': {
        const ok = confirm(
            `Are you sure you trust this site to
            evaluate potentially dangerous Node.js code?`
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
}}, '*');
