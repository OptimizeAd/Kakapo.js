"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = exports.Request = function Request(options) {
  _classCallCheck(this, Request);

  this.params = options.params || {};
  this.query = options.query || {};
  this.body = options.body || null;
  this.headers = options.headers || {};
};