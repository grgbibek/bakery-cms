import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
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
          <NavLink to="/services" end onClick={closeMenu}>Catering &amp; Services</NavLink>
          <a href="/#about" onClick={closeMenu}>About</a>
          <a href="/#menu" onClick={closeMenu}>Menu</a>
          <a href="/#contact" onClick={closeMenu}>Contact</a>
        </motion.nav>

        {/* Hamburger button */}
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
            <NavLink to="/services" end onClick={closeMenu}>Catering &amp; Services</NavLink>
            <a href="/#about" onClick={closeMenu}>About</a>
            <a href="/#menu" onClick={closeMenu}>Menu</a>
            <a href="/#contact" onClick={closeMenu}>Contact</a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
