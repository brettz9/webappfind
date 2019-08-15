/* eslint-env webextensions */
/* eslint-disable node/no-unsupported-features/es-syntax */

import * as ExecBridge from '/node-bridges/ExecBridge.js';
// import jsStringEscape from '/vendor/js-string-escape/dist/index-es.js';

export const executeCommand = async function (name, tabData) {
  const {commands} = await browser.storage.local.get('commands');
  const {[name]: detail} = JSON.parse(commands);
  return execute(detail, tabData);
};

export const execute = async function (detail, tabData) {
  const {executablePath} = detail;
  console.log('executablePath', executablePath);
  const args = await getCommandArgs(detail, tabData);
  // console.log('ExecBridge', executablePath, ExecBridge);
  // console.log('args', args);
  // Todo: Change to spawn?
  try {
    const result = await ExecBridge.execFile(
      // Todo: Apply same substitutions within executable path in case it
      //      is dynamic based on selection?
      executablePath,
      // Todo: handle hard-coded `dirs`;
      //   ability to invoke with link to or contents of a sequence of
      //   hand-typed (auto-complete drop-down) local files and/or URLs
      //   (including option to encode, etc.)
      // Todo: If `dirs` shows something is a directory, confirm the
      //     supplied path is also (no UI enforcement on this currently)
      args
    );
    console.log('resultExec', result);
    return result;
  } catch (err) {
    console.log('Exec Erred:', err, err.toString(), executablePath, args);
    return undefined;
  }
};

export const getCommandArgs = async function (detail, tabData) {
  const {args, files, urls, dirs} = detail;
  function escapeValue (s) {
    // Escape result (for our XMLish escape) so will counter the subsequent unescaping
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    // Seems we actually do not want this as args parsed after equals regardless of
    //  spaces, apparently because they are separate args to `execFile`
    /*
    // Todo: We'll use `js-string-escape` for a safe string (also if we
    //    use within `eval()`)
    return '"' + jsStringEscape(s)
      // Todo: Replace `jsStringEscape` with https://github.com/mathiasbynens/jsesc#quotes
      //   to avoid escape/unescape here of single quotes
      .replace(/\\'/g, "'")
      // Escape result (for our XMLish escape) so will counter the subsequent unescaping
      .replace(/&/g, '&amp;').replace(/</g, '&lt;') + '"';
    */
  }

  console.log('detail', detail);
  console.log('nnn', args, files, urls, dirs);

  const newArgs = args.map((argVal) => {
    // We use <> for escaping
    // since these are disallowed anywhere
    // in URLs (unlike ampersands)
    // Todo: Use real parser like <https://github.com/kach/nearley>
    //  or `eval` with variables replaced using
    //  https://github.com/brettz9/js-string-escape
    return argVal.replace(/<(.*?)>/g, (n0, n1) => {
      if ([
        'contentType',
        'pageURL', 'pageTitle',
        'pageHTML', 'bodyText',
        'selectedHTML', 'selectedText', 'contextSelector', 'contextHTML',
        /* 'linkPageURLAsNativePath',
        'linkPageTitle', 'linkBodyText', 'linkPageHTML',
        'imageDataURL', 'imageDataBinary' */
        'favIconUrl',
        'linkText', 'linkUrl',
        'frameUrl', 'srcUrl', 'mediaType',
        'modifiers',
        'details'
      ].includes(n1)) {
        return escapeValue(tabData[n1] || '');
      }
      const urlNum = n1.match(/^url(\d+)$/);
      if (urlNum) {
        return escapeValue(urls[parseInt(urlNum[1]) - 1]);
      }
      const fileNum = n1.match(/^file(\d+)$/);
      if (fileNum) {
        return escapeValue(files[parseInt(fileNum[1]) - 1]);
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
        //  the location and "overwrite" is "no" or "prompt"
        //  with a resulting "no" answer by the user.
        //  Can be followed by %N where "N" is the number of
        //   the directory argument below
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
            'bodyText', 'selectedHTML', 'selectedText', 'contextSelector', 'contextHTML',
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
        selectedHTML, selectedText, contextSelector, contextHTML,
        linkPageURLAsNativePath, linkPageTitle, linkBodyText,
        linkPageHTML, imageDataURL, imageDataBinary
      }) => {
        if (saveTemp) {
          // overwrite
          // cont
          // Work with URLs as well as files? (if not correct,
          //  `messages.json` `prefix_save_temp` text)
        }
        // Other args here

        // Todo: Ensure substitutions take place within `eval()` first
        // Todo: Ensure escaping occurs in proper order
        // `ucencode` needs `encodeURIComponent` applied
        // For `linkPageURLAsNativePath`, convert to native path
        // Allow `eval()`
        // Todo: Implement `save_temp` and all arguments
        // Retrieve "linkPageTitle", "linkBodyText", or "linkPageHTML"
        //  as needed and cache
        // Retrieve "imageDataBinary" and "imageDataURL" (available
        //  via canvas?) as needed (available from cache?)
        // Move ones found to be used here to the top of the
        //  list/mark in red/asterisked
      },
      'all'
    // Todo: Escape newlines (since allowable with textarea args)?
    ).split('').reverse().join('')
      .replace(/(?:<|>)(?!\\)/g, '').split('').reverse().join('')
      .replace(/\\(<|>)/g, '$1');
    */
  });
  console.log('newArgs', newArgs);
  return newArgs;
  // Todo: return Promise when completed (whose errors can be caught) whose
  //    resolved value is the command line output
};
