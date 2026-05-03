import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    console.log('Starting product image migration...');

    const baseDir = path.join(__dirname, '..', 'uploads');
    const productDir = path.join(baseDir, 'Product');
    const thumbDir = path.join(productDir, 'thumbnail');

    // Ensure target directories exist
    if (!fs.existsSync(productDir)) fs.mkdirSync(productDir, { recursive: true });
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

    // 1. Migrate Products Table
    const [products] = await pool.query('SELECT id, image_url, image_thumb_url FROM products');
    
    for (const p of products) {
      // Handle main image
      if (p.image_url && p.image_url.startsWith('/uploads/') && !p.image_url.includes('/Product/')) {
        const oldName = p.image_url.split('/').pop();
        const oldPath = path.join(baseDir, oldName);
        const newPath = path.join(productDir, oldName);
        
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          const newUrl = `/uploads/Product/${oldName}`;
          await pool.query('UPDATE products SET image_url = ? WHERE id = ?', [newUrl, p.id]);
          console.log(`Moved product image: ${oldName}`);
        }
      }

      // Handle thumbnail
      if (p.image_thumb_url && p.image_thumb_url.startsWith('/uploads/') && !p.image_thumb_url.includes('/Product/')) {
        const oldName = p.image_thumb_url.split('/').pop();
        const oldPath = path.join(baseDir, oldName);
        const newPath = path.join(thumbDir, oldName);
        
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          const newUrl = `/uploads/Product/thumbnail/${oldName}`;
          await pool.query('UPDATE products SET image_thumb_url = ? WHERE id = ?', [newUrl, p.id]);
          console.log(`Moved thumbnail: ${oldName}`);
        }
      }
    }

    // 2. Migrate Product Images Gallery
    const [gallery] = await pool.query('SELECT id, image_url FROM product_images');
    for (const img of gallery) {
      if (img.image_url && img.image_url.startsWith('/uploads/') && !img.image_url.includes('/Product/')) {
        const oldName = img.image_url.split('/').pop();
        const oldPath = path.join(baseDir, oldName);
        const newPath = path.join(productDir, oldName);
        
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          const newUrl = `/uploads/Product/${oldName}`;
          await pool.query('UPDATE product_images SET image_url = ? WHERE id = ?', [newUrl, img.id]);
          console.log(`Moved gallery image: ${oldName}`);
        }
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
