import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Package, ArrowLeft } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2 style={{ fontFamily: 'Playfair Display' }}>Bakery<br />CMS Panel</h2>
        
        <nav className="sidebar-nav">
          <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}>
            <Package size={20} />
            Products
          </Link>
          <Link to="/admin/content" className={`sidebar-link ${location.pathname === '/admin/content' ? 'active' : ''}`}>
            <FileText size={20} />
            Text Content
          </Link>
        </nav>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => { localStorage.removeItem('adminToken'); window.location.href='/admin/login'; }} className="sidebar-link" style={{ textAlign: 'left', background: 'transparent', width: '100%' }}>
            <ArrowLeft size={20} />
            Logout
          </button>
          <Link to="/" className="sidebar-link">
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
