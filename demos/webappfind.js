/*
TODOS
1. Employ this across all demos, adapting as needed
*/

(function () {'use strict';

function WebAppFind (messageHandlers, options) {
    messageHandlers = messageHandlers || {};
    options = options || {};
    if (!(this instanceof WebAppFind)) {
        return new WebAppFind();
    }
    this.view = messageHandlers.view; // Accepts as arguments: content, pathID
    this.saveEnd = messageHandlers.saveEnd;
    this.excludedMessages = options.excludedMessages || ['webapp-save'];
    this.init();
}

WebAppFind.prototype.init = function () {
    if (!document.body) {
        window.addEventListener('DOMContentLoaded', this.addListeners.bind(this));
    }
    else {
        this.addListeners();
    }
};

WebAppFind.prototype.addListeners = function () {
    var that = this;
    window.addEventListener('message', function(e) {
        // Could allow config to loosen for whitelisted sites
        if (e.origin !== window.location.origin || // PRIVACY AND SECURITY! (for viewing and saving, respectively)
            (!Array.isArray(e.data) || that.excludedMessages.indexOf(e.data[0]) > -1) // Validate format and avoid our post below
        ) {
            return;
        }
        var messageType = e.data[0];
        switch (messageType) {
            case 'webapp-view':
                // Populate the contents
                that.pathID = e.data[1];
                that.view(e.data[2], that.pathID);
                break;
            case 'webapp-save-end':
                that.saveEnd(e.data[1]);
                break;
            default:
                throw 'Unexpected mode';
        }
    }, false);
};

WebAppFind.prototype.save = function (content, errBack) {
    if (!this.pathID) {
        if (!errBack) {
            alert('No pathID set by Firefox yet! Remember to invoke this file from an executable or command line and in edit mode.');
            return;
        }
        errBack();
        return;
    }
    window.postMessage(['webapp-save', this.pathID, content], window.location.origin); // Could make origin configurable if wished to leak info to other sites
};

// EXPORTS
window.WebAppFind = WebAppFind;

}());
