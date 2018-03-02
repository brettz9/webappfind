I have patterned the following after <http://wiki.whatwg.org/wiki/MetaExtensions>,
although I'm not sure how policing of the status might be done–maybe some
form of rough consensus.

If the type is well-namespaced and not specific to some well-known
format (e.g., a JSON type "brettzamirinventory" should be fine whereas
one called "svg" would not), there should be no problem with it being
accepted (or at least not overridden in the future).

(Note that lower-case ASCII is required here in order to be used within
`registerProtocolHandler()` (prefixed by WebAppFind's "web+local"
convention).)

| File type | Brief description | Link to specification and/or schema | Conventional extension | Status |
| ------- |  ---------------- | --------------------- | -------- | ------ |
| *Type lower-case ASCII-only name here, e.g., "brettzamirinventory"* | *Describe the expected file format (e.g., "brettzamirinventory" is a subset of JSON which has the following 3 boolean properties...")* | *Link to a repository readme, etc. which describes the file type in more detail* | *Suggested file extension (This does not need to be distinct--e.g., the "brettzamirinventory" type could still use the "json" extension)* | *"Proposal" "Ratified", "Unendorsed"* |

# See also
* [Registered custom modes](./Registered-custom-modes.md)
