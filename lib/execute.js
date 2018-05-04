/* eslint-env webextensions */

import * as ExecBridge from '/node-bridges/ExecBridge.js';
import jsStringEscape from '/vendor/js-string-escape/dist/index-es.js';

export default async function execute (name, details) {
    if (!details) {
        // Todo: supply defaults based on current page
    }
    const {commands} = await browser.storage.local.get('commands');
    const {[name]: data} = JSON.parse(commands);
    const {args, files, urls, dirs} = data;
    console.log('data', data);
    console.log('nnn', name, args, files, urls, dirs);

    console.log('execFile', ExecBridge.execFile);
    /*
    ExecBridge.execFile(
        // Todo: Apply same substitutions within executable path in case it
        //          is dynamic based on selection?
        data.executablePath,
        // Todo: handle hard-coded `dirs`;
        //   ability to invoke with link to or contents of a sequence of
        //   hand-typed (auto-complete drop-down) local files and/or URLs
        //   (including option to encode, etc.)
        // Todo: If `dirs` shows something is a directory, confirm the
        //         supplied path is also (no UI enforcement on this currently)
    */
    function escapeValue (s) {
        // Escape result so will counter the subsequent unescaping
        // Todo: We'll use `js-string-escape` for a safe string (also if we
        //        use within `eval()`)
        return '"' + jsStringEscape(s).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '"';
    }
    console.log('argsMap',
        args.map((argVal) => {
            // We use <> for escaping
            // since these are disallowed anywhere
            // in URLs (unlike ampersands)
            // Todo: Use real parser or `eval` with variables replaced using
            //    https://github.com/brettz9/js-string-escape
            return argVal.replace(/<(.*?)>/g, (n0, n1) => {
                if ([
                    'contentType',
                    'pageURL', 'pageTitle',
                    'pageHTML', 'bodyText',
                    'selectedHTML', 'selectedText',
                    /* 'linkPageURLAsNativePath',
                    'linkPageTitle', 'linkBodyText', 'linkPageHTML',
                    'imageDataURL', 'imageDataBinary' */
                    'favIconUrl',
                    'linkText', 'linkUrl',
                    'frameUrl', 'srcUrl', 'mediaType',
                    'modifiers'
                ].includes(n1)) {
                    return escapeValue(details[n1] || '');
                };
                const urlNum = n1.match(/^url(\d+)$/);
                if (urlNum) {
                    return escapeValue(urls[parseInt(urlNum[1], 10) - 1]);
                }
                const fileNum = n1.match(/^file(\d+)$/);
                if (fileNum) {
                    return escapeValue(files[parseInt(fileNum[1], 10) - 1]);
                }
                return ''; // Todo: Report an error
            }).replace(/&lt;/g, '<').replace(/&amp;/g, '&');
            /*
            // We could take this approach, but maybe easier for now to
            //   just let user pipe to temporary files or what not:
            //   https://serverfault.com/questions/40284/create-virtual-file-from-bash-command-output
            return argVal.replace(/<.*?>/g, (n0) => {
                const saveTemp = (new RegExp(
                    '^saveTemp' +
                    '(?:\\s+overwrite=(yes|no|prompt))?' +
                    '(?:\\s+continue=(yes|no))?'
                    // What to do when a file in the location already exists.
                    // Whether to continue execution when a file is found in
                    //    the location and "overwrite" is "no" or "prompt"
                    //    with a resulting "no" answer by the user.
                    //  Can be followed by %N where "N" is the number of
                    //     the directory argument below
                )).exec(n0);
                if (saveTemp) {
                    const [overwrite, cont] = saveTemp;
                    console.log('overw', overwrite, cont);
                    // return;
                }
            }).replace(/&lt;/g, '<').replace(/&amp;/g, '&');
            */
            /*
            return XRegExp.replace(
                argVal,
                // Begin special syntax
                new XRegExp('<' +
                    // saveTemp with its options
                    '(?:(?<saveTemp>save_temp)' +
                        '(\\s+?:overwrite=(?<overwrite>yes|no|prompt))?' +
                        '(?:\\s+continue=(?<cont>yes|no))?' +
                    '\\s+)?' +
                    // Encoding
                    '(?:(?<ucencode>ucencode_)|(?<uencode>uencode_))?' +
                    // Escaping
                    '(?<escquotes>escquotes_)?' +
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
                        // Work with URLs as well as files? (if not correct,
                        //    `messages.json` `prefix_save_temp` text)
                    }
                    // Other args here

                    // Todo: Ensure substitutions take place within `eval()` first
                    // Todo: Ensure escaping occurs in proper order
                    // `ucencode` needs `encodeURIComponent` applied
                    // For `linkPageURLAsNativePath`, convert to native path
                    // Allow `eval()`
                    // Todo: Implement `save_temp` and all arguments
                    // Retrieve "linkPageTitle", "linkBodyText", or "linkPageHTML"
                    //    as needed and cache
                    // Retrieve "imageDataBinary" and "imageDataURL" (available
                    //    via canvas?) as needed (available from cache?)
                    // Move ones found to be used here to the top of the
                    //    list/mark in red/asterisked
                },
                'all'
            // Todo: Escape newlines (since allowable with textarea args)?
            ).split('').reverse().join('')
                .replace(/(?:<|>)(?!\\)/g, '').split('').reverse().join('')
                .replace(/\\(<|>)/g, '$1');
            */
        })
    );
    // Todo: return Promise when completed (whose errors can be caught) whose
    //        resolved value is the command line output
}
