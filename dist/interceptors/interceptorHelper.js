"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interceptorHelper = undefined;

var _lodash = require("lodash");

var _pathMatch = require("path-match");

var _pathMatch2 = _interopRequireDefault(_pathMatch);

var _parseUrl = require("parse-url");

var _parseUrl2 = _interopRequireDefault(_parseUrl);

var _queryString = require("query-string");

var _queryString2 = _interopRequireDefault(_queryString);

var _Request = require("../Request");

var _Response = require("../Response");

var _Database = require("../Database");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @TODO (oskar): This NEEDS refactor.
var getRoute = function getRoute(_ref, _ref2) {
  var host = _ref.host;
  var handlers = _ref2.handlers,
      pathname = _ref2.pathname,
      fullpath = _ref2.fullpath;

  var matchesPathname = function matchesPathname(path) {
    return (0, _pathMatch2.default)()(path)(pathname);
  };
  var route = (0, _lodash.keys)(handlers).find(matchesPathname);
  var hasHost = (0, _lodash.includes)(fullpath, host);

  return route && hasHost ? route : null;
};

var extractUrl = function extractUrl(_ref3, url, method) {
  var routes = _ref3.routes;
  return {
    handlers: routes[method],
    pathname: (0, _parseUrl2.default)(url).pathname,
    fullpath: (0, _parseUrl2.default)(url).href
  };
};

var interceptorHelper = exports.interceptorHelper = function interceptorHelper(config) {
  return {
    getDB: function getDB() {
      return config.db;
    },
    getDelay: function getDelay() {
      return config.requestDelay;
    },
    getHandler: function getHandler(url, method) {
      var extractedUrl = extractUrl(config, url, method);
      var route = getRoute(config, extractedUrl);

      return route ? extractedUrl.handlers[route] : null;
    },
    getParams: function getParams(url, method) {
      var extractedUrl = extractUrl(config, url, method);
      var matchesPathname = function matchesPathname(path) {
        return (0, _pathMatch2.default)()(path)(extractedUrl.pathname);
      };
      var route = getRoute(config, extractedUrl);

      return route ? matchesPathname(route) : null;
    },
    getQuery: function getQuery(url) {
      return _queryString2.default.parse((0, _parseUrl2.default)(url).search);
    },
    getLogging: function getLogging() {
      return config.logging;
    }
  };
};