/* globals exports, require */
/**
* This is an active module of the WebAppFind Add-on
* @todo code to unregister component, remove category from category manager
*/

(function () {
'use strict';

/*
function l (msg) {
    console.log(msg);
}
*/

exports.main = function () {
    /* const commandLineObj = */ require('./componentRegistrations')();
};
}());
