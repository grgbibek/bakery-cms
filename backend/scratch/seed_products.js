import pool from '../config/db.js';

const categories = [
  'Breads',
  'Cakes',
  'Pastries',
  'Cookies',
  'Sandwiches',
  'Beverages'
];

const adjectives = [
  'Artisan', 'Rustic', 'Classic', 'Signature', 'Premium', 'Traditional', 
  'Homemade', 'Gourmet', 'Handcrafted', 'Deluxe', 'Organic', 'Fresh',
  'Spiced', 'Sweet', 'Savory', 'Warm', 'Crispy', 'Soft'
];

const types = {
  'Breads': ['Sourdough', 'Baguette', 'Ciabatta', 'Rye', 'Focaccia', 'Brioche', 'Whole Wheat Loaf', 'Multigrain Bread', 'Pita', 'Naan'],
  'Cakes': ['Chocolate Cake', 'Vanilla Sponge', 'Red Velvet', 'Carrot Cake', 'Cheesecake', 'Black Forest', 'Lemon Drizzle', 'Coffee Cake', 'Fruit Cake', 'Opera Cake'],
  'Pastries': ['Croissant', 'Pain au Chocolat', 'Danish', 'Eclair', 'Tart', 'Mille-feuille', 'Macaron', 'Profiterole', 'Cannoli', 'Palmier'],
  'Cookies': ['Chocolate Chip Cookie', 'Oatmeal Raisin', 'Snickerdoodle', 'Peanut Butter Cookie', 'Shortbread', 'Gingerbread', 'Macaroon', 'Biscotti', 'Sugar Cookie', 'Linzer Cookie'],
  'Sandwiches': ['Club Sandwich', 'BLT', 'Panini', 'Wrap', 'Baguette Sandwich', 'Grilled Cheese', 'Chicken Salad Sandwich', 'Tuna Melt', 'Veggie Sandwich', 'Egg Salad Sandwich'],
  'Beverages': ['Espresso', 'Cappuccino', 'Latte', 'Americano', 'Mocha', 'Hot Chocolate', 'Iced Coffee', 'Green Tea', 'Earl Grey', 'Fresh Orange Juice']
};

const imagePlaceholder = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80';
const thumbPlaceholder = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80';

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

async function seedProducts() {
  try {
    // 1. Ensure categories exist and get their IDs
    const categoryIds = {};
    for (const catName of categories) {
      const [rows] = await pool.query('SELECT id FROM categories WHERE name = ?', [catName]);
      if (rows.length > 0) {
        categoryIds[catName] = rows[0].id;
      } else {
        const [res] = await pool.query('INSERT INTO categories (name) VALUES (?)', [catName]);
        categoryIds[catName] = res.insertId;
      }
    }

    console.log('Categories ready:', categoryIds);

    // 2. Generate and insert 100 products
    let insertedCount = 0;
    for (let i = 0; i < 100; i++) {
      const categoryName = getRandomItem(categories);
      const catId = categoryIds[categoryName];
      const adj = getRandomItem(adjectives);
      const type = getRandomItem(types[categoryName]);
      const name = `${adj} ${type}`;
      
      const price = getRandomPrice(150, 1500); // realistic prices for a bakery (Rs)
      const description = `Enjoy our delicious ${name}, freshly prepared every day. Made with the finest ingredients to ensure a delightful experience. Perfect for any occasion.`;
      
      await pool.query(
        'INSERT INTO products (category_id, name, description, price, image_url, image_thumb_url) VALUES (?, ?, ?, ?, ?, ?)',
        [catId, name, description, price, imagePlaceholder, thumbPlaceholder]
      );
      insertedCount++;
    }

    console.log(`Successfully seeded ${insertedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
