import React, { useState, useEffect } from 'react';
import { contentService, productService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';

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
  { id: 1, name: 'Pretzel', description: 'A traditional German baked pastry made from dough that is shaped into a knot.', price: 3.50, image: 'https://images.unsplash.com/photo-1598440026214-7e793a38ce1f?auto=format&fit=crop&q=80&w=800', category: 'Pastry' },
  { id: 2, name: 'Black Forest Cake', description: 'Chocolate sponge cake with a rich cherry filling based on the German dessert.', price: 45.00, image: 'https://images.unsplash.com/photo-1571115177098-24fa10bba689?auto=format&fit=crop&q=80&w=800', category: 'Cake' },
  { id: 3, name: 'Sourdough Bread', description: 'Artisanal bread with a soft interior and crispy, hearty crust.', price: 6.50, image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bfc19?auto=format&fit=crop&q=80&w=800', category: 'Bread' }
];

const Home = () => {
  const [content, setContent] = useState({});
  const [products, setProducts] = useState([]);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    // Fetch CMS Content
    contentService.getContent()
      .then(res => {
        if (res.data.length === 0) throw new Error("Empty");
        const contentObj = res.data.reduce((acc, item) => {
          acc[item.key_name] = item.value;
          return acc;
        }, {});
        setContent(contentObj);
        if (contentObj.announcement_enabled === 'true') {
          setTimeout(() => setShowAnnouncement(true), 500);
        }
      })
      .catch(err => {
        console.log("Using sample content due to API failure/empty");
        setContent(sampleContent);
      });

    // Fetch Products
    productService.getProducts()
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
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              style={{ background: 'white', padding: '3rem', borderRadius: '24px', maxWidth: '500px', width: '100%', position: 'relative', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <button 
                onClick={() => setShowAnnouncement(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f3f0eb', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <X size={20} color="var(--text-main)" />
              </button>
              
              <div style={{ background: '#fdf2f8', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#db2777' }}>
                <Gift size={40} />
              </div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem', color: '#831843' }}>
                {content.announcement_title || "Special Offer!"}
              </h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                {content.announcement_text || "Don't miss out on our freshly baked goods today."}
              </p>
              <button 
                onClick={() => setShowAnnouncement(false)}
                style={{ background: '#be185d', color: 'white', padding: '1rem 3rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(190, 24, 93, 0.3)' }}
              >
                Got it, let's go!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Chatbot phone={content.contact_phone} />
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
                  <img src={product.image} alt={product.name} className="product-img" />
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
