import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { ShoppingCart, TrendingUp, DollarSign, Package, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        orderService.getOrders(),
        orderService.getOrderStats()
      ]);
      setOrders(ordersRes.data || []);
      setStats(statsRes.data || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard configuration...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-container">
      
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
                  <th>Date Placed</th>
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
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default AdminOrders;
