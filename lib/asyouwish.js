/* eslint-env webextensions, browser */
const portEvl = browser.runtime.connect({name: 'webappfind-eval-content-script'});

let i = 0;
portEvl.onMessage.addListener(function ({i, error, result}) {
    window.postMessage({webappfind: {i, result, error}}, '*');
});

// Todo: We ought to give some site-based permissions here
window.addEventListener('message', ({data}) => {
    const {string, method} = data.webappfind;
    switch (method) {
    case 'addonEval':
        i++;
        const ok = confirm(
            `Are you sure you trust this site to
            evaluate potentially dangerous add-on code?`
        );
        if (ok) {
            portEvl.postMessage({string, i});
        }
        break;
    case 'nodeEval':
        break;
    }
});

window.postMessage({webappfind: {
    evalReady: true
}}, '*');
