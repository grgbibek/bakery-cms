import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Star, Clock, ShieldCheck, ChevronRight, Plus, Minus, Info, Maximize2, Search, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useProduct, useProducts, useSettings } from '../hooks/useQueries';

const formatImg = (img) =>
  img ? (img.startsWith('data:') || img.startsWith('http') ? img : `${import.meta.env.VITE_API_BASE_URL || ''}${img}`) : 'https://via.placeholder.com/800';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [pounds, setPounds] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isWeightDropdownOpen, setIsWeightDropdownOpen] = useState(false);
  const imageRef = useRef(null);
  const dropdownRef = useRef(null);

  // ── React Query data fetching ────────────────────────────────────────────────
  const { data: product, isLoading: productLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const { data: rawSettings } = useSettings();

  const settings = useMemo(() => ({
    cake_types: rawSettings?.cake_types || [],
    max_cake_pounds: rawSettings?.max_cake_pounds || 10,
  }), [rawSettings]);

  const relatedProducts = useMemo(
    () => allProducts.filter((p) => p.id !== parseInt(id)).slice(0, 4),
    [allProducts, id]
  );

  const loading = productLoading;

  // Set selected image once product loads
  useEffect(() => {
    if (product?.image) setSelectedImage(formatImg(product.image));
    window.scrollTo(0, 0);
  }, [product]);

  // Click outside handler for weight dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsWeightDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mobile resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddToCart = () => {
    const isCake = product.category?.toLowerCase().includes('cake');
    const extraPricePerLb = selectedAddons.reduce((sum, addonName) => {
      const type = settings.cake_types.find(t => t.name === addonName);
      return sum + (type ? parseFloat(type.extra) : 0);
    }, 0);

    const options = isCake ? {
      addons: selectedAddons,
      pounds: pounds,
      extraPrice: extraPricePerLb * pounds
    } : null;

    addToCart(product, quantity, options);
  };

  const handleAddonToggle = (addonName) => {
    setSelectedAddons(prev =>
      prev.includes(addonName)
        ? prev.filter(name => name !== addonName)
        : [...prev, addonName]
    );
  };

  const calculateTotalPrice = useMemo(() => {
    if (!product) return '0.00';
    const basePrice = parseFloat(product.price);
    const isCake = product.category?.toLowerCase().includes('cake');
    if (!isCake) return (basePrice * quantity).toFixed(2);
    const extraPricePerLb = selectedAddons.reduce((sum, addonName) => {
      const type = settings.cake_types.find((t) => t.name === addonName);
      return sum + (type ? parseFloat(type.extra) : 0);
    }, 0);
    return (((basePrice + extraPricePerLb) * pounds) * quantity).toFixed(2);
  }, [product, quantity, selectedAddons, pounds, settings.cake_types]);

  const handleMouseMove = (e) => {
    if (!imageRef.current || isMobile) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleTouchMove = (e) => {
    if (!imageRef.current) return;
    const touch = e.touches[0];
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((touch.clientX - left) / width) * 100;
    const y = ((touch.clientY - top) / height) * 100;

    // Boundary checks
    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));

    setMousePos({ x: boundedX, y: boundedY });
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%' }}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#faf9f7' }}>
        <h2>Product not found</h2>
        <Link to="/" style={{ color: 'var(--primary)', marginTop: '1rem' }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#faf9f7', minHeight: '100vh' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '5.5rem', paddingBottom: '4rem' }}>
        {/* Breadcrumbs */}
        <nav style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Products</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{product.name}</span>
        </nav>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '2rem' : '4rem',
          alignItems: 'start'
        }}>
          {/* Left: Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: isMobile ? 'relative' : 'sticky',
              top: isMobile ? '0' : '8rem',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row-reverse',
              gap: '1rem',
              alignItems: 'flex-start'
            }}
          >
            {/* Main Image */}
            <div
              ref={imageRef}
              onMouseEnter={() => !isMobile && setIsZoomed(true)}
              onMouseLeave={() => !isMobile && setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsZoomed(true)}
              onTouchEnd={() => setIsZoomed(false)}
              onTouchMove={handleTouchMove}
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 15px 40px rgba(0,0,0,0.06)',
                background: 'white',
                position: 'relative',
                cursor: 'zoom-in',
                height: isMobile ? 'auto' : '480px',
                width: '100%',
                aspectRatio: isMobile ? '1/1' : 'auto'
              }}
            >
              <img
                src={selectedImage}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: isZoomed ? 0 : 1,
                  transition: 'opacity 0.2s'
                }}
              />

              {isZoomed && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${selectedImage})`,
                  backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                  backgroundSize: '200%',
                  backgroundRepeat: 'no-repeat',
                  pointerEvents: 'none'
                }} />
              )}
            </div>

            {/* Thumbnails (Vertical on Desktop) */}
            {product.images && product.images.length > 1 && (
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                gap: '0.6rem',
                justifyContent: 'center',
                overflowX: isMobile ? 'auto' : 'visible',
                minWidth: isMobile ? 'auto' : '70px'
              }}>
                {product.images.map((img, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedImage(img.startsWith('data:') || img.startsWith('http') ? img : `${import.meta.env.VITE_API_BASE_URL || ''}${img}`)}
                    style={{
                      width: isMobile ? '56px' : '64px',
                      height: isMobile ? '56px' : '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: selectedImage === (img.startsWith('data:') || img.startsWith('http') ? img : `${import.meta.env.VITE_API_BASE_URL || ''}${img}`) ? '2px solid var(--primary)' : '1px solid #eee',
                      cursor: 'pointer',
                      background: 'white',
                      flexShrink: 0
                    }}
                  >
                    <img src={img.startsWith('data:') || img.startsWith('http') ? img : `${import.meta.env.VITE_API_BASE_URL || ''}${img}`} alt={`${product.name} ${index}`} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 style={{
              fontSize: isMobile ? '1.8rem' : '2.4rem',
              fontFamily: 'Playfair Display', marginBottom: '0.4rem',
              color: 'var(--text-main)', lineHeight: 1.2
            }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                Rs. {Number(product.price).toFixed(2)}
              </div>
              <div style={{ padding: '0.15rem 0.5rem', background: '#ecfdf5', color: '#10b981', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '5px', height: '5px', background: '#10b981', borderRadius: '50%' }} /> In Stock
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{product.description}</p>

            {/* Info Badges (Ingredients / Returns) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'start' }}>
                <div style={{ background: 'rgba(195,132,82,0.08)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '10px' }}><Info size={16} /></div>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.9rem' }}>Ingredients</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Premium flour, organic eggs, natural yeast.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'start' }}>
                <div style={{ background: 'rgba(195,132,82,0.08)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '10px' }}><ArrowLeft size={16} rotation={225} /></div>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.9rem' }}>Returns</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Freshness guaranteed or full refund.</p>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f0f0f0', marginBottom: '2rem' }}>
              {product.category?.toLowerCase().includes('cake') && (
                <>
                  {/* Weight Selector */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.8rem' }}>Weight (Pounds)</div>
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                      <div 
                        onClick={() => setIsWeightDropdownOpen(!isWeightDropdownOpen)}
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem',
                          borderRadius: '12px',
                          border: isWeightDropdownOpen ? '2px solid var(--primary)' : '1px solid #eee',
                          fontSize: '1rem',
                          fontWeight: 600,
                          background: isWeightDropdownOpen ? 'rgba(195,132,82,0.02)' : '#f8fafc',
                          cursor: 'pointer',
                          color: 'var(--text-main)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          boxShadow: isWeightDropdownOpen ? '0 4px 15px rgba(195,132,82,0.1)' : 'none'
                        }}
                      >
                        <span>{pounds} Pound{pounds > 1 ? 's' : ''}</span>
                        <ChevronRight 
                          size={18} 
                          style={{ 
                            transform: isWeightDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)', 
                            transition: 'transform 0.2s',
                            color: isWeightDropdownOpen ? 'var(--primary)' : 'var(--text-muted)'
                          }} 
                        />
                      </div>

                      <AnimatePresence>
                        {isWeightDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              width: '100%',
                              marginTop: '0.4rem',
                              background: 'white',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                              border: '1px solid #eee',
                              zIndex: 10,
                              maxHeight: '200px',
                              overflowY: 'auto',
                              padding: '0.4rem'
                            }}
                          >
                            {[...Array(parseInt(settings.max_cake_pounds || 10))].map((_, i) => (
                              <div
                                key={i + 1}
                                onClick={() => {
                                  setPounds(i + 1);
                                  setIsWeightDropdownOpen(false);
                                }}
                                style={{
                                  padding: '0.6rem 1rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: pounds === i + 1 ? 700 : 500,
                                  color: pounds === i + 1 ? 'var(--primary)' : 'var(--text-main)',
                                  background: pounds === i + 1 ? 'rgba(195,132,82,0.08)' : 'transparent',
                                  transition: 'background 0.1s'
                                }}
                                onMouseEnter={(e) => {
                                  if (pounds !== i + 1) e.currentTarget.style.background = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                  if (pounds !== i + 1) e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                {i + 1} Pound{i > 0 ? 's' : ''}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Dietary Preferences */}
                  {settings.cake_types.filter(t => t.name.toLowerCase() !== 'normal').length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.8rem' }}>Dietary Preferences (Optional)</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                        {settings.cake_types.filter(t => t.name.toLowerCase() !== 'normal').map(type => {
                          const isSelected = selectedAddons.includes(type.name);
                          return (
                            <div 
                              key={type.name}
                              onClick={() => handleAddonToggle(type.name)}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1rem 1.2rem', borderRadius: '12px',
                                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                                background: isSelected ? 'rgba(195,132,82,0.04)' : '#f8fafc',
                                cursor: 'pointer', transition: 'all 0.2s',
                                position: 'relative', overflow: 'hidden'
                              }}
                            >
                              {/* Decorative left border for selected state */}
                              {isSelected && (
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--primary)' }} />
                              )}
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ 
                                  width: '22px', height: '22px', borderRadius: '6px', 
                                  border: isSelected ? 'none' : '2px solid #ddd',
                                  background: isSelected ? 'var(--primary)' : 'white',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.2s',
                                  boxShadow: isSelected ? '0 2px 8px rgba(195,132,82,0.4)' : 'none'
                                }}>
                                  {isSelected && <Check size={14} color="white" strokeWidth={3} />}
                                </div>
                                <span style={{ fontWeight: isSelected ? 700 : 600, fontSize: '0.95rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                                  {type.name}
                                </span>
                              </div>
                              {type.extra > 0 && (
                                <span style={{ fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isSelected ? 700 : 500 }}>
                                  +Rs. {type.extra}/lb
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Quantity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '50px' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ border: 'none', background: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: '1rem', fontWeight: 700, minWidth: '25px', textAlign: 'center' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ border: 'none', background: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                style={{
                  width: '100%', background: 'var(--primary)', color: 'white', border: 'none',
                  padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 4px 15px rgba(195,132,82,0.3)'
                }}
              >
                <ShoppingCart size={18} /> Add to Cart — Rs. {calculateTotalPrice}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        <section style={{ marginTop: '6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2rem' }}>Recommended for You</h2>
            <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              Browse Gallery <ChevronRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
            {relatedProducts.map(p => (
              <motion.div
                key={p.id}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/product/${p.id}`)}
                style={{
                  cursor: 'pointer', background: 'white', padding: '1rem', borderRadius: '20px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <img src={p.image} alt={p.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem' }}>{p.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1rem', margin: 0 }}>Rs. {Number(p.price).toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ background: 'var(--secondary)', color: 'white', padding: '4rem 0', textAlign: 'center', marginTop: '6rem' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontFamily: 'Playfair Display', fontSize: '2rem', marginBottom: '1rem' }}>German Bakery</h2>
          <p style={{ color: '#a3a19e', fontSize: '1rem', marginBottom: '2rem' }}>Artisanal Breads & Pastries Baked with Love</p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', color: '#7E7B78', fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} German Bakery. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;
