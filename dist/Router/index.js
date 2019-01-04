"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Router = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _interceptors = require("../interceptors");

var _environment = require("../config/environment");

var _environment2 = _interopRequireDefault(_environment);

require("../interceptors/interceptorHelper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var browserStrategies = ["fetch", "XMLHttpRequest"];
//TODO: find proper name for Node.js strategies
var nodeStrategies = ["http", "https"];
var routerDefaultConfig = {
  strategies: _environment2.default.browserEnv ? browserStrategies : nodeStrategies
};

var interceptorDefaultConfig = {
  db: null,
  host: "",
  requestDelay: 0,
  routes: { GET: {}, POST: {}, PUT: {}, PATCH: {}, DELETE: {}, HEAD: {} },
  logging: false
};

var Router = exports.Router = function () {
  function Router(interceptorConfig, routerConfig) {
    _classCallCheck(this, Router);

    this.interceptorConfig = (0, _lodash.merge)({}, interceptorDefaultConfig, interceptorConfig);
    this.routerConfig = (0, _lodash.merge)({}, routerDefaultConfig, routerConfig);
  }

  _createClass(Router, [{
    key: "get",
    value: function get() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.register.apply(this, ["GET"].concat(_toConsumableArray(args)));
    }
  }, {
    key: "post",
    value: function post() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      this.register.apply(this, ["POST"].concat(_toConsumableArray(args)));
    }
  }, {
    key: "put",
    value: function put() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      this.register.apply(this, ["PUT"].concat(_toConsumableArray(args)));
    }
  }, {
    key: "patch",
    value: function patch() {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      this.register.apply(this, ["PATCH"].concat(_toConsumableArray(args)));
    }
  }, {
    key: "delete",
    value: function _delete() {
      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      this.register.apply(this, ["DELETE"].concat(_toConsumableArray(args)));
    }
  }, {
    key: "head",
    value: function head() {
      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      this.register.apply(this, ["HEAD"].concat(_toConsumableArray(args)));
    }
  }, {
    key: "register",
    value: function register(method, path, handler) {
      this.interceptorConfig.routes[method][path] = handler;
    }
  }, {
    key: "intercept",
    value: function intercept() {
      var _this = this;

      var strategies = this.routerConfig.strategies;

      (0, _lodash.forEach)(strategies, function (name) {
        return _interceptors.interceptors[name].enable(_this.interceptorConfig);
      });
    }
  }, {
    key: "reset",
    value: function reset() {
      //TODO: Don't reset all 'interceptors'
      (0, _lodash.forEach)(_interceptors.interceptors, function (interceptor) {
        return interceptor.disable();
      });
    }
  }]);

  return Router;
}();