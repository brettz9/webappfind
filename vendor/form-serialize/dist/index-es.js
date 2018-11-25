function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// get successful control from form and assemble into object
// http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2
// types which indicate a submit action and are not successful controls
// these will be ignored
var kRSubmitter = /^(?:submit|button|image|reset|file)$/i; // node names which could be successful controls

var kRSuccessContrls = /^(?:input|select|textarea|keygen)/i; // Matches bracket notation.

var brackets = /(\[[^[\]]*\])/g; // serializes form fields
// @param form MUST be an HTMLForm element
// @param options is an optional argument to configure the serialization. Default output
// with no options specified is a url encoded string
//    - hash: [true | false] Configure the output type. If true, the output will
//    be a js object.
//    - serializer: [function] Optional serializer function to override the default one.
//    The function takes 3 arguments (result, key, value) and should return new result
//    hash and url encoded str serializers are provided with this module
//    - disabled: [true | false]. If true serialize disabled fields.
//    - empty: [true | false]. If true serialize empty fields

function serialize(form, options) {
  if (_typeof(options) !== 'object') {
    options = {
      hash: !!options
    };
  } else if (options.hash === undefined) {
    options.hash = true;
  }

  var result = options.hash ? {} : '';
  var serializer = options.serializer || (options.hash ? hashSerializer : strSerialize);
  var elements = form && form.elements ? _toConsumableArray(form.elements) : []; // Object store each radio and set if it's empty or not

  var radioStore = Object.create(null);
  elements.forEach(function (element) {
    // ignore disabled fields
    if (!options.disabled && element.disabled || !element.name) {
      return;
    } // ignore anything that is not considered a success field


    if (!kRSuccessContrls.test(element.nodeName) || kRSubmitter.test(element.type)) {
      return;
    }

    var key = element.name,
        type = element.type,
        name = element.name,
        checked = element.checked;
    var value = element.value; // We can't just use element.value for checkboxes cause some browsers lie to us;
    // they say "on" for value when the box isn't checked

    if ((type === 'checkbox' || type === 'radio') && !checked) {
      value = undefined;
    } // If we want empty elements


    if (options.empty) {
      // for checkbox
      if (type === 'checkbox' && !checked) {
        value = '';
      } // for radio


      if (type === 'radio') {
        if (!radioStore[name] && !checked) {
          radioStore[name] = false;
        } else if (checked) {
          radioStore[name] = true;
        }

        if (value === undefined) {
          return;
        }
      }
    } else if (!value) {
      // value-less fields are ignored unless options.empty is true
      return;
    } // multi select boxes


    if (type === 'select-multiple') {
      value = [];
      var isSelectedOptions = false;

      _toConsumableArray(element.options).forEach(function (option) {
        var allowedEmpty = options.empty && !option.value;
        var hasValue = option.value || allowedEmpty;

        if (option.selected && hasValue) {
          isSelectedOptions = true; // If using a hash serializer be sure to add the
          // correct notation for an array in the multi-select
          // context. Here the name attribute on the select element
          // might be missing the trailing bracket pair. Both names
          // "foo" and "foo[]" should be arrays.

          if (options.hash && key.slice(key.length - 2) !== '[]') {
            result = serializer(result, key + '[]', option.value);
          } else {
            result = serializer(result, key, option.value);
          }
        }
      }); // Serialize if no selected options and options.empty is true


      if (!isSelectedOptions && options.empty) {
        result = serializer(result, key, '');
      }

      return;
    }

    result = serializer(result, key, value);
  }); // Check for all empty radio buttons and serialize them with key=""

  if (options.empty) {
    Object.entries(radioStore).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];

      if (!value) {
        result = serializer(result, key, '');
      }
    });
  }

  return result;
}

function parseKeys(string) {
  var keys = [];
  var prefix = /^([^[\]]*)/;
  var children = new RegExp(brackets);
  var match = prefix.exec(string);

  if (match[1]) {
    keys.push(match[1]);
  }

  while ((match = children.exec(string)) !== null) {
    keys.push(match[1]);
  }

  return keys;
}

function hashAssign(result, keys, value) {
  if (keys.length === 0) {
    return value;
  }

  var key = keys.shift();
  var between = key.match(/^\[(.+?)\]$/);

  if (key === '[]') {
    result = result || [];

    if (Array.isArray(result)) {
      result.push(hashAssign(null, keys, value));
    } else {
      // This might be the result of bad name attributes like "[][foo]",
      // in this case the original `result` object will already be
      // assigned to an object literal. Rather than coerce the object to
      // an array, or cause an exception the attribute "_values" is
      // assigned as an array.
      result._values = result._values || [];

      result._values.push(hashAssign(null, keys, value));
    }

    return result;
  } // Key is an attribute name and can be assigned directly.


  if (!between) {
    result[key] = hashAssign(result[key], keys, value);
  } else {
    var string = between[1]; // +var converts the variable into a number
    // better than parseInt because it doesn't truncate away trailing
    // letters and actually fails if whole thing is not a number

    var index = +string; // If the characters between the brackets is not a number it is an
    // attribute name and can be assigned directly.

    if (isNaN(index)) {
      result = result || {};
      result[string] = hashAssign(result[string], keys, value);
    } else {
      result = result || [];
      result[index] = hashAssign(result[index], keys, value);
    }
  }

  return result;
} // Object/hash encoding serializer.


function hashSerializer(result, key, value) {
  var hasBrackets = key.match(brackets); // Has brackets? Use the recursive assignment function to walk the keys,
  // construct any missing objects in the result tree and make the assignment
  // at the end of the chain.

  if (hasBrackets) {
    var keys = parseKeys(key);
    hashAssign(result, keys, value);
  } else {
    // Non bracket notation can make assignments directly.
    var existing = result[key]; // If the value has been assigned already (for instance when a radio and
    // a checkbox have the same name attribute) convert the previous value
    // into an array before pushing into it.
    //
    // NOTE: If this requirement were removed all hash creation and
    // assignment could go through `hashAssign`.

    if (existing) {
      if (!Array.isArray(existing)) {
        result[key] = [existing];
      }

      result[key].push(value);
    } else {
      result[key] = value;
    }
  }

  return result;
} // urlform encoding serializer


function strSerialize(result, key, value) {
  // encode newlines as \r\n cause the html spec says so
  value = value.replace(/(\r)?\n/g, '\r\n');
  value = encodeURIComponent(value); // spaces should be '+' rather than '%20'.

  value = value.replace(/%20/g, '+');
  return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
}

function deserialize(form, hash) {
  // input(text|radio|checkbox)|select(multiple)|textarea|keygen
  Object.entries(hash).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        name = _ref4[0],
        value = _ref4[1];

    var control = form[name];

    if (!form[name]) {
      control = form[name + '[]']; // We want this for RadioNodeList so setting value auto-disables other boxes

      if (!('length' in control)) {
        // The latter assignment only gets single
        //    elements, so if not a RadioNodeList, we get all values here
        control = form.querySelectorAll("[name=\"".concat(name, "[]\"]"));
      }
    }

    var _control = control,
        type = _control.type;

    if (type === 'checkbox') {
      control.checked = value !== '';
    }

    if (Array.isArray(value)) {
      if (type === 'select-multiple') {
        _toConsumableArray(control.options).forEach(function (o) {
          if (value.includes(o.value)) {
            o.selected = true;
          }
        });

        return;
      }

      value.forEach(function (v, i) {
        var c = control[i];

        if (c.type === 'checkbox') {
          var isMatch = c.value === v || v === 'on';
          c.checked = isMatch;
          return;
        }

        c.value = v;
      });
    } else {
      control.value = value;
    }
  });
}

export { serialize, deserialize };
