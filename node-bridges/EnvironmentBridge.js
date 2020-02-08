/* eslint-env webextensions */
import {_} from '/utils/i18n.js';

const {getNodeJSON} = browser.extension.getBackgroundPage();

function getHardPaths () {
  return getNodeJSON('getHardPaths');
}

async function getHardPath (dir) {
  const [paths] = await initPromise;
  return paths[dir];
}

function getBrowserExecutableAndDir () {
  return getNodeJSON('getBrowserExecutableAndDir');
}

async function getBrowserExecutable () {
  const [aFile] = await getBrowserExecutableAndDir();
  return aFile;
}
async function getTempPaths () {
  return {
    paths: [
      [_('System_temp'), await getHardPath('TmpD')]
    ]
  };
}
async function getExePaths () {
  const [paths, firefoxExecutablePath] = await initPromise;
  return {
    paths: [
      [_('Firefox'), firefoxExecutablePath],
      [_('Command_prompt'), paths.cmdExe],
      [_('WebAppFind'), paths.webappfind]
    ]
  };
}

let initPromise;

async function init () {
  if (initPromise) {
    return initPromise;
  }
  initPromise = Promise.all([
    /*, profiles */
    getHardPaths(),
    getBrowserExecutable()
  ]);
  return initPromise;
}
init(); // Get things started

export {
  getHardPaths,
  getHardPath,
  getBrowserExecutableAndDir,
  getBrowserExecutable,
  getTempPaths,
  getExePaths
};
