'use strict';

exports.up = async function(db) {
  console.log('--- STARTING COMPREHENSIVE SCHEMA SYNC ---');
  await db.runSql('SET FOREIGN_KEY_CHECKS = 0');

  // 1. USERS
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      is_active TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 2. CATEGORIES
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 3. PRODUCTS
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image_url VARCHAR(255),
      image_thumb_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_products_category_id (category_id),
      INDEX idx_products_created_at (created_at)
    ) ENGINE=InnoDB;
  `);

  // 4. PRODUCT_IMAGES (Multiple images per product)
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      image_thumb_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_product_images_pid (product_id)
    ) ENGINE=InnoDB;
  `);
  
  // 5. CONTENT
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      key_name VARCHAR(255) NOT NULL UNIQUE,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // 6. ORDERS
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tracking_id VARCHAR(36) UNIQUE,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(255) NOT NULL,
      customer_address TEXT NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      delivery_charge DECIMAL(10, 2) DEFAULT 0,
      payment_method VARCHAR(50) DEFAULT 'Cash',
      status VARCHAR(50) DEFAULT 'pending',
      payment_proof LONGTEXT,
      rider_id INT NULL,
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_orders_status (status),
      INDEX idx_orders_tracking_id (tracking_id),
      INDEX idx_orders_created_at (created_at)
    ) ENGINE=InnoDB;
  `);

  // 7. ORDER_ITEMS
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price_at_purchase DECIMAL(10, 2) NOT NULL,
      product_options TEXT,
      INDEX idx_order_items_order (order_id),
      INDEX idx_order_items_product (product_id)
    ) ENGINE=InnoDB;
  `);

  // 8. ORDER_LOGS
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS order_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      status VARCHAR(50) NOT NULL,
      notes TEXT,
      user_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_order_logs_order (order_id)
    ) ENGINE=InnoDB;
  `);

  // 9. SETTINGS
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS settings (
      setting_key VARCHAR(255) PRIMARY KEY,
      setting_value LONGTEXT
    ) ENGINE=InnoDB;
  `);

  // --- REPAIR & SYNC (Safely ensures every column exists in older production tables) ---
  const repairs = [
    { tbl: 'products',     col: 'category_id',      sql: 'ALTER TABLE products ADD COLUMN category_id INT NULL AFTER id' },
    { tbl: 'products',     col: 'image_url',        sql: 'ALTER TABLE products ADD COLUMN image_url VARCHAR(255) AFTER price' },
    { tbl: 'products',     col: 'image_thumb_url',  sql: 'ALTER TABLE products ADD COLUMN image_thumb_url VARCHAR(255) AFTER image_url' },
    { tbl: 'orders',       col: 'tracking_id',      sql: 'ALTER TABLE orders ADD COLUMN tracking_id VARCHAR(36) UNIQUE AFTER id' },
    { tbl: 'orders',       col: 'delivery_charge',  sql: 'ALTER TABLE orders ADD COLUMN delivery_charge DECIMAL(10, 2) DEFAULT 0 AFTER total_amount' },
    { tbl: 'orders',       col: 'payment_method',   sql: 'ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT "Cash" AFTER delivery_charge' },
    { tbl: 'orders',       col: 'rider_id',         sql: 'ALTER TABLE orders ADD COLUMN rider_id INT NULL AFTER status' },
    { tbl: 'orders',       col: 'payment_proof',    sql: 'ALTER TABLE orders ADD COLUMN payment_proof LONGTEXT AFTER status' },
    { tbl: 'orders',       col: 'admin_notes',      sql: 'ALTER TABLE orders ADD COLUMN admin_notes TEXT AFTER payment_proof' },
    { tbl: 'order_items',  col: 'product_options',  sql: 'ALTER TABLE order_items ADD COLUMN product_options TEXT AFTER price_at_purchase' }
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

  // Ensure settings value is LONGTEXT for QR codes
  await db.runSql('ALTER TABLE settings MODIFY COLUMN setting_value LONGTEXT');

  // 10. FOREIGN KEYS
  await db.runSql('ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL').catch(() => {});
  await db.runSql('ALTER TABLE product_images ADD CONSTRAINT fk_product_images_pid FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE').catch(() => {});
  await db.runSql('ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE').catch(() => {});
  await db.runSql('ALTER TABLE order_logs ADD CONSTRAINT fk_order_logs_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE').catch(() => {});

  await db.runSql('SET FOREIGN_KEY_CHECKS = 1');
  console.log('--- COMPREHENSIVE SCHEMA SYNC COMPLETED ---');
};

exports.down = function(db, callback) {
  callback();
};
