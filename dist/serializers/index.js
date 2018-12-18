'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonApi = require('./json-api');

Object.keys(_jsonApi).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _jsonApi[key];
    }
  });
});