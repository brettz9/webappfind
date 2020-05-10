/* eslint-disable no-alert,
  node/no-unsupported-features/node-builtins */
/* eslint-env webextensions, browser */

'use strict';

var AsYouWish = true; // eslint-disable-line no-var, no-unused-vars

// import {_} from '/utils/i18n.js';
// Todo: Replace this with the line above once
//    https://bugzilla.mozilla.org/show_bug.cgi?id=1451545
//    may be implemented
const _ = function _ (...args) {
  try {
    return browser.i18n.getMessage(...args);
  } catch (err) {
    return `(Non-internationalized string--FIXME!) ${args.join(', ')}`;
  }
};

// Todo: Ask for permissions at run-time? <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Request_the_right_permissions>
const portEvl = browser.runtime.connect({name: 'webappfind-eval-content-script'});

const orig = location.href.startsWith('file:') ? '*' : location.origin;

let i = 0;
portEvl.onMessage.addListener(function ({i, error, result, type}) {
  window.postMessage({webappfind: {i, result, error, type}}, orig);
});

window.addEventListener('message', async ({data}) => {
  const {string, method} = data.webappfind;
  if (!method) { // Ignore `evalReady` or `result` messages
    return;
  }

  const {origin, pathname, search} = new URL(location);
  const currentSite = origin + pathname + search;
  let autoApproveConfirmedSites = true, allowedSites = [];
  try {
    ({
      autoApproveConfirmedSites: {enabled: autoApproveConfirmedSites = true} = {},
      allowedSites: {optionValues: allowedSites = []} = {}
    } = await browser.storage.local.get());
  } catch (err) {
    console.log('errrrr', err.toString());
  }
  // console.log('allowedSites', JSON.stringify(allowedSites));

  let avoidConfirm = allowedSites.includes(currentSite);

  async function autoSaveConfirmed () {
    if (avoidConfirm) { // Already saved
      return;
    }
    // console.log('autoApproveConfirmedSites', autoApproveConfirmedSites, currentSite, JSON.stringify(allowedSites));
    // Save site for future if autoconfirming option is on
    if (autoApproveConfirmedSites && !allowedSites.includes(currentSite)) {
      allowedSites.push(currentSite);
      avoidConfirm = true;
      await browser.storage.local.set({
        allowedSites: {optionValues: allowedSites}
      });
    }
  }

  let ok;
  i++;
  switch (method) {
  case 'addonEval': {
    ok = avoidConfirm || confirm(
      _('trust_site_addon_code')
    );
    if (ok) {
      await autoSaveConfirmed();
      portEvl.postMessage({string, i, method});
    }
    break;
  } case 'nodeEval': {
    ok = avoidConfirm || confirm(
      _('trust_site_node_code')
    );
    if (ok) {
      await autoSaveConfirmed();
      portEvl.postMessage({string, i, method});
    }
    break;
  }
  default:
    throw new TypeError('Unexpected method ' + method);
  }
});

// For AsYouWish privileges permitted after load
window.postMessage({webappfind: {
  evalReady: true
}}, orig);
