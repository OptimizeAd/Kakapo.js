"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSONApiSerializer = undefined;

var _lodash = require("lodash");

// @TODO (zzarcon): Implement 'included' support after relationships
var JSONApiSerializer = exports.JSONApiSerializer = function JSONApiSerializer() {
  var record = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var id = record.id;
  var included = [];
  var relationships = {};
  var serializedRecord = (0, _lodash.pickBy)(record, function (value, key) {
    return key !== "id";
  });

  return {
    data: {
      id: id,
      attributes: serializedRecord,
      relationships: relationships,
      type: type
    },
    included: included
  };
};