/* eslint-env webextensions, browser */
/* globals Tags, ExpandableInputs, jml, jQuery, $ */
$.noConflict();
(() => {
'use strict';

const
    optionData = {},
    on = (msg, cb) => {
        cb({firstChild: null}); // eslint-disable-line standard/no-callback-literal
        return []; // TODO
    },
    emit = (type, obj) => {
        // TODO
        // browser.runtime.sendMessage(Object.assign(obj || {}, {type}));
    },
    options = {},
    eiLocale = options.ei_locale || {}, // eslint-disable-line camelcase
    inputs = {
        args: new ExpandableInputs({
            locale: eiLocale,
            table: 'executableTable',
            namespace: 'args',
            label: eiLocale.args_num,
            inputSize: 60,
            rows: 1 // Might perhaps make this optional to save space, but this triggers creation of a textarea so args could be more readable (since to auto-escape newlines as needed)
        }),
        urls: new ExpandableInputs({
            locale: eiLocale,
            table: 'URLArguments',
            namespace: 'urls',
            label: eiLocale.url_num,
            inputSize: 40,
            inputType: 'url'
        }),
        files: new ExpandableInputs({
            locale: eiLocale,
            table: 'fileArguments',
            namespace: 'files',
            label: eiLocale.file_num,
            inputSize: 25,
            inputType: 'file',
            selects: true
        })
    };
let {oldStorage} = options,
    currentName = '',
    createNewCommand = true,
    changed = false,
    nameChanged = false;

// GENERIC UTILITIES
/*
function l (msg) {
    console.log(msg);
}
*/
function $ (sel) {
    return document.querySelector(sel);
}
function $$ (sel) {
    return [...document.querySelectorAll(sel)];
}
function _ (...args) {
    return browser.i18n.getMessage(...args) || `(Non-internationalized string--FIXME!) ${args.join(', ')}`;
}

// TEMPLATE UTILITIES
/**
* @param {array} optTexts Array of option text
* @param {array} [values] Array of values corresponding to text
* @param {string} [ns] Namespace to add to locale string
*/
function buildOptions (optTexts, values, ns) {
    return optTexts.map((optText, i) => {
        const value = values[i] || optText;
        return ['option', {value}, [
            _((ns ? (ns + '_') : '') + optText)
        ]];
    });
}

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
    const paths = optionData[type].paths,
        sel = type === 'executables' ? '#' + type : '.ei-files-presets',
        selects = $$(sel);

    selects.forEach((select) => {
        while (select.firstChild) {
            select.firstChild.remove();
        }

        paths.forEach(([text, value]) => {
            const option = document.createElement('option');
            option.text = text;
            option.value = value;
            select.appendChild(option);
        });
        if (type === 'temps') {
            setSelectOfValue(select, $('#' + select.id.replace('-select-', '-input-')).value);
        }
    });
}

function handleOptions (data) {
    optionData[data.type] = data;
    addOptions(data.type);
}

function resetChanges () {
    changed = false;
    nameChanged = false;
}

function populateEmptyForm () {
    $('#selectNames').selectedIndex = 0; // Unlike populateFormWithStorage, we will always need to set the name
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
    inputs.files.setValues('directory');
    addOptions('temps'); // Todo: make a way for the select to be populated through the ExpandableInputs API
    resetChanges();
}

function populateFormWithStorage (name) {
    createNewCommand = false;
    currentName = name;
    $('#delete').style.display = 'inline';

    $('#command-name').value = name;
    $('#command-name').defaultValue = name;

    // Todo: Could make class for each type of storage (select,
    //   input, etc.) and just invoke its destroy() or create() methods
    //   here, rather than adding specific details in every place needed.
    const oldStorageForName = oldStorage[currentName];
    const {executablePath, restrictContexts, ownContext, dirs} = oldStorageForName;
    setSelectOfValue('#executables', executablePath);
    $('#executablePath').value = executablePath;

    setMultipleSelectOfValue('#restrict-contexts', restrictContexts);
    $('#own-context').value = ownContext;

    ['args', 'urls', 'files'].forEach((inputType) => {
        inputs[inputType].setTextValues(oldStorageForName[inputType]);
    });
    inputs.files.setValues('directory', dirs);
    addOptions('temps'); // Todo: make a way for the select to be populated through the ExpandableInputs API
    resetChanges();
}

function fileOrDirResult ({path, selector}) {
    if (path) {
        $(selector).value = path;
    }
}

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

function finished () {
    $('#processExecuted').style.display = 'block';
    if (!$('#keepOpen').checked) {
        emit('buttonClick', {id: 'cancel'});
    } else {
        setTimeout(() => {
            $('#processExecuted').style.display = 'none';
        }, 2000);
    }
}
function newStorage (data) {
    oldStorage = data.commands;
    rebuildCommandList();
    setSelectOfValue('#selectNames', data.name);
    populateFormWithStorage(data.name); // Important to update other flags even if just changed, so convenient to just re-run
}
function removeStorage (data) {
    oldStorage = data.commands;
    rebuildCommandList();
    if (!data.keepForm) {
        populateEmptyForm();
    }
}
function setOS (os) {
    setSelectOfValue('#export-os-type', os);
}
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
// ADD INITIAL CONTENT

document.title = _('title');
jml('div', [
    ['div', (() => {
        const atts = {id: 'names'};
        if (options.itemType === 'one-off') {
            atts.hidden = true;
        }
        return atts;
    })(), [
        ['select', {id: 'selectNames', size: 39, $on: {
            click ({target: {value: name}}) {
                if (changed) {
                    const abandonUnsaved = confirm(_('have_unsaved_changes'));
                    if (!abandonUnsaved) {
                        setSelectOfValue('#selectNames', currentName);
                        return;
                    }
                }
                if (name === '') { // Create new command
                    populateEmptyForm();
                } else {
                    populateFormWithStorage(name);
                }
            }
        }}]
    ]],
    ['div', (() => {
        const atts = {id: 'main', $on: {
            change ({target: {id}}) {
                changed = true;
                if (id === 'command-name') {
                    nameChanged = true;
                }
            }
        }};
        atts.className = options.itemType === 'one-off' ? 'closed' : 'open';
        return atts;
    })(), [
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
            _(options.itemType === 'one-off' ? 'gt' : 'lt')
        ]],
        ['div', {id: 'processExecuted', style: 'display:none;'}, [
            _('Process executed')
        ]],
        ['br'],
        ['div', {id: 'substitutions-explanation-container'}, [
            ['h3', [_('Substitutions explained')]],
            ['div', {id: 'substitutions-explanation'}, [
                _('Substitution_sequences_allow'),
                ['br'], ['br'],
                _('prefixes_can_be_applied'),
                ['dl', [
                    'save-temp', 'ucencode-', 'uencode-', 'escquotes-'
                ].reduce((children, prefix) => { // Todo: Replace with `flatMap` when decided: https://github.com/tc39/proposal-flatMap/pull/56
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
                ].reduce((children, seq) => { // Todo: Replace with `flatMap` when decided: https://github.com/tc39/proposal-flatMap/pull/56
                    children.push(['dt', [seq]]);
                    children.push(['dd', [_('seq_' + seq)]]);
                    return children;
                }, [])]
            ]]
        ]],
        ['div', {id: 'substitutions-used-container'}, [
            ['h3', [_('Substitutions used')]],
            ['div', {id: 'substitutions-used'}, [
                _('currently_available_sequences'),
                ['br'], ['br'],
                /*
                ['dl', [
                    ['dt', ['save-temp-']], ['dd'],
                    ['dt', ['ucencode-']], ['dd'],
                    ['dt', ['uencode-']], ['dd'],
                    ['dt', ['escquotes-']], ['dd'],
                ]],
                */
                ['b', [_('Sequences')]],
                ['dl', [
                    'eval', 'contentType', 'pageURL', 'pageTitle',
                    'pageHTML', 'bodyText',
                    'selectedHTML', 'selectedText',
                    'linkPageURLAsNativePath', 'linkPageTitle',
                    'linkBodyText', 'linkPageHTML',
                    'imageDataURL', 'imageDataBinary'
                ].reduce((children, seq) => { // Todo: Replace with `flatMap` when decided: https://github.com/tc39/proposal-flatMap/pull/56
                    children.push(['dt', [seq]]);
                    children.push(['dd']);
                    return children;
                }, [])]
            ]]
        ]],
        ['form', {$on: {
            click: [(e) => {
                const cl = e.target.classList;
                if (!this.checkValidity() && // Also "setCustomValidity" and individual items also have "validationMessage" property
                    (cl.contains('execute') || cl.contains('save') || cl.contains('batch_export'))
                ) {
                    e.stopPropagation(); // Don't allow it to get to submit
                }
            }, !!'capturing']
        }}, [
            ['div', {id: 'command-name-section'}, [
                ['label', {title: _('if_present_command_saved')}, [
                    _('Command name') + ' ',
                    ['input', (() => {
                        const atts = {id: 'command-name', size: '35'};
                        if (options.itemType === 'commands') {
                            atts.autofocus = 'autofocus';
                        }
                        return atts;
                    })()]
                ]],
                ['br'],
                ['label', [
                    _('Restrict contexts') + ' ',
                    ['select', {
                        multiple: 'multiple',
                        title: _('Italicized_obtained_from_source_page_context'),
                        id: 'restrict-contexts',
                        $on: {
                            click (e) {
                                // Not sure why we're losing focus or the click event is going through here but not in my multiple-select demo
                                // ms.focus();
                                e.stopPropagation();
                            }
                        }
                    }, Tags.map((groupInfo) => {
                        return ['optgroup', {
                            label: _(groupInfo[0])
                        }, groupInfo[1].map((tagInfo) => {
                            const atts = {};
                            if (tagInfo && typeof tagInfo === 'object' && tagInfo[1].hidden === true) {
                                atts.class = 'hiddenContext';
                            }
                            return ['option', atts, [
                                typeof tagInfo === 'string' ? tagInfo : tagInfo[0]
                            ]];
                        })];
                    })]
                ]],
                ' ' + _('or') + ' ',
                ['label', [
                    _('Specify your own context') + ' ',
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
                        ['label', {'for': 'executablePath'}, [_('Path of executable')]]
                    ]],
                    ['td', [
                        ['select', {id: 'executables', 'class': 'ei-exe-presets', dataset: {
                            ei_sel: '#executablePath'
                        }}],
                        ['input', {
                            type: 'text', size: '55', id: 'executablePath', class: 'ei-exe-path',
                            list: 'datalist', autocomplete: 'off', value: '', required: 'required'
                        }],
                        ['input', {
                            type: 'button', id: 'executablePick', class: 'ei-exe-picker',
                            dataset: {ei_sel: '#executablePath', 'ei_default-extension': 'exe'},
                            value: _('Browse')
                        }],
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
                ['b', [_('Hard-coded files and URLs')]],
                ['br'],
                ['table', {id: 'fileArguments'}],
                ['table', {id: 'URLArguments'}]
            ]],
            ['br'],
            ['div', {'class': 'execution'}, [
                ['label', [_('keep_dialog_open'), ['input', {type: 'checkbox', id: 'keepOpen'}]]],
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
            ]],
            ['div', {'class': 'export'}, [
                ['label', [
                    _('os_format_for_batch_export'),
                    ['select', {id: 'export-os-type'}, buildOptions(
                        ['Linux', 'Mac', 'Windows'],
                        ['linux', 'darwin', 'winnt']
                    )]
                    // Also could add values (and i18n and localize text) for these auto-lower-cased values from https://developer.mozilla.org/en-US/docs/OS_TARGET:
                    //   'android', 'SunOS', 'FreeBSD', 'OpenBSD', 'NetBSD', 'OS2', 'BeOS', 'IRIX64', 'AIX', 'HP-UX', 'DragonFly', 'skyos', 'riscos', 'NTO', 'OSF1'
                ]],
                ['br'],
                ['button', {'class': 'batch_export'}, [_('Export to batch')]]
            ]]
        ]]
    ]]
], $('body'));

// ADD EVENTS

/* const ms = */
jQuery('#restrict-contexts').multipleSelect({
    filter: true,
    hideOptgroupCheckboxes: true,
    filterAcceptOnEnter: true,
    width: '150'
});

// Todo: put these checks as methods on a class for each type of control (can still call from body listener)
$('body').addEventListener('click', function (e) {
    let val, sel, selVal;
    const {target} = e,
        {dataset} = target || {},
        cl = target.classList;

    if (cl.contains('ei-files-presets') || (target.parentNode && target.parentNode.classList.contains('ei-files-presets')) ||
        cl.contains('ei-exe-presets') || (target.parentNode && target.parentNode.classList.contains('ei-exe-presets'))) {
        val = target.value;
        if (!val) {
            return;
        }
        sel = dataset.ei_sel || (target.parentNode && target.parentNode.dataset.ei_sel);
        if (sel) {
            $(sel).value = val;
        }
    } else if (cl.contains('ei-files-picker') || cl.contains('ei-exe-picker')) {
        sel = dataset.ei_sel;
        emit('filePick', {
            dirPath: $(sel).value,
            selector: sel,
            defaultExtension: dataset.ei_defaultExtension || undefined,
            selectFolder: ($(dataset.ei_directory) && $(dataset.ei_directory).checked) ? true : undefined
        });
    } else if (cl.contains('ei-files-revealButton') || cl.contains('ei-exe-revealButton')) {
        sel = dataset.ei_sel;
        selVal = sel && $(sel).value;
        if (selVal) {
            emit('reveal', selVal);
        }
    } else if (e.target.id === 'cancel') {
        emit('buttonClick', {close: true});
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
            const ok = confirm(_('sure_wish_delete'));
            if (ok) {
                emit('buttonClick', {name: name, remove: true});
            }
            return;
        }
        if (cl.contains('save')) {
            if (!name) {
                alert(_('supply_name'));
                return;
            }
            if (nameChanged) {
                if (oldStorage[name]) {
                    const overwrite = confirm(_('name_already_exists_overwrite'));
                    if (!overwrite) {
                        return;
                    }
                } else if (!createNewCommand) {
                    const renameInsteadOfNew = confirm(_('have_unsaved_name_change'));
                    if (!renameInsteadOfNew) { // User wishes to create a new record (or cancel)
                        $('#selectNames').selectedIndex = 0;
                        nameChanged = false;
                        return; // Return so that user has some way of correcting or avoiding (without renaming)
                    }
                }
                // Proceed with rename, so first delete old value (todo: could ensure first added)
                emit('buttonClick', {
                    name: $('#command-name').defaultValue,
                    remove: true,
                    keepForm: true
                });
            } else if (!changed && !cl.contains('execute')) {
                alert(_('no_changes_to_save'));
                return;
            }
        }
        const data = {
            name,
            save: true,
            detail: {
                executablePath: $('#executablePath').value,
                args: inputs.args.getTextValues(),
                files: inputs.files.getTextValues(),
                urls: inputs.urls.getTextValues(),
                dirs: inputs.files.getValues('directory'),
                restrictContexts: [...$('#restrict-contexts').selectedOptions].map(({value}) => {
                    return value;
                }),
                ownContext: $('#own-context').value
            }
        };
        if (cl.contains('execute')) {
            data.execute = true;
        }
        emit('buttonClick', data);
    }
});

$('body').addEventListener('input', function ({target}) {
    const {value} = target;
    if (target.classList.contains('ei-files-path') || target.classList.contains('ei-exe-path')) {
        emit('autocompleteValues', {
            value,
            listID: target.getAttribute('list')
        });
    }
});

// COPIED FROM filebrowser-enhanced directoryMod.js (RETURN ALL MODIFICATIONS THERE)
on('autocompleteValuesResponse', function (data) {
    const datalist = document.getElementById(data.listID);
    while (datalist.firstChild) {
        datalist.firstChild.remove();
    }
    data.optValues.forEach((value) => {
        const option = jml('option', {
            // text: value,
            value
        });
        datalist.appendChild(option);
    });
});

on('finished', finished);
on('filePickResult', fileOrDirResult);
on('executables', handleOptions);
on('temps', handleOptions);
on('defaultOS', setOS);
on('newStorage', newStorage);
on('removeStorage', removeStorage);

// INITIAL BEHAVIORS

rebuildCommandList();

// Todo: For prefs when prev. values stored, call multiple times and
//         populate and reduce when not used
['args', 'urls', 'files'].forEach((inputType) => {
    inputs[inputType].add();
});
})();
