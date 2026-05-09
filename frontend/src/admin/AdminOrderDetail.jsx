import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { 
  Package, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Truck,
  ChefHat,
  CreditCard,
  History,
  MessageSquare,
  ShoppingCart,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await orderService.getOrderDetails(id);
      setOrder(res.data);
    } catch (err) {
      setError('Failed to fetch order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (status, notes = '') => {
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(id, status, notes);
      await fetchOrder();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
      setRejectModal(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (error || !order) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error || 'Order not found'}</div>;

  const STATUS_CONFIG = {
    pending: { color: '#f59e0b', bg: '#fffbeb', icon: Clock, label: 'Pending' },
    confirmed: { color: '#8b5cf6', bg: '#f5f3ff', icon: ChefHat, label: 'Preparing' },
    ready: { color: '#10b981', bg: '#ecfdf5', icon: CheckCircle, label: 'Ready' },
    shipped: { color: '#3b82f6', bg: '#eff6ff', icon: Truck, label: 'Out for Delivery' },
    delivered: { color: '#059669', bg: '#ecfdf5', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: '#ef4444', bg: '#fef2f2', icon: XCircle, label: 'Cancelled' },
  };

  const status = STATUS_CONFIG[order.status || 'pending'] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-container">
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button 
          onClick={() => navigate('/admin')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 500 }}
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {order.status === 'pending' && (
            <button 
              onClick={() => handleUpdateStatus('confirmed')}
              disabled={updating}
              className="btn-primary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
            >
              Confirm Order
            </button>
          )}
          {order.status === 'confirmed' && (
            <button 
              onClick={() => handleUpdateStatus('ready')}
              disabled={updating}
              style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Mark as Ready
            </button>
          )}
          {order.status === 'ready' && (
            <button 
              onClick={() => handleUpdateStatus('delivered')}
              disabled={updating}
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Mark as Delivered
            </button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button 
              onClick={() => setRejectModal(true)}
              disabled={updating}
              style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="admin-detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Order Header */}
          <div className="admin-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Order ID</span>
                <h1 style={{ margin: '0.25rem 0', fontFamily: 'Playfair Display' }}>#{order.id.toString().padStart(5, '0')}</h1>
              </div>
              <div style={{ 
                background: status.bg, 
                color: status.color, 
                padding: '0.5rem 1rem', 
                borderRadius: '50px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                <StatusIcon size={18} />
                {status.label}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#f5ece3', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date Placed</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#f5ece3', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Method</p>
                  <p style={{ margin: 0, fontWeight: 700, color: order.payment_method === 'Online' ? '#3b82f6' : 'var(--secondary)' }}>
                    {order.payment_method === 'Online' ? 'Fonepay' : 'Cash'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#f5ece3', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</p>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--secondary)' }}>Rs. {Number(order.total_amount).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} /> Order Items
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.25rem', borderBottom: i === order.items.length - 1 ? 'none' : '1px solid #eee' }}>
                  <img 
                    src={item.image_thumb_url ? `${import.meta.env.VITE_API_BASE_URL || ''}${item.image_thumb_url}` : 'https://via.placeholder.com/100'} 
                    alt={item.product_name}
                    style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.product_name}</h4>
                      <span style={{ fontWeight: 700 }}>Rs. {(item.quantity * item.price_at_purchase).toFixed(2)}</span>
                    </div>
                    <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {item.quantity} × Rs. {Number(item.price_at_purchase).toFixed(2)}
                    </p>
                    {item.options && item.options.cakeType && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: '#fef3c7', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                          {item.options.cakeType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Customer Info */}
          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} /> Customer Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--text-muted)' }}><User size={18} /></div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{order.customer_name}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--text-muted)' }}><Mail size={18} /></div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{order.customer_email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--text-muted)' }}><Phone size={18} /></div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{order.customer_phone}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--text-muted)' }}><MapPin size={18} /></div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Address</p>
                  <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.5 }}>{order.customer_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking ID */}
          <div className="admin-card" style={{ padding: '1.5rem', background: '#fcfbfa' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tracking ID</p>
            <p style={{ margin: 0, fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.9rem', color: 'var(--secondary)' }}>{order.tracking_id}</p>
          </div>

          {/* Activity Log */}
          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <History size={18} /> Activity Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '5px', bottom: '5px', width: '2px', background: '#eee' }}></div>
              {order.logs && order.logs.length > 0 ? (
                order.logs.map((log, i) => {
                  const logStatus = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending;
                  const LogIcon = logStatus.icon;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                      <div style={{ 
                        background: logStatus.bg, 
                        color: logStatus.color, 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '2px solid white'
                      }}>
                        <LogIcon size={12} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{logStatus.label}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        {log.username && (
                          <p style={{ margin: '0.1rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {log.username}</p>
                        )}
                        {log.notes && (
                          <div style={{ 
                            marginTop: '0.5rem', 
                            padding: '0.6rem 0.8rem', 
                            background: '#f8f9fa', 
                            borderRadius: '8px', 
                            fontSize: '0.8rem', 
                            color: '#555',
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'flex-start'
                          }}>
                            <MessageSquare size={14} style={{ marginTop: '0.1rem', flexShrink: 0, color: '#999' }} />
                            <span>{log.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>No activity recorded yet.</p>
              )}
            </div>
          </div>

          {/* Delivery/Payment Proof */}
          {(order.payment_proof || (order.status !== 'cancelled' && order.status !== 'pending')) && (
            <div className="admin-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <ImageIcon size={18} /> Delivery/Payment Verification
              </h3>
              {order.payment_proof ? (
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`${import.meta.env.VITE_API_BASE_URL || ''}${order.payment_proof}`} 
                    alt="Payment Proof" 
                    style={{ width: '100%', borderRadius: '12px', border: '1px solid #eee' }}
                  />
                  <a 
                    href={`${import.meta.env.VITE_API_BASE_URL || ''}${order.payment_proof}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      position: 'absolute', top: '10px', right: '10px', background: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: 'var(--secondary)', display: 'flex'
                    }}
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '12px', border: '1px dashed #ddd' }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Waiting for rider to upload screenshot...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '450px' }}>
              <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={24} color="#ef4444" /> Cancel Order
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Reason for cancellation (will be sent to customer):</p>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px', marginBottom: '1.5rem' }}
                placeholder="E.g., Item out of stock..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setRejectModal(false)} className="btn-outline">Back</button>
                <button onClick={() => handleUpdateStatus('cancelled', rejectReason)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel Order</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminOrderDetail;
