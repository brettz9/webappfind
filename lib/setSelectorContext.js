/* eslint-env webextensions */
// Imperfect workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1325814
function setSelectorContext ({ // eslint-disable-line no-unused-vars
    menuItemId,
    menuItemIds = [menuItemId],
    selector,
    updateContextMenus = () => {}
}) {
    // Todo: Remove the first condition once Firefox 60+ is widespread
    browser.contextMenus.onShown && browser.contextMenus.onShown.addListener(
        async (info /* , tab */) => {
            let selectionMatchesSelector;
            try {
                [selectionMatchesSelector] = await browser.tabs.executeScript({
                    code: `
window.getSelection().getRangeAt(0).cloneContents().firstElementChild.matches(
    '${selector.replace(/\r|\n/g, '').replace(/'/g, '\\\'')}'
)
`
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
