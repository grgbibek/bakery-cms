import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Package, ArrowLeft, Menu, X, Tags, LayoutDashboard } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile top bar */}
      <div className="admin-topbar">
        <button
          className="admin-menu-btn"
          onClick={() => setSidebarOpen(prev => !prev)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="admin-topbar-title">Bakery CMS</span>
      </div>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <h2 style={{ fontFamily: 'Playfair Display' }}>Bakery<br />CMS Panel</h2>

        <nav className="sidebar-nav">
          <Link
            to="/admin"
            className={`sidebar-link ${location.pathname === '/admin' || location.pathname === '/admin/' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <LayoutDashboard size={20} />
            Overview
          </Link>
          <Link
            to="/admin/products"
            className={`sidebar-link ${location.pathname === '/admin/products' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Package size={20} />
            Products
          </Link>
          <Link
            to="/admin/categories"
            className={`sidebar-link ${location.pathname === '/admin/categories' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Tags size={20} />
            Categories
          </Link>
          <Link
            to="/admin/content"
            className={`sidebar-link ${location.pathname === '/admin/content' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <FileText size={20} />
            Text Content
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => { localStorage.removeItem('adminToken'); window.location.href = '/admin/login'; }}
            className="sidebar-link"
            style={{ textAlign: 'left', background: 'transparent', width: '100%' }}
          >
            <ArrowLeft size={20} />
            Logout
          </button>
          <Link to="/" className="sidebar-link" onClick={closeSidebar}>
            <ArrowLeft size={20} />
            Back to Site
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
