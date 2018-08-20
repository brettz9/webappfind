# Registered custom modes

I have patterned the following after
<http://wiki.whatwg.org/wiki/MetaExtensions>, although I'm not sure how
policing of the status might be done--maybe some form of rough consensus.

Note that the custom modes are supplied optionally in addition to the
fundamental modes ("view", "edit") and,
unlike the fundamental modes, custom modes do not trigger any
WebAppFind-specific behavior; they are intended, however, to trigger
different behaviors within a web application, however. An example of
a custom mode would be "source" which is aimed at allowing one to
"view" (or "edit", etc.) the source code of a given type, as opposed
to displaying it in some other (generic) manner (e.g., WYSIWYG view).
Another example might be a "validate" mode to supply data to a web
application for validation of the format.

For the sake of clarity, a custom mode should not have the same name
as one of the fundamental modes.

If the custom mode is well-namespaced and not specific to some well-known
format (e.g., "brettzamiroutline" should be fine whereas one called "svg"
would not), there should be no problem with it being accepted (or at least
not overridden in the future).

(Note that lower-case ASCII is required here in order to be used within
`registerProtocolHandler()` (prefixed by WebAppFind's "web+local"
convention).)

Please also note that WebAppFind plans to support the supplying of
arbitrary arguments to a web app, so custom modes really should not
be triggering minor options, but rather some important mode, and which
would ideally be reusable across fundamental modes (i.e., whether one
is viewing or editing) and even reusable across different file types (e.g.,
"source" aims to trigger the viewing or editing of source code of HTML
types, JSON types, etc.).

| Custom mode | Brief description | Link to specification | Type association | Status |
| ------- |  ---------------- | --------------------- | -------- | ------ |
| *Type lower-case ASCII name here, e.g., "brettzamiroutline"* | *Describe the expected behavior (e.g., "The custom mode 'brettzamiroutline' should trigger a view of HTML which colors section headings, makes them collapsible, ...")* | *Link to a repository readme, etc. which describes the mode in more detail* | *Known or required type associations--e.g., "brettzamiroutline" type is associated with a view of "html" files or other WYSIWYG human-readable document formats* | *"Proposal" "Ratified", "Unendorsed"* |
| ***source*** | View any file type according to its source code rather than to a conventional rendering of the format (e.g., for HTML, it would show the tag mark-up instead of a WYSIWYG view). | | (Any file type which has a conventional presentation form distinct from its source code) | Ratified |

# See also
* [Registered file types](./Registered-file-types.md)
