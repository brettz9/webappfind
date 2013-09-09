// relayResponse.js - webappfind's module
// author: brettz9
/*globals exports */

function emit (worker, method, privilegedAPI) {
console.log('emitting:' + method);
console.log('mstr:' + this[method]);
    privilegedAPI = privilegedAPI ? [privilegedAPI] : [];
    worker.port.emit(method + 'Response', this[method].apply(this, privilegedAPI.concat([].slice.call(arguments, 3)).concat(worker.port.emit, worker.port.on, worker)));
}

function _relayResponse (worker, privilegedAPI) {
    var method;
    for (method in this) {
//        if (this.hasOwnProperty(method)) { // Doesn't work on modules
            try {
                worker.port.on(method, emit.bind(this, worker, method, privilegedAPI));
            }
            catch(e) {
                console.log('Error:' + e);
            }
//        }
    }    
}

// We might also accept the "this" object instead of requiring it to be bound
module.exports = function (privilegedAPI) {
    var that = this;
    return function relayResponse (worker) {
        _relayResponse.call(that, worker, privilegedAPI);
    };
};

/*
Should work but requires specification of method (as opposed to just invoking with or without an argument):
function relayResponse (worker) {
    _relayResponse.call(this, worker);
}
// Can use this to bind onto it an object that allows (privileged) access to code shared within main.js
function multipleRelayResponse (privilegedAPI, worker) {
    _relayResponse.call(this, worker, privilegedAPI);
}
exports.simple = relayResponse;
exports.privileged = multipleRelayResponse;
*/
