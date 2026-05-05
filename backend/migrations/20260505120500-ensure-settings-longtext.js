'use strict';

exports.up = function(db, callback) {
  // Ensure settings table exists and has sufficient capacity for base64 images
  const sql = `
    CREATE TABLE IF NOT EXISTS settings (
      setting_key VARCHAR(255) PRIMARY KEY,
      setting_value LONGTEXT
    );
    ALTER TABLE settings MODIFY COLUMN setting_value LONGTEXT;
  `;
  return db.runSql(sql, callback);
};

exports.down = function(db, callback) {
  // We keep it as LONGTEXT even in down to avoid data loss if it's already there
  return callback();
};
