## Installing development tools

1. `npm -g i pkg` - Uses [pkg](https://github.com/zeit/pkg)
1. `npm -g i web-ext` - Uses
    [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext)

## Testing

*Note: The "all" options—which are for installing for all users on the
machine—[do not currently work](https://github.com/zeit/pkg/issues/136#issuecomment-308794640).
Note also that if `pkg` is not used, the `node` on one's path will be used instead.
For now, `pkg` should be used.*

1. `npm run (pkg-)installer(-all)-(lint|run|addon)` - Shortcut options for
    the following two steps
    1. `npm run (pkg-)installer(-all)` - Shortcut for the following two steps
        1. `npm run build-(pkg-)installer(-all)` - Shortcut for the following
            1. If `pkg`, `build-pkg-native-apps(-all)` - builds the Node
                executables for native messaging
            1. `build-(pkg-)installer-component(-all)` - Builds installations
                on the user machine
            1. If `pkg`, `npm link`
        1. `npm run run-(pkg-)install` - Executes the installer (to register
            as part of native messaging host files)
    1. One of:
        1. `npm run lint` - Runs ESLint and `web-ext lint` (which uses
            `addons-linter`)
        1. `npm run run` - Test the web extension in Firefox
        1. `npm run addon` - Building the add-on file for distribution,
            e.g., on AMO
