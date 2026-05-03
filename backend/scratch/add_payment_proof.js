import pool from '../config/db.js';

async function migrate() {
  try {
    console.log('Adding payment_proof to orders table...');
    await pool.query("ALTER TABLE orders ADD COLUMN payment_proof VARCHAR(255) AFTER payment_method");
    console.log('Migration successful.');
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column already exists, skipping.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    process.exit();
  }
}

migrate();
