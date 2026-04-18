import pool from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json([]);
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Category not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    res.json({ id: req.params.id, name, description });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
