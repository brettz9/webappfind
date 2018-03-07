## For developers

### Important security notes

When developing a web app for use with WebAppFind, it is even more
important to protect the privacy and security of your users since your
web app may inadvertently be exposing data they have saved on their
desktops and have the potential to even overwrite it.

1. Please note the security comments within the API section comments for
    details on how to make communication with the add-on safely (via
    `postMessage`).
1. As with any web app, do not trust user-supplied data (e.g., don't paste
    in using `innerHTML`), especially if that data is supplied via the URL (to
    which hackers can link or cause their visitors to visit such pages). See
    <https://en.wikipedia.org/wiki/Cross-site_scripting> for some of the
    concerns.
1. There should be no side effects upon the opening of a link to your web app
    (and whether or not your app is opened as a URL, protocol, or
    protocol-opened-through-WebAppFind), so for example, you should not
    automatically save file contents back to disk (at least without user
    approval). (An exception might be made in the future if AsYouWish is
    installed and the user wished to bookmark privileged but harmless or
    per-use-confirmed processes, e.g., to visit a link to package up some
    files as part of a build process.) See
    <https://en.wikipedia.org/wiki/Cross-site_request_forgery> for some
    of the concerns.

### API: reading file contents

The 'view' type of message (see the example below) will be sent to the web
app when a desktop file has been opened in the "view" or "edit" mode. This
message delivers the file contents (whether in binary form or not) to the
web app.

```js
let pathID; // We might use an array to track multiple path IDs within the same app (once WebAppFind may be modified to support this capability!)
window.addEventListener('message', function ({origin, data}) {
    // `data` might be set to something like:
    // {type: 'view', pathID: '{1e5c754e-95d3-4431-a08c-5364db753d97}', content: 'the loaded file contents will be here!'}
    // ...or if the user has checked the option "Reveal selected file paths to scripts", it may look like this:
    // {type :'view', pathID: 'C:\\Users\\Brett\\someDataFile.txt', content: 'the loaded file contents will be here!'}

    let type, pathID, content;
    try {
        ({type, pathID, content} = data); // May throw if data is not an object
        if (origin !== location.origin || // We are only interested in a message sent as though within this URL by our browser add-on
            type === 'save' // Avoid our post below (other messages might be possible in the future which may also need to be excluded if your subsequent code makes assumptions on the type of message this is)
        ) {
            return;
        }
    } catch (err) {
        return;
    }
    if (type === 'view') {
        // We remember the pathID in case we are in "edit" mode which requires a pathID for saving back to disk
        // Do something with `content` like adding it to a textarea, etc.
    }
});
```

Only windows with the URI approved by the process detailed above
will be able to successfully receive such messages (and only for the
supplied file).

### API: saving back to the originally supplied file path (for the "edit" mode only)

A save will be performed by sending a 'save' to the add-on
(see the code below).

A pathID will be needed when making a save of file contents back to
the add-on (which will save back to disk). You can obtain this before
making saves, by listening for the 'view' message (described
under "API: reading file contents" above); the 2nd value of the first (array)
argument (`previouslySavedPathIDFromViewEvent`) will contain this
information.

This pathID is intended to allow for sites to handle multiple files in a
single session (although WebAppFind currently will always open the file
in a new tab as a new instance).

Note the important comment below about ensuring your users' privacy.

Once a save has been performed, a message, 'save-end', will be
sent from the add-on back to the WebAppFind-opened app (in case the
app would like to inform the user in some manner).

```js
// For your user's privacy, you should only post the
//  file contents to this page itself (and this save
//  will be picked up by the browser add-on), so do
//  NOT change the second argument.
// You should only call this when the user has indicated
//  they wish to make a save such as if they have approved
//  draft auto-saving or when manually clicking a save button.
window.postMessage({
    type: 'save',
    pathID: previouslySavedPathIDFromViewEvent,
    content: dataToSaveAsString
}, location.origin);
```

Only windows with the URI approved by the process detailed above
can successfully save such messages (and only for the supplied file).

### API: Obtaining a directory path

If one adds something like the following Windows batch file:

```Batchfile
"%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe" -remote "openurl(about:newtab)" -webappdir "%1" -webappsite "http://brett-zamir.me/webappfind/demos/dir.html?path=%1"
```

:: For details on where one may put this, http://superuser.com/a/722699/156958 and http://answers.microsoft.com/en-us/windows/forum/windows_vista-desktop/how-to-locate-the-sendto-folder-in-vista/78b16711-1135-4eb0-851a-8abae9bfe9ed
:: Place this file at "shell:SendTo" e.g., the location, C:\Users\Brett\AppData\Roaming\Microsoft\Windows\SendTo
"%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe" -remote "openurl(about:newtab)" "%1"


:: For details on where one may put this, http://superuser.com/a/722699/156958 and http://answers.microsoft.com/en-us/windows/forum/windows_vista-desktop/how-to-locate-the-sendto-folder-in-vista/78b16711-1135-4eb0-851a-8abae9bfe9ed
:: Place this file at "shell:SendTo" e.g., the location, C:\Users\Brett\AppData\Roaming\Microsoft\Windows\SendTo
"%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe" -remote "openurl(about:newtab)" -webappdir "%1" -webappsite "http://brett-zamir.me/webappfind/demos/dir.html?path=%1"


...and copies it into the Windows "SendTo" folder (which can be found by
opening `shell:SendTo`), you can right click folders to send its path to
your web app (change the URL above to that of your web application).

(See `SendTo` folder details [here](http://superuser.com/a/722699/156958)
and [here](http://answers.microsoft.com/en-us/windows/forum/windows_vista-desktop/how-to-locate-the-sendto-folder-in-vista/78b16711-1135-4eb0-851a-8abae9bfe9ed).)

You do not need the path in the URL, and, as for files, for security
reasons, should not rely on this, but it is provided for convenience.
The recommended method for listening for the directory path is instead in
the following manner:

```js
window.addEventListener('message', function ({origin, data}) {
    if (origin !== location.origin) { // PRIVACY AND SECURITY! (for viewing and saving, respectively)
        return;
    }
    let directoryPath;
    try {
        ({directoryPath} = data.webappfind);
    } catch (undesiredMessageFormat) { // May be non-WebAppFind format
        return;
    }

    // Now do something with "directoryPath" here!
});
```

WebAppFind may be modified in the future
to allow file writing to all files within a supplied directory, but for now
the most likely use case for using this API is within an AsYouWish
app which could request privileges to process the supplied directory's
contents.

Note that for convenience, a batch file (that does not even require
WebAppFind) is packaged with WebAppFind in the "batch" folder that can
similarly be used if placed in the "SendTo" folder to allow opening
a right-clicked directory into the browser's file browser (including
if you have overlaid its default browser with
[filebrowser-enhanced](https://github.com/brettz9/filebrowser-enhanced)).

### Recognized file types and custom modes

Although you are free to define your own file types and custom modes,
in order to prevent future conflicts, it is recommended that you register
your [file types](./doc/Registered-file-types.md) and
[custom modes](./doc/Registered-custom-modes.md) (or at least namespace
them well).

Even if `filetypes.json` is used with "register" on "defaultHandlers", it may
be convenient to have a separate spec URL detailed for your file type,
including for cases where the file extension is used without `filetypes.json`.
