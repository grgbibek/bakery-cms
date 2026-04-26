/**
 * generate_thumbs.js
 * Run once to generate compressed 200×200 thumbnails for existing products
 * that currently have no image_thumb_url.
 *
 * Usage:  node generate_thumbs.js
 */

import pool from './config/db.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function run() {
  // Fetch all products that have an image but no thumbnail yet
  const [products] = await pool.query(
    `SELECT id, image_url FROM products WHERE image_url IS NOT NULL AND (image_thumb_url IS NULL OR image_thumb_url = '')`
  );

  if (products.length === 0) {
    console.log('✅ All products already have thumbnails.');
    process.exit(0);
  }

  console.log(`Found ${products.length} product(s) without thumbnails. Generating...`);

  for (const product of products) {
    const imageUrl = product.image_url;

    // Skip external URLs (we can't resize remote images here)
    if (imageUrl.startsWith('http')) {
      console.log(`  ⚠️  Product ${product.id}: external URL — skipping (${imageUrl})`);
      await pool.query('UPDATE products SET image_thumb_url = ? WHERE id = ?', [imageUrl, product.id]);
      continue;
    }

    // Resolve local file path, e.g. /uploads/product_xxx.jpg → uploads/product_xxx.jpg
    const relPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    const filePath = path.join(__dirname, relPath);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  Product ${product.id}: file not found at ${filePath} — skipping`);
      continue;
    }

    try {
      const ext = path.extname(filePath).toLowerCase(); // e.g. .png or .jpg
      const basename = path.basename(filePath, ext);
      const thumbFilename = `thumb_${basename}${ext}`;
      const thumbPath = path.join(UPLOADS_DIR, thumbFilename);

      await sharp(filePath)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 80 }) // convert to compressed JPEG regardless of source format
        .toFile(thumbPath.replace(ext, '.jpg'));

      const thumbUrl = `/uploads/${thumbFilename.replace(ext, '.jpg')}`;
      await pool.query('UPDATE products SET image_thumb_url = ? WHERE id = ?', [thumbUrl, product.id]);

      const origSize = (fs.statSync(filePath).size / 1024).toFixed(1);
      const thumbSize = (fs.statSync(thumbPath.replace(ext, '.jpg')).size / 1024).toFixed(1);
      console.log(`  ✅ Product ${product.id}: ${origSize}KB → ${thumbSize}KB thumbnail saved as ${thumbFilename.replace(ext, '.jpg')}`);
    } catch (err) {
      console.error(`  ❌ Product ${product.id}: failed — ${err.message}`);
    }
  }

  console.log('\nDone!');
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
