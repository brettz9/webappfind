/* eslint-env webextensions */
var TemplateFileBridge = (() => { // eslint-disable-line no-var, no-unused-vars
'use strict';

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

return {
    getTemplate,
    getTemplates,
    saveTemplate,
    deleteTemplate
};
})();
