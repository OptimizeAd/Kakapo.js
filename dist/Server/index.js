'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Server = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Router = require('../Router');

var _Database = require('../Database');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isRouter = function isRouter(entity) {
  return entity instanceof _Router.Router;
};
var isDb = function isDb(entity) {
  return entity instanceof _Database.Database;
};

var Server = exports.Server = function () {
  function Server(config) {
    _classCallCheck(this, Server);

    this.config = config;
    this.db = null;
    this.router = null;
  }

  _createClass(Server, [{
    key: 'use',
    value: function use(entity) {
      if (isDb(entity)) {
        this.db = entity;
      } else if (isRouter(entity)) {
        this.router = entity;
        this.router.intercept();
      } else {
        console.warn('KAKAPO: Server doesn\'t know how to use the entity ' + entity);
      }

      this.linkEntities();
    }
  }, {
    key: 'remove',
    value: function remove(entity) {
      if (isDb(entity) && this.router && this.router.interceptorConfig.db === entity) {
        this.router.interceptorConfig.db = null;
      } else if (isRouter(entity) && this.router == entity) {
        this.router.reset();
      } else {
        console.warn("KAKAPO: Entity doesn't belongs to server", entity);
      }
    }
  }, {
    key: 'linkEntities',
    value: function linkEntities() {
      var router = this.router;
      var db = this.db;

      if (router && db && router.interceptorConfig.db !== db) {
        router.interceptorConfig.db = db;
      }
    }
  }]);

  return Server;
}();