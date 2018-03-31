/* globals XRegExp */
function execute (name, details) { // eslint-disable-line no-unused-vars
    if (!details) {
        // Todo: supply defaults based on current page
    }
    const data = ss.commands[name];
    /*
    createProcessAtPath(
        data.executablePath, // Todo: Apply same substitutions within executable path in case it is dynamic based on selection?
        // Todo: handle hard-coded data.files, data.urls, data.dirs; ability to invoke with
        //   link to or contents of a sequence of hand-typed (auto-complete drop-down)
        //   local files and/or URLs (including option to encode, etc.)
        // Todo: If data.dirs shows something is a directory, confirm the supplied path is also (no UI enforcement on this currently)
    */
    console.log(
        data.args.map((argVal) => {
            // We use <> for escaping
            // since these are disallowed anywhere
            // in URLs (unlike ampersands)

            return XRegExp.replace(
                argVal,
                // Begin special syntax
                new XRegExp('<' +
                    // saveTemp with its options
                    '(?:(?<saveTemp>save-temp)' +
                        '(\\s+?:overwrite=(?<overwrite>yes|no|prompt))?' +
                        '(?:\\s+continue=(?<cont>yes|no))?' +
                    '\\s+)?' +
                    // Encoding
                    '(?:(?<ucencode>ucencode-)|(?<uencode>uencode-))?' +
                    // Escaping
                    '(?<escquotes>escquotes-)?' +
                    // Begin main grouping
                    '(?:' +
                        // Eval with body
                        '(?:eval: (?<evl>[^>]*))|' +
                        // Other flags
                        ([
                            'pageURL', 'pageTitle', 'pageHTML',
                            'bodyText', 'selectedHTML', 'selectedText',
                            'linkPageURLAsNativePath',
                            'linkPageTitle', 'linkBodyText', 'linkPageHTML',
                            'imageDataURL', 'imageDataBinary'
                        ].reduce((str, key) => {
                            return str + '|(?<' + XRegExp.escape(key) + '>' + XRegExp.escape(key) + ')';
                        }, '').slice(1)) +
                    // End the main grouping
                    ')' +
                // End special syntax
                '>'),
                ({
                    saveTemp,
                    overwrite, cont,
                    ucencode, uencode, escquotes, evl,
                    pageURL, pageTitle, pageHTML, bodyText,
                    selectedHTML, selectedText,
                    linkPageURLAsNativePath, linkPageTitle, linkBodyText,
                    linkPageHTML, imageDataURL, imageDataBinary
                }) => {
                    if (saveTemp) {
                        // overwrite
                        // cont
                    }
                    // Other args here

                    // Todo: Ensure substitutions take place within eval() first
                    // Todo: Ensure escaping occurs in proper order
                    // ucencode needs encodeURIComponent applied
                    // For linkPageURLAsNativePath, convert to native path
                    // Allow eval()
                    // Todo: Implement save-temp and all arguments
                    // Retrieve "linkPageTitle", "linkBodyText", or "linkPageHTML" as needed and cache
                    // Retrieve "imageDataBinary" and "imageDataURL" (available via canvas?) as needed (available from cache?)
                    // Move ones found to be used here to the top of the list/mark in red/asterisked
                },
                'all'
            // Todo: Escape newlines (since allowable with textarea args)?
            ).split('').reverse().join('')
                .replace(/(?:<|>)(?!\\)/g, '').split('').reverse().join('')
                .replace(/\\(<|>)/g, '$1');
        })
        /*
        , // Todo: Reenable?
        {
            errorHandler (err) {
                throw (err);
            },
            observe (aSubject, aTopic, data) {
                if (aTopic === 'process-finished') {
                    emit('finished');
                }
            }
        }
    );
    */
    );
}
