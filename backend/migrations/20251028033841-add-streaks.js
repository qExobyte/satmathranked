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
  return db.createTable('STREAKS', {
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
        name: 'fk_streaks_user_id',
        table: 'USERS',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    latest_problem: {
      type: 'int',
      foreignKey: {
        name: 'fk_streaks_problem_history_id',
        table: 'PROBLEM_HISTORY',
        rules: {
          onDelete: 'SET NULL',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    streak_icon: {
      type: 'string',
      length: 50
    },
    current_streak: {
      type: 'int',
      notNull: true,
      defaultValue: 0
    },
    longest_streak: {
      type: 'int',
      notNull: true,
      defaultValue: 0
    },
    last_activity_date: {
      type: 'datetime',
      defaultValue: new String('CURRENT_TIMESTAMP')
    }
  });
};

exports.down = function(db) {
  return db.dropTable('STREAKS');
};

exports._meta = {
  "version": 1
};
