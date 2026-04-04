import pool from '../config/db.js';

export const getContent = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM content');
    res.json(rows);
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json([]);
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateContent = async (req, res) => {
  const { key_name, value } = req.body;
  
  if (!key_name) return res.status(400).json({ message: 'key_name is required' });

  try {
    const [existing] = await pool.query('SELECT * FROM content WHERE key_name = ?', [key_name]);
    
    if (existing.length > 0) {
      await pool.query('UPDATE content SET value = ? WHERE key_name = ?', [value, key_name]);
    } else {
      await pool.query('INSERT INTO content (key_name, value) VALUES (?, ?)', [key_name, value]);
    }
    
    res.json({ key_name, value });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
