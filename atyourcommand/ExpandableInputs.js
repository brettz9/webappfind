/* eslint-env browser */
// Todo: Make as own module dependency
// Todo: Add $ and $$ to Jamilih
import jml from '/vendor/jamilih/dist/jml-es.js';

/**
* @class ExpandableInputs
*/
/*
// DEBUGGING
function l (str) {
    console.log(str);
}
*/

// STATIC VARS
let ns = 0; // Used to prevent conflicts if the user does not supply their own namespace

const defaultLocaleStrings = {
    en: {
        browse: 'Browse\u2026',
        directory: 'Directory?',
        plus: '+',
        minus: '-',
        reveal: '' // We use a background-image of a folder instead of text
    }
};

// UTILITIES

/**
* @static
* @private
*/
function $ (sel) {
    return document.querySelector(sel);
}
/**
* @static
* @private
*/
function $$ (sel) {
    return document.querySelectorAll(sel);
}

/**
*
* @constructor
* @param {object} cfg Configuration object
* @param {string} cfg.table The ID of the table.
* @param {string} [cfg.prefix="ei-"] Prefix to denote expandable inputs. Should not need to be changed
* @param {string} [cfg.namespace] Namespace for this set
    of expandable inputs. If none is supplied, an incrementing value will be used.
* @param {string} [cfg.label="%s:"] The label to be shown. (See cfg.pattern for the regular expression used to do substitutions.)
* @param {string} [cfg.pattern=/%s/g] The regular expression for finding numbers within labels.
* @param {string} [cfg.inputType="text"] The type for text inputs
* @param {boolean} [cfg.selects=false] Whether to include a select menu for preset file paths or directories
* @param {number} [cfg.inputSize=50] The size for text inputs
* @param {number} [cfg.rows] The number of rows; auto-changes input to a textarea (even if set to 1)
* @param {string} [cfg.locale] A locale language code. Defaults to "en". (Note that the suppied label property ought to also be localized.)
* @param {string} [cfg.localeStrings] A localeStrings. Default to an English localeStrings. (Note that the supplied label property ought to also be localized.)
*/
function ExpandableInputs (cfg) {
    if (!(this instanceof ExpandableInputs)) {
        return new ExpandableInputs(cfg);
    }
    if (!cfg || typeof cfg !== 'object' || !cfg.table) {
        throw new Error('A config object with a table ID must be supplied to ExpandableInputs');
    }
    this.table = cfg.table;
    this.prefix = ((cfg.prefix && cfg.prefix.replace(/-$/, '')) || 'ei') + '-';
    this.ns = ((cfg.namespace && cfg.namespace.replace(/-$/, '')) || (ns++).toString()) + '-';
    this.label = cfg.label || '%s:';
    this.pattern = cfg.pattern || /%s/g;
    this.inputType = cfg.inputType && cfg.inputType !== 'file' ? cfg.inputType : 'text';
    this.selects = cfg.selects || false;
    this.inputSize = cfg.inputSize || 50;
    if (cfg.rows !== undefined) {
        this.rows = cfg.rows;
    }
    this.localeStrings = Object.assign(
        {},
        defaultLocaleStrings.en,
        defaultLocaleStrings[cfg.locale] || {},
        cfg.localeStrings || {}
    );

    // State variables
    this.fileType = 'inputType' in cfg && cfg.inputType === 'file';
    this.resetCount();
}

ExpandableInputs.prototype.resetCount = function () {
    this.id = 1;
    this.num = 1;
};

ExpandableInputs.prototype.getLabel = function (num) {
    return this.label.replace(this.pattern, num);
};

ExpandableInputs.prototype.getPrefixedNamespace = function () {
    return this.prefix + this.ns;
};

ExpandableInputs.prototype.remove = function (id) {
    const prefixedNS = this.getPrefixedNamespace(),
        rowIDSel = '#' + prefixedNS + 'row-' + id;
    if ($$('.' + prefixedNS + 'row').length === 1) { // Don't delete if only one remaining
        return true;
    }
    $(rowIDSel).remove();
    // Renumber to ensure inputs remain incrementing by one
    this.num = 1;
    [...$$('.' + prefixedNS + 'number')].forEach((numHolder) => {
        numHolder.firstChild.replaceWith(
            this.getLabel(this.num++)
        );
    });
    return false;
};
ExpandableInputs.prototype.addTableEvent = function () {
    const that = this;
    $('#' + this.table).addEventListener('click', function (e) {
        const {dataset} = e.target;
        if (!dataset || !dataset.ei_type) {
            return;
        }
        switch (dataset.ei_type) {
        case 'remove':
            const noneToRemove = that.remove(dataset.ei_id);

            // Allow DOM listening for removal
            if (!noneToRemove) {
                const e = new Event('change', {
                    bubbles: true,
                    cancelable: true
                });
                $('#' + that.table).dispatchEvent(e);
            }

            break;
        case 'add':
            that.add();
            break;
        }
    });
};

ExpandableInputs.prototype.getValues = function (type) {
    const selector = '.' + this.getPrefixedNamespace() + type;
    return [...$$(selector)].map(({type, checked, value}) => {
        return type === 'checkbox' ? checked : value;
    });
};
ExpandableInputs.prototype.getTextValues = function () {
    return this.getValues('input');
};

ExpandableInputs.prototype.setValues = function (type, storage) {
    // We could simplify this by allowing add() to take an initial value
    const prefixedNS = this.getPrefixedNamespace();
    const selector = '.' + prefixedNS + type;
    storage = storage || [];
    if ($$(selector).length !== storage.length) { // Don't remove if already the right number
        [...$$('.' + prefixedNS + 'row')].forEach((row) => {
            row.remove();
        });
        this.resetCount();
        if (!storage.length) {
            this.add();
            return;
        }
        storage.forEach(() => {
            this.add();
        });
    }

    [...$$(selector)].forEach((arg, i) => {
        const data = storage[i];
        if (arg.type === 'checkbox') {
            arg.checked = data || false;
        } else {
            arg.value = data || '';
        }
    });
};

ExpandableInputs.prototype.setTextValues = function (storage) {
    return this.setValues('input', storage);
};

ExpandableInputs.prototype.add = function () {
    const prefixedNS = this.getPrefixedNamespace();
    if (!this.tableEventAdded) {
        this.addTableEvent();
        this.tableEventAdded = true;
    }
    $('#' + this.table).appendChild(jml(
        'tr', {
            id: prefixedNS + 'row-' + this.id,
            class: prefixedNS + 'row'
        }, [
            ['td', [
                ['label', {
                    for: prefixedNS + 'input-' + this.id,
                    class: prefixedNS + 'number'
                }, [this.getLabel(this.num), ['span', [' \u00a0']]]]
            ]],
            ['td', [
                (this.fileType && this.selects
                    ? ($$('.' + prefixedNS + 'presets').length > 0
                        ? (() => {
                            const select = $('.' + prefixedNS + 'presets').cloneNode(true);
                            select.id = prefixedNS + 'select-' + this.id;
                            select.dataset.ei_sel = '#' + prefixedNS + 'input-' + this.id;
                            return select;
                        })()
                        : ['select', {
                            id: prefixedNS + 'select-' + this.id,
                            class: prefixedNS + 'presets',
                            dataset: {ei_sel: '#' + prefixedNS + 'input-' + this.id}
                        }]
                    )
                    : ''
                ),
                [(this.hasOwnProperty('rows') ? 'textarea' : 'input'), (() => {
                    const atts = {
                        id: prefixedNS + 'input-' + this.id,
                        class: prefixedNS + 'input ' + prefixedNS + 'path'
                    };
                    if (this.hasOwnProperty('rows')) { // textarea
                        atts.cols = this.inputSize;
                        atts.rows = this.rows;
                    } else { // input
                        atts.size = this.inputSize;
                        atts.type = this.inputType;
                        atts.value = '';
                    }
                    if (this.fileType) {
                        atts.list = prefixedNS + 'fileDatalist-' + this.id;
                        atts.autocomplete = 'off';
                    }
                    return atts;
                })()],
                // Todo: Should have user supply own callback to ensure
                //        reveal button, etc. has functionality, and
                //        ensure only those desired are added
                (this.fileType
                    ? {'#': [
                        ' ',
                        ['datalist', {id: prefixedNS + 'fileDatalist-' + this.id}],
                        /*
                        // Todo: We might reenable this if we implement a
                        //   Ajax+Node-based file picker (could even use
                        //   Miller columns, etc.)
                        ['input', {
                            type: 'button',
                            class: prefixedNS + 'picker',
                            dataset: {
                                ei_sel: '#' + prefixedNS + 'input-' + this.id,
                                ei_directory: '#' + prefixedNS + 'directory' + this.id
                            },
                            value: this.localeStrings.browse
                        }],
                        */
                        ['input', {
                            type: 'button',
                            class: prefixedNS + 'revealButton',
                            value: this.localeStrings.reveal,
                            dataset: {ei_sel: '#' + prefixedNS + 'input-' + this.id}
                        }]
                        /*
                        // Todo: We might reenable this if we implement a
                        //   Ajax+Node-based file picker (could even use
                        //   Miller columns, etc.)
                        , ['label', [
                            ['input', {
                                id: prefixedNS + 'directory' + this.id,
                                type: 'checkbox',
                                class: prefixedNS + 'directory'
                            }],
                            ' ',
                            this.localeStrings.directory
                        ]] */
                    ]}
                    : ''
                )
            ]],
            ['td', ['\u00a0']],
            ['td', [
                ['button', {
                    class: prefixedNS + 'add',
                    dataset: {ei_type: 'add'}
                }, [this.localeStrings.plus]]
            ]],
            ['td', [
                ['button', {
                    class: prefixedNS + 'remove',
                    dataset: {ei_id: this.id, ei_type: 'remove'}
                }, [this.localeStrings.minus]]
            ]]
        ], null
    ));
    this.id++;
    this.num++;
};

export default ExpandableInputs;
