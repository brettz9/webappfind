# webappfind

VERSION INCOMPLETE!!!

## Development

### Installing development tools

1. `npm -g i pkg`

### Building the Node executable

1. `npm run build`

## To-dos

1. Test `manifest.json` file, etc.

1. In `pkg` file, after checking registry (how to avoid repeating??), set-up Node WebSockets to
     listen and pass on to add-on (which will open website and `postMessage` into it and be able
     to handle opposite direction, including for writing file contents back to disk, but also
     for AtYourCommand functionality)

1. Use `webextension-polyfill` to ensure working on FF and Chrome

1. Test with "Open with..." to open file in a Node script which communicates via Node WebSockets

1. Add back demos from old `webappfind`

1. Remove old `webappfind` files/info (e.g., on `filetypes.json`) if making package more agnostic
