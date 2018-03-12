/* eslint-env webextensions */
/* globals EB, jml, DOMParser, XMLSerializer, alert, confirm */
/*
Info:
1. On building profile dir. for executables, see http://stackoverflow.com/questions/18711327/programmatically-create-firefox-profiles
and possibly https://developer.mozilla.org/en-US/docs/Profile_Manager ; also might just
use command line
1. If need to convert PNG to ICO
    var imgTools = Components.classes['@mozilla.org/image/tools;1'].getService(Components.interfaces.imgITools);
    imgTools.encodeImage( , 'image/x-icon');
1. With WebAppFind, tried -remote, -silent; didn't try -no-remote, -tray

Todos:
1. Split into generic and specific sections (so will allow building of executables regardless of whether used for WebAppFind or not); dynamically reveal sections based on 'Open with WebAppFind?' radio group selection, hard-coding or not, etc.

1. Reported error (as with tooltip titles): autocomplete won't show up inside of panels: https://bugzilla.mozilla.org/show_bug.cgi?id=918600 (though currently not doing as panel anyways)
1. Build command line output including path flag
    1. Use command line http://www.registryonwindows.com/registry-command-line.php (invokable
from FF add-on) to add to registry re: open-with values or use js-ctypes or command line
for integrating with deeper Windows (and Linux) functionality? e.g., adding items for 'open with'?
        1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144158%28v=vs.85%29.aspx
            1. See http://www.enzinger.net/en/FileAsso.html regarding SHChangeNotify SHCNE_ASSOCCHANGED to avoid need for restart!
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
        1. Option to associate with Windows 'verbs' (i.e., Open, Edit, Print, Play, Preview or custom):
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
let ct = 0, ctr = 0, k = 0;

const options = {};

function $ (sel) {
    return document.querySelector(sel);
}
function $$ (sel) {
    return document.querySelectorAll(sel);
}
function templateExistsInMenu (val) {
    return [...$('#templates').options].some((option) => {
        return option.text === val;
    });
}
function getHardPath (dir) {
    return paths[dir];
}
function createRevealButton (sel) {
    return ['input', {
        type: 'button',
        style: 'border: none; margin-left: 5px; background-color: transparent; width: 25px; background-repeat: no-repeat; ' +
                'background-size: 20px 20px; ' +
                'background-image: url("' + options.folderImage + '");',
        'class': 'revealButton',
        dataset: {sel: sel}
    }];
}
function createFileExtensionControls () {
    /*
    Todos:
    1. Associate file extensions to file type, and file type to executable: ftype/assoc
    1. Make as default (or only use with open with...)); OpenWithProgids ?
    1. reg query (add?) HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.svg\OpenWithList
    1. List all file types in pull-down in case someone wants to create an explicit file type for a given extension (or just a file type in case the registry already handles extension-to-type associations) ('assoc' for all <.fileext>=<filetype>, 'assoc + <filetype>' to get <.fileext>=<long name>; 'ftype' for all <filetype>='<exe path>' %1, etc.)
    1. List all existing extension-to-type associations, extension-to-long-name, type-to-exe, or extension-to-exe
    1. See discussion on icons below for app ID association (and adding to recent docs or jump list customization)
    1. Optionally pin apps programmatically to task bar (when task bar path is chosen), supporting dragging and dropping to it or requiring a hard-coded document path/URL
    1. Support drag-and-drop of files to this dialog (to supply document path or URL if it is a URL)
    */
    const i = ++ctr;
    return ['div', {id: 'fileExtensionInfoHolder' + i}, [
        ['label', [
            'File extension to associate with this executable (for Open With): ',
            ['input', {size: 10, 'class': 'fileExtension'}]
        ]],
        ['br'],
        ['label', [
            'File type to associate for this executable (or between it and any supplied extension): ',
            ['input', {size: 10, 'class': 'fileExtension'}]
        ]],
        ['br'],
        ['label', [
            'Make the default execution handler for files with this extension?',
            ['input', {type: 'checkbox', 'class': 'defaultFileExtension'}]
        ]],
        ['button', {dataset: {fileExtensionID: i, type: 'add'}}, [
            '+'
        ]],
        ['button', {dataset: {fileExtensionID: i, type: 'remove'}}, [
            '-'
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
    const i = ++ct;
    return [
        'div', {id: 'pathBoxHolder' + i}, [
            ['label', [
                'Executable name: ',
                ['input', {required: 'true', 'class': 'executableName'}]
            ]],
            ' \u00a0 ',
            ['label', [
                'Preserve shortcut after execution: ',
                ['input', {type: 'checkbox', 'class': 'preserveShortcut'}]
            ]],
            ' \u00a0 ',
            ['label', {'for': 'convertToExe' + i}, [
                'Change batch to exe: '
            ]],
            ['input', {type: 'checkbox', id: 'convertToExe' + i, 'class': 'convertToExe', $on: {click: (function (i) {
                return function ({target}) {
                    if (target.checked) {
                        target.parentNode.insertBefore(jml(
                            'div', {'class': 'sedPreserveHolder'}, [
                                ['label', {title: 'Normally a SED file will be added and then removed. This option preserves it and will subsequently seek to use it.'}, [
                                    'Preserve the SED file: ',
                                    ['input', {'class': 'sedPreserve', dataset: {i: i}, type: 'checkbox'}]
                                ]],
                                ' \u00a0 ',
                                ['label', {title: 'Normally the batch file will be cleaned up when incorporated into an exe. This preserves it and will subsequently seek to use it.'}, [
                                    'Preserve the batch file: ',
                                    ['input', {'class': 'batchPreserve', dataset: {i: i}, type: 'checkbox'}]
                                ]]
                            ]
                        ), target.nextElementSibling);
                    } else {
                        target.parentNode.removeChild(target.nextElementSibling);
                    }
                };
            }(i))}}],
            ['br'],
            ['label', {'for': 'pathBox' + i}, [
                'Directory where the executable will be saved: '
            ]],
            ['input', {
                type: 'text', id: 'pathBox' + i, list: 'datalist', autocomplete: 'off',
                required: 'true', size: 100, value: '', dataset: {pathBoxInput: i},
                'class': 'dirPath'
            }],
            ['button', {dataset: {dirPick: i}}, [
                'Browse\u2026'
            ]],
            ' or ',
            ['select', {dataset: {pathBoxSelect: i}}, [
                ['option', {value: ''}, ['(Or choose a location)']],
                ['option', {value: getHardPath('Executable')}, ['Executable folder within profile folder']],
                ['option', {value: getHardPath('Desk')}, ['Desktop']],
                ['option', {value: getHardPath('Strt')}, ['Start-up']],
                ['option', {value: getHardPath('Progs')}, ['Start menu']],
                ['option', {value: getHardPath('TaskBar')}, ['Task bar']],
                ['option', {value: getHardPath('ProfD')}, ['Profile folder']],
                ['option', {value: getHardPath('Programs')}, ['Programs']]
            ]],
            createRevealButton('#pathBox' + i),
            ['button', {dataset: {pathInputID: i, type: 'add'}}, [
                '+'
            ]],
            ['button', {dataset: {pathInputID: i, type: 'remove'}}, [
                '-'
            ]],
            ['hr']
        ]
    ];
}

function getProfiles () {
    return profiles.reduce((opts, optVal) => {
        opts.push(['option', [optVal]]);
        return opts;
    }, []);
}

// BEGIN EVENT ATTACHMENT

function openOrCreateICOResponse () {
    // TODO:
}

// COPIED FROM filebrowser-enhanced directoryMod.js (RETURN ALL MODIFICATIONS THERE)
function autocompleteValuesResponse (data) {
    const datalist = document.getElementById(data.listID);
    if (!datalist) {
        // Todo: Remove this block after implemented
        return;
    }
    while (datalist.firstChild) {
        datalist.removeChild(datalist.firstChild);
    }
    data.optValues.forEach((optValue) => {
        const option = jml('option', {
            // text: optValue,
            value: optValue
        });
        datalist.appendChild(option);
    });
}

function autocompleteURLHistoryResponse (data) {
    const datalist = document.getElementById(data.listID);
    if (!datalist) {
        // Todo: Remove this block after implemented
        return;
    }
    while (datalist.firstChild) {
        datalist.removeChild(datalist.firstChild);
    }
    data.optValues.forEach((optValue, i) => {
        const option = jml('option', {
            // text: optValue,
            value: optValue,
            // Works as a regular option, but not a datalist option (including if option text is provided)
            style: 'background: no-repeat url(' + data.optIcons[i] + ');'
        });
        datalist.appendChild(option);
    });
}

function deleteTemplateResponse ({fileName}) {
    $('#templates').remove([...$('#templates').options].findIndex((option) => {
        return option.text === fileName;
    }));
    // alert(message);
}

function getTemplateResponse (content) {
    const dom = new DOMParser().parseFromString(content, 'application/xhtml+xml');
    // dom.documentElement.cloneNode(true);
    $('#dynamic').parentNode.replaceChild(dom.documentElement, $('#dynamic'));
}

function fileOrDirResult (data) {
    const path = data.path,
        selector = data.selector;
    if (path) {
        $(selector).value = path;
    }
}
const filePickResult = fileOrDirResult;
const dirPickResult = fileOrDirResult;

function saveTemplateResult ({templateName}) {
    if (!templateExistsInMenu(templateName)) {
        $('#templates').add(jml('option', [templateName]));
    }
    // alert(message);
}

function init () {
    window.addEventListener('input', function ({target}) {
        const id = target.id,
            val = target.value,
            dataset = target.dataset,
            pathBoxInput = dataset.pathBoxInput;

        if (!val) {
            return;
        }
        if (pathBoxInput) {
            if ([...target.nextElementSibling.classList].includes('pinAppHolder')) {
                target.parentNode.removeChild(target.nextElementSibling);
            }
            if (val === getHardPath('TaskBar')) {
                // Todo: Possible to allow pinning to task bar without saving the executable/batch there?
                target.parentNode.insertBefore(jml(
                    'div', {'class': 'pinAppHolder'}, [
                        ['label', {title: 'While on the task bar, a desktop file or URL can be drag-and-dropped onto it if the executable is dynamic or a specific one if the document is baked into the executable'}, [
                            'Pin app to task bar: ',
                            ['input', {'class': 'pinApp', dataset: {i: pathBoxInput}, type: 'checkbox'}]
                        ]]
                    ]
                ), target.nextElementSibling);
            }
            EB.autocompleteValues({
                value: val,
                listID: target.getAttribute('list'),
                dirOnly: true
            }).then(autocompleteValuesResponse);
        } else if (id === 'customMode') {
            target.value = target.value.replace(/[^a-z]/, '');
        } else if (id === 'urlBox' || id === 'documentURLBox') {
            /*
            if (val.length < 9) { // http://.
                return;
            }
            */
            EB.autocompleteURLHistory({
                value: val,
                listID: target.getAttribute('list')
            }).then(autocompleteURLHistoryResponse);
        } else if (id === 'desktopFilePath' || id === 'iconPath') {
            EB.autocompleteValues({
                value: val,
                listID: target.getAttribute('list')
            }).then(autocompleteValuesResponse);
        }
    });

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
            e.target.value = 'ALT+CTRL+' + String.fromCharCode(e.charCode).toUpperCase(); // We upper-case as Windows auto-upper-cases in the UI
        }
        e.preventDefault();
    }

    window.addEventListener('change', function ({target}) {
        const val = target.value;
        if (target.id === 'templateName') {
            if ($('#rememberTemplateChanges').checked &&
                templateExistsInMenu(val)
            ) {
                if (!confirm('You have chosen a template which already exists, so any saves you make with this name will overwrite its contents with the updates made below. Continue?')) {
                    target.value = '';
                    // return;
                }
            }
        } else if (target.id === 'templates') {
            // $('#templateName').value = val;
            EB.getTemplate({fileName: val}).then(getTemplateResponse);
        }
    });

    // Todo: Support keypress
    window.addEventListener('click', async function ({target}) {
        function toValue (item) {
            return item.value;
        }
        function toCheckedValue (prev, pinApp) {
            prev[pinApp.dataset.i] = pinApp.checked;
            return prev;
        }
        function reduceCheckedValue (sel) {
            return [...$$(sel)].reduce(toCheckedValue, {});
        }
        function reduceValue (sel) {
            return [...$$(sel)].map(toValue);
        }
        const {dataset, parentNode, value: val} = target;
        const {
            type, dirPick, pathInputID, fileExtensionID
        } = dataset;
        const pathBoxSelect = dataset.pathBoxSelect ||
            (parentNode && parentNode.dataset && parentNode.dataset.pathBoxSelect);
        let content,
            keyEv, options, executableNames, dirPaths, preserveShortcuts, pinApps, convertToExes, sedPreserves, batchPreserves,
            {id} = target,
            {sel} = dataset;

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
            if (type === 'add') {
                const input = jml(...createPathInput());
                const nextSibling = $('#' + holderID).nextElementSibling;
                if (nextSibling) {
                    $(parentHolderSel).insertBefore(input, nextSibling);
                } else {
                    $(parentHolderSel).appendChild(input);
                }
            } else if (type === 'remove') {
                if ($(parentHolderSel).children.length <= 3) { // Legend, datalist, and a single path control
                    return;
                }
                $('#' + holderID).parentNode.removeChild($('#' + holderID));
            }
        } else if (pathBoxSelect) {
            if (!val) {
                return;
            }
            $('#pathBox' + pathBoxSelect).value = val;
            // We need the input event to go off so as to display the checkbox if this is the task bar
            keyEv = document.createEvent('KeyboardEvent');
            keyEv.initKeyEvent('input', true, true, document.defaultView, false, false, false, false, 13, 0);
            $('#pathBox' + pathBoxSelect).dispatchEvent(keyEv);
        } else if (fileExtensionID) {
            const holderID = 'fileExtensionInfoHolder' + fileExtensionID;
            const parentHolderSel = '#fileExtensionHolder';
            if (type === 'add') {
                const input = jml(...createFileExtensionControls());
                const nextSibling = $('#' + holderID).nextElementSibling;
                if (nextSibling) {
                    $(parentHolderSel).insertBefore(input, nextSibling);
                } else {
                    $(parentHolderSel).appendChild(input);
                }
            } else if (type === 'remove') {
                if ($(parentHolderSel).children.length <= 1) { // A single path control
                    return;
                }
                $('#' + holderID).parentNode.removeChild($('#' + holderID));
            }
        } else if (sel) {
            let selVal = $(sel).value;
            if (selVal.match(/^resource:/)) {
                selVal = selVal.substring(0, selVal.lastIndexOf('/') + 1);
                window.open(selVal, 'resource' + (k++));
                return;
            }
            if (selVal) {
                EB.reveal(selVal);
            }
        } else {
            if (target.nodeName.toLowerCase() === 'option') {
                switch (target.parentNode.id) {
                case 'iconPathSelect': case 'profileNameSelect': case 'desktopFilePathSelect':
                    id = target.parentNode.id;
                    break;
                default:
                    return;
                }
            }
            switch (id) {
            case 'deleteTemplate':
                const fileName = $('#templates').selectedOptions[0].value;
                if (!fileName) {
                    alert('In order to delete a template, you must choose one in the pull-down');
                    return;
                }
                EB.deleteTemplate({fileName}).then(deleteTemplateResponse);
                break;
            case 'desktopFilePathSelect': case 'iconPathSelect':
                if (!val) {
                    return;
                }
                $('#' + id.replace(/Select$/, '')).value = val;
                break;
            case 'desktopFilePick': case 'iconPick':
                // Value can be blank (if user just wishes to browse)
                sel = '#' + id.replace(/Pick$/, 'Path');
                EB.filePick({
                    dirPath: $(sel).value,
                    selector: sel,
                    defaultExtension: 'ico' // Todo: Fix for desktopFilePick
                }).then(filePickResult);
                break;
            case 'openOrCreateICO':
                EB.openOrCreateICO().then(openOrCreateICOResponse);
                break;
            case 'profileNameSelect':
                $('#profileName').value = val;
                break;
            case 'manageProfiles':
                EB.manageProfiles();
                break;
            case 'createExecutable':
                // Todo: Auto-name executable and auto-add path by default
                if (!$('.executableName').value) {
                    alert('You must specify at least one executable file name');
                    return;
                }
                if (!$('.dirPath').value) {
                    alert('You must supply a path for your executable');
                    return;
                }
            case 'runCommands': // eslint-disable-line no-fallthrough
                const templateName = $('#templateName').value;
                if ($('#rememberTemplateChanges').checked &&
                    templateName !== '') {
                    // Save the file, over-writing any existing file
                    const ser = new XMLSerializer();
                    ser.$formSerialize = true;
                    content = ser.serializeToString($('#dynamic'));

                    EB.saveTemplate({
                        fileName: templateName,
                        content: content
                    }).then(saveTemplateResult);
                }

                executableNames = reduceValue('.executableName');
                dirPaths = reduceValue('.dirPath');
                preserveShortcuts = reduceValue('.preserveShortcut');
                convertToExes = reduceValue('.convertToExe');

                pinApps = reduceCheckedValue('.pinApp');
                sedPreserves = reduceCheckedValue('.sedPreserve');
                batchPreserves = reduceCheckedValue('.batchPreserve');

                options = {
                    executableNames,
                    dirPaths,
                    preserveShortcuts,
                    convertToExes,
                    pinApps,
                    sedPreserves,
                    batchPreserves,
                    templateName: templateName || null,
                    description: $('#description').value || '',
                    profileName: $('#profileName').value || null,
                    iconPath: $('#iconPath').value || null,
                    windowStyle: $('#windowStyleSelect').value || null,
                    hotKey: $('#hotKey').value || null,
                    webappurl: $('#urlBox').value || null,
                    webappmode: $('#mode').value || null,
                    webappcustommode: $('#customMode').value || null,
                    webappdoc: $('#desktopFilePath').value ||
                                            $('#documentURLBox').value ||
                                                null
                };

                EB.saveExecutables(options);

                // $('.fileExtension').value // defaultFileExtension
                // emit('associateFileExtension');
                /* emit('cmd', {args: [], observe: function () {
                    alert('Command run!');
                }}); */
                break;
            }
        }
    });
    document.body.appendChild(jml('div',
        [
            ['select', {id: 'templates'},
                templates.reduce((opts, template) => {
                    opts.push(['option', [template]]);
                    return opts;
                }, [
                    ['option', {value: ''}, ['(Choose a template with which to populate this form)']]
                ])
            ],
            ['button', {id: 'deleteTemplate'}, ['Delete this template']],
            ['br', 'br'],
            ['label', [
                'Remember changes to this template\'s content? ',
                ['input', {id: 'rememberTemplateChanges', type: 'checkbox', checked: 'checked'}]
            ]],
            ['br', 'br'],
            ['div', {id: 'dynamic'}, [
                ['label', [
                    'Template name: ',
                    ['input', {id: 'templateName'}]
                ]],
                ' \u00a0 ',
                ['label', [
                    'Description: ',
                    ['input', {id: 'description'}]
                ]],
                ['fieldset', {id: 'pathHolder'}, [
                    ['legend', ['Executable directory(ies)']],
                    ['datalist', {id: 'datalist'}],
                    createPathInput()
                ]],
                ['div', [
                    ['label', [
                        'Window style',
                        ['select', {id: 'windowStyleSelect'}, [
                            ['option', {
                                value: '1',
                                title: 'Activates and displays a window. If the window is minimized or maximized, the system restores it to its original size and position.'
                            }, ['Activate - Restore from minimized/maximized']],
                            ['option', {
                                value: '3',
                                title: 'Activates the window and displays it as a maximized window.'
                            }, ['Activate - Maximize on open']],
                            ['option', {
                                value: '7',
                                title: 'Minimizes the window and activates the next top-level window.'
                            }, ['Minimize on open (and activate next top-level)']]
                        ]]
                    ]],
                    ' \u00a0 ',
                    ['label', [
                        'Global hot key combination to activate: ',
                        ['input', {
                            id: 'hotKey',
                            $on: {keypress: modifierKeypress}
                        }]
                    ]],
                    ['br'],
                    ['label', {'for': 'iconPath'}, [
                        'Icon path for the executable: '
                    ]],
                    ['select', {id: 'iconPathSelect'}, [
                        ['option', {value: ''}, ['(Choose a location)']],
                        ['option', {value: getHardPath('Desk')}, ['Desktop']],
                        ['option', {value: getHardPath('Pict')}, ['Pictures']],
                        ['option', {value: options.ffIcon}, ['Firefox icon']]
                    ]],
                    ['input', {
                        type: 'text', id: 'iconPath', list: 'datalist', autocomplete: 'off',
                        size: 70, value: ''
                    }],
                    ['button', {id: 'iconPick'}, [
                        'Browse\u2026'
                    ]],
                    createRevealButton('#iconPath'),
                    ' or ',
                    /*
                    Todo:
                    1. Icon (Use export-as-png in SVG Edit; need filetypes.json ICO
                    handler--allow testing by previewing as favicon)
                        1. (Paths where to read into a list of available
                        ico files, subject to a filetypes.json file in those
                        directories) (might utilize those paths already added for saving)
                        1. If filetypes.json has an icons section, use that by default instead?
                        1. open SVG or ICO but save back at least to ICO and ideally to SVG (but multiple file saving not supported currently by WebAppFind, so do through add-on for now)
                    1. Ensure icon will work by assigning appIDs to specific windows, profile (processes?), or app (idea to list FF tabs in jump list?); SHAddToRecentDocs may add app ID AND add the potentially useful behavior of putting web apps into recent docs (if add support, make this optional)
                        Windows: Separate windows get app IDs (SHGetPropertyStoreForWindow)
                        Process: SetCurrentProcessExplicitAppUserModelID
                        File association registration (ProgIDs; in Win7, add AppUserModelID)
                        Jump list destinations/tasks: ICustomDestinationList
                        Shortcut (PKEY_AppUserModel_ID)
                        SHAddToRecentDocs
                    */
                    ['button', {id: 'openOrCreateICO', title: 'If the ICO file at the supplied path does not exist, an empty file will be created which can then be edited. Be sure to save your changes to the ICO file when done.'}, [
                        'Create/Edit ICO file'
                    ]]
                ]],
                ['fieldset', [
                    ['legend', ['File/type association']],
                    ['div', {id: 'fileExtensionHolder'}, [
                        createFileExtensionControls()
                    ]],
                    ' OR ',
                    ['label', {'for': 'desktopFilePath'}, [
                        'Hard-coded desktop file: '
                    ]],
                    ['select', {id: 'desktopFilePathSelect'}, [
                        ['option', {value: ''}, ['(Choose a location)']],
                        ['option', {value: getHardPath('Docs')}, ['Documents']],
                        ['option', {value: getHardPath('Desk')}, ['Desktop']]
                    ]],
                    ['input', {
                        type: 'text', id: 'desktopFilePath', list: 'desktopFilePathDatalist', autocomplete: 'off',
                        size: 70, value: ''
                    }],
                    ['button', {id: 'desktopFilePick'}, [
                        'Browse\u2026'
                    ]],
                    createRevealButton('#desktopFilePath'),
                    ['datalist', {id: 'desktopFilePathDatalist'}],
                    ['br'],
                    ' OR ',
                    ['label', [
                        'Hard-coded URL document file: ',
                        ['input', {
                            type: 'url', id: 'documentURLBox', list: 'documentURLDatalist', autocomplete: 'off',
                            size: 100, value: ''
                        }],
                        ['datalist', {id: 'documentURLDatalist'}]
                    ]]
                ]],
                ['div', [
                    ['label', [
                        ['input', {type: 'radio', name: 'executableType', checked: 'checked'}],
                        'Open with WebAppFind?'
                    ]],
                    ['label', [
                        ['input', {type: 'radio', name: 'executableType'}],
                        'Open a hard-coded URL only?'
                    ]],
                    ['label', [
                        ['input', {type: 'radio', name: 'executableType'}],
                        'Don\'t open any URL'
                    ]]
                ]],
                /*
                Todo:
                1. Separate executables like Prism?: hard-code a profile (create one programmatically for user in
                an install script?) firefox.exe -no-remote -P executable http://example.com
                1. Whether to auto-create a new profile just for this combination of options and a
                -no-remote call to allow executable-like behavior (creates a separate icon instance
                in the task bar though not a separate icon unless, again, the icon is attached to a short cut)
                */
                ['div', [
                    ['label', {'for': 'profileName'}, [
                        'Profile to associate with this executable: '
                    ]],
                    ['select', {id: 'profileNameSelect'}, getProfiles()],
                    ['input', {id: 'profileName'}],
                    ['button', {id: 'manageProfiles'}, [
                        'Manage profiles'
                    ]]
                ]],
                ['label', [
                    'Mode: ',
                    ['select', {id: 'mode'}, [
                        ['option', {value: 'view'}, ['View']],
                        ['option', {value: 'binaryview'}, ['Binary view']],
                        ['option', {value: 'edit'}, ['Edit']],
                        ['option', {value: 'binaryedit'}, ['Binary edit']]
                    ]]
                ]],
                ' \u00a0 ',
                ['label', [
                    'Custom mode: ',
                    ['input', {id: 'customMode'}]
                ]],
                ['br'],
                // Todo:
                ['label', ['WebAppFind preference overrides: ']],
                ['br'],
                // Creates an autocomplete for URLs
                // Todo:
                // 1. An optional, hard-coded web app URL (to circumvent the normal detection procedures and always open with a given web app)
                ['label', [
                    'Hard-coded web app URI: ',
                    ['input', {
                        type: 'url', id: 'urlBox', list: 'urlDatalist', autocomplete: 'off',
                        size: 100, value: ''
                    }],
                    ['datalist', {id: 'urlDatalist'}]
                ]],
                ['br'],
                ['br'],
                // Todo: implement
                ['label', [
                    'Behavior upon opening of web app/URL: ',
                    ['select', [
                        ['option', ['New tab']],
                        ['option', ['New window']],
                        ['option', ['Hidden window']]
                    ]]
                ]],
                ['br'],
                //  Todo: 1. Whether web app to open by default in full-screen mode (could just let web app and user handle, but user may prefer to bake it in to a particular executable only)
                ['label', [
                    'Open web app/URL by default in full-screen mode?',
                    ['input', {type: 'checkbox'}]
                ]],
                ['br'],
                //  Todo: 1. Batch file building section; Raw textarea (OR (only?) when webappfind is also installed...)
                ['label', [
                    'Batch file commands in addition to any other options set above: ',
                    ['br'],
                    ['textarea']
                ]],
                ['br'],
                //  Todo: 1. Strings
                ['label', [
                    'Hard-coded string to pass as content to the WebAppFind web app: ',
                    ['br'],
                    ['textarea']
                ]],
                ['br'],
                //  Todo: 1. JavaScript (implement with CodeMirror or option to load JS file (itself invocable with WebAppFind) instead)
                ['label', [
                    'Hard-coded string to pass as evalable JavaScript to the WebAppFind web app: ',
                    ['br'],
                    ['textarea']
                ]],
                ['br'],
                //  Todo: 1. Arguments
                ['label', [
                    'Command line arguments in addition to any other options set above: ',
                    // ['br'],
                    ['input', {size: 100}]
                ]],
                ['br'],
                ['button', {id: 'createExecutable'}, [
                    'Create executable(s) and save template'
                ]],
                ' \u00a0 ',
                ['button', {id: 'runCommands'}, [
                    'Run commands and save template'
                ]]
            ]]
        ],
        null
    ));
}

// We could abstract this, but it's light enough for now to keep flexible
const [paths, profiles, templates] = await Promise.all([
    EB.getHardPaths(),
    EB.getProfiles(),
    EB.getTemplates()
]);
console.log('ttt', templates);
/*
if (document.body) {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
}
*/
// browser.runtime.sendMessage(Object.assign(obj || {}, {type}));
init();

function flattenDepthOne (arrays) {
    return [].concat(...arrays);
}
const metas = flattenDepthOne(await browser.tabs.executeScript({
    allFrames: true,
    code: `
[...document.querySelectorAll('meta[name="webappfind"]')].map((m) => m.content)
`,
    runAt: 'document_end'
}));
console.log('metas-browser-action', metas);
})();
