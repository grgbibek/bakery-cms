import React, { useState, useEffect } from 'react';
import { productService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShoppingCart, ArrowRight, Star, Heart, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

  useEffect(() => {
    productService.getProducts()
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    
    window.scrollTo(0, 0);
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ background: '#faf9f7', minHeight: '100vh' }}>
      <Navbar />
      
      {/* Page Header */}
      <section style={{ 
        paddingTop: '10rem', 
        paddingBottom: '4rem', 
        background: 'linear-gradient(to bottom, #fdfbf8, #faf9f7)',
        textAlign: 'center' 
      }}>
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
          >
            Our Artisanal Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}
          >
            Explore our handcrafted breads, cakes, and pastries made with organic ingredients and traditional techniques.
          </motion.p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section style={{ paddingBottom: '4rem', position: 'sticky', top: '72px', zIndex: 10, background: 'rgba(250, 249, 247, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '2rem',
            padding: '1.5rem 0',
            flexWrap: 'wrap'
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem 0.75rem 3.5rem', 
                  borderRadius: '50px', 
                  border: '1.5px solid #eee',
                  outline: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
              />
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '50px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    background: selectedCategory === cat ? 'var(--primary)' : 'white',
                    color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'white', padding: '0.25rem', borderRadius: '12px', border: '1.5px solid #eee' }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{ padding: '0.5rem', borderRadius: '8px', background: viewMode === 'grid' ? '#f5ece3' : 'transparent', color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{ padding: '0.5rem', borderRadius: '8px', background: viewMode === 'list' ? '#f5ece3' : 'transparent', color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section style={{ padding: '4rem 0 8rem' }}>
        <div className="container">
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ height: '400px', background: '#eee', borderRadius: '24px', animation: 'pulse 1.5s infinite linear' }} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 0' }}>
              <h2>No products found</h2>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <motion.div 
              layout
              style={{ 
                display: 'grid', 
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr', 
                gap: '2.5rem' 
              }}
            >
              <AnimatePresence>
                {filteredProducts.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    style={{ 
                      background: 'white', 
                      borderRadius: '24px', 
                      overflow: 'hidden', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                      display: viewMode === 'list' ? 'flex' : 'block',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <div style={{ 
                      position: 'relative', 
                      height: viewMode === 'list' ? '250px' : '280px', 
                      width: viewMode === 'list' ? '350px' : '100%',
                      overflow: 'hidden' 
                    }}>
                      <motion.img 
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                        src={p.image} 
                        alt={p.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{ 
                        position: 'absolute', 
                        top: '1rem', 
                        left: '1rem', 
                        background: 'rgba(255,255,255,0.9)', 
                        backdropFilter: 'blur(5px)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--primary)'
                      }}>
                        {p.category}
                      </div>
                    </div>

                    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{p.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                          <Star size={16} fill="#fbbf24" />
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>4.9</span>
                        </div>
                      </div>
                      
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>
                        {p.description.length > 100 ? p.description.substring(0, 100) + '...' : p.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                          Rs. {Number(p.price).toFixed(2)}
                        </div>
                        <button 
                          style={{ 
                            background: 'var(--primary)', 
                            color: 'white', 
                            padding: '0.6rem 1.25rem', 
                            borderRadius: '50px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          Details <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <footer style={{ background: 'var(--secondary)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontFamily: 'Playfair Display', marginBottom: '1rem' }}>Kathmandu Bakery</h2>
          <p style={{ color: '#a3a19e' }}>Baking memories since 1990</p>
        </div>
      </footer>
    </div>
  );
};

export default Products;
