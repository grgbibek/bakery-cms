import pool from '../config/db.js';
import { cacheGet, cacheSet, cacheDel, CACHE_KEYS } from '../utils/cache.js';

export const getCategories = async (req, res) => {
  try {
    const cached = cacheGet(CACHE_KEYS.CATEGORIES);
    if (cached) return res.json(cached);

    const [rows] = await pool.query(
      'SELECT id, name, description, created_at FROM categories ORDER BY created_at DESC'
    );
    cacheSet(CACHE_KEYS.CATEGORIES, rows);
    res.json(rows);
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') return res.json([]);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, created_at FROM categories WHERE id = ?',
      [req.params.id]
    );
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
    cacheDel(CACHE_KEYS.CATEGORIES);
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
    cacheDel(CACHE_KEYS.CATEGORIES);
    res.json({ id: req.params.id, name, description });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    cacheDel(CACHE_KEYS.CATEGORIES);
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
