# webappfind

Are you a fan of web apps, but want the freedom to place your data files
where you like on your desktop and thus be able to work offline and own
your data rather than keeping it in the cloud? Do you want the freedom
to just double-click (or right-click) a file on your desktop so that it opens
in a web app, saving you the trouble of having to copy the file path,
move from your desktop to the web app, and paste the path in a file
finder? Do you want to avoid dragging files into your web app when
modifications to the files cannot be saved back directly to your hard
drive?

WebAppFind addresses these use cases by allowing you to double-click (or
use "Open with..." right-click) on "view" or "edit" executable files on your
desktop (currently, executables are for Windows only), sending the file
path details to Firefox (via command line arguments) which are then
intercepted by a Firefox add-on which checks for an *optional* filetypes.json
file within the same directory as the right-clicked file to determine more
precise handling (the file extension will be used to determine the type
otherwise). Based on what is chosen/found and on user preferences,
a handler web site will be sought in Firefox to open the file of the
designated type (whether a generic or custom type) as well as allow
saves to be made back to the file if the "edit" type was the type chosen
and a suitable handler site was found to send back a save event.

WebAppFind allow you to make your data files accessible to other
programs and to give your users peace of mind to not be locked
into your application alone. It also allows your users to open your
custom data files in your program immediately and intelligently,
using whatever file extension you prefer, even if the file extension
is a generic one such as "json" or "js" while your own data file
follows a particular format or schema.

Unlike a more generic solution, such as with a Firefox add-on or
[AsYouWish](https://github.com/brettz9/asyouwish/)-enabled site,
*webappfind* minimizes security and privacy risks by only allowing
files designated in the above manner to be available to the relevant
web application.

# Executable usage notes

(For command line usage, see its API below.)

It is hoped that the instructions below can be mostly automated
and simplified once the
[Executable Builder](https://github.com/brettz9/executable-builder)
add-on is complete (this add-on is to optionally interact with WebAppFind
to allow building and assignment of executable/batch files which can be
designated for specific file types without the user needing to find the
path of these executables as WebAppFind currently requires).

## Instructions

Note that you must first install the Firefox add-on (the XPI file) so that
the following steps will work (the add-on has not yet been submitted
to the Addons site, so for now, you will have to either build the XPI
from source or use the pre-built XPI included with the repository).

1. Right-click on a file.
    1. If you want to use WebAppFind without disturbing your defaults
    for that file extension, select "Open with"->"Choose default program..."
    if present (or if not present, open the file and choose "Select a program
    from a list of installed programs") and then make sure "Always use the
    selected program to open this kind of file" is not checked.
    1. If you always want to use WebAppFind when handling files of this
    extension, click "Properties", then click "Change..." next to
    "Opens with:" in the General tab of the dialog.
1. Click "Browse".
1. Navigate to an executable within the "cplusplus" folder of this
[WebAppFind](https://github.com/brettz9/webappfind) repository (or, if
you prefer, you can build the executables yourself with the source code
included in this repository). If you want web apps to open this file in
view-only mode, choose "WebAppFinder-view-mode-Firefox.exe" (or
"WebAppFinder-binaryview-mode-Firefox.exe" if this is for a program
needing to open a file in binary mode, such as images, sound files, or
videos). If you want to grant the webapp read and write access for this
file (or type of file if you chose option 1.2) you open via WebAppFind,
choose "WebAppFinder-edit-mode-Firefox.exe" (or
"WebAppFinder-binaryedit-mode-Firefox.exe" for editing binary files).
1. Select "Ok".
1. If you used "Open with" (as per step 1.1 above), your file should have
already opened with WebAppFind. If you opted for "Properties" (step 1.2
above), you should now be able to double-click any file possessing the
same extension to open it with WebAppFind.

If an edit web+local protocol is enabled and open and then disabled in
the same session, it will keep having save access (though within that
window session only). One must currently close any open tabs for that
web application if one no longer wishes to allow access (though as noted
elsewhere in the documentation, the app only has access to the files to
which it was permitted access).

# Some use case scenarios

1. Work on Git on your desktop while being able to open HTML files for
WYSIWYG editing in a (CKEditor) web app which you can easily modify
to add buttons for snippets you like to add? Do you want to use CodeMirror
for syntax highlighting of your JavaScript and CSS? (Demos are included
which do all of these.)

# Possible future user preference changes

Currently preferences are global, whereas it may be desirable to allow users
to customize their preferences by type/protocol in addition to the current
default global ones.

# Command line API

WebAppFind is triggered (currently Firefox only) through command line
arguments passed to Firefox and handled by the WebAppFind add-on.

It is my goal to complete work on
[Executable Builder](https://github.com/brettz9/executable-builder) to
facilitate the building of executables (probably batch scripts tied to
cmd.exe) with icon for task bar usage, etc., but currently one must
either use (or build) the executables included in the repository or call
the command line oneself.

The following process is subject to change and may potentially even
be scrapped altogether if another approach is found to be easier for
streamlining cross-browser invocation, but currently this API is available
if someone wishes to build their own executables using the API or to
simply be able to run commands manually from the command line.

* `-webappdoc <path>` - Indicates the path of the file which will be made available to the web application (with the privileges designated by `-webappmode`)
* `-webappmode <mode>` Indicates the fundamental mode under which the file will be opened up to the web app (i.e., "-webappmode view", "-webappmode binaryview", "-webappmode edit", or "-webappmode binaryedit").
* `-webappcustommode <custom mode>` - Indicates a mode that supplements the fundamental mode (e.g., "source" added to the fundamental mode, "view" in order to specify that the document is being
opened so as to view the source code). Custom modes will immediately follow the mode within the protocol. (Note that this API is expected to change)
* `-remote "openurl(about:newtab)"` - This built-in Mozilla command line API allows Firefox (unlike "-silent") to gain focus without additional instructions to Windows. If the tab is determined to not be needed (e.g., if the user has opted to allow desktop opening of the file when no protocols are found), the add-on will simply auto-close the tab that this parameter opens.

# Tips for usage with other tools

As mentioned,
[Executable Builder](https://github.com/brettz9/executable-builder)
is a project which ought to open up further options to WebAppFind
users when complete.

If you wish to open desktop files into web apps but which for those web apps
to have higher privileges than just writing back to the opened file, see
[AsYouWish](https://github.com/brettz9/asyouwish/).

Remember that besides being able to launch WebAppFind from the desktop,
you can also launch from the command line, including from within the likes of
desktop apps as well, such as [Notepad++](http://notepad-plus-plus.org/).
(See also [atyourcommand](https://github.com/brettz9/atyourcommand) for
some desired todos regarding standardizing argument types.)

In the case of Notepad++, one can go to the "Run" menu and choose the
"Run..." item, and then specify the path of the relevant WebAppFind
executable followed by a space and `"$(FULL_CURRENT_PATH)"`. This
will allow you to open the current file in a web app. You may
also wish to click the "save" button there which allows specifying a hot
key. If you wish to supply other arguments, see the relevant
[Notepad++ wiki page](http://sourceforge.net/apps/mediawiki/notepad-plus/index.php?title=External_Programs).
Note that as WebAppFind does not yet support a global user filetypes.json
file, you will first need to allow a site to register itself as a protocol
handler for the types of files you wish to open (based on file
extension) or add a filetypes.json file within the directory of the file
of interest (to which you can easily get in Notepad++ by "Open
Containing Folder in Explorer" and then adding the file by right-click
and opening it); otherwise, you may get a message in a Firefox tab
that a handler was not found for the supplied file's extension.

If you want to go in the other direction, from web documents to the desktop
(or from arbitrary web documents to web apps), you might watch
[AtYourCommand](https://github.com/brettz9/atyourcommand) which when
finished should help users to do this.

# For developers

## Important security notes

When developing a web app for use with WebAppFind, it is even more
important to protect the privacy and security of your users since your
web app may inadvertently be exposing data they have saved on their
desktops or even overwriting it.

1. Please note the security comments within the API comments below for
details on how to make communiction with the add-on safely (via
`postMessage`).
1. As with any web app, do not trust user-supplied data (e.g., to paste
it using `innerHTML`), especially if that data is supplied via the URL (to
which hackers can link or cause their visitors to visit such pages). See
https://en.wikipedia.org/wiki/Cross-site_scripting for some of the concerns.
1. There should be no side effects upon the opening of a link to your web app
(and whether or not your app is opened as a URL, protocol, or
protocol-opened-through-WebAppFind), so for example, you should not
automatically save file contents back to disk (at least without user
approval). (An exception might be made in the future if AsYouWish is
installed and the user wished to bookmark privileged but harmless or
per-use-confirmed processes, e.g., to visit a link to package up some
files as part of a build process.) See
https://en.wikipedia.org/wiki/Cross-site_request_forgery for some
of the concerns.

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
        1. that object will be checked to see whether the requested open mode is also present (i.e., "view", "binaryview", "edit", or "binaryedit" optionally followed by a supplied extensible custom mode such as "source" to view or edit source only).
            1. If the open mode key is present, its value will be used as the site to open. (Currently, %s found in the URL will be substituted with the equivalent protocol scheme (e.g., "web+localeditjs:") followed by a JSON-stringify'd object (containing *fileType*, *mode*, *customMode*, and *pathID* properties); note that user preferences may determine that the path ID is not the actual path but a mere GUID.) Although this may be changed in the future, file:// URLs currently do not work with WebAppFind message posting (due to current privacy leaks in Firefox with add-on-to-file-protocol-webpage communication) (As I recall, custom DOM events didn't work with file:, and there is apparently no other method of communicating with an add-on (without injecting a global) that we could use like allowing sites to open a chrome:// URL (restartless might be able to get such URLs via chrome.manifest or dynamically but this is not allowed from the file: protocol)). (Note: For security reasons
            one should not rely on the URL parameters; it is better to utilize the message listening approach shown below.)
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

Only windows with the URI approved by the process detailed above
will be able to successfully receive such messages (and only for the
supplied file).

## API: saving back to the originally supplied file path (for the "edit" mode only)

A save will be performed by sending a 'webapp-save' to the add-on
(see the code below).

A pathID will be needed when making a save of file contents back to
the add-on (which will save back to disk). You can obtain this before
making saves, by listening for the 'webapp-view' message (described
under "API: reading file contents" above); the 2nd value of the first (array)
argument (`previouslySavedPathIDFromViewEvent`) will contain this
information.

This pathID is intended to allow for sites to handle multiple files in a
single session (although WebAppFind currently will always open the file
in a new tab as a new instance).

Note the important comment below about ensuring your users' privacy.

Once a save has been performed, a message, 'webapp-save-end', will be
sent from the add-on back to the WebAppFind-opened app (in case the
app would like to inform the user in some manner).

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

Only windows with the URI approved by the process detailed above
can successfully save such messages (and only for the supplied file).

## API: Obtaining a directory path

If one adds something like the following Windows batch file:

```Batchfile
"%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe" -remote "openurl(about:newtab)" -webappdir "%1" -webappsite "http://brett-zamir.me/webappfind/demos/dir.html?path=%1"
```

...and copies it into the Windows "SendTo" folder (which can be found by
opening `shell:SendTo`), you can right click folders to send its path to
your web app (change the URL above to that of your web application).

You do not need the path in the URL, and, as for files, for security
reasons, should not rely on this, but it is provided for convenience.
The recommended method for listening for the path is instead in
the following manner:

```javascript
window.addEventListener('message', function(e) {
        if (e.origin !== window.location.origin || // PRIVACY AND SECURITY! (for viewing and saving, respectively)
            (!Array.isArray(e.data)))
        ) {
            return;
        }
        var messageType = e.data[0];
        if (messageType === 'webapp-directoryPath') {
            var path = e.data[1];

            // Now do something with "path" here!

        }
    }, false);
```

WebAppFind may be modified in the future
to allow file writing to all files within a supplied directory, but for now
the most likely use case for using this API is within an AsYouWish
app which could request privileges to process the supplied directory's
contents.

Note that for convenience, a batch file (that does not even require
WebAppFind) is packaged with WebAppFind
in the "batch" folder that can similarly be used if placed in the
"SendTo" folder to allow
opening a right-clicked directory into Firefox's file browser (including
if you have overlaid its default browser with
[filebrowser-enhanced](https://github.com/brettz9/filebrowser-enhanced)).

## Recognized file types and custom modes

Although you are free to define your own file types and custom modes,
in order to prevent future conflicts, it is recommended that you register
your [file types](./doc/Registered-file-types.md) and
[custom modes](./doc/Registered-custom-modes.md) (or at least namespace
them well).

Even if filetypes.json is used with "register" on "defaultHandlers", it may be
convenient to have a separate spec URL detailed for your file type, including
for cases where the file extension is used without filetypes.json.

## Rationale for filetypes.json design

Although there may be some advantages to storing meta-data at the individual
file level, I did not see a very convenient way in which Windows would allow
the addition of arbitary meta-data which Firefox could easily query (besides
the registry, Windows does not appear to offer arbitrary addition and editing
of properties through its UI though programs, e.g., TortoiseGit, are
able to overlay the properties and
are aware of file-level metadata while adding their own). Having a JSON file
allows developers to add some type configuration (beyond the more generic
info detectable by a file extension) within the directory containing the data
files, allowing for introspection and modifications in a manner familiar to
web developers.

The "fileMatches" array is an array of arrays as opposed to object
literal in order to ensure matches occur in reliable order across
systems (since ECMAScript does not guarantee iteration order across
implementations). Other fields are keyed to type name (noting that
these must all be lower-case ASCII letters since web protocols only
allow these to work after the "web+").

Although I would eventually like to allow the add-on to accept hard-coded
URLs for the web apps (so that users or vendors could ensure that their
"Open With" instruction went to a particular URL regardless of add-on
settings) and while filetypes.json does provide for *default*Handlers,
filetypes.json deliberately avoids providing a mechanism for obligating
the add-on to utilize a specific web app URL when opening files of a
given type. This is by design as I believe the open nature of operating
systems letting you choose what application to use for a given data file
ought to be maintained by default with web apps (and be unlike the even
worse status quo where websites not only don't allow other apps to read
their data but host your data exclusively at their own site, even if they at
least allow offline capability). I am interested, however, in seeing the
possibility for registering "validate" modes independently from editors (but
even here, I don't think I'd want to allow hard-coding of validators). But
again, I do intend to allow hard-coding at the add-on level to provide
some means of obligating the use of a particular URL.

Note that although this particular collection of "Open With..."
executables and a (currently Firefox-only) add-on is called
"WebAppFind", the protocols are prefixed to begin with the
more generic phrasing "web+local" so as to allow openness
to the possibility that non-browser desktop apps could also
handle reading and editing of these offline-available, type-aware
data files. The filetypes.json file is similarly non-committal in
terminology or behavior about where the files will be opened,
so desktop apps could (and, I believe, ought) to utilize filetypes.json
when seeking to detect type information (beyond just reading the
file extension). (It is a potential to-do of this project to allow
filetypes.json to allow designation of local command line
arguments to apps besides Firefox as well, but this would
require first routing the request through Firefox or some
batch/executable which did more pre-processing including
JSON parsing; see also
[atyourcommand](https://github.com/brettz9/atyourcommand)
for more ideas about this.)

The allowance for custom modes in addition to fundamental modes
helps the user avoid the need to swap handlers (or modify
filetypes.json) whenever they wish to go directly to an app (or a
part of an app) which brings the precise functionality they are
seeking at the moment. It allows niche apps (such as HTML
source viewers) to avoid registering themselves as handlers in a
manner that would conflict with other normally more useful apps
that would act on the same file type (e.g., a WYSIWYG HTML
viewer). Fundamental modes are limited to those which genuinely
require a distinct mode of transmission or privileges (e.g., editing
vs. viewing or normal vs. binary) whereas custom modes imply
no difference at the file processing level; the information is only
meaningful to web apps. (Hyphens or such would have been
useful for namespacing between the two types of modes, but
the current HTML spec does not allow protocols to be registered
with them present.)

## Rationale for API design

`postMessage` was chosen for having a familiar API and already
designed for potentially untrusted collaboration sources. (See the
section "Comparison with similar WebAPI work" for other possibilities.)

Before discovering the command line handling, I originally sought to
have the executable create a temp file containing an ID and path
and mode info while supplying that to the add-on via a URL which
would in turn check the temp file (this approach might work for other
browsers if they do not allow add-ons to check command line arguments).

## Possible future API/filestypes.json changes

1. Allow filetypes.json to designate profiles or windows so C++ executable or batch file could do its own filetypes.json processing to determine target profile or window?
1. Allow filetypes.json to designate icon files (as well as suggested shortcut names?) for use with [Executable Builder](https://github.com/brettz9/executable-builder) executables so the user will not need to create their own icon? Executables or batch files (or filebrowser-enhanced) might pre-read the current directory and parse the JSON file and then delegate to another shortcut/executable associated with this icon
1. Change filetypes.json to .filetypes.json or at least support the latter for those not wishing to distract users or let them mess things up.
1. Since web protocols are not meant to be used to have the privilege of reading from or writing to files (unless they belong to reserved protocols which, per the HTML spec, cannot be registered from the web anyways), the current approach of allowing web sites to register themselves as handlers might need to be modified to use some other mechanism which can at least provide warnings to users about the capabilities they are thereby approving (perhaps as within [AsYouWish](https://github.com/brettz9/asyouwish/) when sites themselves can do the requesting for privileges). However, since WebAppFind chose to start with the web protocol approach not only because it is an existing method for sites to register themselves for later potential use, but because the data security and privacy issues are confined to data files which are explicitly opened from the desktop when using the WebAppFind approach.
1. Depending on whether registerProtocolHandler will continue to be used, see about whether the HTML spec might be open to more tolerance within the allowed characters of a custom protocol beyond lower-case ASCII letters.
1. Possible changes to parameters passed to registered protocol handlers and/or default handlers (if any, as may only be passed through postMessage or some other means)
    1. Add to what is passed within URL (beyond filetype, mode, custom mode, and path)? or just pass through postMessage? Bookmarkability vs. clean API?
1. See higher priority todos for an anticipated change with custom modes and allowing for multiple
modes at once.
1. See todos below for possible additions to fundamental (functional) modes beyond just "view", "binaryview", "edit", and "binaryedit".

## Implementation notes

A direct visit to the protocol (including through XSRF) should provide no side effects. However, it is possible that a malicious handler opened by the user in "edit" mode could provide immediate side effects by saving back data to overwrite the supplied file. This might be mitigated by a configurable option to require the user's consent upon each save and/or to inform the user of the proposed diffs before saving. But again this will only be possible upon user initiation, only for the specific file or files approved in a given session, and a site will only be usable as a handler if the filetypes.json packaged with the data file designates it as a default handler for the data file (and the user maintains the preference to use this information) or if they have previously approved a protocol site for the given type.

# Comparison with similar WebAPI work

[WebActivities](https://wiki.mozilla.org/WebAPI/WebActivities) is similar to WebAppFind in that both seek to allow delegation of certain behaviors such as "view" and "edit" to (potentially) different apps (where the user also has the freedom to choose any app to handle the given type of activity), but WebActivities does not operate on files. Jonas Sicking indicated in a personal email response supportive of the concept of WebAppFind that WebActivities would be a good "way to dispatch the "view"/"edit" request to the appropriate web page, however WebActivities are still at an early stage and not ready for your use cases.".

These missing use cases (besides operating on files) might perhaps include:
* The typing system of WebActivities does not seem to be made to be extensible by applications. It thus also doesn't allow specification of hierarchies of types (e.g., myJson->json->js) for fallbacks for as-yet-unregistered types or for alternate editor types.
* WebActivities doesn't allow recommendation of default handlers when opening a file for the first time (though a WebActivities-supporting site could seek to register itself as such a handler).

The [WebAPI](https://wiki.mozilla.org/WebAPI) has a
[DeviceStorageAPI](https://wiki.mozilla.org/WebAPI/DeviceStorageAPI)
which has certain file-related behaviors.

Shortcomings (or differences) of the current DeviceStorageAPI
relative to WebAppFind would appear to be:

* It does not seem to anticipate the activities being triggered from one's desktop, but rather if one is already within a web app.
* The proposal at present appears to be limited to files in a specific directory of one's hard drive. It thus does not allow one the freedom to store one's files wherever one likes on one's hard-drive for better organization purposes.

The DeviceStorageAPI appears to allow more privileges (like
[AsYouWish](https://github.com/brettz9/asyouwish/)) such as
enumerating files in a directory, adding or deleting files, and listening
for creation/deletion/modifications, whereas WebAppFind is currently
focused on individual file reading and saving. However, WebAppFind
may add other actions in the future, such as listening for file change
events for version tracking or allowing for a web app to handle adding
or deleting a file (in case it wishes to do related set-up/take-down work).

Since WebAppFind executables pass along path information, WebAppFind
can already be used with the AsYouWish add-on (if the user so configures
that privilege-escalating add-on) to have it conduct the other privileged
activities of the DeviceStorageAPI whether enumerating files in the file's
directory, doing set-up or take-down work related to file creation or
deletion, or such things as uploading the containing folder's contents
(and especially if WebAppFind is modified to allow for opening a hidden
window, AsYouWish could be used for batch-like operations). Another
possibility is remembering a file path, e.g., for an equivalent to Windows
"Pin to Start" if you wish to create something like Windows 8's drag-and-drop
Start menu as an AsYouWish app, with local desktop apps (and web apps)
launchable from your web app, allowing you to extend your native OS
desktop (when not using say [filebrowser-enhanced](https://github.com/brettz9/filebrowser-enhanced)),
to plug into your web app (which can mimic the desktop itself if you wish).

# Comparison with AsYouWish

[AsYouWish](https://github.com/brettz9/asyouwish/) allows a
higher-than-normal privilege level to websites, but it differs in
a number of areas:

1. AsYouWish sites ask for permission, and once approved, can then immediately do their work. WebAppFind currently allows sites to ask for permission to register themselves as handlers, but their work will only become relevant when the user opens a file via WebAppFind.
2. AsYouWish allows for a vast number of possible privileges (though subject to user approval) including potentially arbitrary file reading and writing (as with Firefox extensions), while WebAppFind is limited to file reading and writing (though it may expand to certain other circumscribed, user-initated file-related activities in the future) and only for those files so opened as opened by the user.

# Higher priority todos planned

1. Contemplate option of auto-applying WebAppFind to all local file:// URLs loaded in the browser (redirecting to designated web app)
1. Added security
    1. Disable further save attempts with bad ID supplied in case a however previously approved site is attempting to guess at the paths of (if the user has enabled path transmission), or at the GUID representing, other non-approved files
    1. Check upon each save attempt that the loaded protocol is still registered as a handler (and remove usage notes above once implemented).
    1. Listen for unregistration of protocols to disable acting on future messages from them (only relevant for pages already loaded in this session).
1. API changes/additions
    1. Use objects in `postMessage()` communications for greater
    extensibility, and add a property to indicate the method (as
    opposed to mode) as "webappfind", so as to distinguish
    file://-based client-side GET-like code or server-side GET or POST-driven
    content (which should also provide a "untrusted" property or the like
    so as to distinguish code with side effects and those without).
    Develop boilerplate code to work in all possible environments (except
    for dumb clients or clients with JavaScript disabled making POST
    requests). Utilize with [URI templates](http://tools.ietf.org/html/rfc6570)
    for server-side discovery and a special API for postMessage
    client-side discovery (e.g., if [atyourcommand](https://github.com/brettz9/atyourcommand)
    were to make known to you the modes available in an app
    when one is designing a command to shuffle off content to it)? Make
    this perhaps a mode itself also so that files from the desktop could also
    be opened in a manner that the web app displays the available modes (and
    can post them back optionally to a callin app, again, like atyourcommand).
    1. Allow not just one, but multiple, file/URL/command line/web app/etc. arguments to be passed into
    the web application (e.g., for preferences, privilege level simulation or request information, schema,
    etc.) as an array of objects with the string results of obtaining the file in the specified mode (or
    custom mode in the case of a web app) placed as one of the keys on the object, with the other
    keys optionally indicating: 1) the source and nature of the string data (e.g., the path (with fundamental mode under which it was obtained or at least whether the data was obtained as binary or non-binary), URL, command line instructions, web app URL with arguments), 2) type meta-data about the file (as opposed to arguments supplied to that file) which could be used by the receiving application (e.g., to indicate which file is providing preferences, which is providing a schema for validation, etc. even while (ideally wiki-standardized) custom modes should normally be used for this). Could leverage the information within this array of objects in a generic server-side application as well. Should be able to work with export mode as well for multiple or alternate outputs.
        1. Privileges could be optionally supplied automatically or on demand (with postMessage by site).
        1. Also support designation of additional resource file access for a given file in filetypes.json; allow regex (including subfolders or even ancestor/sibling ones?) to map files (by regexp) or file types to additional resources
        1. Make note that Windows doesn't apparently allow OpenWith when multiple files are selected on the desktop though things can work with filetypes.json
        1. Develop system for converting file names into multiple resource
        files, e.g., opening a file `brett.schema.dbjson` could by default
        look for a "dbjson" web app handler while also giving permission to
        that web app to read/write a file named "brett.schema" in the same
        directory as "brett.schema.dbjson". Besides dot-separated additional
        resource files, within an entry, a hyphen could indicate a
        subdirectory, e.g., "brett.schemas-schema.dbjson" could allow access
        to a file in "schemas/brett.schema" relative to the "dbjson" file.
        A hyphen at the beginning could allow access to parent directories.
    1. Change custom modes to be prefixed with a colon in front of fundamental modes and then
        allow multiple modes separated by whitespace (especially in preparation for support of a likely
        frequent use case for combining a new fundamental mode, "export", along with an "edit" mode,
        e.g., to allow saving of an SVG file as SVG or PNG, or saving CoffeeScript as CoffeeScript
        of JavaScript, [Ocrad](http://antimatter15.github.io/ocrad.js/demo.html) for text OCR export of an image, etc.). Allow multiple custom modes attached to a single fundamental mode?
    1. In addition to regular expressions, use the presence or specific values for custom modes to determine file type?
    1. WebAppFind command line or filetypes.json to resolve URL into content to be passed to web app or path/link (file: or c:\) for app or file
        1. Modify Executable Builder so an executable can cause a web file to be opened by a web or desktop app; and then save changes back via PUT or POST (check header for PUT support?); or should I instead just implement command line control for web->desktop add-ons and call that within an executable/Executable Builder (leading potentially back through WebAppFind command-line control)? Integrate with [atyourcommand](https://github.com/brettz9/atyourcommand)
        1. Use server's filetypes.json also if present
    1. Allow command line args to be piped into a string to be supplied to the web app (including result of another webappfind invocation?); if "edit" or "binaryedit" mode is given, allow command line instructions to be invoked with the result posted back from the web app as a parameter.
    1. Mention how profile selection logic would probably ideally occur before opening Firefox as with
    any complex type-determination logic, taking place within the executable (built by Executable Builder?), though ensure that the new proposed command line and web app pipelining features would be able to replicate this if necessary
    1. Demo of Firefox being used merely to interpret filetypes.json and simply return a command line instruction back to a desktop app (in a hard-coded rather than fallback manner). Although AsYouWish could do this, better to bake it in so other desktop apps can leverage (including Notepad++, etc.).
    1. Allow type to be supplied via command line without fileMatches calculations so as to just open the right web app for the type
    1. Allow type to be supplied without any file so as to just open the web app for the supplied type (without a file)
    1. Web app pipelining: Allow a hard-coded web app URL (or supply a path or
    file type in order to discover a web app) to be supplied (along with its own
    mode, custom mode, arguments, etc.) which will be opened (optionally in
    a hidden window) and when its response its received, pipeline the string
    result to another web app URL. Yes, the apps could instead communicate
    directly with each other via postMessage, but this approach allows the
    user to do their own coupling rather than be dependent
    on a particular integration of services.
    1. Allow command line to specify (or let WebAppFind determine according to some permutation of the file path) the exact window and possibly Panorama group and/or pinned status into which the web app with desktop file will be opened (the web app could handle moving itself instead but only if the web app were AsYouWish-based and the user preferences supplied the file path). Alternatively, the executable might have logic to determine the profile in a similarly automated (as opposed to hard-coded) manner. The advantage of either approach would be to allow the user a better web app grouping organization corresponding to the hierarchical organization they can find on the desktop.
    1. Support an optional, hard-coded web app URL (optionally looking for
    fallbacks if the supplied one is a protocol but not found) and/or
    hard-coded file type (to circumvent the normal detection procedures
    and always open with a given web app).
        1. Demo this hard-coding usage within FireFTP opening of remote
        files (or better yet, implement an AsYouWish-based web FTP client
        which can do it)
    1. Arbitrary command line args to pass on to webapps
        1. Command line args to web apps even without data file (and without special HTTP headers)
        1. Update webappfind wiki on custom modes once arguments can be passed (advise to use instead if minor)
    1. Allow eval-able strings (or JS file paths) as arguments (with or without the usual WebAppFind
    file contents/paths) which Firefox then evaluates so as to provide AYW-like privileged
    functionality in a batch file manner without exposing privileges to web apps unless invoked from the desktop (as a workaround, one could use WebAppFind to open an AYW-enabled site, especially if it adds an eval-like ability and WebAppFind get support for passing in arbitrary command line args). Batch scripts (including the functionality to optionally receive file arguments or paths to JS files if AYW was used or XHR paths were used) could thus be written in JS and take advantage of FF cross-platform features (like [Node.js command line scripts](http://www.2ality.com/2011/12/nodejs-shell-scripting.html) but browser aware too). Could use in conjunction with proposed "hidden" flag to avoid adding a tab (or do so by default).
    1. Support optional "hidden" flag (in conjunction with, or only from, AsYouWish?) to embed a hidden DOM window script (use for batch-script-like functionality)
        1. Potentially privileged via AsYouWish, and aware of file path, could, e.g., create 10 copies of a supplied file name in the same directory or some other pipeline
        1. Allow args to WebAppFind to avoid adding a window, e.g., for a type to handling .jsbatch files to cause a them to be launched with privileges (via AYW? though better to avoid need for any HTML--just JS) in a hidden window (or manage files to run on a schedule; integrate with a Windows task scheduler in case not open?), so work like AYW but without a footprint (but without working each restart as with "add-on sites"); may still be useful with other privs, e.g., to get (send to network) and save file contents, and if asking for privs, will prompt dialog (e.g., to read a file and then use privs--though this would be redundant, perhaps in this mode we can always pass the real path so it adds value, e.g., if script wants to do something in same directory); see also todos in Executable Builder for more on
        command-line-like approach
    1. Prompt user for a web app URL if no app set for file type
    1. Support option for any web app to open by default in full-screen mode (could just let web app and user handle, but user may prefer to bake it in to a particular executable only)
    1. Supply own filetypes.json by command line including a remote one
        1. If a directory or other file is supplied, convert it to the child
        or sibling filetypes.json file respectively? (would be convenient for
        atyourcommand to supply a right-clicked file and have WebAppFind
        detect it's own remote filetypes.json)
	1. Allow optional param substitution of content within the URL? May
	present problems if running into URL length limits (which may differ
	across browser is other browsers will be supported in the future) but
	could allow WAF to work with some legacy apps that do not have the
	message listening code.
1. Complete [Executable Builder](https://github.com/brettz9/executable-builder)
    1. Rewrite C++ exe's as batch scripts (particularly for the sake of [Executable Builder](https://github.com/brettz9/executable-builder)); convert to shortcut tied to cmd.exe for sake of getting an icon
    1. Installer script to run to facilitate setting up of OpenWith per user choices (if Executable Builder is not installed, it could link to it, and if it is, it could bring user through steps).
1. Options to have Windows
"[verb](http://msdn.microsoft.com/en-us/library/bb165967.aspx)"
(i.e., Open, Edit, Print, Play, Preview or custom) be treated as
modes/custom modes or to otherwise detect and interact with
them?
1. Consider encouraging use of MIME types for file type names (perhaps
more in harmony with emerging Web Wishes specification).
1. Unregister command line handler, etc. on add-on uninstall
1. Support processing of filetypes.json for directories (e.g., a
"directoryMatches" property to be added to filetypes.json).
1. Option to avoid or allow new tabs for same URI/mode/filetype/path? (option to get the same tab or new tabs for them?); option to push to all open windows in different manner so can notify user of updates but not change focus, etc.
1. Create tests using registerProtocolHandler (also for JS/JSON/mytype)
1. Submit to AMO, Bower, etc.

# Medium term priority todos

1. Document comparison between WebAppFind and routers/controllers in
typical web apps whose verbs are indicated via URL query string parameters.
1. See [atyourcommand](https://github.com/brettz9/atyourcommand),
a Firefox add-on to allow
creation of context menu items, including invoking a process with
arguments with the selected text, right-clicked URL, or current URL
as arguments (with the URL potentially being first retrieved as text and
then sent as arguments?). Besides allowing the reverse behavior of
WebAppFind (allowing one to selectively choose files on the web or
text to supply to a desktop app instead of supplying desktop files or
command line text to a web app, e.g., opening a file from the web in
Notepad++), it would even allow WebAppFind to be invoked (for the
use case of passing text or URL content to a web app); the web app
could, if opened in edit mode, place a (privileged
cross-domain) PUT request on behalf of the web app for a save-back,
allowing users the choice of application for saving files back to the web
(also allow a desktop executable the ability to launch such a site file in
a hard-coded app or web-app--in this case, the executable would be clicked
directly since it was hard-coding both the data file (a web file) and the
handling app (which in this case could also be a desktop app)). Also support
a content-type handler and protocol handler for opening exe/batch files (or
option to install first (with platform-specific choices) if not already
installed, but with privacy guards not to report whether already
installed), passing arguments (or shell commands), so web can get
access to desktop. Let protocol or content-type handler support either
URLs (so specific data files can be read) or the content itself be passed
but without a need for something heavy like Java or Silverlight (or whatever
people use to do this) to do the delegation to the desktop files (plug-ins
themselves support swapping of data files (for reading or writing) in
app-independent manner?)... Also ensure asks permission and give
ability to remember permissions for a site... (Avoids need for plugin
(or new browser instance embedding) to integrate desktop apps with
and originating from the Web.) Integrate with an add-on version of the
AsYouWish-bundled command line app so batch commands can be
passed from there (as well as saved as a context menu item) to
WebAppFind (see other todo in this README about this possibility).
Also right-click to add text or URL contents as itself a context menu
script. Ensure add-ons support file: and native paths to: open folder
on desktop, open folder in Firefox file browser, execute on desktop,
execute with web app
1. API for XPath/XQuery (+ [HTTPQuery](https://github.com/brettz9/httpquery))
like targeted updating within documents, so data decoupled as with files
(XSS-safe or unsafe versions); PATCH header for more generic updates?
1. PUT for specific site only (or data within a site as per targeted
updating item)
1. Allow PUT/POST back to Atyourcommand to have side effects such as
modifying in place higlighted right-clicking text (without the user seeing
the web app open), e.g., to convert JS to CoffeeScript in a document
one is viewing.
1. SQLite (e.g., for localStorage); could be wrapped by targeted updating API
and used with PUT; send schema URL in header to inform that the update
must be tabular, not otherwise hierarchical
1. Allow command line for temporary file or designated file saving
of string contents in webappfind as well (with dialog to approve
there as in [atyourcommand](https://github.com/brettz9/atyourcommand)
if would cause an overwrite).
1. Support a global user filetypes.json file (at a chosen directory
specified within Firefox?) which can override or provide defaults for
local filetypes.json files (especially for defaults since sites might
not have registered handlers, and a user might not wish to have to
put a filetypes.json file within each directory). Ensure it is in a location
readily detectable by other desktop apps which may wish to check
it as well (or to be opened in WebAppFind itself) (and demo it
with Greasemonkey editing once done, and add support to Stylish).
1. Allow a command-line "prompt" fundamental mode: will allow the
user to determine mode at run-time (Firefox (or other opening app)
can provide a prompt to the user to ask which mode to use before
opening the file in that chosen mode). Modify filetypes.json to support
optional default mode or suggested modes (though Firefox should
not prevent other modes from being used since the whole idea is that
the user controls the mode under which they wish to open the file).
1. Allow a command-line "any" mode to let the web app choose the mode.
1. Provide meta-data in filetypes.json to cause the web app to be passed
awareness of the desire by the user to be prompted for the selection of
specific *custom* mode, along with an optional default custom mode and
suggested custom modes along with any explicitly passed. Thus, an app
might use this information to ask on WebAppFind invocation, "Do you
wish to view this file or view its source?".

# Possible future todos

1. Query OS user groups to determine permissions in place of or in addition
to filetypes.json and the Firefox add-on preferences?
1. Allow genuine POST or other non-GET or header-dependent requests (ala curl)?
1. Allow files opened by FTP for remote editing to be used.
1. Allow stylesheets or scripts to be clicked to be injected into web apps?
(could use if app isn't accepting them as additional file arguments already)
1. Allow postMessage mechanism to receive content as entered in a dialog as opposed to a file (though with an optional file to save back)
1. Create dialog to ask user for mode, etc., so executable doesn't have to bake it all in and can let the user decide at run-time.
1. Command line flag additions:
    1. See below and also possibly the notes within the [Executable Builder](https://github.com/brettz9/executable-builder) code
    1. Support the "register" mode from command line?
1. Integrate functionality into https://github.com/brettz9/filebrowser-enhanced
1. When [AsYouWish](https://github.com/brettz9/asyouwish/) is in use, allow path-reading as long as site is AYW-approved and the page is registered for the protocol--so one can bookmark a path and always load it or load with other approved paths (e.g., in different tabs within a webapp); also can remember paths to invoke upon FF start up ("website addons").
1. Allow users to remember privileges so that whenever a file is reloaded (even if not from the desktop), it will continue to allow read/write access.
1. Ensure some additional security/privacy for users desiring it by restricting external access (using https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIContentPolicy and https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIPrincipal per http://stackoverflow.com/questions/18369052/firefox-add-on-to-load-webpage-without-network-access ?) See also http://en.wikipedia.org/wiki/Site-specific_browser regarding such sandboxing.
1. Provide XULRunner option for executable-like behavior independent of Firefox.
1. Option to enable file: protocol (though mention it is currently risky in Firefox to use `postMessage` for security and privacy given its lack of scoping); report issue to FF if issue not already added (also for better means than '*'  <!--* satisfy Notepad++ MD editor--> for add-on communication?) . However, this option would be quite useful, especially if the todo just above on restricting external access were implemented, given that web apps could be installed to work with one's files (ideally without concerns that the data was going to be sent anywhere, and if the todo to confirm saves were implemented, one could also see what changes were being made to a file before being actually saved). Unfortunately, file: sites cannot register themselves as protocol handlers, so the user would need to configure their settings so as to rely on the default handlers in filetypes.json to be able to use such a file (or we would need to create our own mechanism, such as through `postMessage` back to the add-on (or a change in the file's GET parameters or perhaps modification of an element within the document), to allow a file: site to request permission to become usable as a protocol handler).
1. Option (at the add-on level) to confirm reading and/or saving of data upon each attempt and/or display the proposed diffs before saving. (See "Implementation notes" section).
1. Piggyback on HTML5 drag-and-drop file capabilities (or create own) to allow files dropped in this way to be saved back to disk and/or path provided to the app; same with optionally allowing privileged file picker per site.
1. Possibility of utilizing filetypes.json on the server side for server-side discovery; see http://webviewers.org/xwiki/bin/view/Main/WebHome (utilize its format at all or reconcile?)
1. Get to work in other OS and browser environments (if so, make PR to update https://github.com/marijnh/CodeMirror/blob/master/doc/realworld.html ).
1. As with how filebrowser-extended can open the folder of the currently opened file, add an optional icon in WebAppFind to open the containing directory of the currently opened document file path, e.g., if user used "Open with" on "C:\myfile.txt", it would open "c:\" (if allowed opening the file itself from the desktop and the current web app was also set as the default for that type, it would open another instance of the file in the browser, but may still want to allow this anyways).
1. Build an executable to open a local executable/batch on the Windows desktop with a dialog asking for command line arguments (e.g., profile)? (as a workaround, one might use WebAppFind for this if an override will be provided to ensure it will launch back on the desktop)? Also allow a dialog to ask for WebAppFind arguments to web apps (could be at executable level or within the WebAppFind add-on).
1. Exe's don't allow right-click Open with... though maybe Windows would allow even these files to be handled in some way (e.g., how Tortoise overlays the context menu).
1. Create a shared add-on dependency for WebAppFind and AsYouWish exposing perhaps at least for privilege escalation with some of the underlying non-SDK APIs (e.g., a privilege to save
only to a specific directory if WebAppFind adds such a fundamental mode). Perhaps any AsYouWish directive could be exposed
if part of a filetypes.json directive and/or command line flag (and not blocked by user preferences) or expose AYW API to
other add-ons or command line for adding sites and privileges and use that; could be useful for add-ons as well as sites to provide
alternative views/editing interfaces for the same shared data.
1. Create complementary Firefox add-on to add desktop listeners to file changes to ensure WebAppFind files stay up to date within the app (ensure app also checks whether the user wishes to reconcile the new push with any changes already made); tie into proposed version control mode?
1. Allow filetypes.json to support a hierarchy of custom types (e.g., schema->jsonschema) for meta-data purposes (possibly passing to applications, perhaps useful for namespacing)
1. Could allow type to be determined by schema (e.g., JSON Schema based on `$schema` value with JSON document, XML Schema for XML, etc.).
1. Allow defaultHandlers to be optionally added inline with fileMatches in filetypes.json?
1. Option to open HTML in chrome mode so one can do things like cross-domain toDataURL on an image canvas without errors (the proposed change to AsYouWish to allow sites to be reopened in this mode could be a workaround).
1. Once API stabilizes, file feature request to get the functionality built into Firefox.

# Possible future mode additions

Besides "view", "binaryview", "edit", "binaryedit", "register", the following modes might be added in future versions (or made to correspond with WebDav commands?):

1. Version control (also some discussion of possibilites for multiple file saving)
    1. "create", "delete" - for any necessary set-up before creation or deletion of a file (as with saving, the protocol should not have side effects, so these should only bring one to the page to confirm the user wished to take such an action--and the browser might have its own confirmation for these actions).
    1. "rename" and "move" (or cut or copy and paste)
    1. "versioncontrol" - A mechanism could be added to request listening to events which would impact version control (though some means of determining scope would be needed--e.g., a folder and all its subfolders--as well as privacy/security considerations which expands beyond the current scope of individual file viewing and saving; similar concerns would need to be taken into account for other modes that may process multiple files like search or file packaging). These events could be used to open a (hidden?) web app to store data (e.g., via localStorage or a new "edit" mechanism which could save to disk, but circumscribed by file type so that, e.g., a repository binary could be modified without the user needing to explicitly open it) and build a file history for a "repository". This "versioncontrol" handlers ought to allow multiple listening apps in some manner; this would be both for the sake of allowing different versioncontrol storage mechanisms/repository types, for ensuring that any viewing apps get updated upon external changes, as well as for any apps storing meta-data related to a document or documents but not saved within them to be notified and respond accordingly (including possibly saving their own updates back to disk), e.g., for building up a history of commit messages (which would at least effectively need the completion of the todo to allow a single web app to handle multiple documents at once).
1. "send to" or "mailer" - e.g., to put file contents and/or file attachment(s), subject, etc. into a mail viewer, ready to email (with equivalents for chatting)? See SendTo folder details [here](http://superuser.com/a/722699/156958)
and [here](http://answers.microsoft.com/en-us/windows/forum/windows_vista-desktop/how-to-locate-the-sendto-folder-in-vista/78b16711-1135-4eb0-851a-8abae9bfe9ed);
also accepting a folder as argument!
1. "validate" - Before the save command of an "edit" mode process (and its response back to the app) is completed, it may be handy to have a separate protocol be called for any registered validators of a given file type to perform validation and conditionally reject a save. Instead of receiving the file path, they would be passed the proposed file contents for saving from "edit" to ensure proper well-formedness and validity before saving back to disk. It might be ideal for a validator to simply be a JavaScript file with a specific function, but for parity, we should probably implement this as another HTML file using a (secure) postMessage. If a file was found within a filetypes.json hierarchy, it may be desirable to ensure validators are sought up the hierarchy (at least if not found at the most specific level), e.g., to check that a "myType" file specified as being a JSON file is indeed a JSON file, or at least a JavaScript object if there is no JSON validator registered.
1. "preconvert" and "postconvert" - hooks to transform content before reading or writing, respectively (but before "validate")
1. "splash" - for a splash page leading to the modes so that "register" can be exclusively for registering users? 
1. "query" or "search" - For queries within file or within a folder, etc., optionally (?) filtered by file type; this might be used for "find-in-files" behavior (multiple file saving would be needed for "replace-in-files"). These queries could be hierarchical (as also defined in filetypes.json?) such that, for example, one might have "myType" JSON files queryable in a precise manner, e.g., to find all files (or records) containing a "publication date" between a range of dates, while also allowing more generic queries such as RQL, or if not available (or not desired), the user could default to full text search (since a superset of JSON could be the txt type which could allow full text search). Also for simple file listing (see SendTo info for how to get a batch file to process a folder by right-click
within the desktop)
1. "execute" - Although the OS would normally do its own execution, it is possible that privileged apps (as through AsYouWish) might be able to handle this at least partly on their own
1. "export" - Exporting into a different format (and saving to a different target file) from
the original source file. Once multiple modes may be supported, users might supply
both "edit" and "export" privileges to a web app simultaneously so one could save back the original
file as well as the export (e.g., to save SVG and a PNG export or to save a CoffeeScript file and its
JavaScript export).
1. Like "export", we might wish to allow a file to be opened with the privilege to save anywhere in a particular directory, etc.
1. "prompt" mode; see to-do above.
1. "any" mode; see to-do above.
1. Support local or remote stream inputs

# Possible "Demos" todos

1. Make scrollbars easier to use in CodeMirror demos
1. Utilize https://github.com/brettz9/requirejs-codemirror in CodeMirror demos for cleaner HTML
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
    1. See https://gist.github.com/brettz9/8687257
    1. power-user support for form controls like checkboxes (underlying events currently supported better in Chrome than in Firefox), paperclip links, etc.
    1. Modify WebAppFind to support display of independent data files (for multiple stickies in this case); or don't only associate a file path with individual URLs (file: or http:), but also allow associations with tab groups or bookmark folders so that if saving a new StickyBrains/CKEditor/word-processing file, it will save to a folder where one's ideas are already grouped
    1. Offer grid-like edit ability using SVG Edit with HTML controls like checkboxes within foreignObject
1. Create demo supporting docx format (rather than requiring export to HTML for Word docs)
1. Demonstrate approach of allowing data files for download (so can store them anywhere)--if not AYW approach for namespaced shared browser access--as well as data files chosen from File selector (and save over such a file if within the protocol and user permits)
1. Ability to build [JHTML](http://brettz9.github.com/jhtml) with autocomplete (usable for saving as JSON or saving as HTML) once spec finalized (once <i> approach used)
1. Integrate HTML/SVG (and then others) with [Together.js](https://togetherjs.com/) to allow peer-to-peer collaboration on one's local files
1. Add http://pagedown.googlecode.com/hg/demo/browser/demo.html buttons to Markdown editor?
1. "Todo" webapp demo
1. CoffeeScript demo
1. Modify the OCR demo to support detection (by WebAppFind-injected URL params) of various image formats, SVG, and as per the Ocrad demo, drawing on a canvas which could in turn be saved to disk as an image or exported as a text file (or even [HTML-to](http://robert.ocallahan.org/2011/11/drawing-dom-content-to-canvas.html)[-canvas](http://people.mozilla.org/~roc/rendering-HTML-elements-to-canvas.html)?) images to OCR; also modify to allow clicks/keypress on arrow buttons to browse the PDF page-by-page
1. PDF demo; might use https://github.com/MrRio/jsPDF (see http://parall.ax/products/jspdf with HTML renderer demo) for writing, integrated into CodeMirror or even CKEditor if modified to support generation of the right format; if the same HTML format could be generated and accepted by the likes of [pdf2htmlEX](https://github.com/coolwanglu/pdf2htmlEX/) and jsPDF, there might be some round-tripping potential.
1. Get CKeditor to allow WYSIWYG tables to be sortable for sake of CSV demo? Create view-only demo (i.e., just build table and insert)
1. Web macro-script program for use with the web (including possibly AsYouWish), esp. for text processing (allowing XPath/CSS selectors or raw text searches, testing for content or replacing)
1. Make especially the text and HTML editor demos extensible via postMessage from add-on site
to editor which allows for introspection of the JavaScript to store for later evaluation and then will
put into its own localStorage as an add-on. Could make the demo post the add-on origin site (and possibly code) back to the server (if not indicated as known within client code) and allow these to be discoverable by other users (though allow opting out of such reporting for privacy reasons).
1. [Ocrad](http://antimatter15.github.io/ocrad.js/demo.html) for text OCR export of an image (once export mode supported)
1. SVG OpenType Font editor (adapt https://github.com/edf825/SVG-OpenType-Utils ? See https://wiki.mozilla.org/SVGOpenTypeFonts )
1. Blockly for arbitrary JavaScript:
    1. Object literals
    1. Variables (arrays or objects like functions, etc.) with right side for property access (static (can be detected for pull-down) or dynamic)
    1. `new` (with or w/o needing function definition)
        `new a()[new b()]`
        won't normally add new directly within property (and can't within static property)
    1. invocation (w/o needing function definition)
1. Email/chat client which stores data locally (and optionally only locally); good open source options to adapt? Tie in together.js with chat (as in whiteboards) or even to write collaborative emails
1. Do a concept for browsing or editing the file contents of a zip using the likes of http://stuk.github.io/jszip/ or those mentioned at http://stackoverflow.com/questions/2095697/unzip-files-using-javascript
1. Since WebAppFind relies on files downloaded to the user's desktop, demonstrate with the HTML5 "download" attribute how sites might deliver a data file that the user could then place and call (and optionally also supplying a filetypes.json file). Also demonstrate (once functionality is complete), the downloading of a remote document file and subsequent optional PUT request back to the server to save it there (and AsYouWish requesting to save multiple files at once in a particular directory or the zip example above).
1. Demo plug-in utilizing WebAppFind to pass in data files (from desktop or cross-domain)
1. Desktop file to desktop app demo (using filetypes.json)?
1. Demo of same-domain, CORS, or AsYouWish client checking filetypes.json on a server to determine how to serve? (as opposed to WebAppFind)
1. Demo of server detecting its own filetypes.json (see possible todo above)
1. Give option for demos like txt to add `\r` back to `\r\n`
1. Utilize https://github.com/brettz9/octokit.js to allow HTML, SVG, etc. demos to be pushed directly to a Github repo (no universal REST Git API?); could also use with AsYouWish and command line to update a local repo as well (and use cdn.rawgit.com for public
sharing of content).
1. Demo WebAppFind usage with http://kb.mozillazine.org/View_source.editor.external and http://kb.mozillazine.org/View_source.editor.path
1. Demo WebAppFind usage with external editing editor for textareas using [It's All Text! add-on](https://addons.mozilla.org/en-US/firefox/addon/its-all-text/) ([repo](https://github.com/docwhat/itsalltext/)); or adapt to allow optional embedding of web app in place in iframe?
1. Demo use of [Speech Synthesis](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#tts-section) with an HTML or text file (see [HTML5Rocks](http://updates.html5rocks.com/2014/01/Web-apps-that-talk---Introduction-to-the-Speech-Synthesis-API)) and [Voice recognition](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#speechreco-section) from an audio file. Also allow voice recognition as feature in normal text/HTML demos.
1. Demo to use SendTo webappdir functionality to make a zip within the passed path (using [JSZip](https://github.com/Stuk/jszip)) from right-click (would require no local files besides WebAppFind/AsYouWish and the SendTo batch file). Also ensure demos with files and folders together.
1. Adapt the webappfind.js utility class to reduce demo code (and allow better forward compatibility with any API changes).
