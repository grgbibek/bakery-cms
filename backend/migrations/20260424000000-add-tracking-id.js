'use strict';

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  const sql = `
    ALTER TABLE orders
      ADD COLUMN tracking_id VARCHAR(36) UNIQUE AFTER id;
  `;
  return db.runSql(sql, callback);
};

exports.down = function(db, callback) {
  const sql = `ALTER TABLE orders DROP COLUMN tracking_id;`;
  return db.runSql(sql, callback);
};

exports._meta = {
  "version": 1
};
