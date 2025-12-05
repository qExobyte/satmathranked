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
  return db.createTable('PROBLEMS', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    difficulty: { type: 'int', notNull: false },
    problem_text: { type: 'text', notNull: false },
    topic_id: { 
      type: 'int', 
      notNull: false,
      foreignKey: {
        name: 'problems_topic_fk',
        table: 'TOPICS',
        rules: {
          onDelete: 'SET NULL',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    image_url: { type: 'text', notNull: false },
    is_frq: { type: 'boolean', notNull: false },
    answer_choices: { type: 'json', notNull: false }
  });
};

exports.down = function(db) {
  return db.dropTable('PROBLEMS');
};


exports._meta = {
  "version": 1
};
