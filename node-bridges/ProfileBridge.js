/* eslint-env webextensions */
/* eslint-disable node/no-unsupported-features/es-syntax,
  node/no-unsupported-features/es-builtins */

const {getNodeJSON} = browser.extension.getBackgroundPage();

/*
In case we decide to create profiles on behalf of the user (without the need to
  visit the profile manager):
http://stackoverflow.com/questions/18711327/programmatically-create-firefox-profiles
https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIToolkitProfileService
https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIToolkitProfile
http://kb.mozillazine.org/Profiles.ini_file
https://developer.mozilla.org/en-US/docs/Profile_Manager
*/
function createProfile ({name}) {
  // https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIToolkitProfileService#createProfile%28%29
  return getNodeJSON('createProfile', {name});
}

async function getProfiles () {
  const {profiles} = await getNodeJSON('getProfileInfo');
  return Object.entries(profiles).filter(([p, profile]) => {
    return p.startsWith('Profile');
  }).map(([, profile]) => profile.Name);
}

function manageProfiles () {
  return getNodeJSON('manageProfiles');
}
export {
  createProfile,
  getProfiles,
  manageProfiles
};
