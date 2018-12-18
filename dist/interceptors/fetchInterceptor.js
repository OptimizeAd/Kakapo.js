"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disable = exports.enable = exports.FakeFetch = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Response = require("../Response");

var _Request = require("../Request");

var _interceptorHelper = require("./interceptorHelper");

var _utils = require("../utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nativeFetch = _utils.canUseWindow && window.fetch;
var fakeResponse = function fakeResponse() {
  var response = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var responseStr = JSON.stringify(response);
  return new Response(responseStr, { headers: headers });
};

var FakeFetch = exports.FakeFetch = function () {
  function FakeFetch() {
    _classCallCheck(this, FakeFetch);

    this.interceptors = [];
  }

  _createClass(FakeFetch, [{
    key: "use",
    value: function use(config) {
      this.interceptors.push((0, _interceptorHelper.interceptorHelper)(config));
    }
  }, {
    key: "fake",
    value: function fake() {
      var _this = this;

      return function (requestInfo) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var url = (0, _utils.mapRequestInfoToUrlString)(requestInfo);
        var method = options.method || "GET";

        var interceptor = _this.interceptors.find(function (i) {
          return i.getHandler(url, method) !== null;
        });

        if (!interceptor) {
          return nativeFetch(url, options);
        }

        var handler = interceptor.getHandler(url, method);

        if (!handler) {
          return nativeFetch(url, options);
        }

        var request = new _Request.Request({
          params: interceptor.getParams(url, method),
          query: interceptor.getQuery(url),
          body: options.body || "",
          headers: options.headers || {}
        });
        var db = interceptor.getDB();
        var response = handler(request, db);

        if (response instanceof Promise) {
          //TODO: Should we handle 'requestDelay' also for async responses?
          return response.then(function (data) {
            return fakeResponse(data);
          });
        }

        if (!(response instanceof _Response.Response)) {
          return new Promise(function (resolve) {
            return setTimeout(function () {
              return resolve(fakeResponse(response));
            }, interceptor.getDelay());
          });
        }

        var result = fakeResponse(response.body, response.headers);
        return new Promise(function (resolve, reject) {
          return setTimeout(function () {
            if (response.error) {
              return reject(result);
            }
            return resolve(result);
          }, interceptor.getDelay());
        });
      };
    }
  }]);

  return FakeFetch;
}();

function isFakeFetch(fetch) {
  return window.fetch instanceof FakeFetch;
}

var fakeFetch = new FakeFetch();

var enable = exports.enable = function enable(config) {
  if (!isFakeFetch(window.fetch)) {
    window.fetch = fakeFetch.fake();
  }

  fakeFetch.use(config);
};

var disable = exports.disable = function disable() {
  window.fetch = nativeFetch;
};