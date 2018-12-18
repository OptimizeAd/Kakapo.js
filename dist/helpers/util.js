"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendWithBind = exports.deepMapValues = undefined;

var _lodash = require("lodash");

/**
 * Returns copy of an object with mapped values. Works really similar to
 * lodash's mapValues, with difference that also EVERY nested object is
 * also mapped with passed function.
 *
 * @param {Object} obj - object to map values of
 * @param {Function} fn - function to map values with
 *
 * @returns {Object}
 * @private
 */
var deepMapValues = exports.deepMapValues = function deepMapValues(obj, fn) {
  return (0, _lodash.mapValues)(obj, function (value) {
    if ((0, _lodash.isPlainObject)(value)) return deepMapValues(value, fn);
    return fn(value);
  });
};

var extendWithBind = exports.extendWithBind = function extendWithBind() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _lodash.assignInWith.apply(undefined, args.concat([function (objectValue, sourceValue, key, object, source) {
    if (!(0, _lodash.isUndefined)(objectValue)) {
      return objectValue;
    }
    if ((0, _lodash.isFunction)(sourceValue)) {
      return sourceValue.bind(source);
    }
    return sourceValue;
  }]));
};