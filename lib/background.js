/* eslint-env webextensions */
/*
Note on polyfills:

[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
is available but see also:

- <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities>
- <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs>
*/

import setSelectorContext from '/lib/setSelectorContext.js';
import {executeCommand} from '/lib/execute.js';
import {_} from '/utils/i18n.js';

console.log('Starting webappfind (in background script)');

window.closeAYC = function (winID) {
    const win = windowsMap.get(parseInt(winID, 10));
    browser.windows.remove(win.id);
};

// https://bugzilla.mozilla.org/show_bug.cgi?id=1425829
async function firefoxWorkaroundForBlankPanel () {
    const {id, width, height} = await browser.windows.getCurrent();
    browser.windows.update(id, {
        width: width + 1,
        height: height + 1
    });
}

async function populateDynamicCMItems () {
    let commands;
    try {
        ({commands} = await browser.storage.local.get('commands'));
        console.log('commands', JSON.stringify(commands));
        let p = Promise.resolve();
        // Could replace with for-await-of
        // Could remove sort if wanted first-in-first-out sorting
        //   of user commands
        Object.entries(JSON.parse(commands || '{}')).sort(([aId], [bId]) => {
            return aId > bId;
        }).forEach(([id, commandDetail]) => {
            p = p.then(() => {
                console.log('adding', id, commandDetail);
                return addDynamicCMContent(id, commandDetail);
            });
        });
        await p;
        console.log('finished populating cms');
    } catch (err) {
        console.log('errr', err);
    }
}

const updateContextMenus = window.updateContextMenus = async function updateContextMenus () {
    await Promise.all([
        /*
        // Provide dialog asking for file to open? Move to WebAppFind code?
        ['atyourcommand-open-in-waf-edit', 'Open in WebAppFind edit mode', {
            contexts: ['page']
        }],
        */
        // Todo: invite (or utilize?) sharing of i18n with AppLauncher
        ['asyouwish', 'enable_asyouwish'],
        /*
        ['atyourcommand', 'atyourcommand_open_oneoff', {
            contexts: ['page', 'selection']
        }],
        */
        ['atyourcommand-one-off', 'Create_a_one_off_command', {
            contexts: ['page', 'selection']
        }],
        ['atyourcommand-commands', 'Edit_commands']
        // ['atyourcommand-prefs', 'Open_preferences']
    ].map(async ([menuID, menuI18nKey, {contexts} = {contexts: ['all']}]) => {
        try { // Errs at least in Chrome when not present
            await browser.contextMenus.remove(menuID);
        } catch (err) {
            console.log('failed removing', menuID);
        }
        let enabled = true;
        try {
            ({['pref_' + menuID]: enabled = true} =
                await browser.storage.local.get('pref_' + menuID));
        } catch (err) {
            console.log('failed getting pref_', menuID);
        }
        if (enabled) {
            console.log('trying create', menuID);
            await browser.contextMenus.create({
                id: menuID,
                title: _(menuI18nKey),
                contexts
            });
            console.log('end trying create', menuID);
        }
    }));
    await populateDynamicCMItems();
    console.log('end updateContextMenus');
};
updateContextMenus();

async function addDynamicCMContent (id, details) {
    const menuItemId = 'user-' + id;
    // Todo: Allow more diversity in contexts!
    // todo: handle `details.ownContext`
    // todo: handle `details.ignoreContext`
    try {
        await browser.contextMenus.remove(menuItemId);
    } catch (err) {}
    browser.contextMenus.create({
        id: menuItemId,
        // Todo: Allow 18nization of user menus (in case provided by a library)
        title: id,
        // targetUrlPatterns: array|string targeting href/src, // Might be useful
        contexts: ['all'] // ['page', 'selection'] // User's own context applied on top of this
        // icons: ''
    });
    // Currently available items (until we can actually get the
    //   element selector!!!): https://bugzilla.mozilla.org/show_bug.cgi?id=1325814
    // If textOnly, we don't need to restrict things
    //   further
    if (!details.textOnly &&
        (details.ownContext || (details.restrictContexts && details.restrictContexts.length))) {
        console.log('details.ownContext', details.ownContext);
        console.log('details.restrictContexts', details.restrictContexts);
        setSelectorContext({
            menuItemId,
            ownContext: details.ownContext,
            // ignoreSelector: // Todo:
            restrictContexts: details.restrictContexts,
            updateContextMenus
        });
    }
}

// Todo: Replace with equivalent to `Array.prototype.flatten` when decided:
//    https://github.com/tc39/proposal-flatMap/pull/56
function flatten (arr) {
    return [].concat(...arr);
}

browser.webNavigation.onDOMContentLoaded.addListener(async ({tabId, url}) => {
    if (!(/^(?:https|file)?:/).test(url)) {
        return;
    }
    // console.log('url', url);

    try {
        const metas = flatten(await browser.tabs.executeScript(tabId, {
            allFrames: true,
            code: `
    [...document.querySelectorAll('meta[name="webappfind"]')].map((m) => m.content)
    `,
            runAt: 'document_end'
        }));
        // console.log('metas', metas);

        if (metas.length) {
            // Todo if metas present but already associated, we
            //     probably want yet another icon
            // Todo: Replace `path` with a special icon
            browser.browserAction.setIcon({path: null, tabId});
        } else {
            browser.browserAction.setIcon({path: '/executable-builder/executable.svg', tabId});
        }
    } catch (err) {
        console.log('err', tabId, err);
    }
}); // , {url: []});

const urlToHeaders = new Map();
const windowsMap = new Map();
browser.webRequest.onHeadersReceived.addListener( // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onHeadersReceived
    // Properties:
    //    frameId, method, originUrl, parentFramdId,
    //    proxyInfo (host, port, type, username, proxyDNS, failoverTimeout),
    //    requestId,
    //    responseHeaders (requires arg below),
    //    statusCode, statusLine, tabId, timeStamp, type, url
    (details) => {
        urlToHeaders.set(details.tabId, details);
    },
    { // Filter: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/RequestFilter
        // urls: ['*'], // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns
        types: ['main_frame'], // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/ResourceType
        urls: ['*']
    },
    ['responseHeaders'] // 'blocking'
);

let winCtr = 0;
browser.contextMenus.onClicked.addListener(async (info, tab) => {
    const {menuItemId} = info;
    if ((/(atyourcommand|user)-/).test(menuItemId)) {
        // Todo: see `setSelectorContext` for pattern to get from page
        const {
            // selectionText,
            linkText = '', linkUrl = '',

            // pageUrl = '',
            frameUrl = '', srcUrl = '', mediaType = '', // (image|video|audio),

            // Potentially usable for retrieving other info
            // bookmarkId, frameId,

            // Potentially usuable for flagging extra info to script (should be universal, however)
            modifiers
            // , checked, wasChecked
            // menuItemId, parentMenuItemId
        } = info;
        const {
            // title = '', // Need tabs permission
            favIconUrl = '' // Need tabs permission
        } = tab;
        // Todo: tabs.captureTab(), tabs.captureVisibleTab() // Snapshot page as data URL
        // Todo: `customProperties` could instead by a function of promises (e.g., to
        //   resolve with a `localStorage` value from the page, etc.)
        // Todo: const results = getPageData({customProperties: []});
        const results = (/^about:/).test(tab.url)
            ? [{
                contentType: '',
                pageURL: '',
                pageTitle: '',
                pageHTML: '',
                bodyText: '',
                selectedHTML: '',
                selectedText: ''
            }]
            : await (async () => {
                const results = await browser.tabs.executeScript({
                    code: "typeof getPageData === 'function';"
                });
                if (!results || results[0] !== true) {
                    await browser.tabs.executeScript(tab.id, {
                        allFrames: true,
                        file: '/atyourcommand/getPageData.js', // Cross-browser to use absolute path
                        runAt: 'document_end'
                    });
                }
                return browser.tabs.executeScript(tab.id, {
                    allFrames: true,
                    code: 'getPageData();',
                    runAt: 'document_end'
                });
            })();
        // console.log('results', results);

        // As per https://stackoverflow.com/questions/41420528/communicate-between-scripts-in-the-background-context-background-script-browse/41420772#41420772
        //   a message handler won't be ready in our new (about) tab
        //   (and we can't use `tab.sendMessage` to send into it), so we let the script
        //   grab our data instead
        // const response = await browser.runtime.sendMessage(); // Omit third argument options
        let itemType;
        if (menuItemId.startsWith('atyourcommand-')) {
            itemType = menuItemId.replace(/^atyourcommand-/, '');
        }
        let details;
        try {
            details = urlToHeaders.get(tab.id);
            console.log('details', details);
            details = JSON.stringify(details);
            console.log('details2', details);
        } catch (err) {
            details = '';
        }

        const tabData = window.tabData = {
            itemType, // Not currently exposing
            // `modifiers` could be especially useful to `eval`
            modifiers: modifiers.join(';'),
            // Could be useful if allowing user to create such context menu types
            //     checked, wasChecked,
            // Todo:
            /*
            // These require retrieving the link first:
            'linkPageURLAsNativePath', 'linkPageTitle',
            'linkBodyText', 'linkPageHTML',
            // These require retrieving the image contents:
            'imageDataURL', 'imageDataBinary'
            */
            linkText, linkUrl,
            frameUrl, srcUrl, mediaType,
            favIconUrl,
            details,
            // Getting these three effectively within `results[0]` anyways
            // selectionText, pageUrl, title,
            ...results[0]
        };

        if (menuItemId.startsWith('user-')) {
            try {
                const name = menuItemId.replace(/^user-/, '');
                const commandlineOutput = await executeCommand(name, tabData);
                // Todo: Do something with command line ouput
                console.log('commandlineOutput', commandlineOutput);
            } catch (err) {
                // Todo: Handle errors
                console.log('err', err);
            }
            return;
        }

        let titlePreface = _('atyourcommand_window_title');
        switch (itemType) {
        case 'prefs':
            // Todo:
            break;
        case 'open-in-waf-edit':
            // Todo:
            break;
        case 'commands': case 'one-off':
            titlePreface = _('One_off');
            break;
        }

        const top = 5, left = 100; // Todo: Persist changes
        let width = 1000, height = 705;
        try {
            ({windowCoords: [width, height] = [width, height]} =
                await browser.storage.local.get('windowCoords'));
        } catch (err) {}

        winCtr++;
        // const popupURL = browser.extension.getURL('/atyourcommand/one-off.html');
        const win = await browser.windows.create({
            // focused: true, // Unsupported in Firefox
            // incognito: true,
            // state: '', // maximized|minimized|fullscreen
            // allowScriptsToClose: true,
            titlePreface,
            url: '/atyourcommand/one-off.html?ctr=' + winCtr, // popupURL,
            type: 'panel', // normal/popup/panel/detached_panel?
            top,
            left,
            width,
            height
        });
        windowsMap.set(winCtr, win);
        await firefoxWorkaroundForBlankPanel();
        return;
    }
    if (menuItemId !== 'asyouwish') {
        return;
    }
    const results = await browser.tabs.executeScript({
        code: "typeof WebAppFind === 'object';"
    });
    if (!results || results[0] !== true) {
        await browser.tabs.executeScript({
            allFrames: true,
            file: '/content-scripts/asyouwish.js', // Cross-browser to use absolute path
            runAt: 'document_start'
        });
    }
});

/**
On startup, connect to the "webappfind" app.
*/
const nativePort = browser.runtime.connectNative('webappfind');

const pathMessageMap = {};
const csPorts = [];

function getContentScriptPortForTabID (tabID) {
    return csPorts[tabID];
}
function deleteContentScriptPortByTabID (tabID) {
    delete csPorts[tabID];
}

browser.runtime.onConnect.addListener(function (p) {
    if (p.name === 'webappfind-eval-content-script') {
        p.onMessage.addListener(async function ({string, i, method}) {
            switch (method) {
            case 'addonEval': {
                let result;
                try {
                    result = eval(string); // eslint-disable-line no-eval
                    if (typeof result === 'function') {
                        result = result();
                    }
                    if (result && typeof result.then === 'function') {
                        result = await result;
                    }
                } catch (error) {
                    p.postMessage({type: 'addonEval', i, error});
                    return;
                }
                p.postMessage({type: 'addonEval', i, result});
                break;
            }
            case 'nodeEval': {
                csPorts[p.sender.tab.id] = p;
                // console.log('np', {string, i, method, tabID: p.sender.tab.id});
                nativePort.postMessage({string, i, method, tabID: p.sender.tab.id});
                break;
            }
            }
        });
        return;
    }
    if (p.name !== 'webappfind-postMessage-content-script') {
        return;
    }
    // console.log('setting port for ID', p.sender.tab.id);
    csPorts[p.sender.tab.id] = p;
});

let i = 0;
const proms = {};
window.getNodeJSON = function getNodeJSON (method, ...args) {
    return new Promise((resolve, reject) => {
        proms[++i] = {resolve, reject};
        nativePort.postMessage({i, method, args, nodeJSON: true});
    });
};

/**
Listen for messages from the webappfind native messaging app (which listens for websocket connections, ala "Open"/"Open with...").
*/
nativePort.onMessage.addListener(async (parsedObj) => {
    console.log('parsedObj', typeof parsedObj, parsedObj);
    if (typeof parsedObj !== 'object') {
        return;
    }
    const {method, nodeEval, saveEnd, nodeJSON} = parsedObj;
    switch (method) {
    case 'execbuildopen': {
        // Doesn't work as can only be activated by user action!
        // browser.browserAction.openPopup();
        return;
    }
    }
    if (nodeJSON) {
        const {i, error, result} = parsedObj;
        const prom = proms[i];
        if (error) {
            prom.reject(error);
            return;
        }
        prom.resolve(result);
        return;
    }
    // Todo: We might leverage `nodeJSON` above for refactoring these out
    if (nodeEval) {
        const {i, error, result} = parsedObj;
        const csPort = getContentScriptPortForTabID(parsedObj.tabID);
        if (!csPort) {
            console.log('`nodeEval` message cannot find content script port', parsedObj.tabID, csPorts);
            return;
        }
        csPort.postMessage(
            {type: 'nodeEval', i, result, error}
        );
        return;
    }
    if (saveEnd) {
        const csPort = getContentScriptPortForTabID(parsedObj.tabID);
        if (!csPort) {
            console.log('`saveEnd` message cannot find content script port', csPorts);
            return;
        }
        csPort.postMessage(
            {type: 'saveEnd', pathID: parsedObj.pathID, error: !!parsedObj.error}
        );
        return;
    }
    // ['file', 'mode', 'site', 'args'];
    if (!parsedObj.site) {
        // return;
    }
    // console.log('parsedObj.site', parsedObj.site.replace(/^"?(.*?)"?$/, '$1'));
    const tab = await browser.tabs.create({
        active: true, // Default is true
        url: parsedObj.site.replace(/^"?(.*?)"?$/, '$1')
    });

    // console.log('tab', tab);
    const results = await browser.tabs.executeScript(tab.id, {
        code: "typeof postMessageRelay !== 'undefined';"
    });
    // console.log('results', results);
    // Might reinvoke this on the same tab in the future
    if (!results || results[0] !== true) {
        /* const results2 = */ await browser.tabs.executeScript(tab.id, {
            allFrames: true,
            // Cross-browser to use absolute path
            file: '/content-scripts/postMessageRelay.js',
            runAt: 'document_start'
        });
    } /* else {
        browser.tabs.executeScript({
            allFrames: true,
            code: 'postMessageRelay();',
            runAt: 'document_start'
        });
    } */

    const csPort = getContentScriptPortForTabID(tab.id);
    if (!csPort) {
        console.log('`start` message cannot find content script port');
        return;
    }
    csPort.onMessage.addListener(function ({type, pathID, content}) {
        const tabID = tab.id;
        // Todo: We might instead post against *all* tabs in `ports` with the same URL
        switch (type) {
        case 'unload': // Avoid memory leaks
            deleteContentScriptPortByTabID(tabID);
            break;
        case 'read': case 'save':
            let length;
            if (type === 'save') {
                // Since we will lose the `length` property in JSON parsing,
                //  we pass in the length separately
                length = content.length;
            }
            nativePort.postMessage(Object.assign(
                {},
                pathMessageMap[pathID],
                {method: type, tabID},
                type === 'save' ? {content, length} : {}
            ));
            break;
        }
    });
    if ('file' in parsedObj) {
        pathMessageMap[parsedObj.pathID] = parsedObj;
    }
    csPort.postMessage({result: parsedObj, type: 'start'});
});

// Todo: open tabs, etc. (see old WebAppFind code) and listen to page for write commands (if has write access)

// We can post back to native messaging app (but for file writing, we can probably do this better here in this file instead)
nativePort.postMessage('"Ping from background script"');
