import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Saves a base64 image to disk. If the input is already a URL, returns it unchanged.
 * Also creates a 200x200 thumbnail alongside the original.
 * @returns {{ original: string, thumb: string }}
 */
const processImage = async (base64String) => {
  if (!base64String || !base64String.startsWith('data:image')) {
    return { original: base64String, thumb: base64String };
  }

  try {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return { original: base64String, thumb: base64String };

    const mimeType = matches[1];
    const extension = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ts = Date.now();
    const rand = Math.floor(Math.random() * 1000);
    const filename = `product_${ts}_${rand}.${extension}`;
    const thumbFilename = `thumb_${ts}_${rand}.${extension}`;

    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // Save original
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    // Save compressed thumbnail (200x200 cover crop)
    await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .toFile(path.join(uploadsDir, thumbFilename));

    return {
      original: `/uploads/${filename}`,
      thumb: `/uploads/${thumbFilename}`
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return { original: base64String, thumb: base64String };
  }
};

export const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.description, p.price,
             p.image_url as image, p.image_thumb_url as image_thumb,
             c.name as category, p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') return res.json([]);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.description, p.price,
             p.image_url as image, p.image_thumb_url as image_thumb,
             c.name as category, p.created_at
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

    const { original, thumb } = await processImage(image);

    const [result] = await pool.query(
      'INSERT INTO products (category_id, name, description, price, image_url, image_thumb_url) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id, name, description, price, original, thumb]
    );
    res.status(201).json({ id: result.insertId, name, description, price, image: original, image_thumb: thumb, category });
  } catch (error) {
    console.error('createProduct error:', error);
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

    const { original, thumb } = await processImage(image);

    await pool.query(
      'UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, image_thumb_url = ? WHERE id = ?',
      [category_id, name, description, price, original, thumb, req.params.id]
    );
    res.json({ id: req.params.id, name, description, price, image: original, image_thumb: thumb, category });
  } catch (error) {
    console.error('updateProduct error:', error);
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
