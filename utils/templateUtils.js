var templateUtils; // eslint-disable-line no-var, no-unused-vars
(() => {
const nbsp = '\u00a0';
const upArrow = '\u2191';
const downArrow = '\u2193';
const U = {nbsp, upArrow, downArrow};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const $e = (el, descendentsSel) => {
    el = typeof el === 'string' ? $(el) : el;
    return el.querySelector(descendentsSel);
};
const $$e = (el, descendentsSel) => {
    el = typeof el === 'string' ? $(el) : el;
    return [...el.querySelectorAll(descendentsSel)];
};

const removeChildren = (node) => {
    node = typeof node === 'string' ? $(node) : node;
    while (node.hasChildNodes()) {
        node.lastChild.remove();
    }
};
const removeIfExists = (sel) => {
    const el = typeof sel === 'string' ? $(sel) : sel;
    if (el) el.remove();
};

const filterChildElements = (el, selectors) => {
    const getMatchingChildrenForElement = (el, sel) => {
        const childElements = el.children;
        const matchingChildElements = [...childElements].filter((el) => {
            return el.matches(sel);
        });
        return matchingChildElements;
    };
    el = typeof el === 'string' ? $(el) : el;
    let filtered = [el];
    selectors = Array.isArray(selectors) ? selectors : [selectors];
    selectors.forEach((sel) => {
        filtered = filtered.reduce((els, childElement) => {
            els.push(...getMatchingChildrenForElement(childElement, sel));
            return els;
        }, []);
    });
    return filtered;
};

const initialCaps = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const DOM = {removeChildren, removeIfExists, filterChildElements, initialCaps};

// export {
templateUtils = {
    U,
    $, $$,
    $e, $$e,
    DOM
};
})();
