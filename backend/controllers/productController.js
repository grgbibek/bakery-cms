import pool from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.description, p.price, p.image_url as image, c.name as category, p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json([]);
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.description, p.price, p.image_url as image, c.name as category, p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProduct = async (req, res) => {
  const { name, description, price, image, category } = req.body;
  try {
    let category_id = null;
    if (category) {
      const [catRows] = await pool.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (catRows.length > 0) {
        category_id = catRows[0].id;
      } else {
        const [resCat] = await pool.query('INSERT INTO categories (name) VALUES (?)', [category]);
        category_id = resCat.insertId;
      }
    }

    const [result] = await pool.query(
      'INSERT INTO products (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [category_id, name, description, price, image]
    );
    res.status(201).json({ id: result.insertId, name, description, price, image, category });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProduct = async (req, res) => {
  const { name, description, price, image, category } = req.body;
  try {
    let category_id = null;
    if (category) {
      const [catRows] = await pool.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (catRows.length > 0) {
        category_id = catRows[0].id;
      } else {
        const [resCat] = await pool.query('INSERT INTO categories (name) VALUES (?)', [category]);
        category_id = resCat.insertId;
      }
    }

    await pool.query(
      'UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, image_url = ? WHERE id = ?',
      [category_id, name, description, price, image, req.params.id]
    );
    res.json({ id: req.params.id, name, description, price, image, category });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
