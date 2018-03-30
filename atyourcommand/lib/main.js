/* globals SelectorContext, SelectionContext, PageContext */
(function () {
'use strict';

function l (msg) {
    console.log(msg);
}

exports.main = function () {
    const _ = require('sdk/l10n').get,
        XRegExp = require('./node_modules/xregexp/xregexp-all').XRegExp,
        data = require('sdk/self').data,
        cm = require('sdk/context-menu'),
        ss = require('sdk/simple-storage').storage,
        openDialog = require('./openDialog'),
        platform = require('sdk/system').platform,
        fileHelpers = require('./fileHelpers'),
        {getExePaths, getTempPaths, autocompleteValues, picker, reveal} = fileHelpers;

    if (!ss.commands) {
        ss.commands = {};
    }
    if (!ss.windowCoords) {
        ss.windowCoords = {outerWidth: 1180, outerHeight: 670};
    }

    function execute (name, details) {
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
        l(
            data.args.map(function (argVal) {
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
                            ].reduce(function (str, key) {
                                return str + '|(?<' + XRegExp.escape(key) + '>' + XRegExp.escape(key) + ')';
                            }, '').slice(1)) +
                        // End the main grouping
                        ')' +
                    // End special syntax
                    '>'),
                    function (arg) {
                        if (arg.saveTemp) {
                            // arg.overwrite
                            // arg.cont
                        }
                        /*
                        arg.ucencode
                        arg.uencode
                        arg.escquotes
                        arg.evl
                        arg.pageURL
                        arg.pageTitle
                        arg.pageHTML
                        arg.bodyText
                        arg.selectedHTML
                        arg.selectedText
                        arg.linkPageURLAsNativePath
                        arg.linkPageTitle
                        arg.linkBodyText
                        arg.linkPageHTML
                        arg.imageDataURL
                        arg.imageDataBinary
                        */
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
                ).split('').reverse().join('').replace(/(?:<|>)(?!\\)/g, '').split('').reverse().join('').replace(/\\(<|>)/g, '$1');
            })
            /*
            , // Todo: Reenable?
            {
                errorHandler: function (err) {
                    throw (err);
                },
                observe: function (aSubject, aTopic, data) {
                    if (aTopic === 'process-finished') {
                        emit('finished');
                    }
                }
            }
        );
        */
        );
    }

    const dynamicCMItems = {}, dynamicCMItems2 = {};
    function addDynamicCMContent (name, details) {
        // todo: handle details.ownContext
        // todo: handle details.restrictContexts
        const itemConfig = {
            label: name,
            data: {selector: 'dynamic_' + name, customProperty: ''}, // Namespace to distinguish from our built-in names
            context: details.ownContext ? SelectorContext(details.ownContext) : PageContext(),
            contentScriptFile: data.url('main-context-menu.js'), // loads before contentScript if we want some default code
            // contentScript: '',
            // image: data.url(''),
            onMessage (data) {
                execute(data.name, details);
            }
        };
        let item = dynamicCMItems[name] = cm.Item(itemConfig);

        // We need to duplicate contexts since array of contexts not working properly
        const itemConfigCopy = Object.create(itemConfig);
        itemConfigCopy.context = SelectionContext();
        item = dynamicCMItems2[name] = cm.Item(itemConfigCopy);
        mainMenu.addItem(item);
    }
    function save (name, data) {
        ss.commands[name] = data;
        addDynamicCMContent(name, data);
    }
    function remove (name) {
        delete ss.commands[name];
        if (dynamicCMItems[name]) {
            dynamicCMItems[name].destroy();
        }
        if (dynamicCMItems2[name]) {
            dynamicCMItems2[name].destroy();
        }
    }

    function populateDynamicCMItems () {
        for (const name in ss.commands) {
            addDynamicCMContent(name, ss.commands[name]);
        }
    }

    const mainMenu = cm.Menu({
        onMessage (e) {
            let win;
            const itemType = e.data || e.selector; // Prioritize built-in names
            switch (itemType) {
            case 'commands': case 'one-off':
                win = openDialog({
                    name: _('One-off'),
                    dataURL: 'one-off.html',
                    outerWidth: ss.windowCoords.outerWidth,
                    outerHeight: ss.windowCoords.outerHeight,
                    contentScript: {
                        files: [
                            'bower_components/jquery/dist/jquery.min.js',
                            'bower_components/multiple-select-brett/jquery.multiple.select.js',
                            'node_modules/jamilih/jml.js',
                            'ExpandableInputs.js', 'tags.js', 'one-off.js'
                        ],
                        when: 'ready',
                        options: { // any JSON-serializable key/values
                            itemType: itemType,
                            oldStorage: ss.commands,
                            folderImage: data.url('Yellow_folder_icon_open.png'),
                            // Todo: Get path to locale file, parse, and pass here to remove need for all of these? (and to avoid the data-* approach)
                            locale: [
                                'title', 'lt', 'gt', 'create_new_command', 'Substitutions used',
                                'if_present_command_saved', 'Command name',
                                'Restrict contexts',
                                'have_unsaved_changes', 'have_unsaved_name_change',
                                'no_changes_to_save', 'sure_wish_delete',
                                'Save', 'Delete', 'name_already_exists_overwrite',
                                'supply_name', 'currently_available_sequences',
                                'Process executed', 'Substitutions explained',
                                'Substitution_sequences_allow',
                                'prefixes_can_be_applied', 'or', 'Specify your own context', 'Images',
                                'frames', 'navigation', 'block', 'lists', 'tables', 'forms', 'links and anchors', 'inline', 'time', 'images', 'other media', 'plugins', 'empty but visible', 'hidden', 'templates', 'scripting',
                                'Italicized_obtained_from_source_page_context',
                                'Windows', 'Linux', 'Mac', 'os_format_for_batch_export', 'Export to batch'
                            ].concat(['eval', 'contentType',
                                'pageURL', 'pageTitle', 'pageHTML',
                                'bodyText', 'selectedHTML',
                                'selectedText',
                                'linkPageURLAsNativePath', 'linkPageTitle', 'linkBodyText', 'linkPageHTML', 'imageDataURL', 'imageDataBinary'
                            ].map(function (key) {
                                return 'seq_' + key;
                            })).concat([
                                'Sequences', 'Path of executable', 'Browse',
                                'Hard-coded files and URLs',
                                'keep_dialog_open', 'Execute_on_current_page', 'Cancel'
                            ]).concat([
                                'save-temp', 'ucencode-', 'uencode-', 'escquotes-'
                            ].map(function (key) {
                                return 'prefix_' + key;
                            })).reduce(function (locale, key) {
                                locale[key] = _(key);
                                return locale;
                            }, {}),
                            ei_locale: [
                                'browse', 'directory', 'plus', 'minus', 'reveal',
                                'args_num', 'url_num', 'file_num'
                            ].reduce(function (locale, key) {
                                locale[key] = _('expandable_inputs_' + key);
                                return locale;
                            }, {})
                        }
                    },
                    ready (worker, on, emit) {
                        on({
                            autocompleteValues (data) {
                                emit('autocompleteValuesResponse', autocompleteValues(data));
                            },
                            filePick (data) {
                                picker(data, null, ['pickFolder', 'pickFile'].reduce(function (locale, key) {
                                    locale[key] = _('filepicker_' + key);
                                    return locale;
                                }, {}),
                                function (arg1, arg2) {
                                    emit(arg1, arg2);
                                });
                                emit('filePickResponse');
                            },
                            reveal (data) {
                                reveal(data);
                            },
                            buttonClick (data) {
                                const {name} = data, {commands} = ss;
                                if (data.remove) {
                                    remove(name);
                                    emit('removeStorage', {commands: commands, keepForm: data.keepForm});
                                }
                                if (data.save) {
                                    save(name, data.detail);
                                    emit('newStorage', {name: name, commands: commands});
                                }
                                if (data.execute) {
                                    execute(name);
                                }
                                if (data.close) {
                                    worker.destroy();
                                    win.close();
                                }
                            }
                        });
                        emit({
                            executables: getExePaths(),
                            temps: getTempPaths(),
                            defaultOS: platform
                        });
                    }
                });
                win.addEventListener('resize', function () {
                    ss.windowCoords.outerWidth = win.outerWidth;
                    ss.windowCoords.outerHeight = win.outerHeight;
                });
                break;
            case 'prefs':
                // Detachment of panel upon opening in this manner is a bug that is WONT-FIXED
                // since widgets to be deprecated per https://bugzilla.mozilla.org/show_bug.cgi?id=638142
                // prefsWidget.panel.show();
                break;
            }
        }
    });
    populateDynamicCMItems();
};

exports.onUnload = function () { // reason
};
}());
