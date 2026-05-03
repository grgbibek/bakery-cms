import pool from '../config/db.js';

async function updateDeliveryZones() {
  try {
    console.log('Updating Delivery Zones logic...');

    const settings = [
      { key: 'delivery_fee_base', value: '100' },
      { key: 'delivery_fee_premium', value: '200' },
      { key: 'nearby_areas', value: 'Golfutar, Maharajgunj, Budhanilkantha, Dhapasi, Baluwatar, Bishal Nagar, Chabahil, Gongabu, Samakhushi, Naxal, Lazimpat, Gairidhara' }
    ];

    for (const setting of settings) {
      const [exists] = await pool.query('SELECT 1 FROM content WHERE key_name = ?', [setting.key]);
      if (exists.length === 0) {
        await pool.query('INSERT INTO content (key_name, value) VALUES (?, ?)', [setting.key, setting.value]);
      } else {
        await pool.query('UPDATE content SET value = ? WHERE key_name = ?', [setting.value, setting.key]);
      }
      console.log(`Configured CMS setting: ${setting.key} = ${setting.value}`);
    }

    // Also remove the old flat 'delivery_fee' if it exists to avoid confusion, 
    // though keeping it doesn't hurt.
    
    console.log('Delivery Zones setup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

updateDeliveryZones();
