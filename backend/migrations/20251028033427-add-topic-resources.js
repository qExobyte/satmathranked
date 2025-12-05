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
  return db.createTable('TOPIC_RESOURCES', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      notNull: true
    },
    resource_name: {
      type: 'string',
      notNull: true,
      length: 255
    },
    resource_description: {
      type: 'text',
      notNull: true
    },
    topic_id: {
      type: 'int',
      notNull: true,
      foreignKey: {
        name: 'fk_topic_resources_topic_id',
        table: 'TOPICS',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      defaultValue: new String('CURRENT_TIMESTAMP')
    }
  });
};

exports.down = function(db) {
  return db.dropTable('TOPIC_RESOURCES');
};

exports._meta = {
  "version": 1
};
