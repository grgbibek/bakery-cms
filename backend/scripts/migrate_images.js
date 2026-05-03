import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bakery_cms',
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        image_thumb_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('Table product_images created.');

    // Optional: Seed some images for existing products for demo
    const [products] = await connection.query('SELECT id, image_url FROM products');
    for (const p of products) {
        // Insert the main image as the first image in the new table if not already there
        const [existing] = await connection.query('SELECT id FROM product_images WHERE product_id = ?', [p.id]);
        if (existing.length === 0 && p.image_url) {
            await connection.query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [p.id, p.image_url]);
            // Add a sample second image for demo purposes
            await connection.query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [p.id, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800']);
        }
    }
    console.log('Migration and seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
