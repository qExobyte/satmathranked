'use strict';

const fs = require('fs');
const path = require('path');

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
  // Read the JSON data file
  const jsonPath = path.join(__dirname, '..', 'data', 'problems.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // Create an array of promises for database inserts
  const insertPromises = [];
  
  jsonData.forEach(item => {
    // Convert choices object to the format needed for DB storage
    const answerChoices = {};
    
    if (item.choices) {
      Object.keys(item.choices).forEach(choiceText => {
        const [isCorrect, explanation] = item.choices[choiceText];
        answerChoices[choiceText] = {
          isCorrect: isCorrect,
          explanation: explanation
        };
      });
    }
    
    // Insert problem into the database
    insertPromises.push(
      db.insert('PROBLEMS', 
        ['difficulty', 'problem_text', 'topic_id', 'answer_choices'],
        [
          item.difficulty || null,
          item.problem || null,
          item.topic !== undefined ? item.topic : null,
          JSON.stringify(answerChoices)
        ]
      )
    );
  });
  
  // Execute all insert operations
  return Promise.all(insertPromises);
};

exports.down = function(db) {
  // Simply delete all records from the PROBLEMS table
  return db.runSql('DELETE FROM PROBLEMS');
};

exports._meta = {
  "version": 1
};
