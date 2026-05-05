import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useProducts } from '../hooks/useQueries';

const Products = () => {
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode]               = useState('grid');
  const [visibleCount, setVisibleCount]       = useState(20);
  const navigate = useNavigate();

  const { data: products = [], isLoading: loading } = useProducts();

  // Reset visible count when filters change
  const handleSearch   = useCallback((e) => { setSearchTerm(e.target.value); setVisibleCount(20); }, []);
  const handleCategory = useCallback((cat) => { setSelectedCategory(cat); setVisibleCount(20); }, []);
  const handleLoadMore = useCallback(() => setVisibleCount((prev) => prev + 20), []);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const q = searchTerm.toLowerCase();
        return (
          (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
          (selectedCategory === 'All' || p.category === selectedCategory)
        );
      }),
    [products, searchTerm, selectedCategory]
  );

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  return (
    <div style={{ background: '#faf9f7', minHeight: '100vh' }}>
      <Navbar />

      <style>{`
        .categories-scroll::-webkit-scrollbar { display: none; }

        .hero-section {
          padding-top: 10rem; padding-bottom: 4rem;
          background: linear-gradient(180deg, #fdfbf8 0%, #faf9f7 100%);
          text-align: center; position: relative; overflow: hidden;
        }
        .hero-blob-1 { position:absolute; top:-100px; left:-100px; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(212,163,115,.15) 0%,rgba(250,249,247,0) 70%); z-index:0; }
        .hero-blob-2 { position:absolute; top:50px; right:-150px; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(212,163,115,.1) 0%,rgba(250,249,247,0) 70%); z-index:0; }
        .hero-badge { display:inline-block; padding:.5rem 1rem; background:white; color:var(--primary); border-radius:50px; font-weight:700; font-size:.85rem; letter-spacing:1px; text-transform:uppercase; margin-bottom:1.5rem; box-shadow:0 4px 15px rgba(0,0,0,.05); position:relative; z-index:1; }
        .hero-title { font-size:4rem; margin-bottom:1rem; color:var(--text-main); font-weight:800; line-height:1.1; position:relative; z-index:1; }
        .hero-desc  { color:var(--text-muted); font-size:1.2rem; max-width:600px; margin:0 auto; line-height:1.6; position:relative; z-index:1; }

        @media (max-width:768px) {
          .hero-section  { padding-top:7rem; padding-bottom:2rem; }
          .hero-title    { font-size:2.5rem; }
          .hero-desc     { font-size:1.05rem; padding:0 1rem; }
          .hero-badge    { font-size:.75rem; padding:.4rem .8rem; margin-bottom:1rem; }
          .list-view-card { flex-direction:row !important; align-items:stretch !important; }
          .list-view-image { width:120px !important; height:auto !important; min-height:140px; }
          .list-view-content { padding:1rem !important; }
          .list-view-title { font-size:1.1rem !important; }
          .list-view-desc  { display:none !important; }
          .list-view-price { font-size:1.1rem !important; }
          .list-view-btn   { padding:.4rem .8rem !important; font-size:.85rem !important; }
        }
      `}</style>

      {/* Page Header */}
      <section className="hero-section">
        <div className="hero-blob-1" />
        <div className="hero-blob-2" />
        <div className="container">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}>
            <div className="hero-badge">Freshly Baked Daily</div>
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.1 }} className="hero-title">
            Our Artisanal Collection
          </motion.h1>
          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.2 }} className="hero-desc">
            Explore our handcrafted breads, cakes, and pastries made with organic ingredients and traditional techniques.
          </motion.p>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <section style={{ position:'sticky', top:'72px', zIndex:10, background:'rgba(250,249,247,.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(0,0,0,.05)', padding:'1rem 0' }}>
        <div className="container">
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
              {/* Search */}
              <div style={{ position:'relative', flex:1 }}>
                <Search size={18} style={{ position:'absolute', left:'1.25rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ width:'100%', padding:'.75rem 1rem .75rem 3.5rem', borderRadius:'50px', border:'1.5px solid #eee', outline:'none', fontSize:'.95rem', transition:'all .3s', background:'white' }}
                  onFocus={(e)  => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e)   => e.target.style.borderColor = '#eee'}
                />
              </div>
              {/* View Toggle */}
              <div style={{ display:'flex', background:'white', padding:'.25rem', borderRadius:'50px', border:'1.5px solid #eee' }}>
                <button onClick={() => setViewMode('grid')} style={{ padding:'.5rem', borderRadius:'50px', background: viewMode==='grid' ? '#f5ece3' : 'transparent', color: viewMode==='grid' ? 'var(--primary)' : 'var(--text-muted)' }}>
                  <LayoutGrid size={18} />
                </button>
                <button onClick={() => setViewMode('list')} style={{ padding:'.5rem', borderRadius:'50px', background: viewMode==='list' ? '#f5ece3' : 'transparent', color: viewMode==='list' ? 'var(--primary)' : 'var(--text-muted)' }}>
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="categories-scroll" style={{ display:'flex', gap:'.5rem', overflowX:'auto', paddingBottom:'.25rem', WebkitOverflowScrolling:'touch', scrollbarWidth:'none', msOverflowStyle:'none' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  style={{ padding:'.5rem 1.25rem', borderRadius:'50px', fontSize:'.9rem', fontWeight:600, whiteSpace:'nowrap', background: selectedCategory===cat ? 'var(--primary)' : 'white', color: selectedCategory===cat ? 'white' : 'var(--text-main)', border:`1px solid ${selectedCategory===cat ? 'var(--primary)' : '#eee'}`, transition:'all .3s', boxShadow: selectedCategory===cat ? '0 4px 10px rgba(0,0,0,.1)' : 'none' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section style={{ padding:'2rem 0 8rem' }}>
        <div className="container">
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'2.5rem' }}>
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} style={{ height:'400px', background:'#eee', borderRadius:'24px', animation:'pulse 1.5s infinite linear' }} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'6rem 0' }}>
              <h2>No products found</h2>
              <p style={{ color:'var(--text-muted)' }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:-10 }}
                  transition={{ duration:.3 }}
                  style={{ display:'grid', gridTemplateColumns: viewMode==='grid' ? 'repeat(auto-fill,minmax(300px,1fr))' : '1fr', gap:'2.5rem' }}
                >
                  {displayedProducts.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity:0, scale:.95 }}
                      animate={{ opacity:1, scale:1 }}
                      transition={{ duration:.3, delay: idx * .03 }}
                      className={viewMode==='list' ? 'list-view-card' : ''}
                      style={{ background:'white', borderRadius:'24px', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,.03)', display: viewMode==='list' ? 'flex' : 'block', cursor:'pointer' }}
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      <div
                        className={viewMode==='list' ? 'list-view-image' : ''}
                        style={{ position:'relative', height: viewMode==='list' ? '250px' : '280px', width: viewMode==='list' ? '350px' : '100%', overflow:'hidden', flexShrink:0 }}
                      >
                        <motion.img
                          whileHover={{ scale:1.05 }}
                          transition={{ duration:.6 }}
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        />
                        <div style={{ position:'absolute', top:'1rem', left:'1rem', background:'rgba(255,255,255,.9)', backdropFilter:'blur(5px)', padding:'.4rem .8rem', borderRadius:'50px', fontSize:'.75rem', fontWeight:700, color:'var(--primary)' }}>
                          {p.category}
                        </div>
                      </div>

                      <div className={viewMode==='list' ? 'list-view-content' : ''} style={{ padding:'2rem', flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'.5rem' }}>
                          <h3 className={viewMode==='list' ? 'list-view-title' : ''} style={{ fontSize:'1.5rem', margin:0 }}>{p.name}</h3>
                          <div style={{ display:'flex', alignItems:'center', gap:'.25rem', color:'#fbbf24' }}>
                            <Star size={16} fill="#fbbf24" />
                            <span style={{ fontSize:'.9rem', fontWeight:700, color:'var(--text-main)' }}>4.9</span>
                          </div>
                        </div>
                        <p className={viewMode==='list' ? 'list-view-desc' : ''} style={{ color:'var(--text-muted)', fontSize:'.95rem', marginBottom:'1.5rem', flex:1 }}>
                          {p.description.length > 100 ? p.description.substring(0, 100) + '...' : p.description}
                        </p>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto' }}>
                          <div className={viewMode==='list' ? 'list-view-price' : ''} style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--primary)' }}>
                            Rs. {Number(p.price).toFixed(2)}
                          </div>
                          <button
                            className={viewMode==='list' ? 'list-view-btn' : ''}
                            style={{ background:'var(--primary)', color:'white', padding:'.6rem 1.25rem', borderRadius:'50px', fontWeight:600, display:'flex', alignItems:'center', gap:'.5rem' }}
                          >
                            Details <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {visibleCount < filteredProducts.length && (
                <div style={{ textAlign:'center', marginTop:'3rem' }}>
                  <button
                    onClick={handleLoadMore}
                    style={{ background:'white', color:'var(--primary)', border:'2px solid var(--primary)', padding:'.8rem 2.5rem', borderRadius:'50px', fontSize:'1rem', fontWeight:600, cursor:'pointer', transition:'all .3s', boxShadow:'0 4px 10px rgba(0,0,0,.05)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary)'; }}
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <footer style={{ background:'var(--secondary)', color:'white', padding:'4rem 0', textAlign:'center' }}>
        <div className="container">
          <h2 style={{ color:'white', fontFamily:'Playfair Display', marginBottom:'1rem' }}>Kathmandu Bakery</h2>
          <p style={{ color:'#a3a19e' }}>Baking memories since 1990</p>
        </div>
      </footer>
    </div>
  );
};

export default Products;
