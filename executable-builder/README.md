# executable-builder

***NOTE: This project is not yet functional!! (However, if you
click the "Exec" icon in the add-on bar, the version in the master
branch ought to allow the user-facing UI to be viewed.)***

Executable Builder is a browser add-on (currently Firefox only) which
allows for the building of desktop executables (currently Windows only)
which can launch URLs and which are associated with their own icons.

Executable Builder provides particular functionality for use with
[WebAppFind](https://github.com/brettz9/webappfind) so that one
can build, in a more customizable manner, executables which can
pass a selected desktop file to a web application for viewing and
optional editing. (Windows will find the executable if the user right-clicks
"Open with..." over a given desktop file or if the user opts to select the
executable as the default application handling for files of a given file
extension.)

For an example of such WebAppFind behavior customization,
Executable Builder might be used to build an executable which
hard-codes a particular web app as the handler for the clicked-on
file instead of relying on WebAppFind's behavior of checking for a
protocol handler for the file's type (with the type determined by the
file's extension or, if present, a filetypes.json file in the same directory
as the file).

For any WebAppFind executable, one may choose the level of privilege
by which the web app may act on the supplied file (currently: view, edit,
viewbinary, or editbinary). One may customize how a new tab or window
is created, over-ride preferences, or default the web app display of the
opened file in full screen mode. Advanced users can include additional
batch commands or Firefox command line parameters or pass a custom
hard-coded string to the web app so that it may tweak its behavior
accordingly.

A particular benefit of the builder is to allow for the creation and
association of an icon with the executable which in turn allows for
display of the icon in Windows Explorer, the start menu, the task bar,
and in IE, in its location bar, tabs, favorites, and on the list of
"Your most popular sites" or "Frequent". If one opts to tie this executable
to a separate Firefox profile, this icon will show up in the task bar
independent from other Firefox windows. (If WebAppFind can be
adapted to support XULRunner instead of Firefox, one might be able
to get an even more light weight "executable" environment.)

The executables built by Executable Builder are actually just simple
files working with the command line which pass some additional
instructions to it. In the case of WebAppFind executables, these
will be passing command line instructions to Firefox.

Used in conjunction with Firefox profiles, one will get the benefits
of former projects like Mozilla Prism/Chromeless/WebRunner which
provided web applications as executables with their
ability to show up independently in the task bar, but with the added
optional ability of granting privileged features to web applications
(such as one may get if using Executable Builder/WebAppFind
with an AsYouWish application) and with the ability to utilize add-ons,
even a separate set of add-ons for each executable (and without
the problem that all of these other mentioned executable projects
are all now apparently defunct).

# Command line usage

Once the add-on is installed, the following can be used in calls to
Firefox in addition to Firefox's own flags.

- `-execbuildopen` - Open the Executable Builder dialog.

It is hoped that additional command line options will be added which
can cover the entire range of functionality available in the UI.

# To-dos for new Executable Builder (in WebAppFind)

1. Adapt to-dos below for current realities of being within WebAppFind
1. Split into generic and specific sections (so will allow building of
    executables regardless of whether used for WebAppFind or not);
    dynamically reveal sections based on 'Open with WebAppFind?'
    radio group selection, hard-coding or not, etc.
1. Profile building
1. Allow sites to advertise (in `<meta>`?) a number of file extensions
    (of a certain total limited byte size and number?) which they
    support, so that the following can be done:
    1. Add our format to <https://wiki.whatwg.org/wiki/MetaExtensions>
    1. Have option to change icon when files are available (requires
        (pseudo) content-script)
    1. Bake in a new command-line option to open into whatever the
        current tab is opened to
    1. Command line option to only return without error if the targeted
        site has the `meta` elements (also ensure returning errors
        for other problems).
    1. Give warning if currently opened site doesn't advertise support
        but trying to open in it
    1. Option for trusted sites (as with storage or notifications in
        Chrome?) that are present as a bookmark, with notification
        permissions, etc., to auto-add their file types to "Open with...".
    1. Pre-populate, in the browser action popup, a list of available
        file associations with possible baked in meta-data that can
        be tweaked by the user (e.g., edit could be changed to read-only
        though read-only should probably not be changeable), using favicon if
        no icon specified; ideally, this will show current state, e.g., if
        already associated, if changed, etc.; if no file associations are
        available, only show the option to create one's own executables
        from scratch
    1. Create desktop app (to communicate with native messaging app to use
        `windows` add-on privilege to open a dialog, asking which web
        app (that has previously advertised itself as supporting the
        clicked on file type) the user wishes to open in). If none
        yet exist, provide explanation (and link to, or even parse,
        a wiki to which sites can add their info for discovery?)
        1. Option to disable recording of such data discovered at
            various sites

# Todos

1. IMPORTANT: Upgrade my quick-and-dirty, ironically non-concern-separated
    data files approach in favor of some kind of data-only form serialization
    (in case fields change), e.g., https://github.com/macek/jquery-serialize-object
1. IMPORTANT: See `execute.js`, `executableResponses.js`, and
    `componentRegistrations.js` for specific todos already under-way
1. Ask Mozilla re: `-new-instance` on Windows (if it is supposed to create
    a new separate icon) and whether can add as feature, including for the
    sake of this add-on
1. Implement command line handler to support auto-opening exec dialog
    on start so that until web apps support file writing to arbitrary locations
    (WebActivity or new addition to WebAppFind?), one can at least treat
    ExecutableBuilder as itself an executable (and be able to bake it into
    an executable with its own icon, profile, etc.); also support other
    commands, so e.g., an AsYouWish application could provide an
    alternative interface to the built-in exec dialog (and triggerable from
    WebAppFind); see Demo todos below on dog-fooding
1. Add AsYouWish (and ExecutableBuilder and WebAppFind) optionally
    to profile folder (or global?) so apps can have
    privileges from any profile! (Ought to be desirable to have easy
    way to share back from one profile to another though in case
    people start building independent executables and then decide
    want to share again so as to allow independent executable)
1. Attempt, implement and document editor associations (which apparently
    cannot be set through the normal Windows UI as with "Open With") such
    as allowing a web app to read batch files:
    http://windowsitpro.com/windows-server/how-can-i-change-editor-used-edit-batchcommand-files

# Other dependent read-me todos:

1. Remove from WebAppFind/filebrowser-enhanced to-dos any items
    completed in process of this add-on

# Windows to-dos

1. Deprecate executables in WebAppFind when batch approach done.
1. Comparing to exes? adding to favorites, etc.? (any other
    unimplemented left to replicate and add as a todo?)
1. Open with batch ok for "Open with" but a problem with task bar
    (without tricks); any other reasons for exe over batch? try drag & drop
    onto cmd alias to batch (another advantage of executables) and describe
    usage with ExecutableBuilder-created batch files. Can
    use drag-onto-batch approach to pass in file path to Firefox with protocol
    (e.g., for creating and validating but especially the file-path-specific
    view and editing): see
    http://stackoverflow.com/questions/6852833/running-a-batch-script-by-right-clicking-any-file
    and cf. to drag-and-drop into browser; allow drag-and-drop of files onto
    add-on icon for processing similar to C++-based right-click? Drag files
    onto batch icon as another option?
1. Save to `SendTo` folder (see [here](http://superuser.com/a/722699/156958)
    and [here](http://answers.microsoft.com/en-us/windows/forum/windows_vista-desktop/how-to-locate-the-sendto-folder-in-vista/78b16711-1135-4eb0-851a-8abae9bfe9ed)
    also for working with folders.

# Possible todos

1. Profile - Request to work offline, use the profile without asking,
    open FF is not open.
1. Complete i18n work
1. Support direct integration of commands into
    [atyourcommand](https://github.com/brettz9/atyourcommand)
1. Ability to manage previously added items (including if added to
    extended filebrowser) so that one knows which file types have
    been associated through this add-on
1. Include ability to embed configuration information if WebAppFind
    command line starts to support more configuration options (e.g., full
    screen mode, or stage of type-detection algorithm to require or at
    which to begin).
1. Try installing WebAppFind and ExecutableBuilder extensions globally so
    each profile (or multiple profiles--e.g., one profile for each WebAppFind
    method and/or different environments--e.g., multiple tabs but
    only for HTML reading) can access it? (since --install-global-extension
    is removed from FF now, should apparently use this instead:
    https://developer.mozilla.org/en-US/docs/Installing_extensions )
1. If WebAppFind implements eval()-like behavior (see its todos for
    more on this possibility), create batch files (also for Linux/Mac) which
    pass evalable JS files (or embed JS strings) as a command line
    argument which will be sent to FF for (privileged) evaluation along with
    the optional WebAppFind files on which they are executed.
1. Ability to pass in string of HTML/JS to the add-on command line to
    execute that instead of a specific file (so that an exe could include
    the launching app and processing within one file)? (removing last?
    advantage of exes beyond allowing file dropping/right-click usage
    and own task bar icons? example: open a specific file, that gets sent
    to a particular eval: protocol which listens for the content and then
    passes it to a script that it dynamically loads
1. Get code review of C++ file (e.g., `ShellExecuteEx` vs. `CallProcess`
    and `-remote`; other bugs?) and feedback on general approach,
    security concerns, etc. esp. if batch won't work for needs
1. Ability to proposed WebAppFind handle multiple files on
    right-click (cycling through arguments)? e.g., to open a group
    and then commit as a group (seems to be no "open with
    option when done this way); pass in additional files for access
    (e.g., to save to a config file, to build an icon file in a predictable
    location along with the other file data, etc.)
1. Conditional logic to check if `-no-remote` (preferred is open) and if
    not, open a specific or vice versa? (?)
1. Demo todos
    1. Demo dog-fooding reading/editing our special file type once
        separation-of-concerns/serialize to-do is complete (so it could be
        handled by other apps as with any other WebAppFind file) though
        would need AYW for privileges (as also could do with SVG icons
        when done)
1. SED file
    1. Make SED file more configurable (and savable along with batch?)
    1. If there is any advantage to expanding SED options, or if we implement
        some more robust way to handle exe building, e.g., so as to be able to
        include an icon without creating a shortcut, we may expand the current
        UI to handle this.

# Appreciation

A special thanks to [Imgen Tata](http://www.pdfbatch.com/) for
fielding Windows questions.
