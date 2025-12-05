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
  return db.createTable('GOOGLE_INFO', {
    google_id: {
      type: 'string',
      primaryKey: true,
      notNull: true,
      length: 255
    },
    user_id: {
      type: 'int',
      notNull: true,
      foreignKey: {
        name: 'fk_google_info_user_id',
        table: 'USERS',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    email_address: {
      type: 'string',
      notNull: true,
      length: 255
    },
    email_verified_status: {
      type: 'boolean',
      notNull: true,
      defaultValue: false
    }
  });
};

exports.down = function(db) {
  return db.dropTable('GOOGLE_INFO');
};

exports._meta = {
  "version": 1
};
