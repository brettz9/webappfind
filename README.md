# webappfind

VERSION INCOMPLETE/NOT YET FUNCTIONAL!!!

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

1. Work on Git on your desktop while being able to open HTML files for
WYSIWYG editing in a (CKEditor) web app which you can easily modify
to add buttons for inserting code snippets? Do you want to use CodeMirror
for syntax highlighting of your JavaScript and CSS? (Demos are available
which do all of these.)

## Command line communication with add-on

In order to pass a file into the add-on (which can use any arguments and its
heuristics to determine the specific website to open and in what manner),
the `native-app.js` file should be invoked with `--method=client` and optionally
with `--file="..."`, `--mode="view|edit"`, `--site="http://..."`, `--args="..."`.
See "Executable builder functionality" "Arguments" section for how these optional
methods will be used.

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

### Arguments

- **method** - Required. Must be set to "build-openwith-exec".

- **file** - Optional hard-baking of a file. If this argument is not included,
    the generated script will check for the presence of an argument to the
    script to serve as the file to pass to the web application. If no argument
    is passed to the *generated script*, its absence will trigger a file dialog.

- **mode** - Optional mode for invoking the web app on your contents, either
    "view" (readonly) or "edit". Default is "view".

- **site** - Optional baking in of a specific site to invoke with the designated
    file's contents. Will check for local `filetypes.json` otherwise.

- **args** - Optional. Any arguments to pass to the web applications
    `onmessage` listener data object (under `args`).

- **fileSelectMessage** - When the generated script does not have a baked-in
    file and no file argument is passed to it, this argument will determine
    the message shown in the resulting file dialog.

- **fileSelectType** - When the generated script does not have a baked-in file
    and no file argument is passed to it, this argument, if present, will have
    the script insist on a particular file type in the resulting file dialog.
    Must be an extension string without the leading period (e.g., "js" for ".js"
    JavaScript files) or a
    [Uniform Type Identifier](https://en.wikipedia.org/wiki/Uniform_Type_Identifier),
    e.g., "public.image" or "com.apple.iwork.pages.sffpages".

## Comparison with alternatives

### TODO: Comparison between WebAppFind and routers/controllers in typical web apps whose verbs are indicated via URL query string parameters.

### TODO: Document issues raised between app-agnostic data sharing as through WebAppFind and likes of `postMessage` (but not `MessageChannel` or `WebSockets` which hard-code the shared app?)

### Relative disadvantages of alternatives

1. Node opening file and passing
    [command](https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options)
    [line arguments](https://www.ghacks.net/2013/10/06/list-useful-google-chrome-command-line-switches/)
    into browser to open file with GET parameters

    1. This is limited by string length (and possible security problems if
        the user passes along the URL).

    1. Listening by GET parameters may conflict with existing parameters

    1. Listening by GET parameters may not work with offline applications
        that rely on hash

1. Node opening file and passing command line arguments into browser to
    open file and posting contents to another Node server hosting the web app

    1. Forces user to be subject to any non-agnostic listening requirements (a
        receiving app would know the origin and reject the contents).

    1. Receiving app (where one would most frequently be developing) cannot be
        a static file web application

### Advantages of our configuration

1. Our code supports various platforms and browsers out of the box.

1. By using `pkg`, we can avoid forcing users to install Node.

1. Our `filetypes.json` approach offers easy reusability among non-developers
    (or non-Node developers)

## Development

### Installing development tools

1. `npm -g i pkg` - Uses [pkg](https://github.com/zeit/pkg)
1. `npm -g i web-ext` - Uses [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext)

### Testing

*Note: The "all" options—which are for installing for all users on the
machine—[do not currently work](https://github.com/zeit/pkg/issues/136#issuecomment-308794640)*

1. `npm run (pkg-)installer(-all)-(lint|run|addon)` - Shortcut options for the following
    two steps
    1. `npm run (pkg-)installer(-all)` - Shortcut for the following two steps
        1. `npm run build-(pkg-)installer(-all)` - Shortcut for the following
            1. If `pkg`, `build-pkg-native-apps(-all)` - builds the Node executables for native
                messaging
            1. `build-(pkg-)installer-component(-all)` - Builds installations on the user machine
            1. If `pkg`, `npm link`
        1. `npm run run-(pkg-)install` - Executes the installer (to register as part
            of native messaging host files)
    1. One of:
        1. `npm run lint` - Runs ESLint and `web-ext lint` (which uses `addons-linter`)
        1. `npm run run` - Test the web extension in Firefox
        1. `npm run addon` - Building the add-on file for distribution, e.g., on AMO

## To-dos

1. Delete preferences from `ignore/old-preferences.json` after suitably
    reimplemented

1. Have the OS-specific executable of `bin/native-app` be identified and
    bundled automatically

1. Make install script which avoids pkg bundling by assumes user has Node
    installed (much smaller download and less memory, esp. if needing to
    build executables for opening files too)

1. Overcome "Cannot find module 'regedit'" error when building on non-Windows

1. In `pkg` file, after checking registry (how to avoid repeating??), set-up
    Node WebSockets to listen and pass on to add-on (which will open website
    and `postMessage` into it and be able to handle opposite direction,
    including for writing file contents back to disk, but also for
    *AtYourCommand* functionality)

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
        browser/browser add-on. If not, emulate own via `postMessage` messaging.

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

1. Add back demos and sample files from old `webappfind`.

1. Remove old `webappfind` files/info (e.g., on `filetypes.json`) if
    making package more general purpose.

1. Complete [executable builder](https://github.com/brettz9/executable-builder)
    and [atyourcommand](https://github.com/brettz9/atyourcommand) but for webextensions.
    1. Option to auto-add as file association and to dock
    1. Reimplement to support Windows in new webappfind version (as batch scripts as possible);
        convert to shortcut tied to cmd.exe for sake of getting an icon
    1. Installer script to run to facilitate setting up of OpenWith per user choices (if Executable Builder is not installed, it could link to it, and if it is, it could bring user through steps).
    1. Applescript-based executable builder also?

1. Document usage of putting in dock for dragging files onto it

## To-dos (Lower priority)

1. If we don't need all permissions, see <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Request_the_right_permissions>.
    We might also consider allowing `activeTab`-only build to avoid
    content script permissions.

1. Support passing entire directories with permission to re-reference IDs
    (until revoked in a permissions dialog?)

1. `manifest.json` additions?

    1. Set `protocol_handlers: [{protocol: "ext+waf", name: "WebAppFind", uriTemplate: "https://...%s"}]`; e.g., for site to register itself for a type
    1. Set `omnibox: {keyword: "waf"}` for special auto-complete to send to add-on
    1. Set `options_ui: {page: "webappfind-options.html"}` and/or `sidebar_action`?
    1. Set `permissions`/`optionalPermissions`
    1. Set `incognito` on whether/how to work in Incognito mode
    1. Set `devtools_page` in `manifest.json` to replicate Node console?
    1. Use `web_accessible_resources` for exposing any resources to websites?

## To-dos (new environments)

1. Allow files opened by FTP for remote editing to be used.
1. `localStorage`, cookies and IndexedDB too?; could be wrapped by
targeted updating API and used with PUT; send schema URL in header
to inform that the update must be tabular,
not otherwise hierarchical; could allow a file (or `.filetypes.json`) to
reference a query so that any updates to the webappfind-opened file
would only update the subset of retrieved data! Could thereby have flat
files which bring back shared data ownership (the closest thing to this
currently that I know of would be using this "Shared Storage" approach begun
in <https://gist.github.com/brettz9/8876920>). With IndexedDB, which
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
(optionally requiring credentials) as well as allowing one-off local editing,
so that user can have live data feeds into their local data (listen for changes
locally and poll or coordinate to get or send WebSockets updates with a remote
data source)
1. Allow `postMessage` mechanism to receive content as entered in a pop-up dialog
    for this purpose as opposed to a file (though with an optional file to save back)
1. Allow `postMessage` of content within inputs/textareas and the DOM (or rely on
    AtYourCommand for this?)
1. Allow PUT/POST back to AtYourCommand to have side effects such as
modifying in place highlighted right-clicking text (without the user seeing
the web app open), e.g., to convert JS to CoffeeScript in a document
one is viewing.

## To-dos (Platform-specific)

1. Get to work in Windows (and Linux)
1. Exe's don't allow right-click "Open with..."" though maybe Windows would
    allow even these files to be handled in some way (e.g., how Tortoise
    overlays the context menu).
1. Provide XULRunner-like options for executable-like behavior independent of the browser
    (and on mobile)

## To-dos (Desktop-based enhancements)

1. Create complementary browser add-on to add desktop listeners to file changes to ensure WebAppFind files stay up to date within the app (ensure app also checks whether the user wishes to reconcile the new push with any changes already made); tie into proposed version control mode?
1. Create dialog to ask user for mode, etc., so executable doesn't have to bake it all in and can let the user decide at run-time.

## To-dos (Related enhancements to other add-ons)

1. Integrate functionality into <https://github.com/brettz9/filebrowser-enhanced>
1. See [DEMOS.md](./DEMOS.md) on need to move old demos/samples to own repo.

## To-dos (Message posting)

1. Allow genuine POST or other non-GET or header-dependent requests (ala curl)?

## To-dos (File editing permissions/add-on permissions)

1. Option (at the add-on level) to confirm reading and/or saving of data upon
    each attempt and/or display the proposed diffs before saving. (See
    "Implementation notes" section).
1. Allow users to remember privileges so that whenever a file is reloaded (even
    if not from the desktop), it will continue to allow read/write access.

## To-dos (Submissions)

1. Submit to AMO, npm, etc.
1. Once cross-platform, make PR to update
    <https://github.com/marijnh/CodeMirror/blob/master/doc/realworld.html>).
1. If API stabilizes and functional, file feature request to get the
    functionality built into Firefox.

## To-dos (Others)

1. Add from [README-old.md](./README-old.md)
1. Search through coe for "Todo"
