## 3.4.0

- Security fix: Escape backslash (courtesy lgtm); possible if users
    inputs them for selectors in add-on form
- Refactoring: Avoid unneeded check (courtesy lgtm)
- Linting: Comment out unused code; avoid warning for expression
    known to Firefox through `executeScript`; add `lgtm.yml` (LGTM)
- Update: local Jamilih copies based on latest version
- npm: Bump Jamilih
- npm: Update devDeps

## 3.3.0

- Enhancement (AYC): Expose `contextSelector` and `contextSelectorHTML`

## 3.2.0

- Fix: Further i18n (extension name)
- Fix (AYC): Properly listen for (and supply) for `details` (headers)
- Fix (AYW): Ensure check for previous load actually works
- Enhancement (AYW): Allow AsYouWish to persist permissions for
    whitelisted sites; avoid need for confirmation in such cases; work on
    auto-approved WAF->AYW sites (need to still trigger AsYouWish injection)
- Enhancement (AYW): Add options toward adding allowed sites
- Linting (ESLint): Override new recommended and lint
- Refactoring: Better logging, strict mode
- npm: Update devDeps (and make use of updated Jamilih)

## 3.1.0

- Fix (AYC): More accurate name: "Substitutions used" -> "Substitutions available"
- Fix (AYC): Cancel button not closing window
- Fix (AYC): Avoid `undefined` showing for `details`
- Fix (AYC): Keep open (ensure it closes unless checkbox clicked
- Fix (AYC): Show delete button
- Fix (WAF): Ensure executables with hard-coded files work
- Docs: Overhaul to reflect current behavior
- License: Update date and indicate clearly it is MIT-style
- Enhancement (WAF/ExecutableBuilder): Allow `filePicker` argument to indicate
    should open file picker when there are no arguments
- Enhancement (ExecutableBuilder): Ability to build executable accepting
    string argument
- Enhancement (AYC): Provide WebAppFind executable in pull-down
- Enhancement (AYC): Display command results

## 3.0.4

- Fix (AYC): Ensure selection exists; custom properties from window not
    selection
- Fix (AYC): Work on special case when executable is WebAppFind
- Fix (AYC): Avoid string escaping (arguments processed without need for
    quotes)
- Fix (AYC): Add and show description for `details` (headers); currently
    not working
- Fix (AYC): Items interfering with `all_urls`?

## 3.0.3

- Fix: Add `length` to binary saves (is getting lost in JSON parsing)
- Fix logging
- npm: Update devDep (ESLint)

## 3.0.2

- Rename JS binary so can work as is without install (by adding to PATH)
- Fix: MIME type registration (and improved logging)
- Log binary data length
- Remove `yarn.lock`

## 3.0.1

- Fix path resolution

## 3.0.0

- Switch to WebExtensions/Chrome, now Mac-only instead of Windows-only; also
    `filetype.json` behavior has not been reimplemented (at least not yet)

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
