import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const sampleProducts = [
  { name: 'Almond Croissant', description: 'Flaky, buttery croissant filled with sweet almond frangipane and topped with toasted almonds.', price: 4.50, image: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&q=80&w=800' },
  { name: 'Black Forest Cake', description: 'Rich chocolate sponge cake layered with whipped cream and cherries, sprinkled with chocolate shavings.', price: 45.00, image: 'https://images.unsplash.com/photo-1571115177098-24fa10bba689?auto=format&fit=crop&q=80&w=800' },
  { name: 'Artisan Sourdough', description: 'Crusty loaf with a chewy, tangy interior naturally leavened over 48 hours.', price: 7.00, image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bfc19?auto=format&fit=crop&q=80&w=800' },
  { name: 'French Baguette', description: 'Classic crisp crust with a soft, airy interior. Baked fresh every morning.', price: 3.50, image: 'https://images.unsplash.com/photo-1597079910443-60c43fc4f729?auto=format&fit=crop&q=80&w=800' },
  { name: 'Strawberry Tart', description: 'Fresh seasonal strawberries on a bed of vanilla pastry cream in a buttery shell.', price: 6.50, image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=800' },
  { name: 'Matcha Roll Cake', description: 'Delicate matcha sponge cake rolled with light white chocolate whipped cream.', price: 5.50, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800' }
];

const sampleContent = [
  { key_name: 'hero_title', value: 'Artisan Bakes & Fresh Pastries' },
  { key_name: 'hero_subtitle', value: 'Discover the taste of authentic, handcrafted baked goods made with love and premium ingredients.' },
  { key_name: 'about_us', value: 'At our bakery, we believe in the magic of slow fermentation and traditional techniques. Every pastry and loaf of bread is crafted by artisans who are passionate about bringing joy to your daily moments.' },
  { key_name: 'contact_address', value: '456 Patisserie Blvd, Culinary Center' },
  { key_name: 'contact_phone', value: '+1 (555) 987-6543' },
  { key_name: 'contact_email', value: 'hello@artisanbakes.com' },
  { key_name: 'announcement_enabled', value: 'true' },
  { key_name: 'announcement_title', value: 'Mother\'s Day Special!' },
  { key_name: 'announcement_text', value: 'Enjoy 20% off on all custom cakes. Pre-order now before we sell out!' },
  { key_name: 'services_hero_title', value: 'Catering & Custom Orders' },
  { key_name: 'services_hero_subtitle', value: 'Elevating your special moments and corporate events with artisanal excellence.' },
  { key_name: 'service_1_title', value: 'Custom Celebration Cakes' },
  { key_name: 'service_1_desc', value: 'From elegant wedding tiers to playful birthday designs, our master bakers craft bespoke cakes tailored precisely to your vision and taste. We use only premium ingredients to ensure it tastes as spectacular as it looks.' },
  { key_name: 'service_1_img', value: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=800' },
  { key_name: 'service_2_title', value: 'Wholesale & Large Orders' },
  { key_name: 'service_2_desc', value: 'Supplying local cafes, restaurants, and corporate cafeterias. We scale our authentic artisanal baking processes to provide you with consistent, high-quality bulk orders of pastries, breads, and buns.' },
  { key_name: 'service_2_img', value: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800' },
  { key_name: 'service_3_title', value: 'Event Lunchboxes' },
  { key_name: 'service_3_desc', value: 'Elevate your next corporate off-site or private party with our gourmet lunchbox catering. Packed individually with fresh artisan sandwiches, seasonal salads, and signature sweet treats for a seamless dining experience.' },
  { key_name: 'service_3_img', value: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800' }
];

async function seedDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bakery_cms',
    });

    console.log('Connected to the database. Clearing existing data...');
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM content');

    console.log('Inserting sample products...');
    for (const product of sampleProducts) {
      await connection.query(
        'INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)',
        [product.name, product.description, product.price, product.image]
      );
    }

    console.log('Inserting sample content...');
    for (const content of sampleContent) {
      await connection.query(
        'INSERT INTO content (key_name, value) VALUES (?, ?)',
        [content.key_name, content.value]
      );
    }

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();
