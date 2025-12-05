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
  return db.createTable('PROBLEM_HISTORY', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    user_id: { 
      type: 'int', 
      notNull: true,
      foreignKey: {
        name: 'problem_history_user_fk',
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
        name: 'problem_history_problem_fk',
        table: 'PROBLEMS',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    problem_rating: { type: 'int', notNull: false },
    timestamp: { type: 'datetime', notNull: true },
    is_correct: { type: 'boolean', notNull: false },
    answer_text: { type: 'text', notNull: false }
  });
};

exports.down = function(db) {
  return db.dropTable('PROBLEM_HISTORY');
};

exports._meta = {
  "version": 1
};
