'use strict';

exports.up = function(db) {
  return db.changeColumn('PROBLEM_HISTORY', 'timestamp', {
    type: 'datetime',
    notNull: true,
    defaultValue:'CURRENT_TIMESTAMP'
  });
};

exports.down = function(db) {
  return db.changeColumn('PROBLEM_HISTORY', 'timestamp', {
    type: 'datetime',
    notNull: true,
  });
};

exports._meta = {
  version: 1
};
