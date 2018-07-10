## To-dos (Building)

1. Have the OS-specific executable of `bin/native-app` be identified and
    bundled automatically
1. Make install script which avoids `pkg` bundling by assuming user has Node
    installed (much smaller download and less memory, esp. if needing to
    build executables for opening files too)
1. Overcome "Cannot find module 'regedit'" error when building on non-Windows

## Command line API

Todo: Review this documentation section for reimplementation, and move
to own documentation section when done. Review old [executable builder](https://github.com/brettz9/executable-builder) code also.
----
TODOS TO INCORPORATE AND ADD BELOW
1. Error checking and reporting as dialog (or new tab) unless preference to disable on
1. Builder command to indicate:
    1. target directory path/file name
    1. icon path (or link to SVG-edit to make own)

    1. open in full screen mode or reader mode (or `contextualIdentities`)
    1. make shortcut
    1. additional batch commands
    1. hard-coded string to pass for reading or eval
    1. global hotkey to activate
    1. ability to just open a URL without going through WebAppFind
    1. Could allow creating templates (including name, description)
1. Allow command line for temporary file or designated file saving
    of string contents in webappfind as well (with dialog to approve
    there as in [atyourcommand](https://github.com/brettz9/atyourcommand)
    if would cause an overwrite).
1. Window/tab targeting
    1. Allow targeting of hidden window
    1. make resulting tab pinned?
    1. Option to give browser focus or open in background?
    1. Option to avoid or allow new tabs for same URI/mode/filetype/path?
        (option to get the same tab or new tabs for them?); option to push
        to all open windows in different manner so can notify user of
        updates but not change focus, etc.
    1. Allow command line to specify (or let WebAppFind determine according
        to some permutation of the file path) the exact window and possibly
        Panorama group and/or pinned status into which the web app with
        desktop file will be opened (the web app could handle moving itself
        instead but only if the web app were AsYouWish-based and the user
        preferences supplied the file path). Alternatively, the executable
        might have logic to determine the profile in a similarly automated
        (as opposed to hard-coded) manner. The advantage of either approach
        would be to allow the user a better web app grouping organization
        corresponding to the hierarchical organization they can find on
        the desktop.
1. See below and also possibly the notes within the
    [Executable Builder](https://github.com/brettz9/executable-builder) code
1. Support the "register" mode from command line?
----

WebAppFind is triggered through command line
arguments passed to a WebExtensions browser (or Chrome) and handled by
the WebAppFind add-on.

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

* `-webappdoc <path>` - Indicates the path of the file which will be made
    available to the web application (with the privileges designated by
    `-webappmode`)
* `-mode <mode>` Indicates the fundamental mode under which the file
    will be opened up to the web app (i.e., "-mode view",
    "-mode view", "-mode edit", or "-mode edit -binary").
* `-webappcustommode <custom mode>` - Indicates a mode that supplements
    the fundamental mode (e.g., "source" added to the fundamental mode,
    "view" in order to specify that the document is being opened so as to
    view the source code). Custom modes will immediately follow the mode
    within the protocol. (Note that this API is expected to change)
* `-remote "openurl(about:newtab)"` - This built-in Mozilla command line
    API allows Firefox (unlike "-silent") to gain focus without additional
    instructions to Windows. If the tab is determined to not be needed
    (e.g., if the user has opted to allow desktop opening of the file when
    no protocols are found), the add-on will simply auto-close the tab
    that this parameter opens. <!-- To-do: make this cross-browser -->

## To-dos (Reimplementing preferences/basics)

1. Update [Developer-Guide.ms](./Developer-Guide.md) and [DESIGN](./DESIGN.md)
1. See current code for other to-dos
1. LOOK AT old-app folders for implementation aspects and to-dos to add here
1. When done, remove generated AppleScript app(s) from repo
1. Ensure working in Chrome as well as Firefox (Edge, Safari, etc.)

1. Core enhancements
    1. Allow file or directory permissions to have static file server
        permissions be granted (with localhost:port info sent to webapp).
        Could then, e.g., have wiki edit HTML but also conveniently
        serve it (and in a targeted fashion); also have option, for
        single files, to just open the file itself, along with the directory
        (for JS, CSS, etc.) on the static server (even if permission to
        write only given to single file)
    1. Support directory type permissions, with a permission to iterate
        directories and get and/or edit contents.
        (Later offer ability to persist these permissions.)

1. From Node WebSockets -> add-on, we need to open website and `postMessage`
    into it and be able to handle opposite direction, including for writing
    file contents back to disk, but also for *AtYourCommand* functionality)
1. Delete preferences from `old-app/old-preferences.json` after suitably
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
        of scoping); report issue to Firefox if issue not already added (also
        for better means than '\*' for add-on communication?). However, this
        option would be quite useful, especially if the todo just above on
        restricting external access were implemented, given that web apps
        could be installed to work with one's files (ideally without concerns
        that the data was going to be sent anywhere, and if the todo to
        confirm saves were implemented, one could also see what changes were
        being made to a file before being actually saved). Unfortunately,
        `file:` sites cannot register themselves as protocol handlers, so the
        user would need to configure their settings so as to rely on the
        default handlers in `filetypes.json` to be able to use such a file
        (or we would need to create our own mechanism, such as through
        `postMessage` back to the add-on (or a change in the file's GET
        parameters or perhaps modification of an element within the
        document), to allow a `file:` site to request permission to become
        usable as a protocol handler).
1. Reimplement protocol registration functionality and create tests using
    `registerProtocolHandler` (also for JS/JSON/mytype); also consider
    HTML head meta-data for flagging availability of file registrations
    and possibly allow user directed use of this information to register
    1. Set `protocol_handlers: [{protocol: "ext+waf", name: "WebAppFind", uriTemplate: "https://...%s"}]`; e.g., for site to register itself for a type
1. [executable builder](https://github.com/brettz9/executable-builder)
    and [atyourcommand](https://github.com/brettz9/atyourcommand)
    1. Option to auto-add to dock
    1. Reimplement to support Windows in new webappfind version (as batch
        scripts as possible); convert to shortcut tied to `cmd.exe` for sake
        of getting an icon
    1. Installer script to run to facilitate setting up of OpenWith per
        user choices (if Executable Builder is not installed, it could link
        to it, and if it is, it could bring user through steps).
    1. Applescript-based executable builder also?
    1. Examine `executable builder` for ideas and UI

## For developers
### API: file type finding
Review this documentation section for reimplementation, and move
to own documentation section when done.
----
POSSIBLE TODOS TO INCORPORATE BELOW
1. Add meta-data so "view" or "edit" requests can become "binary"
1. Provide meta-data in `filetypes.json` to cause the web app to be passed
    awareness of the desire by the user to be prompted for the selection of
    specific *custom* mode, along with an optional default custom mode and
    suggested custom modes along with any explicitly passed. Thus, an app
    might use this information to ask on WebAppFind invocation, "Do you
    wish to view this file or view its source?".
1. Support a global user `filetypes.json` file (at a chosen directory
    specified within the browser?) which can override or provide defaults for
    local `filetypes.json` files (especially for defaults since sites might
    not have registered handlers, and a user might not wish to have to
    put a `filetypes.json` file within each directory). Ensure it is in a
    location readily detectable by other desktop apps which may wish to check
    it as well (or to be opened in WebAppFind itself) (and demo it
    with Greasemonkey editing once done, and add support to Stylish).
1. Support processing of `filetypes.json` for directories (e.g., a
    "directoryMatches" property to be added to `filetypes.json`).
1. Allow `filetypes.json` to support a hierarchy of custom types (e.g.,
    schema->jsonschema) for meta-data purposes (possibly passing to
    applications, perhaps useful for namespacing)
1. Possibility of utilizing `filetypes.json` on the server side for
    server-side discovery; see <http://webviewers.org/xwiki/bin/view/Main/WebHome>
    (utilize its format at all or reconcile?); better reconciliation
    with local OS type systems
1. Could allow type to be determined by schema (e.g., JSON Schema based
    on `$schema` value with JSON document, XML Schema for XML, etc.).
1. Allow defaultHandlers to be optionally added inline with `fileMatches`
    in `filetypes.json`?
1. Modify `filetypes.json` to support "prompt" mode
    optional default mode or suggested modes (though the browser should
    not prevent other modes from being used since the whole idea is that
    the user controls the mode under which they wish to open the file).
----

The following steps may currently be altered by user preference.

1. File types can currently be obtained based on file extension
    (e.g., "myScript.js" would incorporate "js" into the type name) or
    based on settings within a `filetypes.json` file placed within the same
    directory as the data files. The rules are as follows:
    1. Use a (lower-case) file extension (e.g., "js" in our example above)
    1. If a `filetypes.json` file is supplied within the same directory as
        the data files, a lower-case custom type can be specified:
        1. At the root of the `filetypes.json` JSON object can be a property
            "fileMatches" which is an array of two-value arrays. The first
            item in these inner arrays must be a regular expression expressed
            as a string to indicate which files will be matched and the
            second value to indicate the type to be assigned to the match.
            The first inner array containing a match will be the one used
            to designate the type name (which must be lower-case ASCII
            letters only).
1. Once a file type is known as per above...
    1. a protocol may be checked for the detected type as follows:
        1. The protocol to find the type will begin with "web+local"
            (only existing
            [whitelisted protocols or "web+" ones are allowed](http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-navigator-registerprotocolhandler))
        1. The protocol must then be followed by the (lower-case) fundamental
            mode (currently "view", "edit", or
            "register") and optionally by a custom mode (e.g., "source") which
            indicates an extensible mode which is focused on one type of
            viewing, editing, etc. (e.g., looking at the source code of an
            HTML file as opposed to a WYSIWYG view).
        1. The protocol must then be concluded by the file type as per above
            (i.e., the file extension like "js" or `filetypes.json` designated
            type name (which
            [must be lower case ASCII](http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-navigator-registerprotocolhandler))).
        1. If the protocol is found to be registered, it will be visited and
            these steps will end. Otherwise, continue with the following steps.
    1. If the `filetypes.json` file contains a top-level "defaultHandlers"
        property object, this object will be checked against the type name and
        if a sub-object for this type is found:
        1. that object will be checked to see whether the "register" mode is
            present (and the add-on user has not opted out of visiting these
            links), and if yes, the user would be forwarded to it (to allow
            a site the ability to register itself as a handler for any number
            of modes and/or be a portal to those modes) and these steps would
            stop. Otherwise, continue.
        1. that object will be checked to see whether the requested open mode
            is also present (i.e., "view" or "edit", optionally followed by a
            supplied extensible custom
            mode such as "source" to view or edit source only).
            1. If the open mode key is present, its value will be used as the
                site to open. (Currently, %s found in the URL will be
                substituted with the equivalent protocol scheme (e.g.,
                "web+localeditjs:") followed by a JSON-stringify'd object
                (containing *fileType*, *mode*, *customMode*, and *pathID*
                properties); note that user preferences may determine that
                the path ID is not the actual path but a mere GUID.) Although
                this may be changed in the future, `file://` URLs currently do
                not work with WebAppFind message posting (due to current
                privacy leaks in Firefox with add-on-to-file-protocol-webpage
                communication) (As I recall, custom DOM events didn't work
                with `file:`, and there is apparently no other method of
                communicating with an add-on (without injecting a global)
                that we could use like allowing sites to open a `chrome://`
                URL (restartless might be able to get such URLs via
                `chrome.manifest` or dynamically but this is not allowed from
                the `file:` protocol)). (Note: For security reasons
                one should not rely on the URL parameters; it is better to
                utilize the message listening approach shown below.)
    1. If the `filetypes.json` file contains a top level "hierarchy"
        property object and if a suitable mode was not found, the hierarchy
        object may be checked for the type name to see what types might
        be acceptable alternatives (in decreasing order of preference)
        to determine the type to check in future steps below.
    1. If no other information is present in the `filetypes.json` file,
        if the file is not present, or if a specific default site was not
        found, depending on user settings, depending on user setting, the
        browser may attempt to open the file. Depending on user settings,
        the user may delegate the opening of the file back to the desktop
        (the default, however, is not to do so). If the user has not
        permitted either of these behaviors, an error message will be
        displayed.

So, for example, if no `filetypes.json` file were present (or if the
`filetypes.json` indicated that the given file was of the "js" type),
a edit-capable loading of a JavaScript source file might look for a
registration at "web+localeditjs:". Depending on user configuration,
if such a hander is not found, the file may be opened in the browser
or on the desktop.

## Todos and possible changes

### Possible future API/filetypes.json changes

1. Mode and parameter changes
    1. Pass in argument for profile, or if defunct in browsers, at least
        allow to open a private window/tab
        1. Set `incognito` on whether/how to work in Incognito mode
        1. Re: Profile, see <https://support.mozilla.org/en-US/kb/profile-manager-create-and-remove-firefox-profiles>
    1. API changes/additions (Anticipated change with custom modes and
        allowing for multiple modes (and file access) at once.)
        1. Allow not just one, but multiple, file/URL/folder/command-line/web
            app/etc. arguments to be passed into the web application (e.g.,
            for preferences, privilege level simulation or request information,
            schema, etc.) as an array of objects with the string results of
            obtaining the file in the specified mode (or custom mode in the
            case of a web app) placed as one of the keys on the object, with
            the other keys optionally indicating: 1) the source and nature of
            the string data (e.g., the path (with fundamental mode under which
            it was obtained or at least whether the data was obtained as
            binary or non-binary), URL, command line instructions, web app
            URL with arguments), 2) type meta-data about the file (as opposed
            to arguments supplied to that file) which could be used by the
            receiving application (e.g., to indicate which file is providing
            preferences, which is providing a schema for validation, etc.
            even while (ideally wiki-standardized) custom modes should
            normally be used for this). Could leverage the information within
            this array of objects in a generic server-side application as
            well. Should be able to work with export mode as well for
            multiple or alternate outputs.
            1. Get this to work with SendTo so that an entire folder's files
                can be sent with privileges through regular desktop without
                need for manual command line or `filetypes.json`
            1. Privileges could be optionally supplied automatically or on
                demand (with `postMessage` by site).
            1. Also support designation of additional resource file access
                for a given file in `filetypes.json`; allow regex (including
                subfolders or even ancestor/sibling ones?) to map files (by
                regexp) or file types to additional resources
            1. Make note that Windows doesn't apparently allow OpenWith
                when multiple files are selected on the desktop though
                things can work with `filetypes.json`
            1. Develop system for converting file names into multiple resource
                files, e.g., opening a file `brett.schema.dbjson` could by
                default look for a "dbjson" web app handler while also giving
                permission to that web app to read/write a file named
                "brett.schema" in the same directory as "brett.schema.dbjson".
                Besides dot-separated additional resource files, within an
                entry, a hyphen could indicate a subdirectory, e.g.,
                "brett.schemas-schema.dbjson" could allow access to a file in
                "schemas/brett.schema" relative to the "dbjson" file. A hyphen
                at the beginning could allow access to parent directories.
            1. "export" - Exporting into a different format (and saving to a
                different target file) from the original source file. Once
                multiple modes may be supported, users might supply
                both "edit" and "export" privileges to a web app
                simultaneously so one could save back the original
                file as well as the export (e.g., to save SVG and a PNG export
                or to save a CoffeeScript file and its JavaScript export).
            1. Like "export", we might wish to allow a file to be opened with
                the privilege to save anywhere in a particular directory, etc.
        1. Change custom modes to be prefixed with a colon in front of
            fundamental modes and then allow multiple modes separated by
            whitespace (especially in preparation for support of a likely
            frequent use case for combining a new fundamental mode, "export",
            along with an "edit" mode, e.g., to allow saving of an SVG file
            as SVG or PNG, or saving CoffeeScript as CoffeeScript of
            JavaScript, [Ocrad](http://antimatter15.github.io/ocrad.js/demo.html)
            for text OCR export of an image, etc.). Allow multiple custom modes
            attached to a single fundamental mode?
        1. In addition to regular expressions, use the presence or specific
            values for custom modes to determine file type?
        1. WebAppFind command line or `filetypes.json` to resolve URL into
            content to be passed to web app or path/link (file: or c:\) for
            app or file
            1. Modify Executable Builder so an executable can cause a web
                file to be opened by a web or desktop app; and then save
                changes back via PUT or POST (check header for PUT
                support?); or should I instead just implement command line
                control for web->desktop add-ons and call that within an
                executable/Executable Builder (leading potentially back
                through WebAppFind command-line control)? Integrate with
                [atyourcommand](https://github.com/brettz9/atyourcommand)
            1. Use server's `filetypes.json` also if present
        1. Allow command line args to be piped into a string to be supplied
            to the web app (including result of another webappfind
            invocation?); if "edit" mode is given, allow
            command line instructions to be invoked with the result posted
            back from the web app as a parameter.
        1. Mention how profile selection logic would probably ideally
            occur before opening the browser as with any complex
            type-determination logic, taking place within the executable
            (built by Executable Builder?), though ensure that the new
            proposed command line and web app pipelining features would
            be able to replicate this if necessary
        1. Demo of the brorwser being used merely to interpret
            `filetypes.json` and simply return a command line instruction
            back to a desktop app (in a hard-coded rather than fallback
            manner). Although AsYouWish could do this, better to bake it in
            so other desktop apps can leverage (including Notepad++, etc.).
        1. Allow type to be supplied via command line without `fileMatches`
            calculations so as to just open the right web app for the type
        1. Allow type to be supplied without any file so as to just open
            the web app for the supplied type (without a file)
        1. Web app pipelining: Allow a hard-coded web app URL (or supply
            a path or file type in order to discover a web app) to be
            supplied (along with its own mode, custom mode, arguments,
            etc.) which will be opened (optionally in a hidden window)
            and when its response its received, pipeline the string
            result to another web app URL. Yes, the apps could instead
            communicate directly with each other via postMessage, but
            this approach allows the user to do their own coupling
            rather than be dependent on a particular integration of services.
        1. Support an optional, hard-coded web app URL (optionally looking for
            fallbacks if the supplied one is a protocol but not found) and/or
            hard-coded file type (to circumvent the normal detection procedures
            and always open with a given web app).
            1. Demo this hard-coding usage within FireFTP opening of remote
                files (or better yet, implement an AsYouWish-based web FTP
                client which can do it)
        1. Arbitrary command line args to pass on to webapps
            1. Command line args to web apps even without data file (and
                without special HTTP headers)
            1. Update webappfind wiki on custom modes once arguments can
                be passed (advise to use instead if minor)
        1. Allow eval-able strings (or JS file paths) as arguments (with or
            without the usual WebAppFind file contents/paths) which the
            browser then evaluates so as to provide AYW-like privileged
            functionality in a batch file manner without exposing privileges
            to web apps unless invoked from the desktop (as a workaround, one
            could use WebAppFind to open an AYW-enabled site, especially if it
            adds an eval-like ability and WebAppFind get support for passing in
            arbitrary command line args). Batch scripts (including the
            functionality to optionally receive file arguments or paths to JS
            files if AYW was used or XHR paths were used) could thus be written
            in JS and take advantage of browser cross-platform features (like
            [Node.js command line scripts](http://www.2ality.com/2011/12/nodejs-shell-scripting.html)
            but browser aware too). Could use in conjunction with proposed
            "hidden" flag to avoid adding a tab (or do so by default).
        1. Support optional "hidden" flag (in conjunction with, or only
            from, AsYouWish?) to embed a hidden DOM window script (use for
            batch-script-like functionality)
            1. Potentially privileged via AsYouWish, and aware of file path,
                could, e.g., create 10 copies of a supplied file name in
                the same directory or some other pipeline
            1. Allow args to WebAppFind to avoid adding a window, e.g., for
                a type to handling `.jsbatch` files to cause a them to be
                launched with privileges (via AYW? though better to avoid
                need for any HTML--just JS) in a hidden window (or manage
                files to run on a schedule; integrate with a Windows task
                scheduler in case not open?), so work like AYW but without
                a footprint (but without working each restart as with
                "add-on sites"); may still be useful with other privs, e.g.,
                to get (send to network) and save file contents, and if
                asking for privs, will prompt dialog (e.g., to read a file
                and then use privs--though this would be redundant, perhaps
                in this mode we can always pass the real path so it adds
                value, e.g., if script wants to do something in same
                directory); see also todos in Executable Builder for more on
                command-line-like approach
        1. Prompt user for a web app URL if no app set for file type
        1. Support option for any web app to open by default in full-screen
            mode (could just let web app and user handle, but user may
            prefer to bake it in to a particular executable only)
        1. Supply own `filetypes.json` by command line including a remote one
            1. If a directory or other file is supplied, convert it to the
                child or sibling `filetypes.json` file respectively?
                (would be convenient for atyourcommand to supply a
                right-clicked file and have WebAppFind detect it's own
                remote `filetypes.json`)
      1. Allow optional param substitution of content within the URL? May
          present problems if running into URL length limits (which may differ
          across browser is other browsers will be supported in the future) but
          could allow WAF to work with some legacy apps that do not have the
          message listening code.
        1. Consider off-by-default mechanism for websites to not only ask to
            handle filetypes, but to ask to set up built-in executables or
            specific executables for OpenWith or default execution of a
            given file type/extension. Consider alternative with WAF in
            defining content types for handling by browser and then with
            sites registering themselves via [registerContentHandler()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator.registerContentHandler).
            See, however, [bug 391286](https://bugzilla.mozilla.org/show_bug.cgi?id=391286)
            for current lack of arbitrary MIME support in Firefox.
    1. See "Possible future mode additions" section below for possible
        additions to fundamental (functional) modes beyond just "view"
        and "edit"
    1. Possible changes to parameters passed to registered protocol
        handlers and/or default handlers (if any, as may only be passed
        through `postMessage` or some other means)
        1. Add to what is passed within URL (beyond filetype, mode,
            custom mode, and path)? or just pass through `postMessage`?
            Bookmarkability vs. clean API?
1. `filetypes.json` changes
    1. Consider encouraging use of MIME types for file type names.
    1. Change `filetypes.json` to .`filetypes.json` or at least support
        the latter for those not wishing to distract users or let them
        mess things up.
    1. Allow `filetypes.json` to designate profiles or windows so C++
        executable or batch file could do its own `filetypes.json`
        processing to determine target profile or window?
    1. Allow `filetypes.json` to designate icon files (as well as
        suggested shortcut names?) for use with [Executable Builder](https://github.com/brettz9/executable-builder)
        executables so the user will not need to create their own
        icon? Executables or batch files (or filebrowser-enhanced)
        might pre-read the current directory and parse the JSON file
        and then delegate to another shortcut/executable associated
        with this icon
1. Protocol handler changes
    1. Since web protocols are not meant to be used to have the privilege
        of reading from or writing to files (unless they belong to reserved
        protocols which, per the HTML spec, cannot be registered from
        the web anyways), the current approach of allowing web sites to
        register themselves as handlers might need to be modified to use
        some other mechanism which can at least provide warnings to users
        about the capabilities they are thereby approving (perhaps as within
        [AsYouWish](https://github.com/brettz9/asyouwish/) when sites
        themselves can do the requesting for privileges). However, since
        WebAppFind chose to start with the web protocol approach not only
        because it is an existing method for sites to register themselves
        for later potential use, but because the data security and privacy
        issues are confined to data files which are explicitly opened
        from the desktop when using the WebAppFind approach.
    1. Depending on whether registerProtocolHandler will continue to be used,
        see about whether the HTML spec might be open to more tolerance within
        the allowed characters of a custom protocol beyond lower-case ASCII
        letters.

### Possible future mode additions

See "Possible future API/filestypes.json changes" for changes/additions
planned for the (hopefully) near future.

----
TODO: Add these below
1. Options to have Windows
    "[verb](http://msdn.microsoft.com/en-us/library/bb165967.aspx)"
    (i.e., Open, Edit, Print, Play, Preview or custom) be treated as
    modes/custom modes or to otherwise detect and interact with
    them?
----

Besides "view", "edit", "register", the
following modes might be added in future versions (or made to correspond
with WebDav commands?):

1. "route"
1. "extensiontypehierarchyhandler"
1. Version control (also some discussion of possibilities for multiple
    file saving)
    1. "create", "delete" - for any necessary set-up before creation or
        deletion of a file (as with saving, the protocol should not have
        side effects, so these should only bring one to the page to confirm
        the user wished to take such an action--and the browser might have
        its own confirmation for these actions).
    1. "rename" and "move" (or cut or copy and paste)
    1. "versioncontrol" - A mechanism could be added to request listening to
        events which would impact version control (though some means of
        determining scope would be needed—e.g., a folder and all its
        subfolders—as well as privacy/security considerations which expands
        beyond the current scope of individual file viewing and saving;
        similar concerns would need to be taken into account for other
        modes that may process multiple files like search or file packaging).
        These events could be used to open a (hidden?) web app to store data
        (e.g., via localStorage or a new "edit" mechanism which could save
        to disk, but circumscribed by file type so that, e.g., a repository
        binary could be modified without the user needing to explicitly
        open it) and build a file history for a "repository". This
        "versioncontrol" handlers ought to allow multiple listening apps
        in some manner; this would be both for the sake of allowing different
        versioncontrol storage mechanisms/repository types, for ensuring
        that any viewing apps get updated upon external changes, as well
        as for any apps storing meta-data related to a document or documents
        but not saved within them to be notified and respond accordingly
        (including possibly saving their own updates back to disk), e.g.,
        for building up a history of commit messages (which would at
        least effectively need the completion of the todo to allow a
        single web app to handle multiple documents at once).
1. "send to" or "mailer" but with file (and folder) contents instead of just
    a path - e.g., to put file contents and/or file attachment(s), subject,
    etc. into a mail viewer, ready to email (with equivalents for chatting)?
1. "validate" - Before the save command of an "edit" mode process (and
    its response back to the app) is completed, it may be handy to have a
    separate protocol be called for any registered validators of a given file
    type to perform validation and conditionally reject a save. Instead of
    receiving the file path, they would be passed the proposed file contents
    for saving from "edit" to ensure proper well-formedness and validity
    before saving back to disk. It might be ideal for a validator to simply
    be a JavaScript file with a specific function, but for parity, we should
    probably implement this as another HTML file using a (secure)
    `postMessage`. If a file was found within a `filetypes.json` hierarchy,
    it may be desirable to ensure validators are sought up the hierarchy
    (at least if not found at the most specific level), e.g., to check that
    a "myType" file specified as being a JSON file is indeed a JSON file,
    or at least a JavaScript object if there is no JSON validator registered.
1. "preconvert" and "postconvert" - hooks to transform content before reading
    or writing, respectively (but before "validate")
1. "splash" - for a splash page leading to the modes so that "register" can
    be exclusively for registering users?
1. "query" or "search" - For queries within file or within a folder, etc.,
    optionally (?) filtered by file type; this might be used for
    "find-in-files" behavior (multiple file saving would be needed for
    "replace-in-files"). These queries could be hierarchical (as also
    defined in `filetypes.json`?) such that, for example, one might have
    "myType" JSON files queryable in a precise manner, e.g., to find all
    files (or records) containing a "publication date" between a range of
    dates, while also allowing more generic queries such as RQL, or if not
    available (or not desired), the user could default to full text search
    (since a superset of JSON could be the txt type which could allow full
    text search). Also for simple file listing (see SendTo info for how to
    get a batch file to process a folder by right-click within the desktop)
1. "execute" - Although the OS would normally do its own execution, it is
    possible that privileged apps (as through AsYouWish) might be able to
    handle this at least partly on their own
1. "prompt" mode - Allow a command-line "prompt" fundamental mode: will allow
    the user to determine mode at run-time (the browser (or other opening app)
    can provide a prompt to the user to ask which mode to use before
    opening the file in that chosen mode).
1. "any" mode - Allow a command-line mode to let the web app choose the mode.
1. Support local or remote stream inputs

## To-dos (Message posting)

1. Allow genuine POST or other non-GET or header-dependent requests (ala curl)?

## To-dos (File editing permissions/add-on permissions)

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

## To-dos (Submissions)

1. Submit to AMO, npm, etc.
1. Once cross-platform, make PR to update
    <https://github.com/marijnh/CodeMirror/blob/master/doc/realworld.html>).
1. Ensure the `filetypes.json` in this repo references updated apps once
    WebAppFind reimplemented.
1. If API stabilizes and functional, file feature request to get the
    functionality built into webextensions.

## To-dos (Future, fairly minor yet new functionality)

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

## To-dos (new environments)

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

## To-dos (Platform-specific)

1. Get to work in Windows (and Linux)
1. Exe's don't allow right-click "Open with..."" though maybe Windows would
    allow even these files to be handled in some way (e.g., how Tortoise
    overlays the context menu).
1. Provide XULRunner-like options for executable-like behavior independent
    of the browser (and on mobile)

## To-dos (Desktop-based enhancements)

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

## To-dos (Related enhancements to other add-ons or refactoring to act as separate)

1. See [webappfind-demos-samples](https://github.com/brettz9/webappfind-demos-samples)
    for to-dos; update it for any API changes
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
        tabs within a webapp); also can remember paths to invoke upon browser
        start up ("website addons").
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
