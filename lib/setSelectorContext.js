/* eslint-env webextensions */
// Imperfect workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1325814

function escapeJSStringApostrophe (s) {
    return s.replace(/'/g, '\\\'')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/[\u2028\u2029]/g, (n0) => {
            return '\\u' + n0.charCodeAt().toString(16).padStart(4, '0');
        });
}

export default function setSelectorContext ({
    menuItemId,
    menuItemIds = [menuItemId],
    selector,
    ignoreSelector,
    updateContextMenus = () => {}
}) {
    // Todo: Remove the first condition once Firefox 60+ is widespread
    browser.contextMenus.onShown && browser.contextMenus.onShown.addListener(
        async (info /* , tab */) => {
            let selectionMatchesSelector;
            try {
                [selectionMatchesSelector] = await browser.tabs.executeScript({
                    code: `
(() => {

const child = window.getSelection().getRangeAt(0).cloneContents().firstElementChild;
return child.matches('${
    escapeJSStringApostrophe(selector)
}')` +
                        (ignoreSelector
                            ? ` && !child.matches(${
                                escapeJSStringApostrophe(ignoreSelector)
                            }))`
                            : ''
                        ) + `
})();`
                });
            } catch (err) {
                console.log('err', err);
            }

            await updateContextMenus();
            if (!selectionMatchesSelector) {
                await Promise.all(menuItemIds.map((menuItemId) => {
                    return browser.contextMenus.remove(menuItemId);
                }));
            }

            browser.contextMenus.refresh();
        }
    );
};
