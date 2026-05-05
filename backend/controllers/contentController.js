import pool from '../config/db.js';
import { cacheGet, cacheSet, cacheDel, CACHE_KEYS } from '../utils/cache.js';

export const getContent = async (req, res) => {
  try {
    const cached = cacheGet(CACHE_KEYS.CONTENT);
    if (cached) return res.json(cached);

    const [rows] = await pool.query('SELECT key_name, value FROM content');
    cacheSet(CACHE_KEYS.CONTENT, rows);
    res.json(rows);
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') return res.json([]);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateContent = async (req, res) => {
  const { key_name, value } = req.body;

  if (!key_name) return res.status(400).json({ message: 'key_name is required' });

  try {
    const [existing] = await pool.query('SELECT id FROM content WHERE key_name = ?', [key_name]);

    if (existing.length > 0) {
      await pool.query('UPDATE content SET value = ? WHERE key_name = ?', [value, key_name]);
    } else {
      await pool.query('INSERT INTO content (key_name, value) VALUES (?, ?)', [key_name, value]);
    }

    // Invalidate cache so next read reflects the update
    cacheDel(CACHE_KEYS.CONTENT);
    res.json({ key_name, value });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
