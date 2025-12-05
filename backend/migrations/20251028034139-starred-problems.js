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
  return db.createTable('STARRED_PROBLEMS', {
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
        name: 'fk_starred_problems_user_id',
        table: 'USERS',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    problem_id: {
      type: 'int',
      notNull: true,
      foreignKey: {
        name: 'fk_starred_problems_problem_id',
        table: 'PROBLEMS',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    starred_date: {
      type: 'datetime',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP')
    },
    notes: {
      type: 'text',
      notNull: false
    }
  }).then(function() {
    // Add a unique constraint to prevent duplicate stars
    return db.addIndex('STARRED_PROBLEMS', 'idx_user_problem_unique', ['user_id', 'problem_id'], true);
  });
};

exports.down = function(db) {
  return db.dropTable('STARRED_PROBLEMS');
};

exports._meta = {
  "version": 1
};
