import pool from '../config/db.js';

const categoryImages = {
  'Breads': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&q=80',
    'https://images.unsplash.com/photo-1589367920969-ab8e050eb0e9?w=800&q=80',
    'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=800&q=80'
  ],
  'Cakes': [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&q=80',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
    'https://images.unsplash.com/photo-1557308536-ee471ef2c390?w=800&q=80',
    'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80'
  ],
  'Pastries': [
    'https://images.unsplash.com/photo-1509365465994-3e5068f691f1?w=800&q=80',
    'https://images.unsplash.com/photo-1621236378699-859efabacd18?w=800&q=80',
    'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&q=80',
    'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=800&q=80'
  ],
  'Cookies': [
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80',
    'https://images.unsplash.com/photo-1618923850106-920ebdd463ad?w=800&q=80',
    'https://images.unsplash.com/photo-1590080875518-1ebdd09b570e?w=800&q=80'
  ],
  'Sandwiches': [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
    'https://images.unsplash.com/photo-1550507992-eb63ffee0224?w=800&q=80',
    'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&q=80',
    'https://images.unsplash.com/photo-1553909489-cd47cebebea8?w=800&q=80'
  ],
  'Beverages': [
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'
  ]
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function updateImages() {
  try {
    const [products] = await pool.query(`
      SELECT p.id, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80'
    `);

    let updatedCount = 0;

    for (const product of products) {
      const images = categoryImages[product.category_name] || categoryImages['Breads'];
      const randomImg = getRandomItem(images);
      // Replace w=800 with w=200 for thumbnail
      const thumbImg = randomImg.replace('w=800', 'w=200');

      await pool.query(
        'UPDATE products SET image_url = ?, image_thumb_url = ? WHERE id = ?',
        [randomImg, thumbImg, product.id]
      );
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} products with appropriate images.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating images:', error);
    process.exit(1);
  }
}

updateImages();
