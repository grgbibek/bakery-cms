'use strict';

/**
 * Performance indexes migration — MySQL-compatible.
 * Only indexes columns verified to exist in the actual schema (init_db.js).
 *
 * orders schema: tracking_id, status, created_at  (no user_id)
 * products schema: category_id, created_at
 * product_images schema: product_id
 */

function query(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.connection.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function tableExists(db, tableName) {
  const rows = await query(
    db,
    `SELECT COUNT(*) AS cnt
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name   = ?`,
    [tableName]
  );
  return rows[0].cnt > 0;
}

async function addIndexIfMissing(db, tableName, indexName, columnDef) {
  // Skip if the table itself doesn't exist yet
  if (!(await tableExists(db, tableName))) return;

  const rows = await query(
    db,
    `SELECT COUNT(*) AS cnt
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = ?
       AND index_name   = ?`,
    [tableName, indexName]
  );
  if (rows[0].cnt === 0) {
    await db.runSql(
      `ALTER TABLE \`${tableName}\` ADD INDEX \`${indexName}\` (${columnDef})`
    );
    console.log(`  + Added index ${indexName} on ${tableName}(${columnDef})`);
  } else {
    console.log(`  ~ Index ${indexName} already exists, skipping.`);
  }
}

async function dropIndexIfExists(db, tableName, indexName) {
  if (!(await tableExists(db, tableName))) return;

  const rows = await query(
    db,
    `SELECT COUNT(*) AS cnt
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = ?
       AND index_name   = ?`,
    [tableName, indexName]
  );
  if (rows[0].cnt > 0) {
    await db.runSql(
      `ALTER TABLE \`${tableName}\` DROP INDEX \`${indexName}\``
    );
    console.log(`  - Dropped index ${indexName} from ${tableName}`);
  }
}

exports.up = async (db) => {
  // ── products ──────────────────────────────────────────────────────────────
  // category_id: used in every product listing JOIN
  await addIndexIfMissing(db, 'products', 'idx_products_category_id', 'category_id');
  // created_at: ORDER BY created_at DESC on product listing
  await addIndexIfMissing(db, 'products', 'idx_products_created_at', 'created_at');

  // ── orders ────────────────────────────────────────────────────────────────
  // status: admin order filtering (pending / confirmed / delivered …)
  await addIndexIfMissing(db, 'orders', 'idx_orders_status', 'status');
  // tracking_id: public order-tracking endpoint
  await addIndexIfMissing(db, 'orders', 'idx_orders_tracking_id', 'tracking_id');
  // created_at: admin reports & sorting
  await addIndexIfMissing(db, 'orders', 'idx_orders_created_at', 'created_at');

  // ── product_images ────────────────────────────────────────────────────────
  // product_id: fetched per detail page
  await addIndexIfMissing(db, 'product_images', 'idx_product_images_pid', 'product_id');
};

exports.down = async (db) => {
  await dropIndexIfExists(db, 'products',       'idx_products_category_id');
  await dropIndexIfExists(db, 'products',       'idx_products_created_at');
  await dropIndexIfExists(db, 'orders',         'idx_orders_status');
  await dropIndexIfExists(db, 'orders',         'idx_orders_tracking_id');
  await dropIndexIfExists(db, 'orders',         'idx_orders_created_at');
  await dropIndexIfExists(db, 'product_images', 'idx_product_images_pid');
};
