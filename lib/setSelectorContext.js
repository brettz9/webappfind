/* eslint-env webextensions */
// Imperfect workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1325814

function escapeJSStringApostrophe (s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '\\\'')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/[\u2028\u2029]/g, (n0) => {
      return '\\u' + n0.charCodeAt().toString(16).padStart(4, '0');
    });
}

export default function setSelectorContext ({
  menuItemId,
  menuItemIds = [menuItemId],
  ownContext,
  restrictContexts,
  // ignoreSelector,
  updateContextMenus = () => { /**/ }
}) {
  // Todo: Pass in argument indicating allowing text selection without
  ///    needing any element
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
  escapeJSStringApostrophe(
    ownContext || restrictContexts.join(',')
  )
}');
` +
          /* (ignoreSelector
              ? ` && !child.matches(${
                escapeJSStringApostrophe(ignoreSelector)
              }))`
              : ''
            ) + */ `
})();`
        });
      } catch (err) {
        console.log('err', err.toString());
      }

      await updateContextMenus();
      if (!selectionMatchesSelector) {
        await Promise.all(menuItemIds.map(async (menuItemId) => {
          try {
            await browser.contextMenus.remove(menuItemId);
            console.log('removed non-match', menuItemId);
          } catch (err) {
            console.log('failed removing non-match', menuItemId);
          }
        }));
      }
      console.log('refresh');
      browser.contextMenus.refresh();
    }
  );
}
