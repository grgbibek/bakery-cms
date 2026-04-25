import React, { useState, useEffect, useRef } from 'react';
import { orderService } from '../services/api';
import { ShoppingCart, TrendingUp, DollarSign, Package, Clock, CheckCircle, Bell, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, orderId: null });
  const [rejectReason, setRejectReason] = useState('');
  const latestOrderIdRef = useRef(null);

  const fetchDashboardData = async (isPolling = false) => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        orderService.getOrders(),
        orderService.getOrderStats()
      ]);
      const newOrders = ordersRes.data || [];
      
      if (isPolling && newOrders.length > 0) {
        const currentLatestId = newOrders[0].id;
        if (latestOrderIdRef.current && currentLatestId > latestOrderIdRef.current) {
          showNotification(`New order #${currentLatestId} received!`);
        }
        latestOrderIdRef.current = currentLatestId;
      } else if (!isPolling && newOrders.length > 0) {
        latestOrderIdRef.current = newOrders[0].id;
      }

      setOrders(newOrders);
      setStats(statsRes.data || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmOrder = async (id) => {
    try {
      await orderService.updateOrderStatus(id, 'confirmed');
      showNotification(`Order #${id} confirmed.`);
      fetchDashboardData(true);
    } catch (error) {
      alert('Failed to confirm order');
    }
  };

  const processConfirmOrder = () => {
    if (confirmModal.orderId) handleConfirmOrder(confirmModal.orderId);
    setConfirmModal({ isOpen: false, orderId: null });
  };

  const processRejectOrder = async () => {
    if (!rejectModal.orderId) return;
    try {
      await orderService.updateOrderStatus(rejectModal.orderId, 'cancelled', rejectReason);
      showNotification(`Order #${rejectModal.orderId} rejected.`);
      fetchDashboardData(true);
    } catch (error) {
      alert('Failed to reject order');
    } finally {
      setRejectModal({ isOpen: false, orderId: null });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard configuration...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-container">
      
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: 'var(--primary)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 500
            }}
          >
            <Bell size={20} />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time statistics & customer order management</p>
        </div>
      </div>

      {/* Statistics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', marginBottom: 0 }}>
          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '12px', color: '#d97706' }}>
            <ShoppingCart size={32} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Volume</p>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '2rem', color: 'var(--secondary)' }}>{stats.totalOrders}</h2>
          </div>
        </div>
        
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', marginBottom: 0 }}>
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '12px', color: '#16a34a' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Revenue</p>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '2rem', color: 'var(--secondary)' }}>Rs. {stats.totalRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', marginBottom: 0 }}>
          <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '12px', color: '#4f46e5' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Average Order</p>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '2rem', color: 'var(--secondary)' }}>Rs. {stats.averageOrderValue.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} /> Recent Orders
        </h3>
        
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
            <p>No orders have been placed yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Contact</th>
                  <th>Delivery Address</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date Placed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {orders.map((order, index) => (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: '#fcfbfa' }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#{order.id.toString().padStart(5, '0')}</td>
                      <td style={{ fontWeight: 500 }}>{order.customer_name}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                          <span>{order.customer_phone}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{order.customer_email}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: '250px' }}>
                        <span style={{ fontSize: '0.9rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.customer_address}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>Rs. {Number(order.total_amount).toFixed(2)}</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: order.status === 'confirmed' ? '#dcfce7' : order.status === 'cancelled' ? '#fef2f2' : '#fef3c7',
                          color: order.status === 'confirmed' ? '#16a34a' : order.status === 'cancelled' ? '#ef4444' : '#d97706',
                          textTransform: 'capitalize'
                        }}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {(!order.status || order.status === 'pending') && (
                            <button
                              onClick={() => setConfirmModal({ isOpen: true, orderId: order.id })}
                              style={{
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}
                              title="Confirm Order"
                            >
                              <CheckCircle size={16} /> Confirm
                            </button>
                          )}
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={() => { setRejectReason(''); setRejectModal({ isOpen: true, orderId: order.id }); }}
                              style={{
                                background: 'transparent',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}
                              title="Reject Order"
                            >
                              <XCircle size={16} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Playfair Display', fontSize: '1.4rem' }}>
                <CheckCircle size={24} color="#16a34a" /> Confirm Order
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Are you sure you want to confirm Order <strong>#{confirmModal.orderId}</strong>? The customer will be immediately notified via email.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setConfirmModal({ isOpen: false, orderId: null })} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={processConfirmOrder} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Yes, Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal.isOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Playfair Display', fontSize: '1.4rem' }}>
                <XCircle size={24} color="#ef4444" /> Reject Order
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5', fontSize: '0.9rem' }}>
                You are about to reject Order <strong>#{rejectModal.orderId}</strong>. Please provide a reason to include in the customer's email.
              </p>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Sorry, we are out of stock for this item..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '100px', marginBottom: '1.5rem', fontFamily: 'inherit', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setRejectModal({ isOpen: false, orderId: null })} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={processRejectOrder} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Reject Order</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default AdminOrders;
