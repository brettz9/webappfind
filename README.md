# webappfind

VERSION INCOMPLETE/NOT YET FUNCTIONAL!!!

TODO: Ensure this README actually reflects the implementation once complete.

A [WebExtensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions)/Chrome
application to allow opening of files from the desktop (by double-click using
default file assocations or "Open with...") into web applications.

## Introduction

Are you a fan of web apps, but want the freedom to place your data files
where you like on your desktop and thus be able to work offline and **own**
your data rather than keeping it in the cloud? Do you want the freedom
to just double-click (or right-click) a file on your desktop so that it opens
in a web app, saving you the trouble of having to copy the file path,
move from your desktop to the web app, and paste the path in a file
finder? Do you want to avoid the wrist strain of dragging files into
your web app when modifications to the files cannot even be saved back
directly to your hard drive?

WebAppFind addresses these use cases by allowing you to double-click (or
use "Open with..." right-click) on "view" or "edit" executable files on your
desktop (currently, executables are for Mac only), sending the file
path details to the [native messaging](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging)
component of the add-on (via command line arguments) which are then
delivered into the main browser add-on which, if no site is hard-coded
in the request, checks for an *optional* `filetypes.json` file within the
same directory as the right-clicked file to determine more precise
handling (the file extension will be used to determine the type otherwise).
Based on what is chosen/found and in the addon's preferences,
a handler web site will be sought in the browser to open the file of the
designated type (whether a generic or custom type) as well as allow--if
the "edit" type was the type chosen and a suitable handler site was
found to send back a save event--saves to be made back to the file.

WebAppFind allow you to make your data files accessible to other
programs and to give your users peace of mind to not be locked
into your application alone. It also allows your users to open your
custom data files in your program immediately and intelligently,
using whatever file extension you prefer, even if the file extension
is a generic one such as "json" or "js" while your own data file
follows a particular format or schema.

Unlike an approach that would allow websites the ability to request
local file access, *webappfind* minimizes security and privacy risks
by only allowing files designated in the above manner of selection from
your desktop to be available to the relevant web application; sites cannot
gain such access without your running the process that grants permission.

## Some use case scenarios

1. See [webappfind-demos-samples](https://github.com/brettz9/webappfind-demos-samples).
1. Work on Git on your desktop while being able to open HTML files for
WYSIWYG editing in a (CKEditor) web app which you can easily modify
to add buttons for inserting code snippets? Do you want to use CodeMirror
for syntax highlighting of your JavaScript and CSS? (Demos are available
at the previous site which do all of these.)

## Usage notes (for end-users)

(For command line usage, see the API below instead.)

It is hoped that the instructions below can be further simplified
once the Executable Builder component is enhanced to automatically
associate default file types to (web) applications (and optionally
add them to the Dock, etc.) without the user needing to find the
path of these executables as WebAppFind currently requires.

### Instructions

Note that you must first install the WebExtensions add-on so that
the following steps will work (the add-on has not yet been submitted
to the Add-ons site, so for now, you will have to build the add-on
from source).

1. Right-click on a file and...
    1. If you want to use WebAppFind without disturbing your defaults
        for that file extension, select "Open With"->"Other..." and
        if you want to always open that particular file with WebAppFind,
        you can also check "Always Open With". (Alternatively, you can
        select "Get Info" (`command-I`) and change the value in the
        "Open with" pull-down and then the file can just be double-clicked
        in the future.)
        <!--
        Note: on Windows, when available again, the following instructions can be used:

        select "Open with"->"Choose default program..." if present (or if
        not present, open the file and choose "Select a program
        from a list of installed programs") and then make sure "Always use
        the selected program to open this kind of file" is not checked.
        -->
    1. If you always want to use WebAppFind when handling files with the same
        extension as this file (and just be able to double-click such files
        when opening them in the future), you can select "Get Info"
        (`command-I`) and change the value in the "Open with" pull-down and
        then click "Change All.." to apply to all such files of that file
        extension.
        <!--
        TODO: on Windows, when available again, the following instructions can be used:

        click "Properties", then click "Change..." next to
        "Opens with:" in the General tab of the dialog.
        -->
<!--
TODO: on Windows, when available again, the following instructions can be used:
1. Click "Browse".
-->
1. Navigate to an executable built following the instructions in the section
    "Executable builder functionality" (Or, if
    you prefer, you can use one of the pre-built binaries includes in the `bin`
    folder of this repository, though see the above-mentioned section anyways
    on the differences of functionality in those binaries).
1. Select "Ok".
1. If you used "Open with" (as per step 1.1 above), your file should have
    already opened with WebAppFind. If you opted for "Get Info" in step 1
    <!-- TODO: On Windows, once implemented "Properties" -->
    you should now be able to double-click the file (or any file possessing
    the same extension if you followed step 1.2) to open it with WebAppFind.

If an edit `web+local` protocol is enabled and open and then disabled in
the same session, it will keep having save access (though within that
window session only). One must currently close any open tabs for that
web application if one no longer wishes to allow access (though as noted
elsewhere in this documentation, the app only has access to the files to
which you granted access).

## Command line communication with add-on

In order to pass a file into the add-on (which can use any arguments and its
heuristics to determine the specific website to open and in what manner),
the `native-app.js` file should be invoked with `--method=client` and
optionally with
`--file="..."`, `--mode="view|edit"`, `--site="http://..."`, `--args="..."`.
See "Executable builder functionality" "Arguments" section for how these
optional methods will be used.

## Executable builder functionality

An AppleScript file can be generated by invoking the `native-app.js`
application (and executable?) with the arguments below which will allow
one to pass predetermined or run-time parameters through WebAppFind, along
with a local file opened by "open with", as a default file association, via
drag-and-drop (including if placed conveniently on one's dock), command
line, or a file optionally baked into the script. In place of a local file,
if the generated AppleScript is called with no arguments (including when
placed on the dock), a file selector will pop-up to determine the file
whose contents will be sent to your web applications.

If the AppleScript is invoked on the command line, one can invoke with:

```bash
open ./webappfind-as.app --args /Users/brett/myFile.txt
```

or to bring up the file selector, just:

```bash
open ./webappfind-as.app
```

You can then follow the instructions in "Usage notes (for end-users)"
to use "Open with" or to associate a specific file or all files of a
certain extension with the web app that will be chosen as a result of
running this executable.

Alternatively or in addition, you can drag this file to your Dock,
Favorites, etc. so as to be able to drag files onto it for opening
(or to just click it to open any hard-baked file or to get the file
dialog otherwise).

### Arguments

- **method** - Required. Must be set to "build-openwith-exec".
- **file** - Optional hard-baking of a file. If this argument is not included,
    the generated script will check for the presence of an argument to the
    script to serve as the file to pass to the web application. If no argument
    is passed to the *generated script*, its absence will trigger a file
    dialog.
- **mode** - Optional mode for invoking the web app on your contents, either
    "view" (readonly) or "edit" (read and write). Default is "view".
    If this is for a program needing to open a file in binary mode, such as
    images, sound files, or videos, use "binaryview" or "binaryedit" instead.
    The `filetypes.json` file can be used to force "binary" or not for
    the respective view or edit mode.
- **site** - Optional baking in of a specific site to invoke with the
    designated file's contents. Will check for local `filetypes.json`
    otherwise.
- **args** - Optional. Any arguments to pass to the web applications
    `onmessage` listener data object (under `args`).
- **fileSelectMessage** - When the generated script does not have a baked-in
    file and no file argument is passed to it, this argument will determine
    the message shown in the resulting file dialog.
- **fileSelectType** - When the generated script does not have a baked-in file
    and no file argument is passed to it, this argument, if present, will have
    the script insist on a particular file type in the resulting file dialog.
    Must be an extension string without the leading period (e.g., "js" for
    ".js" JavaScript files) or a
    [Uniform Type Identifier](https://en.wikipedia.org/wiki/Uniform_Type_Identifier),
    e.g., "public.image" or "com.apple.iwork.pages.sffpages".

## Comparison to other standards, tools, and alternatives

### Comparison with similar WebAPI proposals/work

[WebActivities](https://wiki.mozilla.org/WebAPI/WebActivities) is similar to
WebAppFind in that both seek to allow delegation of certain behaviors such
as "view" and "edit" to (potentially) different apps (where the user also
has the freedom to choose any app to handle the given type of activity),
but WebActivities does not operate on files. Jonas Sicking indicated in a
personal email response supportive of the concept of WebAppFind that
WebActivities would be a good "way to dispatch the "view"/"edit" request to
the appropriate web page, however WebActivities are still at an early
stage and not ready for your use cases.".

Additional missing use cases (besides operating on files) might perhaps
include:

1. The typing system of WebActivities does not seem to be made to be
    extensible by applications. It thus also doesn't allow specification
    of hierarchies of types (e.g., myJson->json->js) for fallbacks of
    as-yet-unregistered types or for alternate editor types.
1. WebActivities doesn't allow recommendation of default handlers
    when opening a file for the first time (though a
    WebActivities-supporting site could seek to register itself as
    such a handler).

The [WebAPI](https://wiki.mozilla.org/WebAPI) has a
[DeviceStorageAPI](https://wiki.mozilla.org/WebAPI/DeviceStorageAPI)
which has certain file-related behaviors.

Shortcomings (or differences) of the current `DeviceStorageAPI`
relative to WebAppFind would appear to be:

1. It does not seem to anticipate the activities being triggered from
    one's desktop, but rather if one is already within a web app.
1. The proposal at present appears to be limited to files in a specific
    directory of one's hard drive. It thus does not allow one the freedom
    to store one's files wherever one likes on one's hard-drive for better
    organization purposes.

The `DeviceStorageAPI` appears to allow more privileges (like
[AsYouWish](https://github.com/brettz9/asyouwish/), an add-on no longer
compatible with current versions of Firefox) such as
enumerating files in a directory, adding or deleting files, and listening
for creation/deletion/modifications, whereas WebAppFind is currently
focused on individual file reading and saving. However, WebAppFind
may add other actions in the future, such as listening for file change
events for version tracking or allowing for a web app to handle adding
or deleting a file (in case it wishes to do related set-up/take-down work).

Since WebAppFind executables pass along path information, WebAppFind
were usable with the AsYouWish add-on (if the user so configured
that privilege-escalating add-on) to have it conduct the other privileged
activities of the `DeviceStorageAPI`, whether enumerating files in the file's
directory, doing set-up or take-down work related to file creation or
deletion, or such things as uploading the containing folder's contents
(and especially if WebAppFind will be modified to allow for opening a hidden
window, AsYouWish could be used for batch-like operations).

Another possibility is remembering a file path, e.g., for an equivalent to
Windows "Pin to Start" if you wish to create something like Windows 8's
drag-and-drop Start menu as an AsYouWish app, listing local desktop apps (and
web apps) launch-able from your web app, allowing you to extend your native OS
desktop (when not using say [filebrowser-enhanced](https://github.com/brettz9/filebrowser-enhanced)),
to plug into your web app (which could mimic the desktop itself).

### Comparison with AsYouWish

[AsYouWish](https://github.com/brettz9/asyouwish/) allowed a
higher-than-normal privilege level to websites, but it differed in
a number of areas:

1. AsYouWish sites ask for permission, and once approved, can then
    immediately do their work. WebAppFind currently allows sites to ask
    for permission to register themselves as handlers, but their work
    will only become relevant when the user opens a file via WebAppFind.
2. AsYouWish allowed for a vast number of possible privileges (though
    subject to user approval) including potentially arbitrary file reading
    and writing (as with some browser extensions), while WebAppFind is
    limited to file reading and writing (though it may expand to certain
    other circumscribed, user-initiated file-related activities in the
    future) and only for those files so opened as opened by the user.

### Comparison with `postMessage` alone

While `postMessage` alone can be used for more app-agnostic data sharing (unlike say `MessageChannel` or `WebSockets` which requires hard-coding the desired shared app),
it does not work with desktop files.

### Comparison with other purely Node-based alternatives

#### Disadvantages of purely Node-based alternatives

1. Node opening file and passing
    [command](https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options)
    [line arguments](https://www.ghacks.net/2013/10/06/list-useful-google-chrome-command-line-switches/)
    into browser to open file with GET parameters or hash
    1. This is limited by string length (and possible security problems if
        the user passes along the URL).
    1. Listening by GET parameters may conflict with parameters already used by applications
        (`onmessage` may as well, but it is easier to namespace)

1. Node opening file and passing command line arguments into browser to
    open file and posting contents to another Node server hosting the web app
    1. Forces user to be subject to any non-agnostic listening requirements (a
        receiving app would know the origin and might reject the contents
        accordingly).
    1. The receiving app (where one would most frequently be developing) cannot be
        a purely client-side web application

#### Advantages of our configuration

1. Our code potentially supports various platforms and browsers out of the box.
1. By using `pkg`, we can avoid forcing users to install Node.
1. Our `filetypes.json` approach offers easy reusability among non-developers
    (or non-Node developers)

## Development

### Installing development tools

1. `npm -g i pkg` - Uses [pkg](https://github.com/zeit/pkg)
1. `npm -g i web-ext` - Uses
    [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext)

### Testing

*Note: The "all" options—which are for installing for all users on the
machine—[do not currently work](https://github.com/zeit/pkg/issues/136#issuecomment-308794640)*

1. `npm run (pkg-)installer(-all)-(lint|run|addon)` - Shortcut options for
    the following two steps
    1. `npm run (pkg-)installer(-all)` - Shortcut for the following two steps
        1. `npm run build-(pkg-)installer(-all)` - Shortcut for the following
            1. If `pkg`, `build-pkg-native-apps(-all)` - builds the Node
                executables for native messaging
            1. `build-(pkg-)installer-component(-all)` - Builds installations
                on the user machine
            1. If `pkg`, `npm link`
        1. `npm run run-(pkg-)install` - Executes the installer (to register
            as part of native messaging host files)
    1. One of:
        1. `npm run lint` - Runs ESLint and `web-ext lint` (which uses
            `addons-linter`)
        1. `npm run run` - Test the web extension in Firefox
        1. `npm run addon` - Building the add-on file for distribution,
            e.g., on AMO

## To-dos

### To-dos (Miscellaneous)

1. Add from [README-old.md](./README-old.md)

### To-dos (Building)

1. Have the OS-specific executable of `bin/native-app` be identified and
    bundled automatically
1. Make install script which avoids `pkg` bundling by assuming user has Node
    installed (much smaller download and less memory, esp. if needing to
    build executables for opening files too)
1. Overcome "Cannot find module 'regedit'" error when building on non-Windows

### To-dos (Reimplementing or basic)

1. When done, remove generated AppleScript app(s) from repo
1. From Node WebSockets -> add-on, we need to open website and `postMessage`
    into it and be able to handle opposite direction, including for writing
    file contents back to disk, but also for *AtYourCommand* functionality)
1. Delete preferences from `ignore/old-preferences.json` after suitably
    reimplemented
    1. Set `options_ui: {page: "webappfind-options.html"}` and/or
        `sidebar_action`?
    1. Currently preferences are global, whereas it may be desirable to allow
        users to customize their preferences by type/protocol in addition to
        the current default global ones.
1. Security improvements
    1. Disable further save attempts with bad ID supplied in case a however
        previously approved site is attempting to guess at the paths of
        (if the user has enabled path transmission), or at the GUID
        representing, other non-approved files
    1. Check upon each save attempt that the loaded protocol is still
        registered as a handler (and remove usage notes above once
        implemented).
    1. Listen for unregistration of protocols to disable acting on future
        messages from them (only relevant for pages already loaded in this
        session).
    1. Piggyback on HTML5 drag-and-drop file capabilities (or create own) to
        allow files dropped in this way to be saved back to disk and/or path
        provided to the app; same with optionally allowing privileged file
        picker per site.
    1. Ensure some additional security/privacy for users desiring it by
        restricting external access (using <https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIContentPolicy>
        and <https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIPrincipal>
        per <http://stackoverflow.com/questions/18369052/firefox-add-on-to-load-webpage-without-network-access>?)
        See also http://en.wikipedia.org/wiki/Site-specific_browser regarding
        such sandboxing.
    1. Option to enable `file:` protocol (though mention it is currently risky
        in Firefox to use `postMessage` for security and privacy given its lack
        of scoping); report issue to FF if issue not already added (also for
        better means than '\*' for add-on communication?). However, this option
        would be quite useful, especially if the todo just above on restricting
        external access were implemented, given that web apps could be
        installed to work with one's files (ideally without concerns that the
        data was going to be sent anywhere, and if the todo to confirm saves
        were implemented, one could also see what changes were being made to
        a file before being actually saved). Unfortunately, `file:` sites
        cannot register themselves as protocol handlers, so the user would
        need to configure their settings so as to rely on the default handlers
        in `filetypes.json` to be able to use such a file (or we would need
        to create our own mechanism, such as through `postMessage` back to
        the add-on (or a change in the file's GET parameters or perhaps
        modification of an element within the document), to allow a `file:`
        site to request permission to become usable as a protocol handler).
1. Reimplement protocol registration functionality and create tests using
    `registerProtocolHandler` (also for JS/JSON/mytype); also consider
    HTML head meta-data for flagging availability of file registrations
    and possibly allow user directed use of this information to register
    1. Set `protocol_handlers: [{protocol: "ext+waf", name: "WebAppFind", uriTemplate: "https://...%s"}]`; e.g., for site to register itself for a type
1. Complete [executable builder](https://github.com/brettz9/executable-builder)
    and [atyourcommand](https://github.com/brettz9/atyourcommand) but for
    webextensions.
    1. Option to auto-add as file association and to dock
    1. Reimplement to support Windows in new webappfind version (as batch
        scripts as possible); convert to shortcut tied to `cmd.exe` for sake
        of getting an icon
    1. Installer script to run to facilitate setting up of OpenWith per
        user choices (if Executable Builder is not installed, it could link
        to it, and if it is, it could bring user through steps).
    1. Applescript-based executable builder also?
    1. Examine `executable builder` for ideas and UI

### To-dos (Message posting)

1. Allow genuine POST or other non-GET or header-dependent requests (ala curl)?

### To-dos (File editing permissions/add-on permissions)

1. Option (at the add-on level) to confirm reading and/or saving of data upon
    each attempt and/or display the proposed diffs before saving. (See
    "Implementation notes" section).
1. Allow users to remember privileges so that whenever a file is reloaded (even
    if not from the desktop), it will continue to allow read/write access.
1. Support passing entire directories and passing permission to re-reference
    IDs (until revoked in a permissions dialog?)
1. If we don't need all add-on permissions, see
    <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Request_the_right_permissions>.
    We might also consider creating an `activeTab`-only build to avoid
    content script permissions.
    1. Set `permissions`/`optionalPermissions`

### To-dos (Submissions)

1. Submit to AMO, npm, etc.
1. Once cross-platform, make PR to update
    <https://github.com/marijnh/CodeMirror/blob/master/doc/realworld.html>).
1. Ensure the `filetypes.json` in this repo references updated apps once
    WebAppFind reimplemented.
1. If API stabilizes and functional, file feature request to get the
    functionality built into Firefox.

### To-dos (Future, fairly minor yet new functionality)

1. Set `devtools_page` in `manifest.json` to replicate Node console?
1. Use `web_accessible_resources` for exposing any resources to websites?
1. Set `omnibox: {keyword: "waf"}` for special auto-complete to send to add-on
1. As with how `filebrowser-extended` can open the folder of the currently
    opened file, add an optional icon in WebAppFind to open the containing
    directory of the currently opened document file path, e.g., if user used
    "Open with" on "C:\myfile.txt", it would open "c:\" (if allowed opening
    the file itself from the desktop and the current web app was also set as
    the default for that type, it would open another instance of the file in
    the browser, but may still want to allow this anyways).
1. Allow right-clicking of stylesheets or scripts encountered in the process to
    be clicked to be injected into web apps? (could use if app isn't accepting
    them as additional file arguments already)

### To-dos (new environments)

1. Allow files opened by FTP for remote editing to be used.
1. `localStorage`, cookies and IndexedDB too?; could be wrapped by
    targeted updating API and used with PUT; send schema URL in header
    to inform that the update must be tabular,
    not otherwise hierarchical; could allow a file (or `.filetypes.json`) to
    reference a query so that any updates to the webappfind-opened file
    would only update the subset of retrieved data! Could thereby have flat
    files which bring back shared data ownership (the closest thing to this
    currently that I know of would be using this "Shared Storage" approach
    begun in <https://gist.github.com/brettz9/8876920>). With IndexedDB, which
    accepts version numbers (or defaults to 1), apps could check whether the
    schema they are assuming is current, thus dealing with the main concern
    that subsequent updates to the original schema would break third party
    apps (they would still, but at least potentially incompatible
    modifications would automatically be blocked and an app could provide
    a notice (our equivalent to listening to `onblocked` or possibly
    `onversionchange` if we could find a way to do this to avoid a change
    in schema while the third party app is still open and potentially making
    modifications) about the app awaiting a developer upgrade).
1. IndexedDB; could synchronize with remote (cross-domain) website data
    (optionally requiring credentials) as well as allowing one-off local
    editing, so that user can have live data feeds into their local data
    (listen for changes locally and poll or coordinate to get or send
    WebSockets updates with a remote data source)
1. Allow `postMessage` mechanism to receive content as entered in a pop-up
    dialog for this purpose as opposed to a file (though with an optional
    file to save back)
1. Allow `postMessage` of content within inputs/textareas and the DOM (or
    rely on AtYourCommand for this?)
1. Allow PUT/POST back to AtYourCommand to have side effects such as
    modifying in place highlighted right-clicking text (without the user seeing
    the web app open), e.g., to convert JS to CoffeeScript in a document
    one is viewing.
    1. PUT for specific site only (or data within a site as per targeted
        updating item)
1. API for XPath/XQuery (+ [HTTPQuery](https://github.com/brettz9/httpquery))
    like targeted updating within documents, so data decoupled as with files
    (XSS-safe or unsafe versions); PATCH header for more generic updates?
1. Write utility code
    1. Leverage `method:'local'` property of API distinguishing
        file://-based client-side GET-like code or server-side GET or
        POST-driven content (which should also provide a "untrusted" property
        or the like so as to distinguish code with side effects and those
        without). Develop boilerplate code to work in all possible
        environments (except for dumb clients or clients with JavaScript
        disabled making POST requests). Utilize with
        [URI templates](http://tools.ietf.org/html/rfc6570)
        for server-side discovery and a special API for `postMessage`
        client-side discovery (e.g., if
        [atyourcommand](https://github.com/brettz9/atyourcommand)
        were to make known to you the modes available in an app
        when one is designing a command to shuffle off content to it)? Make
        this perhaps a mode itself also so that files from the desktop could
        also be opened in a manner that the web app displays the available
        modes (and can post them back optionally to a calling app, again,
        like atyourcommand).
        1. Develop utility wrapper library for API to store to disk via
            WebAppFind and/or to store to `localStorage`, IndexedDB,
            and/or remote POST/PUT (since may wish to keep and possibly
            synchronize local copy or remote back-up).

### To-dos (Platform-specific)

1. Get to work in Windows (and Linux)
1. Exe's don't allow right-click "Open with..."" though maybe Windows would
    allow even these files to be handled in some way (e.g., how Tortoise
    overlays the context menu).
1. Provide XULRunner-like options for executable-like behavior independent
    of the browser (and on mobile)

### To-dos (Desktop-based enhancements)

1. Create complementary browser add-on to add desktop listeners to file
    changes to ensure WebAppFind files stay up to date within the app (ensure
    app also checks whether the user wishes to reconcile the new push with
    any changes already made); tie into proposed version control mode?
1. Create dialog to ask user for mode, etc., so executable doesn't have to
    bake it all in and can let the user decide at run-time.
    1. Build an executable to open a local executable/batch on the Windows
        desktop with a dialog asking for command line arguments (e.g.,
        profile)? (as a workaround, one might use WebAppFind for this if an
        override will be provided to ensure it will launch back on the
        desktop)? Also allow a dialog to ask for WebAppFind arguments to
        web apps (could be at executable level or within the WebAppFind
        add-on).

### To-dos (Related enhancements to other add-ons or refactoring to act as separate)

1. See [webappfind-demos-samples](https://github.com/brettz9/webappfind-demos-samples)
    for to-dos
1. Integrate functionality into <https://github.com/brettz9/filebrowser-enhanced>
1. See [atyourcommand](https://github.com/brettz9/atyourcommand),
    a browser add-on to allow creation of context menu items, including
    invoking a process with arguments with the selected text, right-clicked
    URL, or current URL as arguments (with the URL potentially being first
    retrieved as text and then sent as arguments?). Besides allowing the
    reverse behavior of WebAppFind (allowing one to selectively choose
    files on the web or text to supply to a desktop app instead of supplying
    desktop files or command line text to a web app, e.g., opening a file
    from the web in Notepad++), it would even allow WebAppFind to be invoked
    (for the use case of passing text or URL content to a web app); the web app
    could, if opened in edit mode, place a (privileged
    cross-domain) PUT request on behalf of the web app for a save-back,
    allowing users the choice of application for saving files back to the web
    (also allow a desktop executable the ability to launch such a site file in
    a hard-coded app or web-app--in this case, the executable would be clicked
    directly since it was hard-coding both the data file (a web file) and the
    handling app (which in this case could also be a desktop app)). Also
    support a content-type handler and protocol handler for opening exe/batch
    files (or option to install first (with platform-specific choices) if not
    already installed, but with privacy guards not to report whether already
    installed), passing arguments (or shell commands), so web can get
    access to desktop. Let protocol or content-type handler support either
    URLs (so specific data files can be read) or the content itself be passed
    but without a need for something heavy like Java or Silverlight (or
    whatever people use to do this) to do the delegation to the desktop files
    (plug-ins themselves support swapping of data files (for reading or
    writing) in app-independent manner?)... Also ensure asks permission and
    give ability to remember permissions for a site... (Avoids need for plugin
    (or new browser instance embedding) to integrate desktop apps with
    and originating from the Web.) Integrate with an add-on version of the
    AsYouWish-bundled command line app so batch commands can be
    passed from there (as well as saved as a context menu item) to
    WebAppFind (see other todo in this README about this possibility).
    Also right-click to add text or URL contents as itself a context menu
    script. Ensure add-ons support file: and native paths to: open folder
    on desktop, open folder in the browser's file browser, execute on desktop,
    execute with web app
1. AsYouWish
    1. When [AsYouWish](https://github.com/brettz9/asyouwish/) may be restored
        and in use, allow path-reading as long as site is AYW-approved and the
        page is registered for the protocol--so one can bookmark a path and
        always load it or load with other approved paths (e.g., in different
        tabs within a webapp); also can remember paths to invoke upon FF start
        up ("website addons").
    1. Create a shared add-on dependency for WebAppFind and AsYouWish exposing
        perhaps at least for privilege escalation with some of the underlying
        non-SDK APIs (e.g., a privilege to save only to a specific directory if
        WebAppFind adds such a fundamental mode). Perhaps any AsYouWish
        directive could be exposed if part of a `filetypes.json` directive
        and/or command line flag (and not blocked by user preferences) or
        expose AYW API to other add-ons or command line for adding sites
        and privileges and use that; could be useful for add-ons as well
        as sites to provide alternative views/editing interfaces for the
        same shared data.
    1. Option to open HTML in chrome mode so one can do things like
        cross-domain `toDataURL` on an image canvas without errors (the
        proposed change to `AsYouWish` to allow sites to be reopened in
        this mode could be a workaround).
1. Refactor this extension to be a bridge between Node (including
    user-installed packages) and browser/browser add-ons/web-sites.
    1. Support passing from Node into other add-ons
        1. Is there a way to overcome `allowed_extensions`/`allowed_origins`?
            hard-coded limits; is the app manifest read on install only, on
            browser start-up, or on each access? If the latter, could
            restartlessly dynamically modify the file ourselves. Otherwise
            users may have to bundle this code for each add-on.
    1. Might rely on "add-ons" of `npm` packages designated to be installed
        (and via `package.json` config or custom config?) run on start-up.
    1. For an added security layer, might only let bridge work with
        user-designated packages.
    1. Call "add-on"s' main scripts once at start-up.
    1. Have "add-ons" indicate their privilege level (e.g., nodeToBrowser,
        browserToNode) and high-level permission (e.g., `postMessage`
        `contextMenu`).
    1. Find best means possible (ideally even `eval`) to get full privileges
        (whether originating from web-site as in AsYouWish, from desktop,
        as in old WebAppFind, or from another add-on) out of
        browser/browser add-on. If not, emulate own via `postMessage`
        messaging. Or use
        [onMessageExternal](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/onMessageExternal)
        and [onConnectExternal](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/onConnectExternal)
        and have add-on execute a specified script
    1. Example "add-ons"
        1. The old WebAppFind behavior could be one of these add-ons
            1. Extend `filetypes.json` to support passing into a specific
                add-on?
            1. See old code and all to-dos
        1. Like the old WebAppFind behavior but allow for general
            URL-opening mechanism (including for passing of messages)
            in addition to specific `filetypes.json` approach and have
            mechanism also for passing content into another add-on
            1. Test with "Open with..." to open file in a Node script
                which communicates via Node WebSockets
        1. AtYourCommand to run once to set-up user's context menus (and
            desktop-file-opening behaviors)
        1. AsYouWish to allow websites to communicate into the browser or
            to eval-able Node code; at minimum start shared,
            site-agnostic storage
