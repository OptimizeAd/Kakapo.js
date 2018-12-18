'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interceptors = undefined;

var _xhrInterceptor = require('./xhrInterceptor');

var xhrInterceptor = _interopRequireWildcard(_xhrInterceptor);

var _fetchInterceptor = require('./fetchInterceptor');

var fetchInterceptor = _interopRequireWildcard(_fetchInterceptor);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var interceptors = exports.interceptors = {
  XMLHttpRequest: xhrInterceptor,
  fetch: fetchInterceptor
};