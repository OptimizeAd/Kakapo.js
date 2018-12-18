"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Response = exports.Response = function () {
  function Response() {
    var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;
    var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, Response);

    this.code = code;
    this.body = body;
    this.headers = headers;
  }

  _createClass(Response, [{
    key: "error",
    get: function get() {
      return this.code >= 400;
    }
  }, {
    key: "ok",
    get: function get() {
      return this.code >= 200 && this.code <= 299;
    }
  }], [{
    key: "wrap",
    value: function wrap(response) {
      if (response instanceof Response) {
        return response;
      } else {
        return new Response(200, response, {
          "content-type": "application/json; charset=utf-8"
        });
      }
    }
  }]);

  return Response;
}();