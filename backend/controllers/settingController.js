import db from '../config/db.js';

export const getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM settings');
    const settings = rows.reduce((acc, row) => {
      try {
        acc[row.setting_key] = JSON.parse(row.setting_value);
      } catch (e) {
        acc[row.setting_key] = row.setting_value;
      }
      return acc;
    }, {});
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

export const updateSetting = async (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ message: 'Key is required' });

  try {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await db.query(
      'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, stringValue, stringValue]
    );
    res.json({ message: 'Setting updated successfully', key, value });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Error updating setting' });
  }
};
