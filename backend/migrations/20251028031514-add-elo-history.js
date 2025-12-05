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
  return db.createTable('ELO_HISTORY', {
    id: { 
      type: 'int', 
      primaryKey: true, 
      autoIncrement: true,
      notNull: true
    },
    user_id: {
      type: 'int',
      notNull: true,
      foreignKey: {
        name: 'fk_elo_history_user_id',
        table: 'USERS',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    timestamp: {
      type: 'datetime',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP')
    },
    elo: {
      type: 'int',
      notNull: true
    }
  });
};

exports.down = function(db) {
  return db.dropTable('ELO_HISTORY');
};

exports._meta = { "version": 1 };
