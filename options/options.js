/* eslint-env browser, webextensions */
import {jml, $} from './jml.js';

const nbsp = '\u00a0';

function _ (...args) {
    return browser.i18n.getMessage(...args);
}

document.title = _('extensionName'); // If switch to tabs
(async () => {
jml('section', await Promise.all([
    ['allowedSites', 'addRemove']
].map(async ([preferenceKey, type]) => {
    let config = {};
    try {
        ({[preferenceKey]: config = {}} = await browser.storage.local.get(preferenceKey));
    } catch (err) {}

    switch (type) {
    case 'addRemove': {
        return ['div', {class: 'addRemove'}, [
            _(preferenceKey + '_title'),
            ['section', {class: 'addon-description'}, [
                _(preferenceKey + '_description')
            ]],
            ['br'],
            ['div', {
                class: 'addRemoveInner'
            }, [
                ['input', {
                    id: `addRemove_${preferenceKey}input`,
                    type: 'url'
                }],
                ' ' + nbsp,
                ['button', {
                    $on: {
                        click () {
                            const input = $(`#addRemove_${preferenceKey}input`);
                            const {origin, pathname, search} = new URL(input.value);
                            // Exclude the hash (should we also exclude `search`?)
                            const newVal = origin + pathname + search;
                            const select = $(`#addRemove_${preferenceKey}select`);
                            if (![...select.options].some(({value}) => {
                                return value === newVal;
                            })) {
                                select.add(jml('option', [newVal]));
                                select.$savePref();
                            }
                        }
                    }
                }, [_('options_addRemove_add')]],
                ' ',
                ['button', {
                    $on: {
                        click () {
                            const select = $(`#addRemove_${preferenceKey}select`);
                            select.remove(select.selectedIndex);
                            select.$savePref();
                        }
                    }
                }, [_('options_addRemove_remove')]],
                ['br'],
                ['br'],
                ['select', {
                    id: `addRemove_${preferenceKey}select`,
                    class: 'addRemove',
                    size: 20,
                    readonly: true,
                    $custom: {
                        async $savePref () {
                            const optionValues = [...this.options].map(({value}) => {
                                return value;
                            });
                            await browser.storage.local.set({
                                [preferenceKey]: {
                                    optionValues
                                }
                            });
                        }
                    }
                }, (config.optionValues || []).map((value) => {
                    return ['option', [value]];
                })]
            ]]
        ]];
    }
    case 'checkbox': {
        const {enabled} = config;
        return ['label', [
            ['input', {
                type: 'checkbox',
                checked: enabled,
                $on: {
                    async change ({target}) {
                        await browser.storage.local.set({
                            [preferenceKey]: {
                                enabled: target.checked
                            }
                        });
                    }
                }
            }],
            ' ',
            _(preferenceKey + '_title'),
            ['section', {class: 'addon-description'}, [
                _(preferenceKey + '_description')
            ]],
            ['br']
        ]];
    }
    }
})), document.body);
})();
