# AsYouWish

Right click to access context menu "Enable AsYouWish for this tab" and approve
any dialogs. A separate dialog is required for each eval type (`addonEval` or
`nodeEval`).

See [webappfind-demos-samples](https://github.com/brettz9/webappfind-demos-samples)
for a demo.

**Note that the namespace of `webappfind` may be changed to `asyouwish` in the
future.**

## Posting message to perform eval

Both types may only be executed after receiving an `evalReady` event message.

### `addonEval`

One may use any of the commands from the [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API).

```js
window.postMessage({
    webappfind: {
        method: 'addonEval',
        string: `
browser.tabs.create({
    url: 'https://en.wikipedia.org'
});
`
    }
}, '*');
```

### `nodeEval`

Currently follows the [Node 8 API](https://nodejs.org/docs/). Should be
progressively upgraded as higher versions stabilize. We are currently
dependent on what exact version of Node [pkg](https://github.com/zeit/pkg)
[includes](https://github.com/zeit/pkg/issues/341).

```js
window.postMessage({
    webappfind: {
        method: 'nodeEval',
        string: `require('path').join('a', 'b', 'c');`
    }
}, '*');
```

## Messages

### `evalReady`

This is the initial message to indicate readiness for using the AsYouWish APIs.
See "Posting message to perform eval" for the specific messages you can post
after this event fires.

```js
window.addEventListener('message', ({data: {webappfind: {evalReady}}}) => {
    if (!evalReady) {
        // Ignore our own `postMessage`'s or their results as well as the
        //  passing and receipt of non-AsYouWish WebAppFind messages, or
        //  the results of our posts
        return;
    }
    // Use one or both of the `window.postMessage` APIs above here
});
```

### Results (`i` and `result`)

`i` and `result` will be present for the response messages sent as a result
of the `postMessage`s above.

```js
window.addEventListener('message', ({data: {webappfind: {i, result, type}}}) => {
    if (!result) {
        return;
    }
    // Handle result here from any `window.postMessage` APIs used above;
    //   use `i` to track which particular response goes with which message
    //   and `type` to determine if the request method were for `addonEval`
    //   or `nodeEval`.
});
```

## To-dos

1. Make library (along the lines of `webappfind.js` which allows for Promises
    to get the response of a particular post).
1. Allow means for request privileges or indicate support
