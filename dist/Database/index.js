"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RecordNotFoundError = exports.CollectionNotFoundError = exports.Database = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _en_US = require("faker/locale/en_US");

var faker = _interopRequireWildcard(_en_US);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var databaseCollectionStores = new WeakMap();

var Database = exports.Database = function () {
  function Database() {
    _classCallCheck(this, Database);

    this.reset();
  }

  _createClass(Database, [{
    key: "all",
    value: function all(collectionName) {
      var _getCollection = this.getCollection(collectionName),
          records = _getCollection.records;

      return records;
    }
  }, {
    key: "belongsTo",
    value: function belongsTo(collectionName, conditions) {
      var _this = this;

      return function () {
        if (conditions) {
          return _this.findOne(collectionName, conditions);
        } else {
          return (0, _lodash.sample)(_this.all(collectionName));
        }
      };
    }
  }, {
    key: "create",
    value: function create(collectionName) {
      var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var factory = arguments[2];

      var dataFactory = factory || this.getCollection(collectionName).factory;
      var records = [];

      for (var index = 0; index < size; index++) {
        var _data = dataFactory(faker);
        var record = this.push(collectionName, _data);
        records.push(record);
      }

      return records;
    }
  }, {
    key: "delete",
    value: function _delete(collectionName, id) {
      var collection = this.getCollection(collectionName);
      var records = collection.records;

      var record = records.find(function (record) {
        return record.id === id;
      });

      if (record) {
        var index = records.indexOf(record);
        records.splice(index, 1);
        return record;
      } else {
        return null;
      }
    }
  }, {
    key: "exists",
    value: function exists(collectionName) {
      var collectionStore = this.getCollectionStore();
      return !!collectionStore[collectionName];
    }
  }, {
    key: "find",
    value: function find(collectionName, conditions) {
      var _getCollection2 = this.getCollection(collectionName),
          records = _getCollection2.records;

      return (0, _lodash.filter)(records, { data: conditions });
    }
  }, {
    key: "findOne",
    value: function findOne(collectionName, conditions) {
      return (0, _lodash.first)(this.find(collectionName, conditions));
    }
  }, {
    key: "first",
    value: function first(collectionName) {
      var _getCollection3 = this.getCollection(collectionName),
          records = _getCollection3.records;

      return (0, _lodash.first)(records);
    }
  }, {
    key: "last",
    value: function last(collectionName) {
      var _getCollection4 = this.getCollection(collectionName),
          records = _getCollection4.records;

      return (0, _lodash.last)([].concat(_toConsumableArray(records)).sort(function (l, r) {
        return l.id - r.id;
      }));
    }
  }, {
    key: "push",
    value: function push(collectionName, data) {
      var collection = this.getCollection(collectionName);
      var uuid = collection.uuid,
          records = collection.records;

      var record = {
        id: uuid,
        data: data
      };

      records.push(record);
      collection.uuid++;

      return record;
    }
  }, {
    key: "register",
    value: function register(collectionName, factory) {
      this.getCollectionStore()[collectionName] = {
        uuid: 0,
        records: [],
        factory: factory
      };
    }
  }, {
    key: "reset",
    value: function reset() {
      databaseCollectionStores.set(this, new Map());
    }
  }, {
    key: "update",
    value: function update(collectionName, id, data) {
      var collection = this.getCollection(collectionName);
      var records = collection.records;

      var oldRecord = this.delete(collectionName, id);

      if (oldRecord) {
        var record = _extends({}, oldRecord, {
          data: _extends({}, oldRecord.data, data)
        });
        records.push(record);
        return record;
      } else {
        throw new RecordNotFoundError(collectionName, id);
      }
    }
  }, {
    key: "getCollectionStore",
    value: function getCollectionStore() {
      var collectionStore = databaseCollectionStores.get(this);
      if (collectionStore) {
        return collectionStore;
      } else {
        throw new Error("This database needs to be initialized.");
      }
    }
  }, {
    key: "getCollection",
    value: function getCollection(collectionName) {
      var collectionStore = this.getCollectionStore();
      var collection = collectionStore[collectionName];
      if (collection) {
        return collection;
      } else {
        throw new CollectionNotFoundError(collectionName);
      }
    }
  }]);

  return Database;
}();

var CollectionNotFoundError = exports.CollectionNotFoundError = function (_Error) {
  _inherits(CollectionNotFoundError, _Error);

  function CollectionNotFoundError(collectionName) {
    _classCallCheck(this, CollectionNotFoundError);

    return _possibleConstructorReturn(this, (CollectionNotFoundError.__proto__ || Object.getPrototypeOf(CollectionNotFoundError)).call(this, "Collection " + collectionName + " not found"));
  }

  return CollectionNotFoundError;
}(Error);

var RecordNotFoundError = exports.RecordNotFoundError = function (_Error2) {
  _inherits(RecordNotFoundError, _Error2);

  function RecordNotFoundError(collectionName, id) {
    _classCallCheck(this, RecordNotFoundError);

    return _possibleConstructorReturn(this, (RecordNotFoundError.__proto__ || Object.getPrototypeOf(RecordNotFoundError)).call(this, "Record " + id + " not found in collection " + collectionName));
  }

  return RecordNotFoundError;
}(Error);