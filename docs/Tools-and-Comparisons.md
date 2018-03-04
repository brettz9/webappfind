## Tips for using with other tools

<!--
Todo: If AsYouWish is reimplemented for WebExtensions (using NativeMessaging)
If you wish to open desktop files into web apps but which for those web apps
to have higher privileges than just writing back to the opened file, see
[AsYouWish](https://github.com/brettz9/asyouwish/).
-->

Remember that besides being able to launch WebAppFind from the desktop,
you can also launch from the command line, including from within the likes of
desktop apps as well, such as [Notepad++](http://notepad-plus-plus.org/).
(See also [atyourcommand](https://github.com/brettz9/atyourcommand) for
some desired todos regarding standardizing argument types.)

<!--
Todo: Once WebAppFind is reimplemented for Windows, can uncomment this:

In the case of Notepad++, one can go to the "Run" menu and choose the
"Run..." item, and then specify the path of the relevant WebAppFind
executable followed by a space and `"$(FULL_CURRENT_PATH)"`. This
will allow you to open the current file in a web app. You may
also wish to click the "save" button there which allows specifying a hot
key. If you wish to supply other arguments, see the relevant
[Notepad++ wiki page](http://sourceforge.net/apps/mediawiki/notepad-plus/index.php?title=External_Programs).
Note that as WebAppFind does not yet support a global user `filetypes.json`
file, you will first need to allow a site to register itself as a protocol
handler for the types of files you wish to open (based on file
extension) or add a `filetypes.json` file within the directory of the file
of interest (to which you can easily get in Notepad++ by "Open
Containing Folder in Explorer", then add the file by right-click, and then
open it); otherwise, you may get a message in a browser tab
that a handler was not found for the supplied file's extension.
-->

If you want to go in the other direction, from web documents to the desktop
(or from arbitrary web documents to web apps), you might watch
[AtYourCommand](https://github.com/brettz9/atyourcommand) which when
it may be finished should help users to do this.

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
