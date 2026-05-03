import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function setupSettings() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Creating settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Fetch current delivery settings from 'content' table
    const [contentRows] = await connection.query('SELECT key_name, value FROM content WHERE key_name IN ("delivery_fee_base", "delivery_fee_premium", "nearby_areas", "free_delivery_min")');
    
    const deliverySettings = contentRows.reduce((acc, row) => {
      acc[row.key_name] = row.value;
      return acc;
    }, { 
      delivery_fee_base: '100', 
      delivery_fee_premium: '200', 
      nearby_areas: '', 
      free_delivery_min: '1000' 
    });

    const deliveryJson = JSON.stringify({
        base_fee: parseFloat(deliverySettings.delivery_fee_base),
        premium_fee: parseFloat(deliverySettings.delivery_fee_premium),
        free_min: parseFloat(deliverySettings.free_delivery_min),
        nearby_areas: deliverySettings.nearby_areas
    });

    console.log('Migrating delivery settings...');
    await connection.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', 
        ['delivery_settings', deliveryJson, deliveryJson]);

    // Initialize Cake Types
    const cakeTypes = JSON.stringify([
        { name: 'Normal', extra: 0 },
        { name: 'Veg Cake', extra: 100 },
        { name: 'Eggless Cake', extra: 150 },
        { name: 'Sugarless Cake', extra: 200 }
    ]);

    console.log('Initializing cake types...');
    await connection.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', 
        ['cake_types', cakeTypes, cakeTypes]);

    console.log('Database settings migration complete!');
  } catch (error) {
    console.error('Error setting up settings table:', error);
  } finally {
    await connection.end();
  }
}

setupSettings();
