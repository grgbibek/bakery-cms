import React, { useState, useEffect } from 'react';
import { contentService, productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ShoppingCart, Trash2, Plus, Minus, CheckCircle, Copy, Check, MapPin, Search, Star, Clock, Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';

// Default images for visual appeal if db has none
const defaultHeroImage = 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=1600';

const sampleContent = {
  hero_title: 'Welcome to Kathmandu Bakery',
  hero_subtitle: 'Authentic baked goods, pastries, and artisanal breads made with love.',
  about_us: 'Our bakery brings the finest local and international recipes straight to your table. Every loaf is baked fresh daily by our master bakers in Nepal.',
  contact_address: 'Thamel, Kathmandu, Nepal',
  contact_phone: '+977 9841234567',
  contact_email: 'hello@kathmandubakery.com'
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { addToCart } = useCart();
  const navigate = useNavigate();


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
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length === 0) throw new Error('Empty');
        setProducts(data);
      })
      .catch(err => {
        console.log('Using sample products');
        setProducts(sampleProducts);
      });

    // Handle hash scrolling if navigating from another page
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Wait for content to load and layout to settle
    }
  }, []);

  const heroTitle = content.hero_title || 'Welcome to Kathmandu Bakery';
  const heroSubtitle = content.hero_subtitle || 'Authentic baked goods, pastries, and artisanal breads made with love.';
  const aboutText = content.about_us || 'Experience the authentic taste of freshly baked traditions right here in Nepal.';

  const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set((Array.isArray(products) ? products : []).map(p => p.category))];

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

      <section className="hero" style={{ background: 'linear-gradient(135deg, #FDFBF8 0%, #f7f2ea 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '80%', background: 'var(--primary)', opacity: 0.05, filter: 'blur(100px)', borderRadius: '50%' }}></div>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '4rem', zIndex: 1, position: 'relative' }}>
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(195, 132, 82, 0.1)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: '1 rem' }}>
              <Star size={16} fill="var(--primary)" /> Premium Quality
            </div> */}
            <h1 style={{ fontSize: '5rem', lineHeight: 1.1, marginBottom: '1.5rem', color: '#1a1a1a' }}>{heroTitle}</h1>
            <p style={{ fontSize: '1.3rem', color: '#555', marginBottom: '2.5rem', maxWidth: '540px', lineHeight: 1.6 }}>{heroSubtitle}</p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={() => navigate('/products')} className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>Order Now</button>
              <a href="#about" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid transparent', transition: 'all 0.2s' }}>Our Story</a>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '4rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2rem' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.5rem', margin: 0, color: 'var(--primary)' }}>Fresh</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Every Morning</p>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.5rem', margin: 0, color: 'var(--primary)' }}>100%</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Organic Ingredients</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-image-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ position: 'relative' }}
          >
            <div style={{ position: 'absolute', top: '2rem', left: '-2rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 2 }}>
              <div style={{ width: '40px', height: '40px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}><Clock size={20} /></div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Freshly Baked</p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Just now</p>
              </div>
            </div>
            <img src={defaultHeroImage} alt="Fresh Bread" className="hero-image" style={{ borderRadius: '30px 100px 30px 30px', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', height: '650px', objectFit: 'cover' }} />
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

      {/* Featured Products Section */}
      <section id="products" className="products-section" style={{ background: '#faf9f7', position: 'relative', padding: '6rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Our Artisanal Collection</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Explore our handcrafted favorites, baked fresh every morning with organic ingredients.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: selectedCategory === cat ? 'var(--primary)' : 'white',
                  color: selectedCategory === cat ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: selectedCategory === cat ? '0 10px 15px rgba(195, 132, 82, 0.2)' : '0 2px 10px rgba(0,0,0,0.05)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <motion.div layout className="products-grid">
            <AnimatePresence>
              {filteredProducts.slice(0, 6).map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  className="product-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  style={{ cursor: 'pointer', background: 'white' }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div style={{ overflow: 'hidden', height: '280px', position: 'relative' }}>
                    <img src={product.image} alt={product.name} className="product-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="product-category-badge" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {product.category}
                    </div>
                  </div>
                  <div className="product-info" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{product.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                        <Star size={16} fill="#fbbf24" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>4.9</span>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{product.description.length > 80 ? product.description.substring(0, 80) + '...' : product.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f5f5f5' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>Rs. {Number(product.price).toFixed(2)}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <button onClick={() => navigate('/products')} className="btn-outline" style={{ padding: '1rem 3rem' }}>View Full Collection</button>
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section id="services" style={{ padding: '8rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Beyond the Counter</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>From custom wedding cakes to corporate events, we bring the bakery to your special occasions.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
            {[
              { 
                title: 'Custom Celebration Cakes', 
                desc: 'Bespoke designs for weddings, birthdays, and anniversaries tailored to your vision.', 
                icon: <Gift size={32} />, 
                img: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=800'
              },
              { 
                title: 'Corporate Catering', 
                desc: 'Consistently high-quality bulk orders of pastries and breads for your business meetings.', 
                icon: <Package size={32} />, 
                img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800'
              },
              { 
                title: 'Event Lunchboxes', 
                desc: 'Individually packed gourmet sandwiches and treats for a seamless dining experience.', 
                icon: <Clock size={32} />, 
                img: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800'
              }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ background: '#faf9f7', borderRadius: '30px', overflow: 'hidden', transition: 'all 0.3s' }}
                whileHover={{ y: -10 }}
              >
                <div style={{ height: '220px' }}>
                  <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '2.5rem' }}>
                  <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>{s.icon}</div>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>{s.desc}</p>
                  <button onClick={() => navigate('/services')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    Learn More <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section id="contact" style={{ padding: '6rem 0', background: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title" style={{ marginBottom: '2rem' }}>Visit Us</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.2rem', color: 'var(--text-main)', maxWidth: '600px', margin: '0 auto', background: '#faf9f7', padding: '3.5rem', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
              <p><strong>Address:</strong><br /> <span style={{ color: 'var(--text-muted)' }}>{content.contact_address || 'Thamel, Kathmandu'}</span></p>
              <div style={{ width: '40px', height: '1px', background: 'var(--border-color)', margin: '0.5rem auto' }}></div>
              <p><strong>Phone:</strong><br /> <span style={{ color: 'var(--text-muted)' }}>{content.contact_phone || '+977 9841234567'}</span></p>
              <div style={{ width: '40px', height: '1px', background: 'var(--border-color)', margin: '0.5rem auto' }}></div>
              <p><strong>Email:</strong><br /> <span style={{ color: 'var(--text-muted)' }}>{content.contact_email || 'hello@kathmandubakery.com'}</span></p>
            </div>
          </motion.div>
        </div>
      </section>

      <footer style={{ background: 'var(--secondary)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontFamily: 'Playfair Display', marginBottom: '1rem' }}>Kathmandu Bakery</h2>
          <p style={{ color: '#a3a19e', marginBottom: '2rem' }}>Baking memories since 1990</p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', color: '#7E7B78' }}>
            &copy; {new Date().getFullYear()} Kathmandu Bakery. All rights reserved.
          </div>
        </div>
      </footer>


    </div>
  );
};

export default Home;
