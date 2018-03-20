/* eslint-env webextensions */
/* globals EB, jml, FormSerialize, confirm, alert */

const {serialize: formSerialize, deserialize: formDeserialize} = FormSerialize;

/*
Todos:
1. Get rid of `confirm`, `alert`
1. Build command line output including path flag (Windows info)
    1. Use command line http://www.registryonwindows.com/registry-command-line.php
        (invokable from FF add-on) to add to registry re: open-with values or
        use js-ctypes or command line for integrating with deeper Windows
        (and Linux) functionality? e.g., adding items for 'open with'?
        1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144158%28v=vs.85%29.aspx
            1. See http://www.enzinger.net/en/FileAsso.html regarding
                SHChangeNotify SHCNE_ASSOCCHANGED to avoid need for restart!
            1. Use DefaultIcon instead of building a shortcut?
        1. http://stackoverflow.com/questions/21082752/ftype-assoc-priority-and-adding-to-openwithlist-from-the-command-line/24343882?iemail=1&noredirect=1#24343882
        1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144148%28v=vs.85%29.aspx#fa_optional_keys_attributes
        1. http://msdn.microsoft.com/en-us/library/windows/desktop/hh127445%28v=vs.85%29.aspx
        1. http://msdn.microsoft.com/en-us/library/bb166549%28v=vs.80%29.aspx
        1. http://msdn.microsoft.com/en-us/library/bb166181%28v=vs.80%29.aspx
        1. http://msdn.microsoft.com/en-us/library/bb165967%28v=vs.80%29.aspx
        1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144152%28v=vs.85%29.aspx
        1. http://msdn.microsoft.com/en-us/library/windows/desktop/hh127451%28v=vs.85%29.aspx
        1. http://msdn.microsoft.com/en-us/library/aa911706.aspx
        1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144156%28v=vs.85%29.aspx
        1. example: http://msdn.microsoft.com/en-us/library/bb165967.aspx
        1. http://vim.wikia.com/wiki/Windows_file_associations
        1. http://vim.wikia.com/wiki/Launch_files_in_new_tabs_under_Windows#Using_File_Associations
        1. http://ss64.com/nt/reg.html
        1. http://superuser.com/a/700773/156958 ?
        1. Option to associate with Windows 'verbs' (i.e., Open, Edit, Print, Play,
            Preview or custom):
            1. http://msdn.microsoft.com/en-us/library/bb165967.aspx
            1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144175%28v=vs.85%29.aspx
        1. Creating Windows context menus including submenus!
            1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144171%28v=vs.85%29.aspx
            1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144173%28v=vs.85%29.aspx
        1. Avoid need for separate batch by specifying executable and path
            with needed command line options in registry?
        1. Command line standards!!: http://technet.microsoft.com/en-us/library/ee156811.aspx
1. Search for other 'todo' instances below
*/

(async () => {
/*
function l (msg) {
    console.log(msg);
}
*/
const os = browser.runtime.PlatformOs;
const nbsp = '\u00a0';
const nbsp3 = ` ${nbsp} `;

let pathInputCtr = 0, fileExtIDCtr = 0, winOpenCtr = 0;

function _ (...args) {
    return browser.i18n.getMessage(...args);
}
function $ (sel) {
    return document.querySelector(sel);
}
function $$ (sel) {
    return [...document.querySelectorAll(sel)];
}
function templateExistsInMenu (val) {
    return [...$('[name=templates]').options].some((option) => {
        return option.text === val;
    });
}
function getHardPath (dir) {
    return paths[dir];
}
function createRevealButton (sel) {
    return ['input', {
        type: 'button',
        class: 'revealButton',
        dataset: {sel}
    }];
}
function createFileExtensionControls () {
    /*
    Todos:
    1. Associate file extensions to file type, and file type to executable: ftype/assoc
    1. Make as default (or only use with open with...)); OpenWithProgids ?
    1. reg query (add?)
        HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.svg\OpenWithList
    1. List all file types in pull-down in case someone wants to create an
        explicit file type for a given extension (or just a file type in
        case the registry already handles extension-to-type associations)
        ('assoc' for all <.fileext>=<filetype>, 'assoc + <filetype>' to
        get <.fileext>=<long name>; 'ftype' for all <filetype>='<exe path>' %1, etc.)
    1. List all existing extension-to-type associations, extension-to-long-name,
        type-to-exe, or extension-to-exe
    1. See discussion on icons below for app ID association (and adding to
        recent docs or jump list customization)
    1. Optionally pin apps programmatically to task bar (when task bar path
        is chosen), supporting dragging and dropping to it or requiring a
        hard-coded document path/URL
    1. Support drag-and-drop of files to this dialog (to supply document path or
        URL if it is a URL)
    */
    const fileExtensionID = ++fileExtIDCtr;
    return ['div', {id: 'fileExtensionInfoHolder' + fileExtensionID}, [
        ['label', [
            _('file-extension-associate-open-with'),
            ['input', {
                name: 'file-extension-associate-open-with[]',
                size: 10,
                class: 'fileExtension'
            }]
        ]],
        ['br'],
        ['label', [
            _('file-type-associate'),
            ['input', {
                name: 'file-type-associate[]',
                size: 10,
                class: 'fileExtension'
            }]
        ]],
        ['br'],
        ['label', [
            _('make-default-handler-for-extension'),
            ['input', {
                type: 'checkbox',
                name: 'make-default-handler-for-extension[]',
                class: 'defaultFileExtension'
            }]
        ]],
        ['button', {dataset: {fileExtensionID, type: 'add'}}, [
            _('plus')
        ]],
        ['button', {dataset: {fileExtensionID, type: 'remove'}}, [
            _('minus')
        ]],
        ['hr']
    ]];
}

/**
* Creates paths where one can save the executable, e.g., desktop,
* start-up, start menu, task bar, quick launch (with click to reveal
* any of these folders once added); creates an input type which
* does auto-complete for paths.
*/
function createPathInput () {
    const i = ++pathInputCtr;
    return ['div', {id: 'pathBoxHolder' + i}, [
        ['label', [
            _('executable-name'),
            ['input', {
                name: 'executable-name[]',
                required: 'true',
                class: 'executableName'
            }]
        ]],
        nbsp3,
        ['label', [
            _('preserve-shortcut'),
            ['input', {
                name: 'preserve-shortcut[]',
                type: 'checkbox',
                class: 'preserveShortcut'
            }]
        ]],
        nbsp3,
        ['label', {for: 'convertToExe' + i}, [
            _('change-batch-exe')
        ]],
        ['input', {
            type: 'checkbox',
            id: 'convertToExe' + i,
            name: 'convertToExe[]',
            class: 'convertToExe',
            $on: {
                click: ({target}) => {
                    if (!target.checked) {
                        target.nextElementSibling.remove();
                        return;
                    }
                    target.nextElementSibling.before(jml(
                        'div', {class: 'sedPreserveHolder'}, [
                            ['label', {title: _('preserve-sed-file-explanation')}, [
                                _('preserve-sed-file'),
                                ['input', {
                                    class: 'sedPreserve',
                                    dataset: {i},
                                    type: 'checkbox'
                                }]
                            ]],
                            nbsp3,
                            ['label', {title: _('preserve-batch-file-explanation')}, [
                                _('preserve-batch-file'),
                                ['input', {
                                    class: 'batchPreserve',
                                    dataset: {i},
                                    type: 'checkbox'
                                }]
                            ]]
                        ]
                    ));
                }
            }}
        ],
        ['br'],
        ['label', {for: 'pathBox' + i}, [
            _('executable-save-directory')
        ]],
        ['input', {
            type: 'text',
            id: 'pathBox' + i,
            name: 'pathBox[]',
            list: 'datalist', autocomplete: 'off',
            required: 'true', size: 100, value: '', dataset: {pathBoxInput: i},
            class: 'dirPath'
        }],
        ['button', {dataset: {dirPick: i}}, [
            _('browse-file')
        ]],
        ` ${_('or')} `,
        ['select', {dataset: {pathBoxSelect: i}}, [
            ['option', {value: ''}, [_('or-choose-location')]],
            ['option', {value: getHardPath('Executable')}, [
                _('executable-within-profile-folder')
            ]],
            ['option', {value: getHardPath('Desk')}, [_('Desktop')]],
            ['option', {value: getHardPath('Strt')}, [_('Start-up')]],
            (os === 'win' ? ['option', {value: getHardPath('Progs')}, [
                _('Start menu')
            ]] : ''),
            (os === 'win' ? ['option', {value: getHardPath('TaskBar')}, [
                _('Task bar')
            ]] : ''),
            ['option', {value: getHardPath('ProfD')}, [_('Profile folder')]],
            ['option', {value: getHardPath('ProgF')}, [_('Programs')]]
        ]],
        createRevealButton('#pathBox' + i),
        ['button', {dataset: {pathInputID: i, type: 'add'}}, [
            _('plus')
        ]],
        ['button', {dataset: {pathInputID: i, type: 'remove'}}, [
            _('minus')
        ]],
        ['hr']
    ]];
}

function getProfiles () {
    return profiles.map((optVal) => {
        return ['option', [optVal]];
    });
}

function modifierKeypress (e) {
    // Windows only allows ctrl+alt+XX for a shortcut; otherwise, we could use https://gist.github.com/brettz9/8661692
    if (
        // The following are disallowed in Windows shortcuts: Esc, Enter, Tab, Spacebar, PrtScn, Shift, or Backspace (see http://windows.microsoft.com/en-hk/windows/create-keyboard-shortcuts-open-programs#1TC=windows-7 )
        e.charCode === 32 || // Space bar is found here
        [27, 13, 9, 32, 44, 16, 8, // Esc, Enter, Tab, Spacebar, PrtScn, Shift, Backspace (we really only need for space, enter, tab, and backspace here as the others don't do anything with keypress)
            46, 35, 36, 33, 34, 37, 38, 39, 40, 93 // also prevent Del, End, Home, PgUp, PgDown, Arrows (left, up, right, down), ?
        ].includes(e.keyCode)
    ) {
        e.target.value = '';
    } else {
        e.target.value = _('alt-ctrl', String.fromCharCode(e.charCode).toUpperCase()); // We upper-case as Windows auto-upper-cases in the UI
    }
    e.preventDefault();
}

function createTemplatedForm () {
    return ['form', {id: 'dynamic', $on: {submit (e) {
        e.preventDefault();
    }}}, [
        ['label', [
            _('template-name'),
            ' ',
            ['input', {name: 'templateName'}]
        ]],
        nbsp3,
        ['label', [
            _('description'),
            ' ',
            ['input', {name: 'description'}]
        ]],
        ['fieldset', {id: 'pathHolder'}, [
            ['legend', [_('executable-directories')]],
            ['datalist', {id: 'datalist'}],
            createPathInput()
        ]],
        ['div', [
            ['label', [
                _('window-style'),
                ' ',
                ['select', {name: 'windowStyleSelect'}, [
                    ['option', {
                        value: '1',
                        title: _('window-activate-restore-explanation')
                    }, [_('window-activate-restore')]],
                    ['option', {
                        value: '3',
                        title: _('window-activate-maximize-explanation')
                    }, [_('window-activate-maximize')]],
                    ['option', {
                        value: '7',
                        title: _('window-minimize-explanation')
                    }, [_('window-minimize')]]
                ]]
            ]],
            ['br'],
            ['label', [
                _('global-hot-key'),
                ' ',
                ['input', {
                    name: 'hotKey',
                    $on: {keypress: modifierKeypress}
                }]
            ]],
            ['br'],
            ['label', {for: 'iconPath'}, [
                _('icon-path-executable'),
                ' '
            ]],
            ['select', {id: 'iconPathSelect'}, [
                ['option', {value: ''}, [_('choose-location')]],
                ['option', {value: getHardPath('Desk')}, [_('Desktop')]],
                ['option', {value: getHardPath('Pict')}, [_('Pictures')]],
                ['option', {value: getHardPath('ffIcon')}, [_('firefox-icon')]]
            ]],
            ['input', {
                type: 'text', id: 'iconPath', name: 'iconPath', list: 'datalist', autocomplete: 'off',
                size: 70, value: ''
            }],
            ' ',
            ['button', {id: 'iconPick'}, [
                _('browse-file')
            ]],
            createRevealButton('[name=iconPath]'),
            ` ${_('or')} `,
            /*
            Todo:
            1. Icon (Use export-as-png in SVG Edit; need filetypes.json ICO
            handler--allow testing by previewing as favicon)
                1. (Paths where to read into a list of available
                ico files, subject to a filetypes.json file in those
                directories) (might utilize those paths already added for saving)
                1. If filetypes.json has an icons section, use that by default instead?
                1. open SVG or ICO but save back at least to ICO and
                    ideally to SVG (but multiple file saving not supported
                    currently by WebAppFind, so do through add-on for now)
            1. Ensure icon will work by assigning appIDs to specific windows,
                profile (processes?), or app (idea to list FF tabs in jump
                list?); SHAddToRecentDocs may add app ID AND add the
                potentially useful behavior of putting web apps into recent
                docs (if add support, make this optional)
                    Windows: Separate windows get app IDs (SHGetPropertyStoreForWindow)
                    Process: SetCurrentProcessExplicitAppUserModelID
                    File association registration (ProgIDs; in Win7, add AppUserModelID)
                    Jump list destinations/tasks: ICustomDestinationList
                    Shortcut (PKEY_AppUserModel_ID)
                    SHAddToRecentDocs
            */
            ['button', {
                id: 'openOrCreateICO',
                title: _('create-edit-ico-file-explanation')
            }, [
                _('create-edit-ico-file')
            ]]
        ]],
        ['fieldset', [
            ['legend', [_('file-type-association')]],
            ['div', {id: 'fileExtensionHolder'}, [
                createFileExtensionControls()
            ]],
            ` ${_('or').toUpperCase()} `,
            ['label', {for: 'desktopFilePath'}, [
                _('hard-coded-desktop-file'),
                ' '
            ]],
            ['select', {id: 'desktopFilePathSelect'}, [
                ['option', {value: ''}, [_('choose-location')]],
                ['option', {value: getHardPath('Docs')}, [_('Documents')]],
                ['option', {value: getHardPath('Desk')}, [_('Desktop')]]
            ]],
            ['input', {
                type: 'text', id: 'desktopFilePath', name: 'desktopFilePath',
                list: 'desktopFilePathDatalist', autocomplete: 'off',
                size: 70, value: ''
            }],
            ' ',
            ['button', {id: 'desktopFilePick'}, [
                _('browse-file')
            ]],
            createRevealButton('[name=desktopFilePath]'),
            ['datalist', {id: 'desktopFilePathDatalist'}],
            ['br'],
            ` ${_('or').toUpperCase()} `,
            ['label', [
                _('hard-coded-url-document-file'),
                ' ',
                ['input', {
                    type: 'url', name: 'documentURLBox',
                    list: 'documentURLDatalist', autocomplete: 'off',
                    size: 100, value: ''
                }],
                ['datalist', {id: 'documentURLDatalist'}]
            ]]
        ]],
        ['div', [
            ['label', [
                ['input', {
                    type: 'radio',
                    value: 'open-with-webappfind',
                    name: 'executableType',
                    checked: 'checked'
                }],
                _('open-with-webappfind')
            ]],
            ['label', [
                ['input', {
                    type: 'radio',
                    value: 'open-hard-coded-url-only',
                    name: 'executableType'
                }],
                _('open-hard-coded-url-only')
            ]],
            ['label', [
                ['input', {
                    type: 'radio',
                    value: 'dont-open-url',
                    name: 'executableType'
                }],
                _('dont-open-url')
            ]]
        ]],
        /*
        Todo:
        1. Separate executables like Prism?: hard-code a profile (create
            one programmatically for user in an install script?)
            firefox.exe -no-remote -P executable http://example.com
        1. Whether to auto-create a new profile just for this combination
            of options and a -no-remote call to allow executable-like
            behavior (creates a separate icon instance in the task bar
            though not a separate icon unless, again, the icon is
            attached to a short cut)
        */
        ['div', [
            ['label', {for: 'profileName'}, [
                _('profile-for-executable'),
                ' '
            ]],
            ['select', {id: 'profileNameSelect'}, getProfiles()],
            ' ',
            ['input', {id: 'profileName', name: 'profileName'}],
            ' ',
            ['button', {id: 'manageProfiles'}, [
                _('manage-profiles')
            ]]
        ]],
        ['label', [
            _('mode'),
            ' ',
            ['select', {name: 'mode'}, [
                ['option', {value: 'view'}, [_('view-mode')]],
                ['option', {value: 'binaryview'}, [_('binary-view-mode')]],
                ['option', {value: 'edit'}, [_('edit-mode')]],
                ['option', {value: 'binaryedit'}, [_('binary-edit-mode')]]
            ]]
        ]],
        nbsp3,
        ['label', [
            _('custom-mode'),
            ' ',
            ['input', {name: 'customMode'}]
        ]],
        ['br'],
        // Todo:
        ['label', [
            _('webappfind-preference-overrides'),
            ' '
        ]],
        ['br'],
        // Creates an autocomplete for URLs
        // Todo:
        // 1. An optional, hard-coded web app URL (to circumvent the
        //     normal detection procedures and always open with a
        //     given web app)
        ['label', [
            _('hard-coded-web-app-URI'),
            ' ',
            ['input', {
                type: 'url', name: 'urlBox',
                list: 'urlDatalist', autocomplete: 'off',
                size: 100, value: ''
            }],
            ['datalist', {id: 'urlDatalist'}]
        ]],
        ['br'],
        ['br'],
        // Todo: implement
        ['label', [
            _('behavior-upon-URL-open'),
            ' ',
            ['select', {name: 'behaviorUponURLOpen'}, [
                ['option', {value: 'new-tab'}, [_('behavior-new-tab')]],
                ['option', {value: 'new-window'}, [_('behavior-new-window')]],
                ['option', {value: 'hidden-window'}, [_('behavior-hidden-window')]]
            ]]
        ]],
        ['br'],
        //  Todo: 1. Whether web app to open by default in full-screen
        //             mode (could just let web app and user handle, but
        //             user may prefer to bake it in to a particular
        //             executable only)
        ['label', [
            _('open-fullscreen-mode'),
            ['input', {name: 'open-fullscreen-mode', type: 'checkbox'}]
        ]],
        ['br'],
        //  Todo: 1. Batch file building section; Raw textarea (OR
        //              (only?) when webappfind is also installed...)
        ['label', [
            _('extra-batch-file-commands'),
            ' ',
            ['br'],
            ['textarea', {name: 'extra-batch-file-commands'}]
        ]],
        ['br'],
        //  Todo: 1. Strings
        ['label', [
            _('hard-coded-string-to-pass'),
            ' ',
            ['br'],
            ['textarea', {name: 'hard-coded-string-to-pass'}]
        ]],
        ['br'],
        //  Todo: 1. JavaScript (implement with CodeMirror or option to
        //              load JS file (itself invocable with WebAppFind)
        //              instead)
        ['label', [
            _('hard-coded-eval-string-to-pass'),
            ' ',
            ['br'],
            ['textarea', {name: 'hard-coded-eval-string-to-pass'}]
        ]],
        ['br'],
        //  Todo: 1. Arguments
        ['label', [
            _('extra-command-line-args'),
            ' ',
            // ['br'],
            ['input', {size: 100, name: 'extra-command-line-args'}]
        ]],
        ['br'],
        ['button', {id: 'createExecutable'}, [
            _('create-executable-save-template')
        ]],
        nbsp3,
        ['button', {id: 'runCommands'}, [
            _('run-commands-save-template')
        ]]
    ]];
}

// BEGIN EVENT ATTACHMENT

function openOrCreateICOResponse () {
    // TODO:
}

// COPIED FROM filebrowser-enhanced directoryMod.js (RETURN ALL MODIFICATIONS THERE)
function autocompleteValuesResponse ({listID, optValues}) {
    const datalist = $('#' + listID);
    while (datalist.firstChild) {
        datalist.firstChild.remove();
    }
    optValues.forEach((value) => {
        jml('option', {
            // text: value,
            value
        }, datalist);
    });
}

function autocompleteURLHistoryResponse ({listID, optValues}) { // , optIcons
    const datalist = $('#' + listID);
    while (datalist.firstChild) {
        datalist.firstChild.remove();
    }
    optValues.forEach((value, i) => {
        jml('option', {
            // text: value,
            value
            // Works as a regular option, but not a datalist option (including
            //    if option text is provided)
            // Can't use currently due to https://bugzilla.mozilla.org/show_bug.cgi?id=1411120#c6
            // style: 'background: no-repeat url(' + optIcons[i] + ');'
        }, datalist);
    });
}

function deleteTemplateResponse ({fileName}) {
    $('[name=templates]').remove(
        [...$('[name=templates]').options].findIndex((option) => {
            return option.text === fileName;
        })
    );
    // alert(message);
}

function getTemplateResponse (content) {
    const json = JSON.parse(content);
    // json['executable-name'].length
    // json['file-extension-associate-open-with'].length
    console.log('json', json);
    formDeserialize($('#dynamic'), json);
}

function fileOrDirResult ({path, selector}) {
    if (path) {
        $(selector).value = path;
    }
}
const filePickResult = fileOrDirResult;
const dirPickResult = fileOrDirResult;

function saveTemplateResult ({templateName}) {
    if (!templateExistsInMenu(templateName)) {
        $('[name=templates]').add(jml('option', [templateName]));
    }
    // alert(message);
}

function init () {
    window.addEventListener('input', function ({target}) {
        const {name, value, nextElementSibling, dataset: {pathBoxInput}} = target;

        if (!value) {
            return;
        }
        if (pathBoxInput) {
            if ([...nextElementSibling.classList].includes('pinAppHolder')) {
                nextElementSibling.remove();
            }
            if (value === getHardPath('TaskBar')) {
                // Todo: Possible to allow pinning to task bar without
                //         saving the executable/batch there?
                nextElementSibling.before(jml(
                    'div', {class: 'pinAppHolder'}, [
                        ['label', {title: _('pin-app-task-bar-explanation')}, [
                            _('pin-app-task-bar'),
                            ['input', {
                                class: 'pinApp',
                                dataset: {i: pathBoxInput},
                                type: 'checkbox'
                            }]
                        ]]
                    ]
                ));
            }
            EB.autocompleteValues({
                value,
                listID: target.getAttribute('list'),
                dirOnly: true
            }).then(autocompleteValuesResponse);
            return;
        }
        switch (name) {
        case 'customMode': {
            target.value = target.value.replace(/[^a-z]/, '');
            break;
        } case 'urlBox': case 'documentURLBox': {
            /*
            if (value.length < 9) { // http://.
                return;
            }
            */
            EB.autocompleteURLHistory({
                value,
                listID: target.getAttribute('list')
            }).then(autocompleteURLHistoryResponse);
            break;
        } case 'desktopFilePath': case 'iconPath': {
            EB.autocompleteValues({
                value,
                listID: target.getAttribute('list')
            }).then(autocompleteValuesResponse);
            break;
        }
        }
    });

    window.addEventListener('change', function ({target}) {
        const {name, value: fileName} = target;
        switch (name) {
        case 'templateName': {
            if ($('#rememberTemplateChanges').checked &&
                templateExistsInMenu(fileName)
            ) {
                if (!confirm(_('overwrite-template-ok'))) {
                    target.value = '';
                    // return;
                }
            }
            break;
        } case 'templates': {
            if (!fileName) {
                return;
            }
            // $('#templateName').value = fileName;
            EB.getTemplate({fileName}).then(getTemplateResponse);
            break;
        }
        }
    });

    // Todo: Support keypress
    window.addEventListener('click', async function ({target}) {
        function toCheckedValue (prev, pinApp) {
            prev[pinApp.dataset.i] = pinApp.checked;
            return prev;
        }
        function reduceToCheckedValue (sel) {
            return $$(sel).reduce(toCheckedValue, {});
        }
        function reduceToValue (sel) {
            return $$(sel).map((i) => i.value);
        }
        const {parentNode, value, nodeName, dataset: {
            type, dirPick, pathInputID, fileExtensionID, sel
        }} = target;
        const pathBoxSelect = target.dataset.pathBoxSelect ||
            (parentNode && parentNode.dataset && parentNode.dataset.pathBoxSelect);

        if (dirPick) {
            // Value can be blank (if user just wishes to browse)
            EB.dirPick({
                dirPath: $('#pathBox' + dirPick).value,
                selector: '#pathBox' + dirPick,
                selectFolder: dirPick
            }).then(dirPickResult);
        } else if (pathInputID) {
            const holderID = 'pathBoxHolder' + pathInputID;
            const parentHolderSel = '#pathHolder';
            switch (type) {
            case 'add': {
                const input = jml(...createPathInput());
                const nextSibling = $('#' + holderID).nextElementSibling;
                if (nextSibling) {
                    nextSibling.before(input);
                } else {
                    $(parentHolderSel).appendChild(input);
                }
                break;
            } case 'remove': {
                if ($(parentHolderSel).children.length <= 3) { // Legend, datalist, and a single path control
                    return;
                }
                $('#' + holderID).remove();
                break;
            }
            }
        } else if (pathBoxSelect) {
            if (!value) {
                return;
            }
            $('#pathBox' + pathBoxSelect).value = value;
            // We need the input event to go off so as to display the checkbox if this is the task bar
            const keyEv = document.createEvent('KeyboardEvent');
            keyEv.initKeyEvent('input', true, true, document.defaultView, false, false, false, false, 13, 0);
            $('#pathBox' + pathBoxSelect).dispatchEvent(keyEv);
        } else if (fileExtensionID) {
            const holderID = 'fileExtensionInfoHolder' + fileExtensionID;
            const parentHolderSel = '#fileExtensionHolder';
            switch (type) {
            case 'add': {
                const input = jml(...createFileExtensionControls());
                const nextSibling = $('#' + holderID).nextElementSibling;
                if (nextSibling) {
                    nextSibling.before(input);
                } else {
                    $(parentHolderSel).appendChild(input);
                }
                break;
            } case 'remove': {
                if ($(parentHolderSel).children.length <= 1) { // A single path control
                    return;
                }
                $('#' + holderID).remove();
                break;
            }
            }
        } else if (sel) {
            let selVal = $(sel).value;
            if (selVal.match(/^resource:/)) {
                selVal = selVal.substring(0, selVal.lastIndexOf('/') + 1);
                window.open(selVal, 'resource' + (winOpenCtr++));
                return;
            }
            if (selVal) {
                EB.reveal(selVal);
            }
        } else {
            let {id} = target;
            if (nodeName.toLowerCase() === 'option') {
                switch (parentNode.id) {
                case 'iconPathSelect': case 'profileNameSelect': case 'desktopFilePathSelect':
                    id = parentNode.id;
                    break;
                default:
                    return;
                }
            }
            switch (id) {
            case 'deleteTemplate':
                const fileName = $('[name=templates]').selectedOptions[0].value;
                if (!fileName) {
                    alert(_('must-choose-one-to-delete'));
                    return;
                }
                EB.deleteTemplate({fileName}).then(deleteTemplateResponse);
                break;
            case 'desktopFilePathSelect': case 'iconPathSelect':
                if (!value) {
                    return;
                }
                $('#' + id.replace(/Select$/, '')).value = value;
                break;
            case 'desktopFilePick': case 'iconPick': {
                // Value can be blank (if user just wishes to browse)
                const sel = '#' + id.replace(/Pick$/, 'Path');
                EB.filePick({
                    dirPath: $(sel).value,
                    selector: sel,
                    defaultExtension: 'ico' // Todo: Fix for desktopFilePick
                }).then(filePickResult);
                break;
            } case 'openOrCreateICO':
                EB.openOrCreateICO().then(openOrCreateICOResponse);
                break;
            case 'profileNameSelect':
                $('[name=profileName]').value = value;
                break;
            case 'manageProfiles':
                EB.manageProfiles();
                break;
            case 'createExecutable':
                // Todo: Auto-name executable and auto-add path by default
                if (!$('.executableName').value) {
                    alert(_('must-add-one-executable-name'));
                    return;
                }
                if (!$('.dirPath').value) {
                    alert(_('must-add-executable-path'));
                    return;
                }
            case 'runCommands': // eslint-disable-line no-fallthrough
                const templateName = $('[name=templateName]').value || null;
                if ($('#rememberTemplateChanges').checked &&
                    templateName !== null
                ) {
                    // Save the file, over-writing any existing file
                    console.log('ffff', formSerialize($('#dynamic'), {empty: true, hash: true}));
                    const content = JSON.stringify(
                        formSerialize($('#dynamic'), {empty: true, hash: true})
                    );
                    console.log('ser-content', content);
                    EB.saveTemplate({
                        templateName,
                        content
                    }).then(saveTemplateResult);
                }

                const executableNames = reduceToValue('.executableName');
                const dirPaths = reduceToValue('.dirPath');
                const preserveShortcuts = reduceToValue('.preserveShortcut');
                const convertToExes = reduceToValue('.convertToExe');

                const pinApps = reduceToCheckedValue('.pinApp');
                const sedPreserves = reduceToCheckedValue('.sedPreserve');
                const batchPreserves = reduceToCheckedValue('.batchPreserve');

                const options = {
                    executableNames,
                    dirPaths,
                    preserveShortcuts,
                    convertToExes,
                    pinApps,
                    sedPreserves,
                    batchPreserves,
                    templateName,
                    description: $('[name=description]').value || '',
                    profileName: $('[name=profileName]').value || null,
                    iconPath: $('[name=iconPath]').value || null,
                    windowStyle: $('[name=windowStyleSelect]').value || null,
                    hotKey: $('[name=hotKey]').value || null,
                    webappurl: $('[name=urlBox]').value || null,
                    webappmode: $('[name=mode]').value || null,
                    webappcustommode: $('[name=customMode]').value || null,
                    webappdoc: $('[name=desktopFilePath]').value ||
                                            $('[name=documentURLBox]').value ||
                                                null
                };

                EB.saveExecutables(options);

                // $('.fileExtension').value // defaultFileExtension
                // emit('associateFileExtension');
                /*
                    await EB.cmd({args: []});
                    alert('Command run!');
                */
                break;
            }
        }
    });
    jml('div', [
        ['select', {name: 'templates'}, [
            ['option', {value: ''}, [_('choose-template')]],
            ...templates.map((template) => {
                return ['option', [template]];
            })
        ]],
        ['button', {id: 'deleteTemplate'}, [_('delete-template')]],
        ['br', 'br'],
        ['label', [
            _('remember-template-changes'),
            ' ',
            // We don't give a `name` here as we don't want to
            //    remember this during serialization
            ['input', {
                id: 'rememberTemplateChanges',
                type: 'checkbox',
                checked: 'checked'
            }]
        ]],
        ['br', 'br'],
        createTemplatedForm()
    ], document.body);
}

// We could abstract this, but it's light enough for now to keep flexible
const [paths, profiles, templates] = await Promise.all([
    EB.getHardPaths(),
    EB.getProfiles(),
    EB.getTemplates()
]);
console.log('ttt', templates);

// To send messages within add-on
// browser.runtime.sendMessage(Object.assign(obj || {}, {type}));
init();

// Todo: Use
/* const metas = */ (await browser.tabs.executeScript({
    allFrames: true,
    code: `
[...document.querySelectorAll('meta[name="webappfind"]')].map((m) => m.content)
`,
    runAt: 'document_end'
})).flatten();
// console.log('metas-browser-action', metas);
})();
