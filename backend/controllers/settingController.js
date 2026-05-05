import db from '../config/db.js';
import { cacheGet, cacheSet, cacheDel, CACHE_KEYS } from '../utils/cache.js';

export const getSettings = async (req, res) => {
  try {
    const cached = cacheGet(CACHE_KEYS.SETTINGS);
    if (cached) return res.json(cached);

    const [rows] = await db.query('SELECT setting_key, setting_value FROM settings');
    const settings = rows.reduce((acc, row) => {
      try {
        acc[row.setting_key] = JSON.parse(row.setting_value);
      } catch (e) {
        acc[row.setting_key] = row.setting_value;
      }
      return acc;
    }, {});

    cacheSet(CACHE_KEYS.SETTINGS, settings);
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
    // Invalidate cache so next read reflects the update
    cacheDel(CACHE_KEYS.SETTINGS);
    res.json({ message: 'Setting updated successfully', key, value });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Error updating setting' });
  }
};
