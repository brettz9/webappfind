# webappfind

VERSION INCOMPLETE!!!

This is a [WebExtensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) application.

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

1. `npm -g i pkg` - Uses [pkg](https://github.com/zeit/pkg)
1. `npm -g i web-ext` - Uses [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext)

### Testing

1. `npm run installer` - Shortcut for the following two steps
    1. `npm run build-installer` - Builds the Node executables for native messaging and
        installations on the user machine
    1. `npm run execute` - Executes the installer
1. `npm run lint` - Runs ESLint and `web-ext lint` (which uses `addons-linter`)
1. `npm run run` - Test the web extension in Firefox
1. `npm run build-addon` - Building the add-on file for distribution, e.g., on AMO

## To-dos

1. Set executable permissions on `bin/native-app`

1. Overcome "Cannot find module 'regedit'" error when building on non-Windows

1. In `pkg` file, after checking registry (how to avoid repeating??), set-up Node WebSockets to
     listen and pass on to add-on (which will open website and `postMessage` into it and be able
     to handle opposite direction, including for writing file contents back to disk, but also
     for AtYourCommand functionality)

1. Refactor this extension to be a bridge between Node (including
    user-installed packages) and browser/browser add-ons/web-sites.

    1. Support passing from Node into other add-ons

        1. Is there a way to overcome `allowed_extensions`/`allowed_origins`?
            hard-coded limits; is the app manifest read on install only, on
            browser start-up, or on each access? If the latter, could
            restartlessly dynamically modify the file ourselves. Otherwise
            users may have to bundle this code for each add-on.

    1. Might rely on "add-ons" of `npm` packages designated to be installed
        (and via `package.json` config or custom config?) run on start-up.

    1. For an added security layer, might only let bridge work with
        user-designated packages.

    1. Use socket instead of stateless server to relay flexibly in either
        direction? But call "add-on"'s main script once at start-up.

    1. Have "add-ons" indicate their privilege level (e.g., nodeToBrowser,
        browserToNode) and high-level permission (e.g., `postMessage`
        `contextMenu`).

    1. Find best means possible (ideally even `eval`) to get full privileges
        (whether originating from web-site as in AsYouWish, from desktop,
        as in old WebAppFind, or from another add-on) out of
        browser/browser add-on. If not, emulate own via `postMessage` messaging.

    1. Example "add-ons"

        1. The old WebAppFind behavior could be one of these add-ons

            1. Extend `filetypes.json` to support passing into a specific
                add-on?

        1. Like the old WebAppFind behavior but allow for general
            URL-opening mechanism (including for passing of messages)
            in addition to specific `filetypes.json` approach and have
            mechanism also for passing content into another add-on

            1. Test with "Open with..." to open file in a Node script
                which communicates via Node WebSockets

        1. AtYourCommand to run once to set-up user's context menus (and
            desktop-file-opening behaviors)

        1. AsYouWish to allow websites to communicate into the browser or
            to eval-able Node code; at minimum start shared,
            site-agnostic storage

1. Add back demos and sample files from old `webappfind`.

1. Remove old `webappfind` files/info (e.g., on `filetypes.json`) if
    making package more general purpose.

## To-dos (Lower priority)

1. `manifest.json` additions?

    1. Set `protocol_handlers: [{protocol: "ext+waf", name: "WebAppFind", uriTemplate: "https://...%s"}]`; e.g., for site to register itself for a type

    1. Set `omnibox: {keyword: "waf"}` for special auto-complete to send to add-on

    1. Set `options_ui: {page: "webappfind-options.html"}` and/or `sidebar_action`?

    1. Set `permissions`/`optionalPermissions`

    1. Set `incognito` on whether/how to work in Incognito mode

    1. Set `devtools_page` in `manifest.json` to replicate Node console?

    1. Use `web_accessible_resources` for exposing any resources to websites?
