'use strict';

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(
      'ALTER TABLE USERS ADD CONSTRAINT unique_email UNIQUE (email_address)'
  );
};

exports.down = function(db) {
  return db.runSql(
      'ALTER TABLE USERS DROP INDEX unique_email'
  );
};

exports._meta = {
  "version": 1
};