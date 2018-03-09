/* eslint-env webextensions, browser */
const portEvl = browser.runtime.connect({name: 'webappfind-eval-content-script'});

let i = 0;
portEvl.onMessage.addListener(function ({i, error, result}) {
    window.postMessage({webappfind: {i, result, error}}, '*');
});

window.addEventListener('message', ({data}) => {
    const {string, method} = data.webappfind;
    switch (method) {
    case 'addonEval':
        console.log('addoneval');
        i++;
        portEvl.postMessage({string, i});
        break;
    case 'nodeEval':
        break;
    }
});

window.postMessage({webappfind: {
    evalReady: true
}}, '*');
