import pool from '../config/db.js';

async function migrate() {
  try {
    console.log('Creating order_logs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    
    // Optional: Backfill logs for existing orders?
    // For now, we'll just start fresh.
    
    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();
