# webappfind

Are you a fan of web apps, but want the freedom to place your data files where you like on your desktop and thus be able to work offline and own your data rather than keeping it in the cloud? Do you want the freedom to just double-click (or right-click) a file on your desktop so that it opens in a web app, saving you the trouble of having to copy the file path, move from your desktop to the web app, and paste the path in a file finder? Do you want to avoid dragging files into your web app when modifications to the files cannot be saved back directly to your hard drive?

WebAppFind addresses these use cases by allowing you to double-click or "Open with..." right-click on "view" or "edit" executable files on your desktop (currently, executables are for Windows only), sending the file path details to Firefox (via command line arguments) which are then intercepted by a Firefox add-on which checks for an *optional* filetypes.json file within the same directory as the right-clicked file to determine more precise handling (the file extension will be used to determine the type otherwise). Based on what is chosen/found and on user preferences, a handler web site will be sought in Firefox to open the file of the designated type (whether a generic or custom type) as well as allow saves to be made back to the file if the "edit" type was the type chosen and a suitable handler site was found to send back a save event.

WebAppFind allow you to make your data files accessible to other programs and to give your users peace of mind to not be locked into your application alone. It also allows your users to open such data files in your program immediately and intelligently, using whatever file extension you prefer, even if it is a generic one such as "json" or "js".

Unlike a more generic solution, such as with a Firefox add-on or [AsYouWish](https://github.com/brettz9/asyouwish/)-enabled site, *webappfind* minimizes security and privacy risks by only allowing files designated in the above manner to be available to the relevant web application.

# Executable usage notes

(For command line usage, see its API below.)

Note that you must first install the Firefox add-on (the XPI file) so that the following steps will work (the add-on has not yet been submitted to the Addons site, so for now, you will have to either build the XPI from source or use the pre-built XPI included with the repository).

1. Right-click on a file.
    1. If you want to use WebAppFind without disturbing your defaults for that file extension, select "Open with"->"Choose default program..." if present (or if not present, open the file and choose "Select a program from a list of installed programs") and then make sure "Always use the selected program to open this kind of file" is not checked.
    1. If you always want to use WebAppFind when handling files of this extension, click "Properties", then click "Change..." next to "Opens with:" in the General tab of the dialog.
1. Click "Browse".
1. Navigate to an executable within the "cplusplus" folder of this [WebAppFind](https://github.com/brettz9/webappfind) repository (or, if you prefer, you can build the executables yourself with the source code included in this repository). If you want web apps to open this file in view-only mode, choose "WebAppFinder-view-mode-Firefox.exe" (or "WebAppFinder-binaryview-mode-Firefox.exe" if this is for a program needing to open a file in binary mode, such as images, sound files, or videos). If you want to grant the webapp read and write access for this file (or type of file if you chose option 1.2) you open via WebAppFind, choose "WebAppFinder-edit-mode-Firefox.exe".
1. Select "Ok".
1. If you used "Open with" (as per step 1.1 above), your file should have already opened with WebAppFind. If you opted for "Properties" (step 1.2 above), you should now be able to double-click any file possessing the same extension to open it with WebAppFind.

The remaining notes are for caution. It is hoped that the instructions above can be mostly automated once the [ExecuteBuilder](https://builder.addons.mozilla.org/package/204099/latest/) add-on is complete (this add-on is to optionally interact with WebAppFind to allow building and assignment of executable/batch files which can be designated for specific file types without the user needing to find the path of these executables as WebAppFind currently requires).

If an edit web+local protocol is enabled and open and then disabled in the same session, it will keep having save access (though within that window session only). One must currently close any open tabs for that web application if one no longer wishes to allow access (though as noted elsewhere in the documentation, the app only has access to the files to which it was permitted access).

# Some use case scenarios

1. Work on Git on your desktop while being able to open HTML files for WYSIWYG editing in a (CKEditor) web app which you can easily modify to add buttons for snippets you like to add? Do you want to use CodeMirror for syntax highlighting of your JavaScript and CSS? (Demos are included which do all of these.)

# Possible future user preference changes

Currently preferences are global, whereas it may be desirable to allow users to customize their preferences by type/protocol in addition to the current default global ones.

# Command line API

WebAppFind is triggered (currently Firefox only) through command line arguments passed to Firefox and handled by the WebAppFind add-on.

It is my goal to complete work on [ExecuteBuilder](https://builder.addons.mozilla.org/package/204099/latest/) to facilitate the building of executables (probably batch scripts tied to cmd.exe) with icon for task bar usage, etc., but currently one must either use (or build) the executables included in the repository or call the command line oneself.

The following process is subject to change and may potentially even be scrapped altogether if another approach is found to be easier for streamlining cross-browser invocation, but currently this API is available if someone wishes to build their own executables using the API or to simply be able to run commands manually from the command line.

* `-webapp-<method> <path>` (i.e., "-webapp-view", "-webapp-binaryview", or "-webapp-edit" and the file path) - Indicates the path of the file which will be available with privileges (currently, view or edit) to the webapp.
* `-remote "openurl(about:newtab)"` - This built-in Mozilla command line API allows Firefox (unlike "-silent") to gain focus without additional instructions to Windows. If the tab is determined to not be needed (e.g., if the user has opted to allow desktop opening of the file when no protocols are found), the add-on will simply auto-close the tab that this parameter opens.

# For developers

## Important security notes

When developing a web app for use with WebAppFind, it is even more important to protect the privacy and security of your users since your web app may inadvertently be exposing data they have saved on their desktops or even overwriting it.

1. Please note the security comments within the API comments below for details on how to make communiction with the add-on safely (via `postMessage`).
1. As with any web app, do not trust user-supplied data (e.g., to paste it using `innerHTML`), especially if that data is supplied via the URL (to which hackers can link or cause their visitors to visit such pages).
1. There should be no side effects upon the opening of a link to your web app (and whether or not your app is opened as a URL, protocol, or protocol-opened-through-WebAppFind), so for example, you should not automatically save file contents back to disk (at least without user approval). (An exception might be made in the future if AsYouWish is installed and the user wished to bookmark privileged but harmless or per-use-confirmed processes, e.g., to visit a link to package up some files as part of a build process.)

## API: file type finding

The following steps may currently be altered by user preference.

1. File types can currently be obtained based on file extension (e.g., "myScript.js" would incorporate "js" into the type name) or based on settings within a filetypes.json file placed within the same directory as the data files. The rules are as follows:
    1. Use a (lower-case) file extension (e.g., "js" in our example above)
    1. If a filetypes.json file is supplied within the same directory as the data files, a lower-case custom type can be specified:
        1. At the root of the filetypes.json JSON object can be a property "fileMatches" which is an array of two-value arrays. The first item in these inner arrays must be a regular expression expressed as a string to indicate which files will be matched and the second value to indicate the type to be assigned to the match. The first inner array containing a match will be the one used to designate the type name (which must be lower-case ASCII letters only).
1. Once a file type is known as per above...
    1. a protocol may be checked for the detected type as follows:
        1. The protocol to find the type will begin with "web+local" (only existing [whitelisted protocols or "web+" ones are allowed](http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-navigator-registerprotocolhandler))
        1. The protocol must then be followed by the (lower-case) method (currently "view", "binaryview", "edit", or "register")
        1. The protocol must then be concluded by the file type as per above (i.e., the file extension like "js" or filetypes.json designated type name (which [must be lower case ASCII](http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-navigator-registerprotocolhandler))).
        1. If the protocol is found to be registered, it will be visited and these steps will end. Otherwise, continue with the following steps.
    1. If the filetypes.json file contains a top-level "defaultHandlers" property object, this object will be checked against the type name and if a subobject for this type is found:
        1. that object will be checked to see whether the "register" mode is present, and if yes, the user would be forwarded to it (to allow a site the ability to register itself as a handler for any number of modes and/or be a portal to those modes) and these steps would stop. Otherwise, continue.
        1. that object will be checked to see whether the requested open mode is also present (e.g., "view", "binaryview", or "edit").
            1. If the open mode key is present, its value will be used as the site to open. (Currently, %type , %method and %pathID are variables that will be substituted. User preferences may determine that the path ID is not the actual path but a mere GUID.) Although this may be changed in the future, file:// URLs currently do not work with WebAppFind message posting (due to current privacy leaks in Firefox with add-on-to-file-protocol-webpage communication) (I don't believe custom DOM events worked with file:, and there is apparently no other method of communicating with an add-on (without injecting a global) that we could use like allowing sites to open a chrome:// URL (restartless might be able to get such URLs via chrome.manifest or dynamically but not allowed cross-domain)).
    1. If the filetypes.json file contains a top level "hierarchy" property object and if a suitable mode was not found, the hierarchy object may be checked for the type name to see what types might be acceptable alternatives (in decreasing order of preference) to determine the type to check in future steps below.
    1. If no other information is present in the filetypes.json file, if the file is not present, or if a specific default site was not found, depending on user settings, depending on user setting, the browser may attempt to open the file. Otherwise, if a non-default setting is changed, the user may delegate the opening of the file back to the desktop.

So, for example, if no filetypes.json file were present (or if the filetypes.json indicated that the given file was of the "js" type), a edit-capable loading of a JavaScript source file might look for a registration at "web+localeditjs:". Depending on user configuration, if such a hander is not found, the file may be opened in the browser or on the desktop.

## API: reading file contents

The 'webapp-view' message (see the example below) will occur for "view", "binaryview", and "edit" methods to indicate the readiness of the file contents (whether binary or not).

```javascript
var pathID; // We might use an array to track multiple path IDs within the same app (once WebAppFind may be modified to support this capability!)
window.addEventListener('message', function(e) {
    // e.data might be set to something like:
    // ['webapp-view', '{1e5c754e-95d3-4431-a08c-5364db753d97}', 'the loaded file contents will be here!']
    // ...or if the user has checked the option "Reveal selected file paths to scripts", it may look like this:
    // ['webapp-view', 'C:\\Users\\Brett\\someDataFile.txt', 'the loaded file contents will be here!']
    
    if (e.origin !== window.location.origin || // We are only interested in a message sent as though within this URL by our Firefox add-on
        (!Array.isArray(e.data) || // Validate format
            e.data[0] === 'webapp-save') // Avoid our post below (other messages might be possible in the future which may also need to be excluded if your subsequent code makes assumptions on the type of message this is)
    ) {
        return;
    }
    if (e.data[0] === 'webapp-view') {
        pathID = e.data[1]; // We remember this in case we are in "edit" mode which requires a pathID for saving back to disk
        var fileContents = e.data[2];
        // Do something with fileContents like adding them to a textarea, etc.
    }
});
```

Only windows with the URI approved by the process detailed above will be able to successfully receive such messages (and only for the supplied file).

## API: saving back to the originally supplied file path (for the "edit" mode only)

See above regarding the pathID 2nd value of the first (array) argument (`previouslySavedPathIDFromViewEvent`). This argument is intended to allow for sites to handle multiple files in a single session (although WebAppFind currently will always open the file in a new tab as a new instance).

Note the important comment below about ensuring your users' privacy.

A message 'webapp-save-end' will be sent from the add-on to a WebAppFind-opened app once a save has occurred successfully (in case the app would like to inform the user in some manner).

```javascript
// For your user's privacy, you should only post the
//  file contents to this page itself (and this save
//  will be picked up by the Firefox add-on), so do
//  NOT change the second argument.
// You should only call this when the user has indicated
//  they wish to make a save such as if they have approved
//  draft auto-saving or when manually clicking a save button.
window.postMessage(['webapp-save', previouslySavedPathIDFromViewEvent, dataToSaveAsString], window.location.origin);
```

Only windows with the URI approved by the process detailed above can successfully save such messages (and only for the supplied file).

## Rationale for filetypes.json design

Although there may be some advantages to storing meta-data at the individual file level, I did not see a very convenient way in which Windows would allow the addition of arbitary meta-data which Firefox could easily query (Windows does not appear to offer arbitrary addition and editing of properties though programs, e.g., TortoiseGit, appear to be able to overlay the properties and are aware of file-level metadata while adding their own). Having a JSON file would allow developers to add some type configuration (beyond the more generic info detectable by a file extension) within the directory containing the data files.

The "fileMatches" array is an array of arrays in order to ensure matches occur in reliable order across systems (since ECMAScript does not guarantee iteration order across implementations). Other fields are keyed to type name (noting that these must all be lower-case ASCII letters since web protocols only allow these to work after the "web+").

Although I would eventually like to allow the add-on to accept hard-coded URLs for the web apps (so that users or vendors could ensure that their "Open With" instruction went to a particular URL regardless of add-on settings) and while filetypes.json does provide for *default*Handlers, filetypes.json deliberately avoids providing a mechanism for obligating the add-on to utilize a specific web app URL when opening files of a given type. This is by design as I believe the open nature of operating systems letting you choose what application to use for a given data file ought to be maintained by default with web apps (and be unlike the even worse status quo where websites not only don't allow other apps to read their data but host your data exclusively at their own site, even if they at least allow offline capability). I am interested, however, in seeing the possibility for registering "validate" modes independently from editors (but even here, I don't think I'd want to allow hard-coding of validators). But again, I do intend to allow hard-coding at the add-on level to provide some means of obligating the use of a particular URL.

Note that although this particular collection of "Open With..." executables and a (currently Firefox-only) add-on is called "WebAppFind", the protocols are prefixed to begin with the more generic phrasing "web+local" so as to allow openness to the possibility that non-browser desktop apps could also handle reading and editing of these offline-available, type-aware data files. The filetypes.json file is similarly non-commital in terminology or behavior about where the files will be opened, so desktop apps could (and, I believe, ought) to utilize filetypes.json when seeking to detect type information (beyond just reading the file extension).

## Rationale for API design

`postMessage` was chosen for having a familiar API and already designed for potentially untrusted collaboration sources. (See the section "Comparison with similar WebAPI work" for other possibilities.)

Before discovering the command line handling, I originally sought to have the executable create a temp file containing an ID and path and mode info while supplying that to the add-on via a URL which would in turn check the temp file (this approach might work for other browsers if they do not allow add-ons to check command line arguments).

## Possible future API changes

1. Change filetypes.json to .filetypes.json or at least support the latter for those not wishing to distract users or let them mess things up.
1. Possible changes to parameters passed to registered protocol handlers and/or default handlers (if any, as may only be passed through postMessage or some other means)
    1. Change what is passed within URL? method, filetype, path? or just pass through postMessage? Bookmarkability vs. clean API?
1. Since web protocols are not meant to be used to have the privilege of reading from or writing to files (unless they belong to reserved protocols which, per the HTML spec, cannot be registered from the web anyways), the current approach of allowing web sites to register themselves as handlers might need to be modified to use some other mechanism which can at least provide warnings to users about the capabilities they are thereby approving (perhaps as within [AsYouWish](https://github.com/brettz9/asyouwish/) when sites themselves can do the requesting for privileges). However, since WebAppFind chose to start with the web protocol approach not only because it is an existing method for sites to register themselves for later potential use, but because the data security and privacy issues are confined to data files which are explicitly opened from the desktop when using the WebAppFind approach.
1. See todos below for possible additions to modes beyond "view" and "edit".
1. See about spec changes to be more tolerant of characters beyond lower-case ASCII letters

## Implementation notes

A direct visit to the protocol (including through XSRF) should provide no side effects. However, it is possible that a malicious handler opened by the user in "edit" mode could provide immediate side effects by saving back data to overwrite the supplied file. This might be mitigated by a configurable option to require the user's consent upon each save and/or to inform the user of the proposed diffs before saving. But again this will only be possible upon user initiation, only for the specific file or files approved in a given session, and a site will only be usable as a handler if the filetypes.json packaged with the data file designates it as a default handler for the data file (and the user maintains the preference to use this information) or if they have previously approved a protocol site for the given type.

# Comparison with similar WebAPI work

[WebActivities](https://wiki.mozilla.org/WebAPI/WebActivities) is similar to WebAppFind in that both seek to allow delegation of certain behaviors such as "view" and "edit" to (potentially) different apps (where the user also has the freedom to choose any app to handle the given type of activity), but WebActivities does not operate on files.

The [WebAPI](https://wiki.mozilla.org/WebAPI) has a [DeviceStorageAPI](https://wiki.mozilla.org/WebAPI/DeviceStorageAPI) which has certain file-related behaviors. The proposal at present appears to be limited, however, to files in a specific directory of one's hard drive. It does not allow one the freedom to store one's files wherever one likes on one's hard-drive for better organization purposes. It also does not seem to anticipate the activities being triggered from one's desktop, but rather if one is already within the app.

The DeviceStorageAPI appears to allow more privileges (like [AsYouWish](https://github.com/brettz9/asyouwish/)) whereas WebAppFind is currently focused on individual file reading and saving (though WebAppFind may add other actions in the future, such as listening for file change events).

# Comparison with AsYouWish

[AsYouWish](https://github.com/brettz9/asyouwish/) allows a higher-than-normal privilege level to websites, but it differs in a number of areas:

1. AsYouWish sites ask for permission, and once approved, then can immediately do their work. WebAppFind currently allows sites to ask for permission to register themselves as handlers, but their work will only become relevant when the user opens a file via WebAppFind.
2. AsYouWish allows for a vast number of possible privileges (though subject to user approval) including potentially arbitrary file reading and writing (as with Firefox extensions), while WebAppFind is limited to file reading and writing (though it may expand to certain other circumscribed, user-initated file-related activities in the future) and only for those files so opened as opened by the user.

# Higher priority todos planned

1. Create tests with using registerProtocolHandler (also for JS/JSON/mytype)
1. Stop defining new command line listeners for each method--just require it as an additional parameter?
1. Command line argument to hard-code a specific URL for opening (optionally looking for fallbacks if the supplied one is a protocol but not found)
1. Arbitrary command line args to pass on to webapps
1. Support hard-coding to transmit file paths regardless of prefs?
1. Submit to AMO, Bower, etc.
1. Rewrite C++ exe's as batch scripts (for sake of [ExecuteBuilder](https://builder.addons.mozilla.org/package/204099/latest/))
    1. Auto-generate these batch scripts for users (though we can supply the ones not using hard-coded URLs) via our Firefox add-on based on their supplying:
        1. Method (view, edit, etc.) for opening files via webappfind
        1. Optional "hidden" flag (in conjunction with, or only from, AsYouWish?) to embed a hidden DOM window script (use for batch-script-like functionality)
            1. Potentially privileged via AsYouWish, and aware of file path, could, e.g., create 10 copies of a supplied file name in the same directory or some other pipeline
            1. Allow args to webappfind to avoid adding a window, e.g., for a type to handling .jsbatch files to cause a them to be launched with privileges (via AYW? though better to avoid need for any HTML--just JS) in a hidden window (or manage files to run on a schedule; integrate with a Windows task scheduler in case not open?), so work like AYW but without a footprint (but without working each restart as with "add-on sites"); may still be useful with other privs, e.g., to get (send to network) and save file contents, and if asking for privs, will prompt dialog (e.g., to read a file and then use privs--though this would be redundant, perhaps in this mode we can always pass the real path so it adds value, e.g., if script wants to do something in same directory); see also todos in ExecuteBuilder for more on
            command-line-like approach
        1. An optional, hard-coded web app URL (to circumvent the normal detection procedures and always open with a given web app)
        1. Option for any web app to open by default in full-screen mode
        1. An optional icon, so as to distinguish in task bar, etc. (making shortcuts via command line: http://ss64.com/nt/shortcut.html )
        1. Whether to auto-create a new profile just for this combination of options and a -no-remote call to allow executable-like behavior (separate icon instance in task bar though not icon)
        1. Another browser path if other browsers ever support
1. Complete [ExecuteBuilder](https://builder.addons.mozilla.org/package/204099/latest/)
1. Disable further save attempts with bad ID supplied
1. Unregister command line handler, etc. on add-on uninstall
1. Check upon each save attempt that the loaded protocol is still registered as a handler (and remove usage notes above once implemented).

# Possible future todos

1. Command line flag additions:
    1. See also [ExecuteBuilder](https://builder.addons.mozilla.org/package/204099/latest/)
    1. Support the "register" method from command line?
1. Integrate functionality into https://github.com/brettz9/filebrowser-enhanced
1. When [AsYouWish](https://github.com/brettz9/asyouwish/) is in use, allow path-reading as long as site is AYW-approved and the page is registered for the protocol--so one can bookmark a path and always load it or load with other approved paths (e.g., in different tabs within a webapp); also can remember paths to invoke upon FF start up ("website addons")
1. Ensure some additional privacy for users desiring it by restricting external access (using https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIContentPolicy and https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIPrincipal per http://stackoverflow.com/questions/18369052/firefox-add-on-to-load-webpage-without-network-access ?) See also http://en.wikipedia.org/wiki/Site-specific_browser regarding such sandboxing.
1. Option to enable file: protocol (though mention it is currently risky in Firefox to use `postMessage` for security and privacy given its lack of scoping); report issue to FF if issue not already added (also for better means than '*' for add-on communication?) . However, this option would be quite useful, especially if the todo just above on restricting external access were implemented, given that web apps could be installed to work with one's files (ideally without concerns that the data was going to be sent anywhere, and if the todo to confirm saves were implemented, one could also see what changes were being made to a file before being actually saved). Unfortunately, file: sites cannot register themselves as protocol handlers, so the user would need to configure their settings so as to rely on the default handlers in filetypes.json to be able to use such a file (or we would need to create our own mechanism, such as through `postMessage` back to the add-on (or a change in the file's GET parameters or perhaps modification of an element within the document), to allow a file: site to request permission to become usable as a protocol handler).
1. Option to confirm reading and/or saving of data upon each attempt and/or display the proposed diffs before saving. (See "Implementation notes" section).
1. Piggyback on drag-and-drop file capabilities (or create own) to allow files dropped in this way to be saved back to disk and/or path provided to the app.
1. Listen for unregistration of protocols to disable acting on future messages from them (only relevant for pages already loaded in this session).
1. Option to avoid or allow new tabs for same URI/method/filetype/path? (option to get the same tab or new tabs for them?); option to push to all open windows in different manner so can notify user of updates but not change focus, etc.
1. Open up wiki for custom type documentation/links with "proposal", "accepted", etc. statuses similar to the WhatWG meta tags wiki? Even if filetypes.json is used with "register" on "defaultHandlers", it may be convenient to have a separate spec URL, including for cases where the file extension is used without filetypes.json.
1. Allow genuine POST or other non-GET or header-dependent requests (ala curl)?

# Possible future mode additions

Besides "view", "binaryview", "edit", "register", the following modes might be added in future versions:

1. Version control
    1. "create", "delete" - for any necessary set-up before creation or deletion of a file (as with saving, the protocol should not have side effects, so these should only bring one to the page to confirm the user wished to take such an action--and the browser might have its own confirmation for these actions).
    1. "rename" and "move" (or cut or copy and paste)
    1. "versioncontrol" - A mechanism could be added to request listening to events which would impact version control (though some means of determining scope would be needed--e.g., a folder and all its subfolders--as well as privacy/security considerations which expands beyond the current scope of individual file viewing and saving; similar concerns would need to be taken into account for other modes that may process multiple files like search or file packaging). These events could be used to open a (hidden?) web app to store data (e.g., via localStorage or a new "edit" mechanism which could save to disk, but circumscribed by file type so that, e.g., a repository binary could be modified without the user needing to explicitly open it) and build a file history for a "repository". This "versioncontrol" handlers ought to allow multiple listening apps in some manner; this would be both for the sake of allowing different versioncontrol storage mechanisms/repository types, for ensuring that any viewing apps get updated upon external changes, as well as for any apps storing meta-data related to a document or documents but not saved within them to be notified and respond accordingly (including possibly saving their own updates back to disk), e.g., for building up a history of commit messages (which would at least effectively need the completion of the todo to allow a single web app to handle multiple documents at once).
1. "send to" or "mailer" - e.g., to put file contents and/or file attachment(s), subject, etc. into a mail viewer, ready to email (with equivalents for chatting)?
1. "validate" - Before the save command of an "edit" mode process (and its response back to the app) is completed, it may be handy to have a separate protocol be called for any registered validators of a given file type to perform validation and conditionally reject a save. Instead of receiving the file path, they would be passed the proposed file contents for saving from "edit" to ensure proper well-formedness and validity before saving back to disk. It might be ideal for a validator to simply be a JavaScript file with a specific function, but for parity, we should probably implement this as another HTML file using a (secure) postMessage. If a file was found within a filetypes.json hierarchy, it may be desirable to ensure validators are sought up the hierarchy (at least if not found at the most specific level), e.g., to check that a "myType" file specified as being a JSON file is indeed a JSON file, or at least a JavaScript object if there is no JSON validator registered.
1. "preconvert" and "postconvert" - hooks to transform content before reading or writing, respectively (but before "validate")
1. "splash" - for a splash page leading to the modes so that "register" can be exclusively for registering users? 
1. "query" or "search" - For queries within file or within a folder, etc., optionally (?) filtered by file type; this might be used for "find-in-files" behavior (multiple file saving would be needed for "replace-in-files"). These queries could be hierarchical (as also defined in filetypes.json?) such that, for example, one might have "myType" JSON files queryable in a precise manner, e.g., to find all files (or records) containing a "publication date" between a range of dates, while also allowing more generic queries such as RQL, or if not available (or not desired), the user could default to full text search (since a superset of JSON could be the txt type which could allow full text search).

# Possible "Demos" todos

1. Demos ought to use cookie-using full screen option for HTML and SVG
1. Get HTML CodeMirror to use closetag, html5complete, matchTags (in addition to JS ones if mixed mode can support), use the preview option?; http://codemirror.net/demo/widget.html for line bars in linting (html, css, javascript)? linting for HTML? (jslint can do some)
1. JS enhancement: CodeMirror tern support? can this work or be made to work with JSDoc?
1. use CodeMirror diffs/merge add-ons if version-control trigger types supported
1. use runmode for getting code syntax highlighting within CKEditor HTML (e.g., for doing blog posts): http://codemirror.net/demo/runmode.html and for a button to copy-HTML-(+css with styles inlined?)-to-clipboard in each of the html/javascript/css/svg/etc. modes
1. Add CodeMirror search/replace?
1. Tweak change CSS autocomplete in CodeMirror to support color/background-color, support CSS lint options
1. Cookie to hold JSHint options (or CSS lint options))
1. JSON (just use mytype.html and change the title and add to filetypes.json) and XML demos including CodeMirror xmlautocomplete
1. images/canvas: http://www.picozu.com/editor/ ?
1. audio: http://plucked.de/ and https://github.com/plucked/html5-audio-editor ?
1. video - popcorn?
1. music notations  - http://www.vexflow.com/
1. MIDI, etc.
1. better integration of CodeMirror/CKEditor, using full (mixed HTML) features of latest CodeMirror
1. update my regex support in CodeMirror for regex type and for JS overlay: http://codemirror.net/1/contrib/regex/index.html
1. CKEditor support for popup SVGEdit and SVGEdit support for CKEditor foreign objects
1. Add CodeMirror to SVG Edit XML view
1. For SVG Edit demo, add own SVG icon for saving to file
1. Sticky app
    1. power-user support for form controls like checkboxes (underlying events currently supported better in Chrome than in Firefox), paperclip links, etc.
    1. Modify WebAppFind to support display of independent data files (for multiple stickies in this case); or don't only associate a file path with individual URLs (file: or http:), but also allow associations with tab groups or bookmark folders so that if saving a new StickyBrains/CKEditor/word-processing file, it will save to a folder where one's ideas are already grouped
1. Create demo supporting docx format (rather than requiring export to HTML for Word docs)
1. Demonstrate approach of allowing data files for download (so can store them anywhere)--if not AYW approach for namespaced shared browser access--as well as data files chosen from File selector (and save over such a file if within the protocol and user permits)
