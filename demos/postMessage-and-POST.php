<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8" />
    <title></title>
</head>
<body>

<input type="button" value="Save" id="save" />
<script>
/*
todo: add following to README when WAF updated

## `postMessage()` to work with HTTP POST and

For a shared approach to allow the `postMessage()` mechanism of WebAppFind
to be reusable with server-side apps accepting HTTP POST requests, see
[postMessage and POST](./doc/postMessage-and-POST.md) 

*/
(function () {'use strict';

function $ (sel) {
    return document.querySelector(sel);
}

window.addEventListener('message', function(e) {
	if (e.origin !== window.location.origin || // PRIVACY AND SECURITY! (for viewing and saving, respectively)
		(!Array.isArray(e.data) || excludedMessages.indexOf(e.data[0]) > -1) // Validate format and avoid our post below
	) {
		return;
	}
	var messageType = e.data[0];
	switch (messageType) {
		case 'webapp-view':
			// Populate the contents
			pathID = e.data[1];
			var raw = e.data[2];
			$('#save').disabled = false;
			break;
		case 'webapp-save-end':
			alert('save complete for pathID ' + e.data[1] + '!');
			break;
		default:
			throw 'Unexpected mode';
	}
}, false);

$('#save').addEventListener('click', function () {
	if (!pathID) {
		alert('No pathID set by Firefox yet! Remember to invoke this file from an executable or command line and in edit mode.');
		return;
	}
	window.postMessage([saveMessage, pathID, cm.getValue()], window.location.origin);
});

}());
</script>


<!-- Begin postMessage-and-POST boilerplate -->
<script>
/*
The PHP block below will accept data from POST requests
made in a browser (not, however, in dumb client to server requests).
The PHP block will be safely ignored when loading
local files via WebAppFind but that is desirable since WebAppFind
will call postMessage() by itself.

Although POST doesn't work for local file:// URLs anyways, if the
page is intended to handle legitimate GET-based postMessaging
(i.e., code without server-side side effects), the JavaScript immediately
following is required.
*/
(function () {'use strict';
var loc = window.location.href;
var qsPos = loc.indexOf('?');
if (loc.match(/^file:.*\?/) && qsPos > -1) {
	var payload = JSON.parse(decodeURIComponent(loc.slice(qsPos + 1)));
	// Todo: change WebAppFind to send an object, and pass mode info along or custom mode info to distinguish WAF method from normal GET as this?
	window.postMessage({payload: payload, method: 'get', untrusted: true}, window.location.origin);
}
}());
</script><?php

echo '<script' . chr(0x3e);

$abc = 'JSON.parse(decodeURIComponent(' . $_SERVER['QUERY_STRING'] . ')';

// Although we could use rawurldecode and json_decode, we'll use the JS methods to ensure consistency
echo 'window.postMessage(' . $abc . ', window.location.origin);';

// Trigger JS postMessage event here when server-side
echo '</script' . chr(0x3e);
?><!-- End postMessage-and-POST boilerplate -->

</body>
</html>
