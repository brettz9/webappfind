/* globals dialogPolyfill */
// Todo: Make as own module dependency
import {jml, nbsp} from '/vendor/jamilih/dist/jml-es-noinnerh.js';
import {$e} from './templateUtils.js';

const defaultLocale = 'en';
const localeStrings = {
    en: {
        submit: 'Submit',
        cancel: 'Cancel',
        ok: 'Ok'
    }
};

class Dialog {
    constructor ({locale, localeObject} = {}) {
        this.setLocale({locale, localeObject});
    }
    setLocale ({locale = {}, localeObject = {}}) {
        this.localeStrings = Object.assign(
            {},
            localeStrings[defaultLocale],
            localeStrings[locale],
            localeObject
        );
    }
    makeDialog ({atts = {}, children = [], close, remove = true}) {
        if (close) {
            if (!atts.$on) {
                atts.$on = {};
            }
            if (!atts.$on.close) {
                atts.$on.close = close;
            }
        }
        const dialog = jml('dialog', atts, children, document.body);
        dialogPolyfill.registerDialog(dialog);
        dialog.showModal();
        if (remove) {
            dialog.addEventListener('close', () => {
                dialog.remove();
            });
        }
        return dialog;
    }
    makeSubmitDialog ({
        submit, // Don't pass this on to `args` if present
        submitClass = 'submit',
        ...args
    }) {
        const dialog = this.makeCancelDialog(args);
        $e(dialog, `button.${args.cancelClass || 'cancel'}`).before(
            jml('button', {
                class: submitClass,
                $on: {
                    click (e) {
                        if (submit) {
                            submit.call(this, {e, dialog});
                        }
                    }
                }
            }, [this.localeStrings.submit]),
            nbsp.repeat(2)
        );
        return dialog;
    }
    makeCancelDialog ({
        submit, // Don't pass this on to `args` if present
        cancel,
        cancelClass = 'cancel', submitClass = 'submit',
        ...args
    }) {
        const dialog = this.makeDialog(args);
        jml('div', {class: submitClass}, [
            ['br'], ['br'],
            ['button', {class: cancelClass, $on: {
                click (e) {
                    e.preventDefault();
                    if (cancel) {
                        if (cancel.call(this, {e, dialog}) === false) {
                            return;
                        }
                    }
                    dialog.close();
                }
            }}, [this.localeStrings.cancel]]
        ], dialog);
        return dialog;
    }
    alert (message) {
        message = typeof message === 'string' ? {message} : message;
        const {message: msg, submitClass = 'submit'} = message;
        return new Promise((resolve, reject) => {
            const dialog = jml('dialog', [
                msg,
                ['br'], ['br'],
                ['div', {class: submitClass}, [
                    ['button', {$on: {click () {
                        dialog.close();
                        resolve();
                    }}}, [this.localeStrings.ok]]
                ]]
            ], document.body);
            dialogPolyfill.registerDialog(dialog);
            dialog.showModal();
        });
    }
    prompt (message) {
        message = typeof message === 'string' ? {message} : message;
        const {message: msg, submit: userSubmit, ...submitArgs} = message;
        return new Promise((resolve, reject) => {
            const submit = function ({e, dialog}) {
                if (userSubmit) {
                    userSubmit.call(this, {e, dialog});
                }
                dialog.close();
                resolve($e(dialog, 'input').value);
            };
            /* const dialog = */ this.makeSubmitDialog({
                ...submitArgs,
                submit,
                cancel () {
                    reject(new Error('cancelled'));
                },
                children: [
                    ['label', [
                        msg,
                        nbsp.repeat(3),
                        ['input']
                    ]]
                ]
            });
        });
    }
    confirm (message) {
        message = typeof message === 'string' ? {message} : message;
        const {message: msg, submitClass = 'submit'} = message;
        return new Promise((resolve, reject) => {
            const dialog = jml('dialog', [
                msg,
                ['br'], ['br'],
                ['div', {class: submitClass}, [
                    ['button', {$on: {click () {
                        dialog.close();
                        resolve();
                    }}}, [this.localeStrings.ok]],
                    nbsp.repeat(2),
                    ['button', {$on: {click () {
                        dialog.close();
                        reject(new Error('cancelled'));
                    }}}, [this.localeStrings.cancel]]
                ]]
            ], document.body);
            dialogPolyfill.registerDialog(dialog);
            dialog.showModal();
        });
    }
};

const dialogs = new Dialog();

export {
    Dialog, dialogs
};
