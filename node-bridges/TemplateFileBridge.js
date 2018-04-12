/* eslint-env webextensions */

const {getNodeJSON} = browser.extension.getBackgroundPage();

function getTemplate (data) {
    return getNodeJSON('getTemplate', data);
}

function getTemplates () {
    return getNodeJSON('getTemplates');
}

function saveTemplate (data) {
    return getNodeJSON('saveTemplate', data);
}

function deleteTemplate (data) {
    return getNodeJSON('deleteTemplate', data);
}

export {
    getTemplate,
    getTemplates,
    saveTemplate,
    deleteTemplate
};
