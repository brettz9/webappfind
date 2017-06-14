# webappfind

VERSION INCOMPLETE!!!

## Comparison with alternatives

### Relative disadvantages of alternatives

1. Node opening file and passing
    [command](https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options)
    [line arguments](https://www.ghacks.net/2013/10/06/list-useful-google-chrome-command-line-switches/)
    into browser to open file with GET parameters

    1. This is limited by string length (and possible security problems if
        the user passes along the URL).

    1. Listening by GET parameters may conflict with existing parameters

    1. Listening by GET parameters may not work with offline applications
        that rely on hash

1. Node opening file and passing command line arguments into browser to
    open file and posting contents to another Node server hosting the web app

    1. Forces user to be subject to any non-agnostic listening requirements (a
        receiving app would know the origin and reject the contents).

    1. Receiving app (where one would most frequently be developing) cannot be
        a static file web application

### Advantages of our configuration

1. Our code supports various platforms and browsers out of the box.

1. By using `pkg`, we can avoid forcing users to install Node.

1. Our `filetypes.json` approach offers easy reusability among non-developers
    (or non-Node developers)

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
