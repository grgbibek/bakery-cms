import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MapPin, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cartCount, setIsSidebarOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route-style anchor clicks
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="logo" onClick={closeMenu}>German Bakery</Link>
        </motion.div>

        {/* Desktop nav */}
        <motion.nav
          className="nav-links"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/products" end onClick={closeMenu}>Products</NavLink>
          <NavLink to="/services" end onClick={closeMenu}>Catering &amp; Services</NavLink>

          <Link 
            to="/#services" 
            onClick={(e) => {
              closeMenu();
              if (window.location.pathname === '/') {
                e.preventDefault();
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Services
          </Link>

          <Link 
            to="/#about" 
            onClick={(e) => {
              closeMenu();
              if (window.location.pathname === '/') {
                e.preventDefault();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            About
          </Link>

          <Link 
            to="/#contact" 
            onClick={(e) => {
              closeMenu();
              if (window.location.pathname === '/') {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Contact
          </Link>

          <NavLink
            to="/track-order"
            onClick={closeMenu}
            style={({ isActive }) => ({
              color: isActive ? 'var(--primary)' : 'var(--primary)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 1rem',
              background: 'rgba(195,132,82,0.1)',
              borderRadius: '50px',
              transition: 'background 0.2s',
            })}
          >
            <MapPin size={15} /> Track Order
          </NavLink>

          <button
            onClick={() => { setIsSidebarOpen(true); closeMenu(); }}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-main)'}
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#be185d',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white'
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </motion.nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="nav-cart-mobile"
            onClick={() => setIsSidebarOpen(true)}
            style={{
              display: 'none', // Shown only on mobile via media query or inline check
              position: 'relative',
              background: 'transparent',
              border: 'none',
              padding: '0.5rem',
              color: 'var(--text-main)'
            }}
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: '#be185d', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="nav-toggle"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="nav-mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
            <NavLink to="/products" end onClick={closeMenu}>Products</NavLink>
            <NavLink to="/services" end onClick={closeMenu}>Catering &amp; Services</NavLink>

            <Link 
              to="/#services" 
              onClick={(e) => {
                closeMenu();
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Services
            </Link>

            <Link 
              to="/#about" 
              onClick={(e) => {
                closeMenu();
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              About
            </Link>

            <Link 
              to="/#contact" 
              onClick={(e) => {
                closeMenu();
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Contact
            </Link>
            <NavLink to="/track-order" onClick={closeMenu} style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={15} /> Track Order
            </NavLink>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
