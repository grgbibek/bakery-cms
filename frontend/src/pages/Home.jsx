import React, { useState, useEffect } from 'react';
import { contentService, productService, orderService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ShoppingCart, Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
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
  
  // Cart & Checkout State
  const [cart, setCart] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [orderStatus, setOrderStatus] = useState({ loading: false, success: false, error: '' });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsSidebarOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setOrderStatus({ loading: true, success: false, error: '' });
    try {
      const payload = {
        customer: orderForm,
        cartItems: cart.map(c => ({ id: c.id, quantity: c.quantity }))
      };
      await orderService.createOrder(payload);
      setOrderStatus({ loading: false, success: true, error: '' });
      setCart([]);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setIsSidebarOpen(false);
        setOrderStatus(prev => ({ ...prev, success: false }));
        setOrderForm({ name: '', email: '', phone: '', address: '' });
      }, 3000);
    } catch (err) {
      setOrderStatus({ loading: false, success: false, error: 'Failed to submit order. Please try again.' });
    }
  };

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
  }, []);

  const heroTitle = content.hero_title || 'Welcome to Kathmandu Bakery';
  const heroSubtitle = content.hero_subtitle || 'Authentic baked goods, pastries, and artisanal breads made with love.';
  const aboutText = content.about_us || 'Experience the authentic taste of freshly baked traditions right here in Nepal.';

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
            {(Array.isArray(products) ? products : []).map((product, index) => (
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
                    <span className="product-price">Rs. {Number(product.price).toFixed(2)}</span>
                    <button className="btn-outline" style={{ padding: '0.5rem 1.2rem' }} onClick={() => addToCart(product)}>Add to Cart</button>
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
              <p><strong>Address:</strong><br /> {content.contact_address || 'Thamel, Kathmandu'}</p>
              <p><strong>Phone:</strong><br /> {content.contact_phone || '+977 9841234567'}</p>
              <p><strong>Email:</strong><br /> {content.contact_email || 'hello@kathmandubakery.com'}</p>
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
      
      {/* Floating Cart Button */}
      <motion.button
        className="floating-cart-btn"
        onClick={() => setIsSidebarOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--primary)', color: 'white',
          border: 'none', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', cursor: 'pointer', zIndex: 99
        }}
      >
        <ShoppingCart size={24} />
        {cart.length > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: '#be185d', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translate(20%, -20%)' }}>
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </motion.button>

      {/* Cart Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'black', zIndex: 1000 }}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}
              style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '400px', height: '100%', background: 'white', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart /> Your Cart</h2>
                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                    <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cart.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #f5ece3', paddingBottom: '1rem' }}>
                        <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.25rem' }}>{item.name}</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>Rs. {Number(item.price).toFixed(2)}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5ece3', borderRadius: '4px', padding: '0.25rem' }}>
                              <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}><Minus size={14} /></button>
                              <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}><Plus size={14} /></button>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'flex-start' }}><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ padding: '1.5rem', background: '#fcfbfa', borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <span>Total</span>
                  <span>Rs. {cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} 
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal Overlay */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              {orderStatus.success ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                  </motion.div>
                  <h2 style={{ fontFamily: 'Playfair Display', color: 'var(--secondary)' }}>Order Confirmed!</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Thank you for ordering. We'll be in touch shortly!</p>
                </div>
              ) : (
                <>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                    <h2 style={{ margin: 0 }}>Secure Checkout</h2>
                    <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                  </div>
                  <form onSubmit={handleCheckoutSubmit} style={{ padding: '1.5rem' }}>
                    {orderStatus.error && (
                      <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        {orderStatus.error}
                      </div>
                    )}
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" className="form-control" required value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} placeholder="Ram Sharma" />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" className="form-control" required value={orderForm.email} onChange={e => setOrderForm({...orderForm, email: e.target.value})} placeholder="ram@example.com" />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" className="form-control" required value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} placeholder="+977 9841234567" />
                    </div>
                    <div className="form-group">
                      <label>Delivery Address</label>
                      <textarea className="form-control" rows="3" required value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})} placeholder="Thamel, Kathmandu, Nepal..."></textarea>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                      <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={orderStatus.loading}>
                        {orderStatus.loading ? 'Processing...' : `Pay Rs. ${cartTotal.toFixed(2)}`}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;
