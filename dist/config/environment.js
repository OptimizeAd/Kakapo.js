'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var browserEnv = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object';
var nodeEnv = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) === 'object';
var name = browserEnv ? 'browser' : nodeEnv ? 'node' : 'unknown';

exports.default = {
  name: name,
  browserEnv: browserEnv,
  nodeEnv: nodeEnv
};