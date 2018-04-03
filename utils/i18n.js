/* eslint-env webextensions */
function _ (...args) { // eslint-disable-line no-unused-vars
    try {
        return browser.i18n.getMessage(...args);
    } catch (err) {
        return `(Non-internationalized string--FIXME!) ${args.join(', ')}`;
    }
}
