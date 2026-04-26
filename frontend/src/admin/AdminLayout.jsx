import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Package, ArrowLeft, Menu, X, Tags, LayoutDashboard, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { orderService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastViewedOrderId, setLastViewedOrderId] = useState(
    parseInt(localStorage.getItem('lastViewedOrderId') || '0', 10)
  );
  const dropdownRef = useRef(null);

  const closeSidebar = () => setSidebarOpen(false);

  const fetchPendingOrders = async () => {
    try {
      const res = await orderService.getOrders();
      setPendingOrders((res.data || []).filter(order => !order.status || order.status === 'pending'));
    } catch (err) {
      console.error('Failed to fetch pending orders for notifications:', err);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <div>
            <h2 className="sidebar-title-expanded" style={{ fontFamily: 'Playfair Display', margin: 0 }}>Bakery<br />CMS Panel</h2>
            <h2 className="sidebar-title-collapsed" style={{ fontFamily: 'Playfair Display', margin: 0, fontSize: '2rem', textAlign: 'center' }}>B</h2>
          </div>
          <button 
            className="desktop-only"
            onClick={() => setIsCollapsed(!isCollapsed)} 
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', marginTop: '0.2rem' }}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/admin"
            className={`sidebar-link ${location.pathname === '/admin' || location.pathname === '/admin/' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <LayoutDashboard size={20} style={{ flexShrink: 0 }} />
            <span className="link-text">Overview</span>
          </Link>
          <Link
            to="/admin/products"
            className={`sidebar-link ${location.pathname === '/admin/products' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Package size={20} style={{ flexShrink: 0 }} />
            <span className="link-text">Products</span>
          </Link>
          <Link
            to="/admin/categories"
            className={`sidebar-link ${location.pathname === '/admin/categories' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Tags size={20} style={{ flexShrink: 0 }} />
            <span className="link-text">Categories</span>
          </Link>
          <Link
            to="/admin/content"
            className={`sidebar-link ${location.pathname === '/admin/content' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <FileText size={20} style={{ flexShrink: 0 }} />
            <span className="link-text">Text Content</span>
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => { localStorage.removeItem('adminToken'); window.location.href = '/admin/login'; }}
            className="sidebar-link"
            style={{ textAlign: 'left', background: 'transparent', width: '100%', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} style={{ flexShrink: 0 }} />
            <span className="link-text">Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main" style={{ position: 'relative' }}>
        {/* Desktop & Mobile Notification Header */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'sticky', top: '1.5rem', zIndex: 100, width: '100%', height: 0, pointerEvents: 'none', gap: '1rem', paddingRight: '2rem' }}>

          <div ref={dropdownRef} style={{ position: 'relative', pointerEvents: 'auto', height: '42px' }}>
            <button
              onClick={() => {
                const nextState = !showNotifications;
                setShowNotifications(nextState);
                if (nextState) {
                  const maxId = pendingOrders.length > 0 ? Math.max(...pendingOrders.map(o => o.id)) : lastViewedOrderId;
                  localStorage.setItem('lastViewedOrderId', maxId.toString());
                  setLastViewedOrderId(maxId);
                }
              }}
              style={{
                background: 'white',
                border: '1px solid var(--border-color)',
                padding: '0.6rem',
                borderRadius: '50%',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <Bell size={20} color="var(--secondary)" />
              {pendingOrders.filter(o => o.id > lastViewedOrderId).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {pendingOrders.filter(o => o.id > lastViewedOrderId).length}
                </span>
              )}
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '320px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', background: '#fcfbfa' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'Playfair Display' }}>Notifications</h3>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {pendingOrders.length === 0 ? (
                      <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>No new notifications.</p>
                      </div>
                    ) : (
                      pendingOrders.map(order => (
                        <Link
                          to="/admin"
                          key={order.id}
                          onClick={() => setShowNotifications(false)}
                          style={{
                            display: 'block',
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-color)',
                            textDecoration: 'none',
                            color: 'var(--text-color)',
                            transition: 'background 0.2s',
                            background: order.id > lastViewedOrderId ? '#fffbeb' : 'transparent'
                          }}
                          className="notification-item"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '0.9rem' }}>
                              New Order #{order.id}
                              {order.id > lastViewedOrderId && (
                                <span style={{ marginLeft: '0.5rem', width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }}></span>
                              )}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Pending</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {order.customer_name} placed an order for Rs. {Number(order.total_amount).toFixed(2)}
                          </p>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
