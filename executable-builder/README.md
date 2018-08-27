# executable-builder

Executable Builder is a component of WebAppFind which provides
the functionality to build, in a more customizable manner, executables which
can pass a selected desktop file to a web application for viewing and
optional editing.
<!--
TODO: Add when `filetypes.json` reimplemented:

For an example of such WebAppFind behavior customization,
Executable Builder might be used to build an executable which
hard-codes a particular web app as the handler for the clicked-on
file--instead of relying on WebAppFind's behavior of checking for a
protocol handler for the file's type (with the type determined by the
file's extension or, if present, a `filetypes.json` file in the same
directory as the file).
-->

Executable Builder also lets websites silently advertise their support for
handling certain file extensions and/or content types and the user
can, at their discretion, import that info and even set the web app
to open local files of that type by default (or just be available
within "Open With...").

For any WebAppFind executable, one may choose the level of privilege
by which the web app may act on the supplied file (e.g., "view" or "edit").
<!--
TODO: Add when implemented
One may customize how a new tab or window is created, over-ride
preferences, or default the web app display of the opened file in full
screen mode. Advanced users can include additional batch commands or
browser command line parameters or pass a custom hard-coded string to
the web app so that it may tweak its behavior accordingly.
-->
<!--
TODO: Add when implemented
The executables can have their own associated icons (which the add-on
can help you to create) to give the feel on the desktop that the
executable (which opens a web app) is as any other app.
-->
<!--
TODO: Add when implemented
By having icons, this lets them show in Windows Explorer, the
start menu, and the task bar.
-->
<!--
TODO: Add when implemented
If one opts to tie this executable to a separate browser profile,
this icon will show up in the task bar independent from other
browser windows. (If WebAppFind can be adapted to support XULRunner
instead of Firefox, one might be able to get an even more light
weight "executable" environment.)
-->

The executables built by Executable Builder are actually just simple
files working with the command line which pass some additional
instructions to it. In the case of WebAppFind executables, these
will be passing command line instructions to the browser.

<!--
TODO: Add when implemented
Used in conjunction with browser profiles, one will get the benefits
of former projects like Mozilla Prism/Chromeless/WebRunner which
provided web applications as executables with their ability to show
up independently in the task bar, but with the added optional ability
of granting privileged features to web applications
(such as one may get if using Executable Builder/WebAppFind
with AsYouWish functionality) and with the ability to utilize add-ons,
even a separate set of add-ons for each executable (and without
the problem that all of these other executable projects are all
now apparently defunct).
-->

## Usage

In order to provide suggested file extension and content type associations for
discoverability by Executable Builder, one's HTML must include
`<meta name="webappfind">` elements in the head of the document. These elements
must also include a `content` attribute with keys and values separated by equal
signs and each pair separated by ampersands, as in URL query strings (minus the
initial question mark). To properly escape content, one may use JavaScript's
`encodeURIComponent()` or use the utility library provided with
[webappfind-demos-samples](https://github.com/brettz9/webappfind-demos-samples).

When when one has a tab open in the browser with such HTML containing these
`<meta>` tags, one may click the "Exec" Executable Builder toolbar button
and then choose from the "Prepopulate with settings recommended by site"
pull-down and choose the settings offered by the website (listed by
executable name). **Upon using such a suggestion, be sure to review
the settings before building an executable, as the site may be suggesting
itself as a handler for files which you are not willing for it to
handle.**

## To-dos for new Executable Builder (in WebAppFind)

1. Provide *button to remove apps from "Open with..."*
    1. If deleting the application:
        1. Remove the application
        1. `/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -kill -r -domain local -domain user`
        1. `killall Finder`
    1. If modifying an application:
        1. Modify application package contents Info.plist `CFBundleTypeExtensions`
        1. `killall Finder`
1. For content-type, give option to *add further meta-data to export*
    (if exposing)/import (needed if using third party)
1. IMPORTANT: See `execute.js`, `executableResponses.js`, etc. for *other
    todos already under-way*
1. *Remove/adapt to-dos from other add-ons*
    (WebAppFind/filebrowser-enhanced/AsYouWish) as completed in process of
    this add-on
1. As reimplement, *uncomment hidden docs* above
1. Option to auto-add to *dock*
1. *Avoid baking in arguments*--let them be passed in by command line
1. *UI*
    1. *Split form into generic and specific sections* (so will allow building of
        executables regardless of *whether used for WebAppFind or not*);
        *dynamically reveal* sections based on 'Open with WebAppFind?'
        radio group selection, hard-coding or not, etc. (as simpler *Wizard*)
    1. Add *copy path to clipboard*
    1. *File picker* from Ajax and local Node.js (using Miller columns browser?);
        see commented out code.
    1. Have option to *change toolbar icon when files are available* (requires
        (pseudo) content-script)
        1. show current state, e.g., if already associated, if changed, etc.
1. Add our `<meta name=webappfind>` format to <https://wiki.whatwg.org/wiki/MetaExtensions>
1. Allow *icon* for app (using site favicon if no icon specified)
1. *Other similar openers*
    1. Create *AppleScript to prompt for site*
    1. Create *desktop app/AppleScript* (to communicate with native
        messaging app to use `windows` add-on privilege to open a
        dialog, *asking which web app (that has previously advertised
        itself as supporting the clicked on file type)* the user wishes
        to open in). If none yet exist, provide explanation (and link to,
        or even parse, a wiki to which sites can add their info for discovery?)
        1. Option to disable recording of such data discovered at
            various sites
1. *Other command line uses*
    1. *Command line for ExecutableBuilder UI*: Until web apps support file
        writing to arbitrary locations (WebActivity or new addition to
        WebAppFind?), one can at least treat ExecutableBuilder as itself
        an executable (and be able to bake it into
        an executable with its own icon, profile, etc.); also support other
        commands, so e.g., an AsYouWish application could provide an
        alternative interface to the built-in exec dialog (and trigger-able
        from WebAppFind); see Demo todos below on dog-fooding
        1. Since can't open browser action, just open within some other window
    1. *Expose full API to command line* for building executables
        1. Support additional command line arguments to *open up the executable
            builder dialog from the desktop with initial values* such as
            executable or icon path, desktop/remote file or web app URL,
            etc.; allow command the "Browse" dialog for desktop file to be
            opened via command line or immediately to the document URL
            autocomplete field (so that Executable Builder can easily add
            an add-on bar/toolbar button to go immediately to picking a
            file or URL)
    1. Allow executable builder to *build executables to run itself*
1. *Profiles*
    1. *Profile building*
    1. In place of or in addition to profiles, consider *contextualIdentities*
    1. Profile - Request to *work offline*, use the *profile without asking*,
        *open if browser is not open*.
    1. Implement if WebExtensions ever returns to XUL capabilities
        1. Conditional logic to *check if `-no-remote`* (preferred is open) and if
            not, open a specific profile or vice versa? (?)
        1. Add AsYouWish (and ExecutableBuilder and WebAppFind) optionally
            to profile folder (or global?) so apps can have
            *privileges from any profile*! (Ought to be desirable to have easy
            way to share back from one profile to another though in case
            people start building independent executables and then decide
            want to share again so as to allow independent executable)
        1. Try *installing WebAppFind and ExecutableBuilder extensions globally* so
            each profile (or multiple profiles--e.g., one profile for each
            WebAppFind method and/or different environments--e.g., multiple tabs
            but only for HTML reading) can access it? (since
            `--install-global-extension` is removed from Firefox now, should
            apparently use this instead (cross-browser?):
            <https://developer.mozilla.org/en-US/docs/Installing_extensions>)
1. Include ability to embed configuration information if WebAppFind
    command line starts to support more configuration options (e.g., *full
    screen mode* algorithm to require or at which to begin<!--
    or stage of type-detection if reimplementing `filetypes.json`
    -->).
1. *Features requiring extended privileges*
    1. Ability to *manage previously associated items* (including if added to
        `filebrowser-enhanced`) so that one knows which file types have
        been associated through this add-on
    1. Ability to proposed WebAppFind handle *multiple files on
        right-click* (cycling through arguments)? e.g., to open a group
        and then commit as a group (seems to be no "open with
        option when done this way); pass in *additional files for access*
        (e.g., to save to a config file, to build an icon file in a predictable
        location along with the other file data, etc.); if done by right-click,
        could do in `filebrowser-enhanced` at least
1. *Other executable types*
    1. Option to accept *URL shortcut file for dropping onto* and use its URL
        with hard-baked file params; see `urlshortcut` method for format of
        this file so as to be able to parse it for the URL; for Executable
        Builder, this would be HTML drag-and-drop, but could be AppleScript
        for direct
1. [AtYourCommand](https://github.com/brettz9/atyourcommand)
    1. Support *direct integration of commands* into AtYourCommand
1. *Demo* todos
    1. Demo dog-fooding *reading/editing our special template file type* once
        separation-of-concerns/serialize to-do is complete (so it could be
        handled by other apps as with any other WebAppFind file) though
        would need AYW for privileges (as also could do with SVG icons
        when done)
    1. Provide *sample batch file*; including ones which supply arguments
        based on the current directory's path; the path could determine the
        ultimate path of the to-be-created executable (or icon), a
        hard-coded desktop (or remote) file or web app URL to open

# Windows to-dos

(These to-dos are for whenever Windows functionality may be reimplemented.)

1. Ask Mozilla re: *`-new-instance`* on Windows (if it is supposed to create
    a new separate icon) and whether can add as feature, including for the
    sake of this add-on
1. *Deprecate executables* in WebAppFind when batch approach done.
1. See <https://stackoverflow.com/questions/21082752/ftype-assoc-priority-and-adding-to-openwithlist-from-the-command-line>
    re: OpenWith file association
1. Attempt, implement and document *editor associations* (which apparently
    cannot be set through the normal Windows UI as with "Open With") such
    as allowing a web app to read batch files:
    <http://windowsitpro.com/windows-server/how-can-i-change-editor-used-edit-batchcommand-files>
1. Build a batch file which can be invoked with a document file OR URL so
    that if in the task bar, a *file or URL might be droppable on it*
    (if this is possible to do)
1. *Add to favorites*
1. Open with batch ok for "Open with" but a problem with task bar
    (without tricks); any other reasons for exe over batch? can add to favorites?
    try *drag & drop*
    onto cmd alias to batch (another advantage of executables) and describe
    usage with ExecutableBuilder-created batch files. Can
    use drag-onto-batch approach to pass in file path to browser with protocol
    (e.g., for creating and validating but especially the file-path-specific
    view and editing): see
    <http://stackoverflow.com/questions/6852833/running-a-batch-script-by-right-clicking-any-file>
    and cf. to drag-and-drop into browser; allow drag-and-drop of files onto
    add-on icon for processing similar to C++-based right-click? Drag files
    onto batch icon as another option?
1. Save to *`SendTo` folder* (see [here](http://superuser.com/a/722699/156958)
    and [here](http://answers.microsoft.com/en-us/windows/forum/windows_vista-desktop/how-to-locate-the-sendto-folder-in-vista/78b16711-1135-4eb0-851a-8abae9bfe9ed)
    also for working with folders.
1. *SED file*
    1. Make SED file *more configurable* (and *savable* along with batch?)
    1. If there is any advantage to *expanding SED options*, or if we implement
        some more robust way to handle exe building, e.g., so as to be able to
        include an icon without creating a shortcut, we may expand the current
        UI to handle this.
1. Get code review of C++ file (e.g., `ShellExecuteEx` vs. `CallProcess`
    and `-remote`; other bugs?) and feedback on general approach,
    security concerns, etc. esp. *if batch won't work for needs*

## Appreciation

A special thanks to [Imgen Tata](http://www.pdfbatch.com/) for
fielding Windows questions (for the prior version of WebAppFind which
supported Windows).
