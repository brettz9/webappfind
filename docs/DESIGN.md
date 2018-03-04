## Design choices

### Implementation notes

A direct visit to the protocol (including through XSRF) should provide no
side effects. However, it is possible that a malicious handler opened by
the user in "edit" mode could provide immediate side effects by saving
back data to overwrite the supplied file. This might be mitigated by a
configurable option to require the user's consent upon each save and/or
to inform the user of the proposed diffs before saving. But again this
will only be possible upon user initiation, only for the specific file or
files approved in a given session, and a site will only be usable as a
handler if the `filetypes.json` packaged with the data file designates
it as a default handler for the data file (and the user maintains the
preference to use this information) or if they have previously approved
a protocol site for the given type.

### Rationale for `filetypes.json` design

Although there may be some advantages to storing meta-data at the individual
file level, I did not see a very convenient way in which Windows would allow
the addition of arbitrary meta-data which the browser could easily query
(besides the registry, Windows does not appear to offer arbitrary addition
and editing of properties through its UI though programs, e.g., TortoiseGit,
are able to overlay the properties and are aware of file-level metadata
while adding their own). Having a JSON file allows developers to add some
type configuration (beyond the more generic info detectable by a file
extension) within the directory containing the data files, allowing for
introspection and modifications in a manner familiar to web developers.

The "fileMatches" array is an array of arrays as opposed to object
literal in order to ensure matches occur in reliable order across
systems. Other fields are keyed to type name (noting that
these must all be lower-case ASCII letters since web protocols only
allow these to work after the "web+").

Although I would eventually like to allow the add-on to accept hard-coded
URLs for the web apps (so that users or vendors could ensure that their
"Open With" instruction went to a particular URL regardless of add-on
settings) and while `filetypes.json` does provide for *default*-Handlers,
`filetypes.json` deliberately avoids providing a mechanism for obligating
the add-on to utilize a specific web app URL when opening files of a
given type. This is by design as I believe the open nature of operating
systems letting you choose what application to use for a given data file
ought to be maintained by default with web apps (and be unlike the even
worse status quo where websites not only don't allow other apps to read
their data but host your data exclusively at their own site, even if they at
least allow offline capability).

I am interested, however, in seeing the possibility for registering
"validate" modes independently from editors (but even here, I don't think
I'd want to allow hard-coding of validators). But again, I do intend to
allow hard-coding at the add-on level to provide some means of obligating
the use of a particular URL.

Note that although this particular collection of "Open With..."
executables and add-on is called "WebAppFind", the protocols are prefixed to
begin with the more generic phrasing "web+local" so as to allow openness
to the possibility that non-browser desktop apps could also handle reading
and editing of these offline-available, type-aware data files. The
`filetypes.json` file is similarly non-committal in terminology or behavior
about where the files will be opened, so desktop apps could utilize
`filetypes.json` when seeking to detect type information (beyond just
reading the file extension). (It is a potential to-do of this project to allow
`filetypes.json` to allow designation of local command line arguments to
apps besides the browser as well, but this would require first routing the
request through the browser or some batch/executable which did more
pre-processing including JSON parsing; see also
[atyourcommand](https://github.com/brettz9/atyourcommand)
for more ideas about this.)

The allowance for custom modes in addition to fundamental modes
helps the user avoid the need to swap handlers (or modify
`filetypes.json`) whenever they wish to go directly to an app (or a
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

### Rationale for API design

`postMessage` was chosen for having a familiar API and already
designed for potentially untrusted collaboration sources. (See the
README section "Comparison with similar WebAPI work" for other possibilities.)

Before discovering the command line handling, I originally sought to
have the executable create a temp file containing an ID and path
and mode info while supplying that to the add-on via a URL which
would in turn check the temp file (this approach might work for other
browsers if they do not allow add-ons to check command line arguments).
