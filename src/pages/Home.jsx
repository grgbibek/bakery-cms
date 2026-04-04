import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

// Default images for visual appeal if db has none
const defaultHeroImage = 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=1600';

const sampleContent = {
  hero_title: 'Welcome to German Bakery',
  hero_subtitle: 'Authentic baked goods, pastries, and artisanal breads made with love.',
  about_us: 'Our bakery brings the finest German recipes straight to your table. Every loaf is baked fresh daily by our master bakers.',
  contact_address: '123 Pretzel Street, Munich, Germany',
  contact_phone: '+49 123 456 7890',
  contact_email: 'hello@germanbakery.com'
};

const sampleProducts = [
  { id: 1, name: 'Pretzel', description: 'A traditional German baked pastry made from dough that is shaped into a knot.', price: 3.50, image_url: 'https://images.unsplash.com/photo-1598440026214-7e793a38ce1f?auto=format&fit=crop&q=80&w=800', category: 'Pastry' },
  { id: 2, name: 'Black Forest Cake', description: 'Chocolate sponge cake with a rich cherry filling based on the German dessert.', price: 45.00, image_url: 'https://images.unsplash.com/photo-1571115177098-24fa10bba689?auto=format&fit=crop&q=80&w=800', category: 'Cake' },
  { id: 3, name: 'Sourdough Bread', description: 'Artisanal bread with a soft interior and crispy, hearty crust.', price: 6.50, image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bfc19?auto=format&fit=crop&q=80&w=800', category: 'Bread' }
];

const Home = () => {
  const [content, setContent] = useState({});
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch CMS Content
    axios.get('http://localhost:5000/api/content')
      .then(res => {
        if (Object.keys(res.data).length === 0) throw new Error("Empty");
        setContent(res.data);
      })
      .catch(err => {
        console.log("Using sample content due to API failure/empty");
        setContent(sampleContent);
      });

    // Fetch Products
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        if (res.data.length === 0) throw new Error("Empty");
        setProducts(res.data);
      })
      .catch(err => {
        console.log("Using sample products");
        setProducts(sampleProducts);
      });
  }, []);

  const heroTitle = content.hero_title || 'Welcome to German Bakery';
  const heroSubtitle = content.hero_subtitle || 'Authentic baked goods, pastries, and artisanal breads made with love.';
  const aboutText = content.about_us || 'Experience the authentic taste of German baking traditions right in your neighborhood.';

  return (
    <div>
      <Navbar />

      <section className="hero">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
            <a href="#menu" className="btn-primary">View Our Menu</a>
          </motion.div>

          <motion.div 
            className="hero-image-wrapper"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img src={defaultHeroImage} alt="Fresh Bread" className="hero-image" />
          </motion.div>
        </div>
      </section>

      <section id="about" style={{ padding: '6rem 0', background: '#FFFFFF' }}>
        <div className="container">
          <motion.div 
            style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title" style={{ marginBottom: '2rem' }}>Our Story</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{aboutText}</p>
          </motion.div>
        </div>
      </section>

      <section id="menu" className="products-section">
        <div className="container">
          <h2 className="section-title">Our Bakes</h2>
          
          <div className="products-grid">
            {products.map((product, index) => (
              <motion.div 
                key={product.id} 
                className="product-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <img src={product.image_url} alt={product.name} className="product-img" />
                </div>
                <div className="product-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 className="product-title">{product.name}</h3>
                    <span style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem', background: '#f5ece3', color: 'var(--primary)', borderRadius: '20px', fontWeight: '500' }}>
                      {product.category}
                    </span>
                  </div>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-meta">
                    <span className="product-price">${Number(product.price).toFixed(2)}</span>
                    <button className="btn-outline" style={{ padding: '0.5rem 1.2rem' }}>Order Now</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section id="contact" style={{ padding: '6rem 0', background: '#F3F0EB' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title" style={{ marginBottom: '2rem' }}>Visit Us</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.2rem', color: 'var(--text-main)', maxWidth: '600px', margin: '0 auto', background: 'white', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <p><strong>Address:</strong><br /> {content.contact_address || '123 Bakery Lane, Berlin'}</p>
              <p><strong>Phone:</strong><br /> {content.contact_phone || '+49 123 456 7890'}</p>
              <p><strong>Email:</strong><br /> {content.contact_email || 'hello@germanbakery.com'}</p>
            </div>
          </motion.div>
        </div>
      </section>
      
      <footer style={{ background: 'var(--secondary)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontFamily: 'Playfair Display', marginBottom: '1rem' }}>German Bakery</h2>
          <p style={{ color: '#a3a19e', marginBottom: '2rem' }}>Baking memories since 1990</p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', color: '#7E7B78' }}>
            &copy; {new Date().getFullYear()} German Bakery. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
