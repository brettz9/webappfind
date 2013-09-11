// Some JSLint applied to https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
  Array.prototype.every = function(fun /*, thisp */) {
    'use strict';
    var t, len, i, thisp;

    if (this == null) {
      throw new TypeError();
    }

    t = Object(this);
    len = t.length >>> 0;
    if (typeof fun !== 'function') {
        throw new TypeError();
    }

    thisp = arguments[1];
    for (i = 0; i < len; i++) {
      if (i in t && !fun.call(thisp, t[i], i, t)) {
        return false;
      }
    }

    return true;
  };
}
