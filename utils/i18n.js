/* eslint-env webextensions */
export const _ = function _ (...args) {
    try {
        return browser.i18n.getMessage(...args);
    } catch (err) {
        return `(Non-internationalized string--FIXME!) ${args.join(', ')}`;
    }
};
