"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disable = exports.enable = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("../helpers/util");

var _Response = require("../Response");

var _Request = require("../Request");

var _interceptorHelper = require("./interceptorHelper");

var _utils = require("../utils");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NativeXMLHttpRequest = _utils.canUseWindow && XMLHttpRequest;
var NativeXMLHttpRequestEventTarget = _utils.canUseWindow && window.XMLHttpRequestEventTarget;

var FakeXMLHttpRequest = function () {
  function FakeXMLHttpRequest() {
    _classCallCheck(this, FakeXMLHttpRequest);

    this._status = 0;
    this._readyState = FakeXMLHttpRequest.UNSENT;
    this._requestHeaders = {};
    this._responseHeaders = {};
    this._listeners = {
      abort: [],
      error: [],
      load: [],
      loadend: [],
      loadstart: [],
      progress: [],
      timeout: []
    };
    this.upload = new XMLHttpRequestEventTarget();
  }

  _createClass(FakeXMLHttpRequest, [{
    key: "open",
    value: function open(method, url, async, user, password) {
      this._method = method;
      this._url = url;
      this._readyState = FakeXMLHttpRequest.OPENED;
    }

    // responseBody: any;

  }, {
    key: "_setReadyState",

    // responseXML: any;
    // responseURL: string;
    // statusText: string;

    value: function _setReadyState(readyState) {
      this._readyState = readyState;
      if (this.onreadystatechange) {
        this.onreadystatechange(new Event("readystatechange"));
      }
    }
  }, {
    key: "setRequestHeader",
    value: function setRequestHeader(header, value) {
      this._requestHeaders[header] = value;
    }
  }, {
    key: "getResponseHeader",

    // getAllResponseHeaders(): string;
    value: function getResponseHeader(header) {
      return this._responseHeaders[header];
    }
  }, {
    key: "getAllResponseHeaders",
    value: function getAllResponseHeaders() {
      return this._responseHeaders;
    }
  }, {
    key: "abort",
    value: function abort() {
      this._setReadyState(FakeXMLHttpRequest.UNSENT);
      this._status = 0;
    }
  }, {
    key: "send",
    value: function send(data) {
      var _this = this;

      var method = this._method,
          url = this._url;

      var interceptors = FakeXMLHttpRequest.interceptors.filter(function (interceptor) {
        return interceptor.getHandler(url, method);
      });

      if (interceptors.length > 0) {
        interceptors.forEach(function (interceptor) {
          var handler = interceptor.getHandler(url, method);

          if (handler) {
            var db = interceptor.getDB();
            var delay = interceptor.getDelay();
            var logging = interceptor.getLogging();

            var request = new _Request.Request({
              params: interceptor.getParams(url, method),
              query: interceptor.getQuery(url),
              body: data,
              headers: _this._requestHeaders
            });

            if (logging) {
              console.log(method + ' ' + url, request);
            }

            // Wrapping handler into a promise to add promise support for free
            var responsePromise = Promise.resolve(handler(request, db));

            responsePromise.then(function (result) {
              var response = _Response.Response.wrap(result);

              if (logging) {
                console.log(method + ' ' + url, response);
              }

              if (delay) {
                setTimeout(function () {
                  return _this._handleResponse(response);
                }, delay);
              } else {
                _this._handleResponse(response);
              }
            });
          }
        });
      } else {
        this.nativeSend(data);
      }
    }
  }, {
    key: "_handleResponse",
    value: function _handleResponse(_ref) {
      var code = _ref.code,
          headers = _ref.headers,
          body = _ref.body;
      var contentType = headers["content-type"];


      this._status = code;
      this._responseHeaders = headers;

      if (this.responseType === "blob") {
        if (body instanceof Blob) {
          this._response = body;
        } else {
          this._response = new Blob([body]);
        }
      } else {
        this._response = JSON.stringify(body);
      }

      this._setReadyState(FakeXMLHttpRequest.DONE);

      var loadEvent = new ProgressEvent("load");
      if (this.onload) {
        this.onload(loadEvent);
      }
      this._listeners["load"].forEach(function (listener) {
        if (listener.handleEvent) {
          listener.handleEvent(loadEvent);
        } else {
          listener(loadEvent);
        }
      });
    }
  }, {
    key: "_handleNativeErrorResponse",
    value: function _handleNativeErrorResponse(errorEvent) {
      this._listeners["error"].forEach(function (listener) {
        if (listener.handleEvent) {
          listener.handleEvent(errorEvent);
        } else {
          listener(errorEvent);
        }
      });
    }

    // abort(): void;

    // msCachingEnabled(): boolean;
    // overrideMimeType(mime: string): void;

  }, {
    key: "addEventListener",
    value: function addEventListener(type, listener) {
      this._listeners[type].push(listener);
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(type, listener) {
      var index = this._listeners[type].indexOf(listener);
      if (index >= 0) {
        this._listeners[type].splice(index, 1);
      }
    }
  }, {
    key: "nativeSend",
    value: function nativeSend(data) {
      var _this2 = this;

      var request = new NativeXMLHttpRequest();

      request.timeout = this.timeout;
      request.onload = function () {
        var headers = request.getAllResponseHeaders().split("\r\n").reduce(function (previous, current) {
          var _current$split = current.split(": "),
              _current$split2 = _slicedToArray(_current$split, 2),
              header = _current$split2[0],
              value = _current$split2[1];

          return _extends({}, previous, _defineProperty({}, header, value));
        }, {});
        var contentType = headers['content-type'];
        var responseBody = contentType && contentType.includes('application/json') ? JSON.parse(request.response) : request.response;
        var response = new _Response.Response(request.status, responseBody, headers);
        _this2._handleResponse(response);
      };
      request.onerror = function (event) {
        _this2._handleNativeErrorResponse(event);
      };

      request.open(this._method, this._url);
      Object.keys(this._requestHeaders).forEach(function (key) {
        request.setRequestHeader(key, _this2._requestHeaders[key]);
      });
      request.send(data);
    }
  }, {
    key: "status",
    get: function get() {
      return this._status;
    }
  }, {
    key: "readyState",
    get: function get() {
      return this._readyState;
    }
  }, {
    key: "response",
    get: function get() {
      return this._response;
    }
  }, {
    key: "responseText",
    get: function get() {
      return this.response;
    }
  }], [{
    key: "use",
    value: function use(interceptor) {
      FakeXMLHttpRequest.interceptors.push(interceptor);
    }
  }, {
    key: "shouldIntercept",
    value: function shouldIntercept(method, url) {
      return FakeXMLHttpRequest.interceptors.some(function (interceptor) {
        return interceptor.getHandler(url, method);
      });
    }
    // withCredentials: boolean;
    // msCaching: string;

  }]);

  return FakeXMLHttpRequest;
}();

FakeXMLHttpRequest.interceptors = [];
FakeXMLHttpRequest.UNSENT = 0;
FakeXMLHttpRequest.OPENED = 1;
FakeXMLHttpRequest.HEADERS_RECEIVED = 2;
FakeXMLHttpRequest.LOADING = 3;
FakeXMLHttpRequest.DONE = 4;

var FakeXMLHttpRequestEventTarget = function () {
  function FakeXMLHttpRequestEventTarget() {
    _classCallCheck(this, FakeXMLHttpRequestEventTarget);
  }

  _createClass(FakeXMLHttpRequestEventTarget, [{
    key: "addEventListener",
    value: function addEventListener(type, listener) {
      // do nothing for now

      var useCaptureOrOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    }
  }]);

  return FakeXMLHttpRequestEventTarget;
}();

var enable = exports.enable = function enable(config) {
  var interceptor = (0, _interceptorHelper.interceptorHelper)(config);
  FakeXMLHttpRequest.use(interceptor);
  window.XMLHttpRequest = FakeXMLHttpRequest;
  window.XMLHttpRequestEventTarget = FakeXMLHttpRequestEventTarget;
};
var disable = exports.disable = function disable() {
  window.XMLHttpRequest = NativeXMLHttpRequest;
  window.XMLHttpRequestEventTarget = NativeXMLHttpRequestEventTarget;
};