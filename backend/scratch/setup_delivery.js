import pool from '../config/db.js';

async function setupDelivery() {
  try {
    console.log('Starting Delivery Charge setup...');

    // 1. Add delivery_charge column to orders table
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN delivery_charge DECIMAL(10,2) DEFAULT 0 AFTER total_amount');
      console.log('Added delivery_charge column to orders table.');
    } catch (err) {
      if (err.code === 'ER_DUP_COLUMN_NAME' || err.code === 'ER_DUP_FIELDNAME') {
        console.log('delivery_charge column already exists.');
      } else {
        throw err;
      }
    }

    // 2. Insert default delivery settings into website_content
    const defaultSettings = [
      { key: 'delivery_fee', value: '100' },
      { key: 'free_delivery_min', value: '1000' }
    ];

    for (const setting of defaultSettings) {
      const [exists] = await pool.query('SELECT 1 FROM content WHERE key_name = ?', [setting.key]);
      if (exists.length === 0) {
        await pool.query('INSERT INTO content (key_name, value) VALUES (?, ?)', [setting.key, setting.value]);
        console.log(`Initialized CMS setting: ${setting.key} = ${setting.value}`);
      }
    }

    console.log('Delivery setup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupDelivery();
