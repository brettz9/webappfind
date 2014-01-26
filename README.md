# webappfind

Are you a fan of web apps, but want the freedom to place your data files where you like on your desktop and thus be able to work offline and own your data rather than keeping it in the cloud? Do you want the freedom to just double-click (or right-click) a file on your desktop so that it opens in a web app, saving you the trouble of having to copy the file path, move from your desktop to the web app, and paste the path in a file finder? Do you want to avoid dragging files into your web app when modifications to the files cannot be saved back directly to your hard drive?

WebAppFind addresses these use cases by allowing you to double-click (or use "Open with..." right-click) on "view" or "edit" executable files on your desktop (currently, executables are for Windows only), sending the file path details to Firefox (via command line arguments) which are then intercepted by a Firefox add-on which checks for an *optional* filetypes.json file within the same directory as the right-clicked file to determine more precise handling (the file extension will be used to determine the type otherwise). Based on what is chosen/found and on user preferences, a handler web site will be sought in Firefox to open the file of the designated type (whether a generic or custom type) as well as allow saves to be made back to the file if the "edit" type was the type chosen and a suitable handler site was found to send back a save event.

WebAppFind allow you to make your data files accessible to other programs and to give your users peace of mind to not be locked into your application alone. It also allows your users to open your custom data files in your program immediately and intelligently, using whatever file extension you prefer, even if the file extension is a generic one such as "json" or "js" while your own data file follows a particular format or schema.

Unlike a more generic solution, such as with a Firefox add-on or [AsYouWish](https://github.com/brettz9/asyouwish/)-enabled site, *webappfind* minimizes security and privacy risks by only allowing files designated in the above manner to be available to the relevant web application.

# Executable usage notes

(For command line usage, see its API below.)

It is hoped that the instructions below can be mostly automated and simplified once the [Executable Builder](https://github.com/brettz9/executable-builder) add-on is complete (this add-on is to optionally interact with WebAppFind to allow building and assignment of executable/batch files which can be designated for specific file types without the user needing to find the path of these executables as WebAppFind currently requires).

## Instructions

Note that you must first install the Firefox add-on (the XPI file) so that the following steps will work (the add-on has not yet been submitted to the Addons site, so for now, you will have to either build the XPI from source or use the pre-built XPI included with the repository).

1. Right-click on a file.
    1. If you want to use WebAppFind without disturbing your defaults for that file extension, select "Open with"->"Choose default program..." if present (or if not present, open the file and choose "Select a program from a list of installed programs") and then make sure "Always use the selected program to open this kind of file" is not checked.
    1. If you always want to use WebAppFind when handling files of this extension, click "Properties", then click "Change..." next to "Opens with:" in the General tab of the dialog.
1. Click "Browse".
1. Navigate to an executable within the "cplusplus" folder of this [WebAppFind](https://github.com/brettz9/webappfind) repository (or, if you prefer, you can build the executables yourself with the source code included in this repository). If you want web apps to open this file in view-only mode, choose "WebAppFinder-view-mode-Firefox.exe" (or "WebAppFinder-binaryview-mode-Firefox.exe" if this is for a program needing to open a file in binary mode, such as images, sound files, or videos). If you want to grant the webapp read and write access for this file (or type of file if you chose option 1.2) you open via WebAppFind, choose "WebAppFinder-edit-mode-Firefox.exe" (or "WebAppFinder-binaryedit-mode-Firefox.exe" for editing binary files).
1. Select "Ok".
1. If you used "Open with" (as per step 1.1 above), your file should have already opened with WebAppFind. If you opted for "Properties" (step 1.2 above), you should now be able to double-click any file possessing the same extension to open it with WebAppFind.

If an edit web+local protocol is enabled and open and then disabled in the same session, it will keep having save access (though within that window session only). One must currently close any open tabs for that web application if one no longer wishes to allow access (though as noted elsewhere in the documentation, the app only has access to the files to which it was permitted access).

# Some use case scenarios

1. Work on Git on your desktop while being able to open HTML files for WYSIWYG editing in a (CKEditor) web app which you can easily modify to add buttons for snippets you like to add? Do you want to use CodeMirror for syntax highlighting of your JavaScript and CSS? (Demos are included which do all of these.)

# Possible future user preference changes

Currently preferences are global, whereas it may be desirable to allow users to customize their preferences by type/protocol in addition to the current default global ones.

# Command line API

WebAppFind is triggered (currently Firefox only) through command line arguments passed to Firefox and handled by the WebAppFind add-on.

It is my goal to complete work on [Executable Builder](https://github.com/brettz9/executable-builder) to facilitate the building of executables (probably batch scripts tied to cmd.exe) with icon for task bar usage, etc., but currently one must either use (or build) the executables included in the repository or call the command line oneself.

The following process is subject to change and may potentially even be scrapped altogether if another approach is found to be easier for streamlining cross-browser invocation, but currently this API is available if someone wishes to build their own executables using the API or to simply be able to run commands manually from the command line.

* `-webappdoc <path>` - Indicates the path of the file which will be made available to the web application (with the privileges designated by `-webappmode`)
* `-webappmode <mode>` Indicates the fundamental mode under which the file will be opened up to the web app (i.e., "-webappmode view", "-webappmode binaryview", "-webappmode edit", or "-webappmode binaryedit").
* `-webappcustommode <custom mode>` - Indicates a mode that supplements the fundamental mode (e.g., "source" added to the fundamental mode, "view" in order to specify that the document is being
opened so as to view the source code). Custom modes will immediately follow the mode within the protocol.
* `-remote "openurl(about:newtab)"` - This built-in Mozilla command line API allows Firefox (unlike "-silent") to gain focus without additional instructions to Windows. If the tab is determined to not be needed (e.g., if the user has opted to allow desktop opening of the file when no protocols are found), the add-on will simply auto-close the tab that this parameter opens.

# For developers

## Important security notes

When developing a web app for use with WebAppFind, it is even more important to protect the privacy and security of your users since your web app may inadvertently be exposing data they have saved on their desktops or even overwriting it.

1. Please note the security comments within the API comments below for details on how to make communiction with the add-on safely (via `postMessage`).
1. As with any web app, do not trust user-supplied data (e.g., to paste it using `innerHTML`), especially if that data is supplied via the URL (to which hackers can link or cause their visitors to visit such pages). See https://en.wikipedia.org/wiki/Cross-site_scripting for some of the concerns.
1. There should be no side effects upon the opening of a link to your web app (and whether or not your app is opened as a URL, protocol, or protocol-opened-through-WebAppFind), so for example, you should not automatically save file contents back to disk (at least without user approval). (An exception might be made in the future if AsYouWish is installed and the user wished to bookmark privileged but harmless or per-use-confirmed processes, e.g., to visit a link to package up some files as part of a build process.) See https://en.wikipedia.org/wiki/Cross-site_request_forgery for some of the concerns.

## API: file type finding

The following steps may currently be altered by user preference.

1. File types can currently be obtained based on file extension (e.g., "myScript.js" would incorporate "js" into the type name) or based on settings within a filetypes.json file placed within the same directory as the data files. The rules are as follows:
    1. Use a (lower-case) file extension (e.g., "js" in our example above)
    1. If a filetypes.json file is supplied within the same directory as the data files, a lower-case custom type can be specified:
        1. At the root of the filetypes.json JSON object can be a property "fileMatches" which is an array of two-value arrays. The first item in these inner arrays must be a regular expression expressed as a string to indicate which files will be matched and the second value to indicate the type to be assigned to the match. The first inner array containing a match will be the one used to designate the type name (which must be lower-case ASCII letters only).
1. Once a file type is known as per above...
    1. a protocol may be checked for the detected type as follows:
        1. The protocol to find the type will begin with "web+local" (only existing [whitelisted protocols or "web+" ones are allowed](http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-navigator-registerprotocolhandler))
        1. The protocol must then be followed by the (lower-case) fundamental mode (currently "view", "binaryview", "edit", "binaryedit", or "register") and optionally by a custom mode (e.g., "source") which indicates an extensible mode which is focused on one type of viewing, editing, etc. (e.g., looking at the source code of an HTML file as opposed to a WYSIWYG view).
        1. The protocol must then be concluded by the file type as per above (i.e., the file extension like "js" or filetypes.json designated type name (which [must be lower case ASCII](http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-navigator-registerprotocolhandler))).
        1. If the protocol is found to be registered, it will be visited and these steps will end. Otherwise, continue with the following steps.
    1. If the filetypes.json file contains a top-level "defaultHandlers" property object, this object will be checked against the type name and if a subobject for this type is found:
        1. that object will be checked to see whether the "register" mode is present (and the add-on user has not opted out of visiting these links), and if yes, the user would be forwarded to it (to allow a site the ability to register itself as a handler for any number of modes and/or be a portal to those modes) and these steps would stop. Otherwise, continue.
        1. that object will be checked to see whether the requested open mode is also present (e.g., "view", "binaryview", "edit", or "binaryedit").
            1. If the open mode key is present, its value will be used as the site to open. (Currently, %s found in the URL will be substituted with the equivalent protocol scheme (e.g., "web+localeditjs:") followed by a JSON-stringify'd object (containing *fileType*, *mode*, *customMode*, and *pathID* properties); note that user preferences may determine that the path ID is not the actual path but a mere GUID.) Although this may be changed in the future, file:// URLs currently do not work with WebAppFind message posting (due to current privacy leaks in Firefox with add-on-to-file-protocol-webpage communication) (As I recall, custom DOM events didn't work with file:, and there is apparently no other method of communicating with an add-on (without injecting a global) that we could use like allowing sites to open a chrome:// URL (restartless might be able to get such URLs via chrome.manifest or dynamically but this is not allowed from the file: protocol)).
    1. If the filetypes.json file contains a top level "hierarchy" property object and if a suitable mode was not found, the hierarchy object may be checked for the type name to see what types might be acceptable alternatives (in decreasing order of preference) to determine the type to check in future steps below.
    1. If no other information is present in the filetypes.json file, if the file is not present, or if a specific default site was not found, depending on user settings, depending on user setting, the browser may attempt to open the file. Depending on user settings, the user may delegate the opening of the file back to the desktop (the default, however, is not to do so). If the user has not permitted either of these behaviors, an error message will be displayed.

So, for example, if no filetypes.json file were present (or if the filetypes.json indicated that the given file was of the "js" type), a edit-capable loading of a JavaScript source file might look for a registration at "web+localeditjs:". Depending on user configuration, if such a hander is not found, the file may be opened in the browser or on the desktop.

## API: reading file contents

The 'webapp-view' message (see the example below) will be sent to the web app when a desktop file has been opened in the "view", "binaryview", "edit", or "binaryedit" mode. This message delivers the file contents (whether in binary form or not) to the web app.

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

A save will be performed by sending a 'webapp-save' to the add-on (see the code below).

A pathID will be needed when making a save of file contents back to the add-on (which will save back to disk). You can obtain this before making saves, by listening for the 'webapp-view' message (described under "API: reading file contents" above); the 2nd value of the first (array) argument (`previouslySavedPathIDFromViewEvent`) will contain this information.

This pathID is intended to allow for sites to handle multiple files in a single session (although WebAppFind currently will always open the file in a new tab as a new instance).

Note the important comment below about ensuring your users' privacy.

Once a save has been performed, a message, 'webapp-save-end', will be sent from the add-on back to the WebAppFind-opened app (in case the app would like to inform the user in some manner).

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

Although there may be some advantages to storing meta-data at the individual file level, I did not see a very convenient way in which Windows would allow the addition of arbitary meta-data which Firefox could easily query (Windows does not appear to offer arbitrary addition and editing of properties though programs, e.g., TortoiseGit, appear to be able to overlay the properties and are aware of file-level metadata while adding their own). Having a JSON file allows developers to add some type configuration (beyond the more generic info detectable by a file extension) within the directory containing the data files, allowing for introspection and modifications in a manner familiar to web developers.

The "fileMatches" array is an array of arrays as opposed to object literal in order to ensure matches occur in reliable order across systems (since ECMAScript does not guarantee iteration order across implementations). Other fields are keyed to type name (noting that these must all be lower-case ASCII letters since web protocols only allow these to work after the "web+").

Although I would eventually like to allow the add-on to accept hard-coded URLs for the web apps (so that users or vendors could ensure that their "Open With" instruction went to a particular URL regardless of add-on settings) and while filetypes.json does provide for *default*Handlers, filetypes.json deliberately avoids providing a mechanism for obligating the add-on to utilize a specific web app URL when opening files of a given type. This is by design as I believe the open nature of operating systems letting you choose what application to use for a given data file ought to be maintained by default with web apps (and be unlike the even worse status quo where websites not only don't allow other apps to read their data but host your data exclusively at their own site, even if they at least allow offline capability). I am interested, however, in seeing the possibility for registering "validate" modes independently from editors (but even here, I don't think I'd want to allow hard-coding of validators). But again, I do intend to allow hard-coding at the add-on level to provide some means of obligating the use of a particular URL.

Note that although this particular collection of "Open With..." executables and a (currently Firefox-only) add-on is called "WebAppFind", the protocols are prefixed to begin with the more generic phrasing "web+local" so as to allow openness to the possibility that non-browser desktop apps could also handle reading and editing of these offline-available, type-aware data files. The filetypes.json file is similarly non-committal in terminology or behavior about where the files will be opened, so desktop apps could (and, I believe, ought) to utilize filetypes.json when seeking to detect type information (beyond just reading the file extension).

The allowance for custom modes in addition to fundamental modes helps the user avoid the need to swap handlers (or modify filetypes.json) whenever they wish to go directly to an app (or a part of an app) which brings the precise functionality they are seeking at the moment. It allows niche apps (such as HTML source viewers) to avoid registering themselves as handlers in a manner that would conflict with other normally more useful apps that would act on the same file type (e.g., a WYSIWYG HTML viewer). Fundamental modes are limited to those which genuinely require a distinct mode of transmission or privileges (e.g., editing vs. viewing or normal vs. binary) whereas custom modes imply no difference at the file processing level; the information is only meaningful to web apps. (Hyphens or such would have been useful for namespacing between the two types of modes, but the current HTML spec does not allow protocols to be registered with them present.)

## Rationale for API design

`postMessage` was chosen for having a familiar API and already designed for potentially untrusted collaboration sources. (See the section "Comparison with similar WebAPI work" for other possibilities.)

Before discovering the command line handling, I originally sought to have the executable create a temp file containing an ID and path and mode info while supplying that to the add-on via a URL which would in turn check the temp file (this approach might work for other browsers if they do not allow add-ons to check command line arguments).

## Possible future API changes

1. Change filetypes.json to .filetypes.json or at least support the latter for those not wishing to distract users or let them mess things up.
1. Since web protocols are not meant to be used to have the privilege of reading from or writing to files (unless they belong to reserved protocols which, per the HTML spec, cannot be registered from the web anyways), the current approach of allowing web sites to register themselves as handlers might need to be modified to use some other mechanism which can at least provide warnings to users about the capabilities they are thereby approving (perhaps as within [AsYouWish](https://github.com/brettz9/asyouwish/) when sites themselves can do the requesting for privileges). However, since WebAppFind chose to start with the web protocol approach not only because it is an existing method for sites to register themselves for later potential use, but because the data security and privacy issues are confined to data files which are explicitly opened from the desktop when using the WebAppFind approach.
1. Depending on whether registerProtocolHandler will continue to be used, see about whether the HTML spec might be open to more tolerance within the allowed characters of a custom protocol beyond lower-case ASCII letters.
1. Possible changes to parameters passed to registered protocol handlers and/or default handlers (if any, as may only be passed through postMessage or some other means)
    1. Add to what is passed within URL (beyond filetype, mode, custom mode, and path)? or just pass through postMessage? Bookmarkability vs. clean API?
1. See todos below for possible additions to fundamental (functional) modes beyond just "view", "binaryview", "edit", and "binaryedit".

## Implementation notes

A direct visit to the protocol (including through XSRF) should provide no side effects. However, it is possible that a malicious handler opened by the user in "edit" mode could provide immediate side effects by saving back data to overwrite the supplied file. This might be mitigated by a configurable option to require the user's consent upon each save and/or to inform the user of the proposed diffs before saving. But again this will only be possible upon user initiation, only for the specific file or files approved in a given session, and a site will only be usable as a handler if the filetypes.json packaged with the data file designates it as a default handler for the data file (and the user maintains the preference to use this information) or if they have previously approved a protocol site for the given type.

# Comparison with similar WebAPI work

[WebActivities](https://wiki.mozilla.org/WebAPI/WebActivities) is similar to WebAppFind in that both seek to allow delegation of certain behaviors such as "view" and "edit" to (potentially) different apps (where the user also has the freedom to choose any app to handle the given type of activity), but WebActivities does not operate on files. Jonas Sicking indicated in a personal email response supportive of the concept of WebAppFind that WebActivities would be a good "way to dispatch the "view"/"edit" request to the appropriate web page, however WebActivities are still at an early stage and not ready for your use cases.".

These missing use cases (besides operating on files) might perhaps include:
* The typing system of WebActivities does not seem to be made to be extensible by applications. It thus also doesn't allow specification of hierarchies of types (e.g., myJson->json->js) for fallbacks for as-yet-unregistered types or for alternate editor types.
* WebActivities doesn't allow recommendation of default handlers when opening a file for the first time (though a WebActivities-supporting site could seek to register itself as such a handler).

The [WebAPI](https://wiki.mozilla.org/WebAPI) has a [DeviceStorageAPI](https://wiki.mozilla.org/WebAPI/DeviceStorageAPI) which has certain file-related behaviors.

Shortcomings (or differences) of the current DeviceStorageAPI relative to WebAppFind would appear to be:

* It does not seem to anticipate the activities being triggered from one's desktop, but rather if one is already within a web app.
* The proposal at present appears to be limited to files in a specific directory of one's hard drive. It thus does not allow one the freedom to store one's files wherever one likes on one's hard-drive for better organization purposes.

The DeviceStorageAPI appears to allow more privileges (like [AsYouWish](https://github.com/brettz9/asyouwish/)) such as enumerating files in a directory, adding or deleting files, and listening for creation/deletion/modifications, whereas WebAppFind is currently focused on individual file reading and saving. However, WebAppFind may add other actions in the future, such as listening for file change events for version tracking or allowing for a web app to handle adding or deleting a file (in case it wishes to do related set-up/take-down work).

Since WebAppFind executables pass along path information, WebAppFind can already be used with the AsYouWish add-on (if the user so configures that privilege-escalating add-on) to have it conduct the other privileged activities of the DeviceStorageAPI whether enumerating files in the file's directory, doing set-up or take-down work related to file creation or deletion, or such things as uploading the containing folder's contents (and especially if WebAppFind is modified to allow for opening a hidden window, AsYouWish could be used for batch-like operations).

# Comparison with AsYouWish

[AsYouWish](https://github.com/brettz9/asyouwish/) allows a higher-than-normal privilege level to websites, but it differs in a number of areas:

1. AsYouWish sites ask for permission, and once approved, can then immediately do their work. WebAppFind currently allows sites to ask for permission to register themselves as handlers, but their work will only become relevant when the user opens a file via WebAppFind.
2. AsYouWish allows for a vast number of possible privileges (though subject to user approval) including potentially arbitrary file reading and writing (as with Firefox extensions), while WebAppFind is limited to file reading and writing (though it may expand to certain other circumscribed, user-initated file-related activities in the future) and only for those files so opened as opened by the user.

# Higher priority todos planned

1. Added security
    1. Disable further save attempts with bad ID supplied in case a however previously approved site is attempting to guess at the paths of (if the user has enabled path transmission), or at the GUID representing, other non-approved files
    1. Check upon each save attempt that the loaded protocol is still registered as a handler (and remove usage notes above once implemented).
    1. Listen for unregistration of protocols to disable acting on future messages from them (only relevant for pages already loaded in this session).
1. API changes/additions
    1. Support an optional, hard-coded web app URL and/or hard-coded file type (to circumvent the normal detection procedures and always open with a given web app).
    1. Support command-line transmission of the file privileges to a specific web app URLs regardless of prefs/config? (optionally looking for fallbacks if the supplied one is a protocol but not found)
    1. Arbitrary command line args to pass on to webapps
    1. Allow eval-able strings (or JS file paths) as arguments (with or without the usual WebAppFind
    file contents/paths) which Firefox then evaluates so as to provide AYW-like privileged
    functionality in a batch file manner without exposing privileges to web apps unless invoked from the desktop (as a workaround, one could use WebAppFind to open an AYW-enabled site, especially if it adds an eval-like ability and WebAppFind get support for passing in arbitrary command line args). Batch scripts (including the functionality to optionally receive file arguments or paths to JS files if AYW was used or XHR paths were used) could thus be written in JS and take advantage of FF cross-platform features (like [Node.js command line scripts](http://www.2ality.com/2011/12/nodejs-shell-scripting.html) but browser aware too). Could use in conjunction with proposed "hidden" flag to avoid adding a tab (or do so by default).
    1. Support optional "hidden" flag (in conjunction with, or only from, AsYouWish?) to embed a hidden DOM window script (use for batch-script-like functionality)
        1. Potentially privileged via AsYouWish, and aware of file path, could, e.g., create 10 copies of a supplied file name in the same directory or some other pipeline
        1. Allow args to WebAppFind to avoid adding a window, e.g., for a type to handling .jsbatch files to cause a them to be launched with privileges (via AYW? though better to avoid need for any HTML--just JS) in a hidden window (or manage files to run on a schedule; integrate with a Windows task scheduler in case not open?), so work like AYW but without a footprint (but without working each restart as with "add-on sites"); may still be useful with other privs, e.g., to get (send to network) and save file contents, and if asking for privs, will prompt dialog (e.g., to read a file and then use privs--though this would be redundant, perhaps in this mode we can always pass the real path so it adds value, e.g., if script wants to do something in same directory); see also todos in Executable Builder for more on
        command-line-like approach
    1. Support option for any web app to open by default in full-screen mode (could just let web app and user handle, but user may prefer to bake it in to a particular executable only)
1. Complete [Executable Builder](https://github.com/brettz9/executable-builder)
    1. Rewrite C++ exe's as batch scripts (particularly for the sake of [Executable Builder](https://github.com/brettz9/executable-builder)), but made executable by being tied to cmd.exe
    1. Installer script to run to facilitate setting up of OpenWith per user choices (if Executable Builder is not installed, it could link to it, and if it is, it could bring user through steps).
1. Unregister command line handler, etc. on add-on uninstall
1. Option to avoid or allow new tabs for same URI/mode/filetype/path? (option to get the same tab or new tabs for them?); option to push to all open windows in different manner so can notify user of updates but not change focus, etc.
1. Create tests with using registerProtocolHandler (also for JS/JSON/mytype)
1. Submit to AMO, Bower, etc.

# Medium term priority todos

1. Firefox add-on to allow creation of context menu items, including invoking a process with arguments with the selected text, right-clicked URL, or current URL as arguments (with the URL potentially being first retrieved as text and then sent as arguments?). Besides allowing the reverse behavior of WebAppFind (allowing one to selectively choose files on the web or text to supply to a desktop app instead of supplying desktop files or command line text to a web app, e.g., opening a file from the web in Notepad++), it would even allow WebAppFind to be invoked (for the use case of passing text or URL content to a web app); the web app could, if opened in edit mode, place a (privileged cross-domain) PUT request on behalf of the web app for a save-back, allowing users the choice of application for saving files back to the web (also allow a desktop executable the ability to launch such a site file in a hard-coded app or web-app--in this case, the executable would be clicked directly since it was hard-coding both the data file (a web file) and the handling app (which in this case could also be a desktop app)). Also support a content-type handler and protocol handler for opening exe/batch files (or option to install first (with platform-specific choices) if not already installed, but with privacy guards not to report whether already installed), passing arguments (or shell commands), so web can get access to desktop. Let protocol or content-type handler support either URLs (so specific data files can be read) or the content itself be passed but without a need for something heavy like Java or Silverlight (or whatever people use to do this) to do the delegation to the desktop files (plug-ins themselves support swapping of data files (for reading or writing) in app-independent manner?)... Also ensure asks permission and give ability to remember permissions for a site... (Avoids need for plugin (or new browser instance embedding) to integrate desktop apps with and originating from the Web.) Integrate with an add-on version of the AsYouWish-bundled command line app so batch commands can be passed from there (as well as saved as a context menu item) to WebAppFind (see other todo in this README about this possibility). Also right-click to add text or URL contents as itself a context menu script. Ensure add-ons support file: and native paths to: open folder on desktop, open folder in Firefox file browser, execute on desktop, execute with web app

# Possible future todos

1. Allow genuine POST or other non-GET or header-dependent requests (ala curl)?
1. Allow postMessage mechanism to receive content as entered in a dialog as opposed to a file (though with an optional file to save back)
1. Create dialog to ask user for mode, etc., so executable doesn't have to bake it all in and can let the user decide at run-time.
1. Command line flag additions:
    1. See below and also possibly the notes within the [Executable Builder](https://github.com/brettz9/executable-builder) code
    1. Support the "register" mode from command line?
1. Integrate functionality into https://github.com/brettz9/filebrowser-enhanced
1. When [AsYouWish](https://github.com/brettz9/asyouwish/) is in use, allow path-reading as long as site is AYW-approved and the page is registered for the protocol--so one can bookmark a path and always load it or load with other approved paths (e.g., in different tabs within a webapp); also can remember paths to invoke upon FF start up ("website addons")
1. Ensure some additional privacy for users desiring it by restricting external access (using https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIContentPolicy and https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIPrincipal per http://stackoverflow.com/questions/18369052/firefox-add-on-to-load-webpage-without-network-access ?) See also http://en.wikipedia.org/wiki/Site-specific_browser regarding such sandboxing.
1. Provide XULRunner option for executable-like behavior independent of Firefox.
1. Option to enable file: protocol (though mention it is currently risky in Firefox to use `postMessage` for security and privacy given its lack of scoping); report issue to FF if issue not already added (also for better means than '*' for add-on communication?) . However, this option would be quite useful, especially if the todo just above on restricting external access were implemented, given that web apps could be installed to work with one's files (ideally without concerns that the data was going to be sent anywhere, and if the todo to confirm saves were implemented, one could also see what changes were being made to a file before being actually saved). Unfortunately, file: sites cannot register themselves as protocol handlers, so the user would need to configure their settings so as to rely on the default handlers in filetypes.json to be able to use such a file (or we would need to create our own mechanism, such as through `postMessage` back to the add-on (or a change in the file's GET parameters or perhaps modification of an element within the document), to allow a file: site to request permission to become usable as a protocol handler).
1. Option to confirm reading and/or saving of data upon each attempt and/or display the proposed diffs before saving. (See "Implementation notes" section).
1. Piggyback on drag-and-drop file capabilities (or create own) to allow files dropped in this way to be saved back to disk and/or path provided to the app.
1. Open up wiki for custom type documentation/links with "proposal", "accepted", etc. statuses similar to the WhatWG meta tags wiki (and same for custom modes)? Even if filetypes.json is used with "register" on "defaultHandlers", it may be convenient to have a separate spec URL, including for cases where the file extension is used without filetypes.json.
1. Allow filetypes.json to designate icon files (as well as suggested shortcut names?) for use with [Executable Builder](https://github.com/brettz9/executable-builder) executables so the user will not need to create their own icon? Would executables or batch files (or filebrowser-enhanced) be able to pre-read the current directory and parse the JSON file and then delegate to another executable associated with this icon?
1. Allow command line to specify (or let WebAppFind determine according to some permutation of the file path) the exact window and possibly Panorama group and/or pinned status into which the web app with desktop file will be opened (the web app could handle moving itself instead but only if the web app were AsYouWish-based and the user preferences supplied the file path). Alternatively, the executable might have logic to determine the profile in a similarly automated (as opposed to hard-coded) manner. The advantage of either approach would be to allow the user a better web app grouping organization corresponding to the hierarchical organization they can find on the desktop.

# Possible future mode additions

Besides "view", "binaryview", "edit", "binaryedit", "register", the following modes might be added in future versions:

1. Version control (also some discussion of possibilites for multiple file saving)
    1. "create", "delete" - for any necessary set-up before creation or deletion of a file (as with saving, the protocol should not have side effects, so these should only bring one to the page to confirm the user wished to take such an action--and the browser might have its own confirmation for these actions).
    1. "rename" and "move" (or cut or copy and paste)
    1. "versioncontrol" - A mechanism could be added to request listening to events which would impact version control (though some means of determining scope would be needed--e.g., a folder and all its subfolders--as well as privacy/security considerations which expands beyond the current scope of individual file viewing and saving; similar concerns would need to be taken into account for other modes that may process multiple files like search or file packaging). These events could be used to open a (hidden?) web app to store data (e.g., via localStorage or a new "edit" mechanism which could save to disk, but circumscribed by file type so that, e.g., a repository binary could be modified without the user needing to explicitly open it) and build a file history for a "repository". This "versioncontrol" handlers ought to allow multiple listening apps in some manner; this would be both for the sake of allowing different versioncontrol storage mechanisms/repository types, for ensuring that any viewing apps get updated upon external changes, as well as for any apps storing meta-data related to a document or documents but not saved within them to be notified and respond accordingly (including possibly saving their own updates back to disk), e.g., for building up a history of commit messages (which would at least effectively need the completion of the todo to allow a single web app to handle multiple documents at once).
1. "send to" or "mailer" - e.g., to put file contents and/or file attachment(s), subject, etc. into a mail viewer, ready to email (with equivalents for chatting)?
1. "validate" - Before the save command of an "edit" mode process (and its response back to the app) is completed, it may be handy to have a separate protocol be called for any registered validators of a given file type to perform validation and conditionally reject a save. Instead of receiving the file path, they would be passed the proposed file contents for saving from "edit" to ensure proper well-formedness and validity before saving back to disk. It might be ideal for a validator to simply be a JavaScript file with a specific function, but for parity, we should probably implement this as another HTML file using a (secure) postMessage. If a file was found within a filetypes.json hierarchy, it may be desirable to ensure validators are sought up the hierarchy (at least if not found at the most specific level), e.g., to check that a "myType" file specified as being a JSON file is indeed a JSON file, or at least a JavaScript object if there is no JSON validator registered.
1. "preconvert" and "postconvert" - hooks to transform content before reading or writing, respectively (but before "validate")
1. "splash" - for a splash page leading to the modes so that "register" can be exclusively for registering users? 
1. "query" or "search" - For queries within file or within a folder, etc., optionally (?) filtered by file type; this might be used for "find-in-files" behavior (multiple file saving would be needed for "replace-in-files"). These queries could be hierarchical (as also defined in filetypes.json?) such that, for example, one might have "myType" JSON files queryable in a precise manner, e.g., to find all files (or records) containing a "publication date" between a range of dates, while also allowing more generic queries such as RQL, or if not available (or not desired), the user could default to full text search (since a superset of JSON could be the txt type which could allow full text search).
1. "execute" - Although the OS would normally do its own execution, it is possible that privileged apps (as through AsYouWish) might be able to handle this at least partly on their own

# Possible "Demos" todos

1. Demos ought to use cookie-using full screen option for HTML and SVG
1. Get HTML CodeMirror to use closetag, html5complete, matchTags (in addition to JS ones if mixed mode can support), use the preview option?; http://codemirror.net/demo/widget.html for line bars in linting (html, css, javascript)? linting for HTML? (JSLint can do some); ensure JSLint (and CSSLint?) applied to mixed HTML
1. JS enhancement: CodeMirror tern support? can this work or be made to work with JSDoc?
1. Use CodeMirror diffs/merge add-ons if version-control trigger types supported
1. Use runmode for getting code syntax highlighting within CKEditor HTML (e.g., for doing blog posts): http://codemirror.net/demo/runmode.html and for a button to copy-HTML-(+css with styles inlined?)-to-clipboard in each of the html/javascript/css/svg/etc. modes
1. Add CodeMirror search/replace?
1. Tweak change CSS autocomplete in CodeMirror to support color/background-color, support CSS lint options
1. Cookie to hold JSHint options (or CSS lint options) and for remembering XML "schemaInfo"
1. XML dialect demo with schema for CodeMirror xmlautocomplete (also a JSON schema for checking JSON dialects if not autocomplete as well?)
1. Images/canvas: http://www.picozu.com/editor/ ? Animated GIFs?
1. Animated SVG?
1. Audio: http://plucked.de/ and https://github.com/plucked/html5-audio-editor ?
1. Video - popcorn?
1. Music notations  - http://www.vexflow.com/
1. MIDI, etc.
1. Better integration of CodeMirror/CKEditor, using full (mixed HTML) features of latest CodeMirror
1. Update my regex support in CodeMirror for regex type and for JS overlay: http://codemirror.net/1/contrib/regex/index.html
1. CKEditor support for popup or inline SVGEdit and SVGEdit support for CKEditor foreign objects (via foreignObject extension?)
1. Add CodeMirror to SVG Edit XML view
1. Sticky app
    1. power-user support for form controls like checkboxes (underlying events currently supported better in Chrome than in Firefox), paperclip links, etc.
    1. Modify WebAppFind to support display of independent data files (for multiple stickies in this case); or don't only associate a file path with individual URLs (file: or http:), but also allow associations with tab groups or bookmark folders so that if saving a new StickyBrains/CKEditor/word-processing file, it will save to a folder where one's ideas are already grouped
    1. Offer grid-like edit ability using SVG Edit with HTML controls like checkboxes within foreignObject
1. Create demo supporting docx format (rather than requiring export to HTML for Word docs)
1. Demonstrate approach of allowing data files for download (so can store them anywhere)--if not AYW approach for namespaced shared browser access--as well as data files chosen from File selector (and save over such a file if within the protocol and user permits)
1. Ability to build [JHTML](http://brettz9.github.com/jhtml) with autocomplete (usable for saving as JSON or saving as HTML) once spec finalized (once <i> approach used)
1. Integrate HTML/SVG (and then others) with [Together.js](https://togetherjs.com/) to allow collaboration on one's local files
1. Markdown editor (http://pagedown.googlecode.com/hg/demo/browser/demo.html for buttons or http://dillinger.io/ for syntax highlighting or integrate CodeMirror markdown into pagedown?). See also http://stackoverflow.com/questions/2357022/what-is-a-good-client-side-markdown-editor/
1. Todo webapp demo
1. Email/chat client which stores data locally (and optionally only locally); good open source options to adapt? Tie in together.js with chat (as in whiteboards) or even to write collaborative emails
1. Do a concept for browsing or editing the file contents of a zip using the likes of http://stuk.github.io/jszip/ or those mentioned at http://stackoverflow.com/questions/2095697/unzip-files-using-javascript
