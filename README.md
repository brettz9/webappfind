# webappfind

**NOTE: While this extension has now been minimally reimplemented from version 2.0.0,
it is now Mac-only instead of Windows-only (what I happen to be developing on), and
a good deal of the functionality (especially using a `filetypes.json` file) has
not yet been restored. There have also been changes
in the API. Note too that the guides and info below are in the process of being
transitioned, so there may be some inaccurate relics. Moreover, the AtYourCommand
features have not been well-tested, and as they call the command line, use at
your own risk! Note too that AsYouWish is bundled, which is also potentially
dangerous if you grant permission to sites asking it; I hope to test more
completely and separate out AsYouWish, but it is exciting that it is not only
working, but the functionality for both AtYourCommand and ExecutableBuilder, which
had not been implemented previously, are now working. Executable Builder lets
websites silently advertise their support for certain file names and the extension can
import that info into a template for building an executable that can open local
files by default (or at least advertise support with "Open With...").**

<!--
TODO: Ensure this README and doc files actually reflects the implementation once complete.
-->

A [WebExtensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions)/Chrome
application to allow opening of files from the desktop (by double-click using
default file associations or "Open with...") into web applications.

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
delivered into the main browser add-on.<!--which, if no site is hard-coded
in the request, checks for an *optional* `filetypes.json` file within the
same directory as the right-clicked file to determine more precise
handling (the file extension will be used to determine the type otherwise).
Based on what is chosen/found and in the addon's preferences,
-->
Based on the site that is baked into the executable,
a handler web site will be sought in the browser to open the file of the
designated type (whether a generic or custom type) as well as allow--if
the "edit" type was the type chosen and a suitable handler site was
found to send back a save event--saves to be made back to the file.

WebAppFind allow you to make your data files accessible to other
programs and to give your users peace of mind to not be locked
into your application alone. It also allows your users to open your
custom data files in your program immediately<!-- and intelligently,
using whatever file extension you prefer, even if the file extension
is a generic one such as "json" or "js" while your own data file
follows a particular format or schema-->.

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

## User guide

See [User-Guide](./docs/User-Guide). Indicates usage of the executables on your
OS desktop, using the UI to make and associate one's own executables, and, for
those interested, how to work WebAppFind from the command line.

## Developers

### App Developer Guide

See [Developer-Guide](./docs/Developer-Guide.md). <!-- Includes information on the
`filestypes.json` file format.-->

### Design rationale

See [DESIGN](./docs/DESIGN.md).

### Contributing to WebAppFind

See [CONTRIBUTING](./docs/CONTRIBUTING.md)

## To-dos

See [TO-DOS](./docs/TO-DOS.md)
