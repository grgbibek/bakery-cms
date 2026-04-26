import pool from './config/db.js';
async function run() {
  try {
    await pool.query('ALTER TABLE orders ADD COLUMN admin_notes TEXT');
    console.log('Column admin_notes added successfully');
  } catch(e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('Column admin_notes already exists');
    else console.error(e);
  }
  try {
    await pool.query('ALTER TABLE products ADD COLUMN image_thumb_url VARCHAR(255)');
    console.log('Column image_thumb_url added successfully');
  } catch(e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('Column image_thumb_url already exists');
    else console.error(e);
  }
  process.exit(0);
}
run();
