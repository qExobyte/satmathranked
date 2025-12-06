'use strict';

var dbm;
var type;
var seed;
const fs = require('fs');
const path = require('path');

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
  const filePath = path.join(__dirname, '..', 'data', 'topics.json');
  const rawData = fs.readFileSync(filePath, 'utf8');
  const records = JSON.parse(rawData);

  // Create an array to hold all insert promises
  const insertPromises = [];

  // Insert each topic record into the database
  for (const topic of records) {
    insertPromises.push(
      db.insert('TOPICS', 
        {
          name: topic.name,
          weight: topic.weight,
          // Note: We don't need to specify created_at as it will use the default value
        }
      )
    );
  }

  // Execute all insertions in sequence
  return Promise.all(insertPromises);
};

exports.down = function(db) {
  // Delete all records from the TOPICS table
  return db.runSql('DELETE FROM TOPICS');
};

exports._meta = {
  "version": 1
};
