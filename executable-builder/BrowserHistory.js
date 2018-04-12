/* eslint-env webextensions */
async function autocompleteURLHistory ({listID, value: userVal}) {
    const historyItems = await browser.history.search({
        text: userVal,
        maxResults: 100 // Default: 100
    });
    // console.log('historyItems', historyItems);
    const optValues = historyItems.map((hi) => hi.url);
    return {
        listID,
        optValues,
        // We could use a convoluted way of hiding tabs (which cannot be
        //    created hidden but an empty one might be created on
        //    start-up and then hidden); added to an issue to be able
        //    to get favicons from history
        // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/hide
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1411120#c6
        // optIcons,
        userVal // Just for debugging on the other side
    };
};

export {
    autocompleteURLHistory
};
