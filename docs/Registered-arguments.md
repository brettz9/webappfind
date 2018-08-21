# Registered arguments

This page is for tracking well-known argument properties of a format that can
be leveraged across applications.

Arguments may be used for passing configuration such as theme, without needing
to pollute the URL.

A special type of (reserved) argument is `customModes` which is an array of
modes into which the file is being opened. These should generally represent
a special and fairly fundamental category of operation into which the file
is being opened, such as viewing source code, though it will likely be more
specific than the basic (and required) `mode` (i.e., `view`, `edit`, or
`shell`).

| Argument property |  Description | Link to specification and/or schema | Status (*"Proposal" "Ratified", "Unendorsed"*) |
| ----------------- |  ----------- | ----------------------------------- | -------------------------- |
| `locale` | A BCP 47 language code | | Proposal |
| `stylesheets` | The path of CSS stylesheets to be applied to the content | | Proposal |
| `theme` | The name of a theme (string) | | Proposal |
| `modes` | An array of custom modes | See [Registered-custom-modes](./Registered-custom-modes.md) | Ratified
