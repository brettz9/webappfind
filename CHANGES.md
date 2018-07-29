## 3.0.0

- Switch to WebExtensions/Chrome

## 2.0.0

- Breaking API change: Switch to object-based postMessage API

## 1.2.1

- Update `package.json` for Addon SDK `jpm` builder

## 1.2.0

- Fix an issue in passing file URI when `fallbackToBrowserUsingFilePath` is enabled and caught
- Support passing `webappdir` flag along with a hard-coded `webappsite` (note that the already existing files processing does not yet allow hard-coded URLs as with this new flag, nor does the `webappdir` directory passing yet support `filetypes.json` processing)
- Add simple demo for new flag (must call from command line or use SendTo)

## 1.1.1

- Fix empty tabs being populated with mode errors when opened from Thunderbird (or any other similar command line invocation which causes a command line handler to be invoked despite the command not actually being found!)

## 1.1.0

- Report more error-checking info
- i18n-ize
- Minor: README and doc updates
- Minor: Sample filetypes.json updates
- Demo updates
    - SVG-Edit demo updates
    - OCR demo (GOCR/Ocrad) using pdf.js
    - CSV demo
    - CodeMirror update
    - Fix themes/cookies in CodeMirror demos
    - javascript.css changes

## 1.0.1

- Make `package.json` more readable

## 1.0.0

- Breaking changes
    - Change command line `-webapp-<mode> <path>` to `-webappdoc <path>` and `-webappmode <mode>` (and with a new optional `-webappcustommode <custom mode>`); also change within executables
    - Change away from substituting individual variables to replacing a single `%s` with a single JSON-stringified object (in default handlers as well as occurs in protocol handlers)
    - Change terminology of "method" to "mode" (view, edit, etc.) including within the preference name noProtocolFallbackToRegistrationMode and executable source
- Add path to `document.title` in the HTML demo

## 0.2.1 (Post-AMO Builder release)

- Fix bug with duplication of events upon additional opening of the same file
