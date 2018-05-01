/* eslint-env webextensions */
/* globals jQuery */

import Tags from './Tags.js';
import ExpandableInputs from './ExpandableInputs.js';
import execute from '/lib/execute.js';
import jml from '/vendor/jamilih/dist/jml-es.js';
import {_} from '/utils/i18n.js';
import {U, $, $$} from '/utils/templateUtils.js';
import {Dialog} from '/utils/dialogs.js';
import * as EnvironmentBridge from '/node-bridges/EnvironmentBridge.js';
import * as FileBridge from '/node-bridges/FileBridge.js';
import loadStylesheets from '/vendor/load-stylesheets/dist/index-es.js';

import addMultipleSelect from '/vendor/multiple-select/dist/multiple-select-es.js';
addMultipleSelect(jQuery);

const uiLanguage = browser.i18n.getUILanguage();
const dialogs = new Dialog({locale: uiLanguage});

window.addEventListener('resize', function () {
    browser.storage.local.set({
        windowCoords: [window.outerWidth, window.outerHeight]
    });
});

(async () => {
const {updateContextMenus, tabData} = browser.extension.getBackgroundPage();
// const platform = browser.runtime.PlatformOs;

const dynamicCMItems = {}, dynamicCMItems2 = {};

async function save (name, data) {
    await browser.storage.local.set({
        [name]: data
    });
    updateContextMenus();
}
async function remove (name) {
    await browser.storage.local.remove([name]);
    if (dynamicCMItems[name]) {
        dynamicCMItems[name].destroy();
    }
    if (dynamicCMItems2[name]) {
        dynamicCMItems2[name].destroy();
    }
    updateContextMenus();
}

function removeStorage ({commands, keepForm, inputs}) {
    oldStorage = commands;
    rebuildCommandList();
    if (!keepForm) {
        populateEmptyForm(inputs);
    }
}

function newStorage ({name, commands, inputs}) {
    oldStorage = commands;
    rebuildCommandList();
    setSelectOfValue('#selectNames', name);
    // Important to update other flags even if just changed,
    //    so convenient to just re-run
    populateFormWithStorage(name, inputs);
}

async function buttonClick (data) {
    const {name, keepForm, close} = data;
    let commands;
    try {
        ({commands} = await browser.storage.local.get('commands'));
    } catch (err) {}
    if (data.remove) {
        remove(name);
        removeStorage({commands, keepForm, inputs: data.inputs});
    }
    if (data.save) {
        save(name, data.detail);
        newStorage({name, commands, inputs: data.inputs});
    }
    if (data.execute) {
        await execute(name);
        finished();
    }
    if (close) {
        window.close();
    }
}

const optionData = {};
let currentName = '',
    createNewCommand = true,
    changed = false,
    nameChanged = false;

// tabData: Passed JSON object
// sender: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/MessageSender
// sendResponse: One time callback
/* browser.runtime.onMessage.addListener(async (tabData, sender, sendResponse) => {
    sendResponse({});
}); */
const {itemType} = tabData;
console.log('tabData', tabData);
// Has now received arguments, so we can inject...
// We might `executeScript` to check for
//  `window.getSelection()` (see append-to-clipboard add-on)
//  to get raw HTML of a selection (but unfortunately not a clicked
//  element without a selection)

const [
    {commands: initialStorage},
    executables,
    temps
] = await Promise.all([
    browser.storage.local.get('commands'),

    EnvironmentBridge.getExePaths(),
    EnvironmentBridge.getTempPaths(),
    loadStylesheets([
        '/vendor/dialog-polyfill/dialog-polyfill.css',
        '/vendor/bootstrap/dist/css/bootstrap.css',
        '/vendor/multiple-select/multiple-select.css',
        'one-off.css'
    ])
]);
let oldStorage = initialStorage;
if (!initialStorage) {
    await browser.storage.local.set({commands: {}});
    oldStorage = {};
}

const options = { // any JSON-serializable key/values
    itemType,
    executables,
    temps,
    tabData,
    eiLocale: uiLanguage,
    eiLabels: [
        'argsNum', 'urlNum', 'fileNum'
    ].reduce((locale, key) => {
        locale[key] = _('expandable_inputs_' + key);
        return locale;
    }, {})
};

// ADD INITIAL CONTENT ONCE DATA AVAILABLE
document.title = _('atyourcommand_doc_title');

// Todo: Why are we not seeing this?
jml('div', {id: 'loading'}, [
    _('loading')
], $('body'));

try {
    init(options);
} catch (err) { // Get stack trace which Firefox isn't otherwise giving
    console.log('err', err);
    throw err;
}

// TEMPLATE UTILITIES

function rebuildCommandList () {
    while ($('#selectNames').firstChild) {
        $('#selectNames').firstChild.remove();
    }
    jml({'#': [
        ['option', {value: '', selected: 'selected'}, [_('create_new_command')]],
        ...Object.keys(oldStorage).sort().map((commandName) => {
            return ['option', [commandName]];
        })
    ]}, $('#selectNames'));
}

/**
* @param {array} optTexts Array of option text
* @param {array} [values] Array of values corresponding to text
* @param {string} [ns] Namespace to add to locale string
*/
/*
function buildOptions (optTexts, values, ns) {
    return optTexts.map((optText, i) => {
        const value = values[i] || optText;
        return ['option', {value}, [
            _((ns ? (ns + '_') : '') + optText)
        ]];
    });
}
*/

// BEHAVIORAL UTILITIES
function setMultipleSelectOfValue (sel, vals) {
    const names = typeof sel === 'string' ? $(sel) : sel;
    [...names.options].forEach((option) => {
        if (vals.includes(option.value)) {
            option.selected = true;
        }
    });
}

function setSelectOfValue (sel, val) {
    const names = typeof sel === 'string' ? $(sel) : sel;
    const idx = [...names.options].findIndex(({value}) => {
        return value === val;
    });
    names.selectedIndex = idx === -1 ? 0 : idx;
}

function addOptions (type) {
    const {paths} = optionData[type],
        sel = type === 'executables' ? '#' + type : '.ei-files-presets',
        selects = $$(sel);

    selects.forEach((select) => {
        while (select.firstChild) {
            select.firstChild.remove();
        }

        jml({'#': paths.map(([text, value]) => {
            return ['option', {value}, [text]];
        })}, select);

        if (type === 'temps') {
            setSelectOfValue(
                select,
                $('#' + select.id.replace('-select-', '-input-')).value
            );
        }
    });
}

function handleOptions (typeDataMap) {
    Object.entries(typeDataMap).forEach(([type, data]) => {
        optionData[type] = data;
        addOptions(type);
    });
}

function resetChanges () {
    changed = false;
    nameChanged = false;
}

function populateEmptyForm (inputs) {
    // Unlike populateFormWithStorage, we will always need to set the name
    $('#selectNames').selectedIndex = 0;
    $('#executablePath').focus();

    createNewCommand = true;
    currentName = '';
    $('#delete').style.display = 'none';

    $('#command-name').value = '';
    $('#command-name').defaultValue = '';

    $('#executables').selectedIndex = 0;
    $('#executablePath').value = '';
    $('#restrict-contexts').selectedIndex = 0;
    $('#own-context').value = '';

    ['args', 'urls', 'files'].forEach((inputType) => {
        inputs[inputType].setTextValues();
    });
    // Todo: Uncomment if we get directory selection working
    //    (e.g., Ajax+Node.js local file browser)
    // inputs.files.setValues('directory');
    // Todo: make a way for the select to be populated through the ExpandableInputs API
    addOptions('temps');
    resetChanges();
}

function populateFormWithStorage (name, inputs) {
    createNewCommand = false;
    currentName = name;
    $('#delete').style.display = 'inline';

    $('#command-name').value = name;
    $('#command-name').defaultValue = name;

    // Todo: Could make class for each type of storage (select,
    //   input, etc.) and just invoke its destroy() or create() methods
    //   here, rather than adding specific details in every place needed.
    const oldStorageForName = oldStorage[currentName];
    const {executablePath, restrictContexts, ownContext} = oldStorageForName;
    setSelectOfValue('#executables', executablePath);
    $('#executablePath').value = executablePath;

    setMultipleSelectOfValue('#restrict-contexts', restrictContexts);
    $('#own-context').value = ownContext;

    ['args', 'urls', 'files'].forEach((inputType) => {
        inputs[inputType].setTextValues(oldStorageForName[inputType]);
    });
    // Todo: Uncomment if we get directory selection working
    //    (e.g., Ajax+Node.js local file browser)
    // inputs.files.setValues('directory', oldStorageForName.dirs);
    // Todo: make a way for the select to be populated through the ExpandableInputs API
    addOptions('temps');
    resetChanges();
}

function fileOrDirResult ({path, selector}) {
    if (path) {
        $(selector).value = path;
    }
}

function finished () {
    $('#processExecuted').style.display = 'block';
    if (!$('#keepOpen').checked) {
        buttonClick({id: 'cancel'});
    } else {
        setTimeout(() => {
            $('#processExecuted').style.display = 'none';
        }, 2000);
    }
}
/*
function setOS (os) {
    setSelectOfValue('#export-os-type', os);
}
*/
function getSuffixForOS () {
    const type = $('#export-os-type').value,
        osMap = {
            winnt: '.bat'
        };
    if (osMap.hasOwnProperty(type)) {
        return osMap[type];
    }
    return '';
}

async function filePick (data) {
    const {selector} = data;
    const {type, ...args} = await FileBridge.picker({
        ...data,
        locale: uiLanguage
    });
    fileOrDirResult({selector, ...args});
}

function init ({
    itemType, executables, temps, tabData,
    eiLocale,
    eiLabels: {argsNum, urlNum, fileNum}
}) {
    const inputs = {
        args: new ExpandableInputs({
            locale: eiLocale,
            table: 'executableTable',
            namespace: 'args',
            label: argsNum,
            inputSize: 60,
            // Might perhaps make this optional to save space, but this
            //  triggers creation of a textarea so args could be more
            //  readable (since to auto-escape newlines as needed)
            rows: 1
        }),
        urls: new ExpandableInputs({
            locale: eiLocale,
            table: 'URLArguments',
            namespace: 'urls',
            label: urlNum,
            inputSize: 40,
            inputType: 'url'
        }),
        files: new ExpandableInputs({
            locale: eiLocale,
            table: 'fileArguments',
            namespace: 'files',
            label: fileNum,
            inputSize: 25,
            inputType: 'file',
            selects: true
        })
    };
    $('#loading').remove();
    jml('div', [
        ['div', {
            id: 'names',
            hidden: itemType === 'one-off'
        }, [
            ['select', {id: 'selectNames', size: 39, $on: {
                async click ({target: {value: name}}) {
                    if (changed) {
                        try {
                            await dialogs.confirm(_('have_unsaved_changes'));
                        } catch (cancelled) {
                            return;
                        }
                        setSelectOfValue('#selectNames', currentName);
                    }
                    if (name === '') { // Create new command
                        populateEmptyForm(inputs);
                    } else {
                        populateFormWithStorage(name, inputs);
                    }
                }
            }}]
        ]],
        ['div', {
            id: 'main',
            class: itemType === 'one-off' ? 'closed' : 'open',
            $on: {
                change ({target: {id}}) {
                    changed = true;
                    if (id === 'command-name') {
                        nameChanged = true;
                    }
                }
            }
        }, [
            ['button', {id: 'showNames', $on: {
                click () {
                    $('#names').hidden = !$('#names').hidden;
                    const showNames = $('#showNames');
                    if (!$('#names').hidden) {
                        $('#main').className = 'open';
                        showNames.firstChild.replaceWith(_('lt'));
                    } else {
                        $('#main').className = 'closed';
                        showNames.firstChild.replaceWith(_('gt'));
                    }
                }
            }}, [
                _(itemType === 'one-off' ? 'gt' : 'lt')
            ]],
            ['div', {id: 'processExecuted', style: 'display:none;'}, [
                _('Process_executed')
            ]],
            ['br'],
            ['div', {id: 'substitutions-explanation-container'}, [
                ['h3', [_('Substitutions_explained')]],
                ['div', {id: 'substitutions-explanation'}, [
                    _('Substitution_sequences_allow'),
                    ['br'], ['br'],
                    _('prefixes_can_be_applied'),
                    ['dl', [
                        'save_temp', 'ucencode_', 'uencode_', 'escquotes_'
                    ].reduce((children, prefix) => {
                        // Todo: Replace with `flatMap` when decided: https://github.com/tc39/proposal-flatMap/pull/56
                        children.push(['dt', [prefix]]);
                        children.push(['dd', [_('prefix_' + prefix)]]);
                        return children;
                    }, [])],
                    ['b', [_('Sequences')]],
                    ['dl', [
                        'eval', 'contentType', 'pageURL',
                        'pageTitle', 'pageHTML', 'bodyText',
                        'selectedHTML', 'selectedText',
                        'linkPageURLAsNativePath', 'linkPageTitle',
                        'linkBodyText', 'linkPageHTML',
                        'imageDataURL', 'imageDataBinary'
                    ].reduce((children, seq) => {
                        // Todo: Replace with `flatMap` when decided: https://github.com/tc39/proposal-flatMap/pull/56
                        children.push(['dt', [seq]]);
                        children.push(['dd', [_('seq_' + seq)]]);
                        return children;
                    }, [])]
                ]]
            ]],
            ['div', {id: 'substitutions-used-container'}, [
                ['h3', [_('Substitutions_used')]],
                ['div', {id: 'substitutions-used'}, [
                    _('currently_available_sequences'),
                    ['br'], ['br'],
                    ['dl', [
                        ['dt', ['save_temp']], ['dd'],
                        ['dt', ['ucencode_']], ['dd'],
                        ['dt', ['uencode_']], ['dd'],
                        ['dt', ['escquotes_']], ['dd']
                    ]],
                    ['b', [_('Sequences')]],
                    ['dl', [
                        ...[
                            // Todo: While useful to show `eval` result here,
                            //   this would need to occur as the string was
                            //   typed (and thus potentially dangerous)
                            // 'eval',
                            /*
                            // These may be better as user-`eval` given latency
                            //   in retrieving
                            'linkPageURLAsNativePath', 'linkPageTitle',
                            'linkBodyText', 'linkPageHTML',
                            'imageDataURL', 'imageDataBinary'
                            */
                            'contentType', 'pageURL', 'pageTitle',
                            'pageHTML', 'bodyText',
                            'selectedHTML', 'selectedText',
                            // Supplied by webextensions API
                            'favIconUrl',
                            'linkText', 'linkUrl',
                            'frameUrl', 'srcUrl', 'mediaType',
                            'modifiers'
                        ].reduce((children, seq) => {
                            // Todo: Replace with `flatMap` when decided: https://github.com/tc39/proposal-flatMap/pull/56
                            children.push(['dt', [seq]]);
                            children.push(['dd', {
                                style: 'width: 400px; border: 1px solid black; height: 50px; overflow: auto;'
                            }, [String(tabData[seq])]]);
                            return children;
                        }, [])
                    ]]
                ]]
            ]],
            ['form', {$on: {
                submit (e) {
                    e.preventDefault();
                },
                click: [function (e) {
                    const cl = e.target.classList;
                    // Also "setCustomValidity" and individual items also have
                    //    "validationMessage" property
                    if (!this.checkValidity() &&
                        (cl.contains('execute') || cl.contains('save') ||
                            cl.contains('batch_export'))
                    ) {
                        e.stopPropagation(); // Don't allow it to get to submit
                    }
                }, !!'capturing']
            }}, [
                ['div', {id: 'command-name-section'}, [
                    ['label', {title: _('if_present_command_saved')}, [
                        _('Command_name') + ' ',
                        ['input', {
                            id: 'command-name',
                            size: '35',
                            autofocus: itemType === 'commands'
                        }]
                    ]],
                    ['div', [
                        _('command_preview'),
                        U.nbsp,
                        ['input', {id: 'command-preview', readonly: 'readonly', value: '(Preview here)'}]
                    ]],
                    ['br'],
                    ['label', [
                        _('Restrict_contexts') + ' ',
                        ['select', {
                            multiple: 'multiple',
                            title: _('Italicized_obtained_from_source_page_context'),
                            id: 'restrict-contexts',
                            $on: {
                                click (e) {
                                    // Not sure why we're losing focus or the click event
                                    //   is going through here but not in my multiple-select demo
                                    // ms.focus();
                                    e.stopPropagation();
                                }
                            }
                        }, Tags.map(([mainElement, childElements]) => {
                            return ['optgroup', {
                                label: _(mainElement)
                            }, childElements.map((tagInfo) => {
                                const atts = {};
                                let attInfo;
                                if (typeof tagInfo !== 'string') {
                                    [tagInfo, attInfo] = tagInfo;
                                    if (attInfo.hidden === true) {
                                        atts.class = 'hiddenContext';
                                    }
                                }
                                return ['option', atts, [tagInfo]];
                            })];
                        })]
                    ]],
                    ' ' + _('or') + ' ',
                    ['label', [
                        _('Specify_your_own_context') + ' ',
                        ['input', {id: 'own-context', placeholder: 'a[href],img[src]'}]
                    ]]
                ]],
                ['table', [
                    /*
                    ['tr', [
                        ['td', [
                            ['label', [_('Label:')]]
                        ]],
                        ['td', [
                            ['input', {id: 'label'}]
                        ]]
                    ]]
                    */
                    ['tr', [
                        ['td', [
                            ['label', {'for': 'executablePath'}, [_('Path_of_executable')]]
                        ]],
                        ['td', [
                            ['select', {id: 'executables', 'class': 'ei-exe-presets', dataset: {
                                ei_sel: '#executablePath'
                            }}],
                            ' ',
                            ['input', {
                                type: 'text', size: '55', id: 'executablePath',
                                class: 'ei-exe-path',
                                list: 'datalist', autocomplete: 'off', value: '',
                                required: 'required'
                            }],
                            /*
                            ' ',
                            _('or'),
                            // The following with `webkitRelativePath` will only get
                            //   the direct parent folder name and the file name
                            ['input', {
                                type: 'file', id: 'executablePick', class: 'ei-exe-picker',
                                accept: '.exe, .app',
                                webkitdirectory: 'webkitdirectory',
                                dataset: {
                                    ei_sel: '#executablePath'
                                }
                            }],
                            */
                            /*
                            // Todo: We might reenable this if we implement a
                            //   Ajax+Node-based file picker (could even use
                            //   Miller columns, etc.)
                            ['input', {
                                type: 'button', id: 'executablePick', class: 'ei-exe-picker',
                                dataset: {
                                    ei_sel: '#executablePath',
                                    'ei_default-extension': 'exe'
                                },
                                value: _('Browse')
                            }],
                            */
                            ['datalist', {id: 'datalist'}],
                            ['input', {
                                type: 'button',
                                class: 'ei-exe-revealButton',
                                dataset: {ei_sel: '#executablePath'}
                            }]
                        ]]
                    ]]
                ]],
                ['div', {id: 'executableTableContainer'}, [
                    ['table', {id: 'executableTable'}]
                ]],
                ['div', {id: 'fileAndURLArgumentContainer'}, [
                    ['b', [_('Hard_coded_files_and_URLs')]],
                    ['br'],
                    ['table', {id: 'fileArguments'}],
                    ['table', {id: 'URLArguments'}]
                ]],
                ['br'],
                ['div', {'class': 'execution'}, [
                    ['label', [
                        ['input', {type: 'checkbox', id: 'keepOpen'}],
                        ' ',
                        _('keep_dialog_open')
                    ]],
                    ['br'],
                    ['button', {'class': 'passData save'}, [_('Save')]],
                    ['button', {
                        id: 'delete',
                        class: 'passData delete',
                        hidden: true
                    }, [_('Delete')]],
                    // ['br'],
                    ['button', {'class': 'passData execute'}, [_('Execute_on_current_page')]],
                    ['button', {id: 'cancel'}, [_('Cancel')]]
                ]]
                /*
                Todo:
                ['div', {'class': 'export'}, [
                    ['label', [
                        _('os_format_for_batch_export'),
                        U.nbsp.repeat(2),
                        ['select', {id: 'export-os-type'}, buildOptions(
                            ['Linux', 'Mac', 'Windows'],
                            ['linux', 'mac', 'win']
                        )]
                        // Also could add values (and i18n and localize text) for
                        //   these auto-lower-cased values from
                        //       https://developer.mozilla.org/en-US/docs/OS_TARGET:
                        //   'android', 'SunOS', 'FreeBSD', 'OpenBSD',
                        //   'NetBSD', 'OS2', 'BeOS', 'IRIX64', 'AIX',
                        //   'HP-UX', 'DragonFly', 'skyos', 'riscos', 'NTO', 'OSF1'
                    ]],
                    ['br'],
                    ['button', {'class': 'batch_export'}, [_('Export_to_batch')]]
                ]]
                */
            ]]
        ]]
    ], $('body'));

    // setOS(platform);

    // ADD EVENTS

    /* const ms = */
    jQuery('#restrict-contexts').multipleSelect({
        filter: true,
        hideOptgroupCheckboxes: true,
        filterAcceptOnEnter: true,
        width: '150'
    });

    // Todo: put these checks as methods on a class for each type of control
    //        (can still call from body listener)
    $('body').addEventListener('click', async function (e) {
        let value, sel, selVal;
        const {target} = e,
            {dataset, parentNode} = target || {},
            cl = target.classList;

        if (cl.contains('ei-files-presets') ||
            (
                parentNode &&
                parentNode.classList.contains('ei-files-presets')
            ) ||
                cl.contains('ei-exe-presets') ||
                (
                    parentNode &&
                    parentNode.classList.contains('ei-exe-presets')
                )
        ) {
            ({value} = target);
            if (!value) {
                return;
            }
            sel = dataset.ei_sel || (parentNode && parentNode.dataset.ei_sel);
            if (sel) {
                $(sel).value = value;
            }
        } else if (cl.contains('ei-files-picker') || cl.contains('ei-exe-picker')) {
            sel = dataset.ei_sel;
            // Use .select() on input type=file picker?
            filePick({
                dirPath: $(sel).value,
                selector: sel,
                defaultExtension: dataset.ei_defaultExtension || undefined,
                selectFolder: ($(dataset.ei_directory) && $(dataset.ei_directory).checked)
                    ? true
                    : undefined
            });
        } else if (cl.contains('ei-files-revealButton') || cl.contains('ei-exe-revealButton')) {
            sel = dataset.ei_sel;
            selVal = sel && $(sel).value;
            if (selVal) {
                FileBridge.reveal({fileName: selVal});
            } else {
                dialogs.alert(_('choose_file_to_reveal'));
            }
        } else if (target.id === 'cancel') {
            buttonClick({close: true});
        } else if (cl.contains('batch_export')) {
            const commandText = 'todo: serialize the form into a batch file here';
            const uri = 'data:,' + encodeURIComponent(commandText);
            const a = jml('a', {
                style: 'display: none;',
                download: ($('#command-name').value || 'command') + getSuffixForOS(),
                href: uri
            }, ['hidden'], $('body'));
            a.click();
            e.preventDefault(); // Avoid blanking out
        } else if (cl.contains('passData')) {
            const name = $('#command-name').value;
            if (cl.contains('delete')) {
                try {
                    await dialogs.confirm(_('sure_wish_delete'));
                } catch (cancelled) {
                    return;
                }
                buttonClick({name, remove: true, inputs});
                return;
            }
            if (cl.contains('save')) {
                if (!name) {
                    await dialogs.alert(_('supply_name'));
                    return;
                }
                if (nameChanged) {
                    if (oldStorage[name]) {
                        try {
                            await dialogs.confirm(_('name_already_exists_overwrite'));
                        } catch (cancelled) {
                            return;
                        }
                    } else if (!createNewCommand) {
                        // User wishes to create a new record (or cancel)
                        try {
                            await dialogs.confirm(_('have_unsaved_name_change'));
                        } catch (cancelled) {
                            $('#selectNames').selectedIndex = 0;
                            nameChanged = false;
                            // Return so that user has some way of correcting or
                            //   avoiding (without renaming)
                            return;
                        }
                    }
                    // Proceed with rename, so first delete old value
                    //    (todo: could ensure first added)
                    buttonClick({
                        name: $('#command-name').defaultValue,
                        remove: true,
                        inputs,
                        keepForm: true
                    });
                } else if (!changed && !cl.contains('execute')) {
                    await dialogs.alert(_('no_changes_to_save'));
                    return;
                }
            }
            const data = {
                name,
                save: cl.contains('save'),
                inputs,
                detail: {
                    executablePath: $('#executablePath').value,
                    args: inputs.args.getTextValues(),
                    files: inputs.files.getTextValues(),
                    urls: inputs.urls.getTextValues(),
                    // Todo: Uncomment if we get directory selection working
                    //    (e.g., Ajax+Node.js local file browser)
                    // dirs: inputs.files.getValues('directory'),
                    restrictContexts: [...$('#restrict-contexts').selectedOptions].map(({value}) => {
                        return value;
                    }),
                    ownContext: $('#own-context').value
                }
            };
            if (cl.contains('execute')) {
                data.execute = true;
            }
            console.log('data', data);
            buttonClick(data);
        }
    });

    $('body').addEventListener('input', async function ({target}) {
        const {value} = target;
        if (target.classList.contains('ei-files-path') ||
            target.classList.contains('ei-exe-path')
        ) {
            const data = await FileBridge.autocompletePaths({
                value,
                listID: target.getAttribute('list')
            });
            autocompletePathsResponse(data);
        }
    });

    // COPIED FROM filebrowser-enhanced directoryMod.js (RETURN ALL MODIFICATIONS THERE)
    function autocompletePathsResponse (data) {
        const datalist = $('#' + data.listID);
        while (datalist.firstChild) {
            datalist.firstChild.remove();
        }
        data.optValues.forEach((value) => {
            const option = jml('option', {
                // text: value,
                value
            });
            datalist.append(option);
        });
    }

    // INITIAL BEHAVIORS

    rebuildCommandList();

    // Todo: For prefs when prev. values stored, call multiple times and
    //         populate and reduce when not used
    ['args', 'urls', 'files'].forEach((inputType) => {
        inputs[inputType].add();
    });

    handleOptions({
        executables,
        temps
    });
}
})();
