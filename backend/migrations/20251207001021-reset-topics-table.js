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
  // First disable foreign key checks
  return db.runSql('SET FOREIGN_KEY_CHECKS=0;')
    .then(function() {
      // Drop the table without worrying about foreign key constraints
      return db.dropTable('TOPICS');
    })
    .then(function() {
      // Create the table with the new schema
      return db.createTable('TOPICS', {
        columns: {
          id: { type: 'int', primaryKey: true},
          weight: {type: 'float', notNull: true},
          name: { type: 'string', length: 255, notNull: true },
          description: { type: 'text' },
          created_at: { type: 'timestamp', defaultValue: new String('CURRENT_TIMESTAMP') }
        }
      });
    })
    .then(function() {
      // Re-enable foreign key checks
      return db.runSql('SET FOREIGN_KEY_CHECKS=1;');
    });
};

exports.down = function(db) {
  // First disable foreign key checks
  return db.runSql('SET FOREIGN_KEY_CHECKS=0;')
    .then(function() {
      // Drop the new version of the table
      return db.dropTable('TOPICS');
    })
    .then(function() {
      return db.createTable('TOPICS', {
        columns: {
          id: { type: 'int', primaryKey: true, autoIncrement: true },
          name: { type: 'string', length: 255, notNull: true },
          weight: {type: 'float', notNull: true},
          description: { type: 'text' },
          created_at: { type: 'timestamp', defaultValue: new String('CURRENT_TIMESTAMP') }
        },
        ifNotExists: true
      });
    })
    .then(function() {
      // Re-enable foreign key checks
      return db.runSql('SET FOREIGN_KEY_CHECKS=1;');
    });
};

exports._meta = {
  "version": 1
};
