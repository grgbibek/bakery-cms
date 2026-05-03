import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, ExternalLink, Download, Calendar, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminReports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [trackingIdFilter, setTrackingIdFilter] = useState('');

  const STATUS_THEMES = {
    pending: { bg: '#fffbeb', text: '#d97706', label: 'Pending' },
    confirmed: { bg: '#f5f3ff', text: '#8b5cf6', label: 'Preparing' },
    ready: { bg: '#ecfdf5', text: '#10b981', label: 'Ready' },
    shipped: { bg: '#eff6ff', text: '#3b82f6', label: 'Out for Delivery' },
    delivered: { bg: '#ecfdf5', text: '#059669', label: 'Delivered' },
    cancelled: { bg: '#fef2f2', text: '#ef4444', label: 'Cancelled' }
  };

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const res = await orderService.getOrders();
        setOrders(res.data || []);
      } catch (error) {
        console.error('Error fetching orders for reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    let match = true;
    
    // Status Filter
    if (statusFilter !== 'all' && order.status !== statusFilter) match = false;
    
    // Payment Method Filter
    if (paymentFilter !== 'all' && order.payment_method !== paymentFilter) match = false;
    
    // Date Range Filter
    if (dateFrom) {
      if (new Date(order.created_at) < new Date(dateFrom)) match = false;
    }
    if (dateTo) {
      // Add 1 day to dateTo to include the end date fully
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      if (new Date(order.created_at) >= endDate) match = false;
    }

    // Order ID Filter (Exact match)
    if (orderIdFilter && order.id.toString() !== orderIdFilter) match = false;

    // Tracking ID Filter
    if (trackingIdFilter && !order.tracking_id?.toLowerCase().includes(trackingIdFilter.toLowerCase())) match = false;

    // Search Term Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const orderIdStr = order.id.toString();
      const nameMatch = order.customer_name?.toLowerCase().includes(lowerSearch);
      const phoneMatch = order.customer_phone?.includes(lowerSearch);
      const idMatch = orderIdStr.includes(lowerSearch);
      if (!nameMatch && !phoneMatch && !idMatch) match = false;
    }

    return match;
  });

  // Calculate some aggregate stats based on filtered results
  const totalFilteredRevenue = filteredOrders.reduce((sum, order) => {
    // Only count revenue for orders that are not cancelled
    if (order.status !== 'cancelled') {
      return sum + Number(order.total_amount);
    }
    return sum;
  }, 0);

  const totalFilteredCount = filteredOrders.length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading reporting data...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-container">
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Order Reports</h1>
          <p style={{ color: 'var(--text-muted)' }}>Comprehensive view and filtering of all historical orders</p>
        </div>
      </div>

      {/* Aggregate Stats for Filtered Data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', marginBottom: 0 }}>
           <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '12px', color: '#0ea5e9' }}>
             <FileText size={28} />
           </div>
           <div>
             <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Filtered Orders</p>
             <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', color: 'var(--secondary)' }}>{totalFilteredCount}</h2>
           </div>
        </div>
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', marginBottom: 0 }}>
           <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '12px', color: '#16a34a' }}>
             <DollarSign size={28} />
           </div>
           <div>
             <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Filtered Revenue</p>
             <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', color: 'var(--secondary)' }}>Rs. {totalFilteredRevenue.toFixed(2)}</h2>
           </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontWeight: 600 }}>
          <Filter size={18} /> Filter Criteria
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Search Customer/ID</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          {/* Order ID */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Exact Order ID</label>
            <input 
              type="text" 
              placeholder="e.g. 42" 
              value={orderIdFilter}
              onChange={(e) => setOrderIdFilter(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>

          {/* Tracking ID */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Tracking ID</label>
            <input 
              type="text" 
              placeholder="Search Tracking ID..." 
              value={trackingIdFilter}
              onChange={(e) => setTrackingIdFilter(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Preparing (Confirmed)</option>
              <option value="ready">Ready</option>
              <option value="shipped">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Payment Method</label>
            <select 
              value={paymentFilter} 
              onChange={(e) => setPaymentFilter(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
            >
              <option value="all">All Methods</option>
              <option value="Cash">Cash on Delivery</option>
              <option value="Online">Online / Fonepay</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>From Date</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>To Date</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>
        </div>
        
        {/* Clear Filters Button */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
           <button 
             onClick={() => { setStatusFilter('all'); setPaymentFilter('all'); setDateFrom(''); setDateTo(''); setSearchTerm(''); setOrderIdFilter(''); setTrackingIdFilter(''); }}
             style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}
           >
             Clear Filters
           </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
            <p>No orders match your filter criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Contact</th>
                  <th>Payment</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date Placed</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredOrders.map((order, index) => (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.5) }} // Cap delay for many rows
                      whileHover={{ backgroundColor: '#fcfbfa' }}
                    >
                      <td>
                        <Link 
                          to={`/admin/orders/${order.id}`}
                          style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          #{order.id.toString().padStart(5, '0')}
                          <ExternalLink size={12} style={{ opacity: 0.5 }} />
                        </Link>
                      </td>
                      <td style={{ fontWeight: 500 }}>{order.customer_name}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                          <span>{order.customer_phone}</span>
                        </div>
                      </td>
                      <td>
                         <span style={{ fontSize: '0.85rem', fontWeight: 600, color: order.payment_method === 'Online' ? '#3b82f6' : 'var(--text-muted)' }}>
                           {order.payment_method}
                         </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>Rs. {Number(order.total_amount).toFixed(2)}</td>
                      <td>
                        <span style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: (STATUS_THEMES[order.status] || STATUS_THEMES.pending).bg,
                          color: (STATUS_THEMES[order.status] || STATUS_THEMES.pending).text,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em'
                        }}>
                          {(STATUS_THEMES[order.status] || STATUS_THEMES.pending).label}
                        </span>
                      </td>
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

export default AdminReports;
