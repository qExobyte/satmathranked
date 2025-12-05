'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};


exports.up = function(db) {
  return db.createTable('USERS', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    username: { type: 'string', notNull: true },
    profile_info_id: { type: 'int', notNull: false },
    email_address: { type: 'string', notNull: true }
  });
};

exports.down = function(db) {
  return db.dropTable('USERS');
};

exports._meta = {
  "version": 1
};
