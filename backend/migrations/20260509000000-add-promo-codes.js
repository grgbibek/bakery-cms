'use strict';

exports.up = async function(db) {
  console.log('--- ADDING PROMO CODES SCHEMA ---');
  await db.runSql('SET FOREIGN_KEY_CHECKS = 0');

  // Create promo_codes table
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
      discount_value DECIMAL(10, 2) NOT NULL,
      min_order_amount DECIMAL(10, 2) DEFAULT 0,
      expiration_date DATETIME NULL,
      is_active TINYINT DEFAULT 1,
      usage_limit INT NULL, -- NULL means unlimited
      usage_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Add promo fields to orders
  const repairs = [
    { tbl: 'orders', col: 'promo_code', sql: 'ALTER TABLE orders ADD COLUMN promo_code VARCHAR(50) NULL AFTER status' },
    { tbl: 'orders', col: 'discount_amount', sql: 'ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0 AFTER promo_code' }
  ];

  for (const r of repairs) {
    const [check] = await new Promise((resolve) => {
      db.connection.query('SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?', [r.tbl, r.col], (err, rows) => resolve(rows));
    });
    if (check && check.cnt === 0) {
      console.log(`  + Repairing ${r.tbl}: adding column ${r.col}`);
      await db.runSql(r.sql);
    }
  }

  await db.runSql('SET FOREIGN_KEY_CHECKS = 1');
  console.log('--- PROMO CODES SCHEMA COMPLETE ---');
};

exports.down = function(db, callback) {
  callback();
};
