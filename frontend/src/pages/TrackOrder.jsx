import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Clock, CheckCircle, Truck, ChefHat, XCircle } from 'lucide-react';
import { orderService } from '../services/api';
import Navbar from '../components/Navbar';
import { Link, useSearchParams } from 'react-router-dom';

// ── Status pipeline config ─────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Received',   icon: Package,    color: '#f59e0b' },
  { key: 'confirmed', label: 'Preparing',         icon: ChefHat,    color: '#8b5cf6' },
  { key: 'ready',     label: 'Ready',             icon: CheckCircle, color: '#10b981' },
  { key: 'shipped',   label: 'Out for Delivery',  icon: Truck,      color: '#3b82f6' },
  { key: 'delivered', label: 'Delivered',         icon: CheckCircle, color: '#059669' },
];

const STATUS_META = {
  pending:    { color: '#f59e0b', bg: '#fffbeb', label: 'Order Received' },
  confirmed:  { color: '#8b5cf6', bg: '#f5f3ff', label: 'Preparing' },
  ready:      { color: '#10b981', bg: '#ecfdf5', label: 'Ready for Pickup/Delivery' },
  shipped:    { color: '#3b82f6', bg: '#eff6ff', label: 'Out for Delivery' },
  delivered:  { color: '#059669', bg: '#ecfdf5', label: 'Delivered' },
  cancelled:  { color: '#ef4444', bg: '#fef2f2', label: 'Cancelled' },
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [trackingInput, setTrackingInput] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    const id = trackingInput.trim();
    if (!id) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await orderService.trackOrder(id);
      setOrder(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Order not found. Please check your tracking ID.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : -1;

  const meta = order ? (STATUS_META[order.status] || STATUS_META.pending) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      {/* ── Hero banner ── */}
      <section className="track-hero" style={{ padding: '6rem 0 4rem' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}
          >
            <div className="track-hero-icon" style={{ width: '64px', height: '64px', marginBottom: '1.25rem' }}>
              <Package size={30} />
            </div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '1rem', color: 'var(--secondary)' }}>
              Track Your Order
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Stay updated! Enter your tracking ID to see exactly where your delicious treats are.
            </p>

            {/* ── Search form ── */}
            <form onSubmit={handleTrack} className="track-search-form" style={{ borderRadius: '20px', padding: '0.25rem' }}>
              <input
                id="tracking-id-input"
                type="text"
                className="track-search-input"
                placeholder="Paste Tracking ID here..."
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                required
                style={{ padding: '0.9rem 1.5rem' }}
              />
              <button
                type="submit"
                id="track-submit-btn"
                className="track-search-btn"
                disabled={loading}
                style={{ borderRadius: '16px', margin: '4px' }}
              >
                {loading
                  ? <span className="spin" style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  : <><Search size={18} /> <span className="hide-mobile">Track</span></>
                }
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ── Result Area ── */}
      <section style={{ padding: '2rem 0 6rem' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <AnimatePresence mode="wait">

            {/* Error state */}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#fff', borderRadius: '24px', boxShadow: 'var(--shadow-md)', border: '1px solid #fee2e2' }}
              >
                <div style={{ background: '#fef2f2', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                   <XCircle size={32} color="#ef4444" />
                </div>
                <h3 style={{ fontWeight: 700, color: '#b91c1c', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Order Not Found</h3>
                <p style={{ color: '#7f1d1d', lineHeight: 1.5 }}>{error}</p>
                <button onClick={() => setError('')} style={{ marginTop: '1.5rem', background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>Try another ID</button>
              </motion.div>
            )}

            {/* Order card */}
            {order && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                {/* Status badge */}
                <div className="track-status-card" style={{ '--status-color': meta.color, '--status-bg': meta.bg, borderRadius: '28px', padding: '2rem' }}>
                  <div className="track-status-badge" style={{ marginBottom: '2rem' }}>
                    <span className="track-status-dot" />
                    {meta.label}
                  </div>
                  <div className="track-meta-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <span className="track-label" style={{ fontSize: '0.7rem', opacity: 0.7 }}>Customer</span>
                      <span className="track-value" style={{ fontSize: '1rem' }}>{order.customerName}</span>
                    </div>
                    <div>
                      <span className="track-label" style={{ fontSize: '0.7rem', opacity: 0.7 }}>Placed On</span>
                      <span className="track-value" style={{ fontSize: '1rem' }}>{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                      <span className="track-label" style={{ fontSize: '0.7rem', opacity: 0.7 }}>Order Total</span>
                      <span className="track-value" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' }}>Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress timeline */}
                {order.status !== 'cancelled' && (
                  <div className="track-timeline-card" style={{ borderRadius: '28px', padding: '2rem' }}>
                    <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '2rem', fontSize: '1.4rem' }}>Journey Map</h3>
                    <div className="track-timeline">
                      {STATUS_STEPS.map((step, idx) => {
                        const StepIcon = step.icon;
                        const done = idx <= currentStepIndex;
                        const active = idx === currentStepIndex;
                        return (
                          <div key={step.key} className="track-step">
                            <div className="track-step-connector">
                              <motion.div
                                className="track-step-circle"
                                animate={{ background: done ? step.color : '#e5e7eb', scale: active ? 1.2 : 1 }}
                                transition={{ duration: 0.4 }}
                                style={{ background: done ? step.color : '#e5e7eb', width: '36px', height: '36px' }}
                              >
                                <StepIcon size={16} color={done ? 'white' : '#9ca3af'} />
                              </motion.div>
                              {idx < STATUS_STEPS.length - 1 && (
                                <div className="track-step-line">
                                  <motion.div
                                    className="track-step-line-fill"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: idx < currentStepIndex ? 1 : 0 }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    style={{ background: STATUS_STEPS[idx + 1]?.color || 'var(--primary)' }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="track-step-label">
                              <span style={{ fontWeight: active ? 800 : 600, color: done ? 'var(--secondary)' : '#b9b6b2', fontSize: '0.85rem' }}>
                                {step.label}
                              </span>
                              {active && (
                                <motion.span
                                  className="track-active-badge"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  style={{ background: step.color + '15', color: step.color, borderRadius: '6px', padding: '2px 8px', fontSize: '0.65rem' }}
                                >
                                  In Progress
                                </motion.span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cancelled banner */}
                {order.status === 'cancelled' && (
                  <div className="track-cancelled-banner" style={{ borderRadius: '20px', padding: '1.25rem', background: '#fef2f2', color: '#dc2626', fontWeight: 600, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <XCircle size={24} />
                    <span>This order has been cancelled. Please contact us for support.</span>
                  </div>
                )}

                {/* Order Items */}
                <div className="track-items-card" style={{ background: 'white', borderRadius: '28px', padding: '2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #f0f0f0' }}>
                  <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '1.5rem', fontSize: '1.4rem' }}>Package Content</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {order.items.map((item, i) => {
                      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                      const thumbSrc = item.image_thumb
                        ? (item.image_thumb.startsWith('http') ? item.image_thumb : `${backendUrl}${item.image_thumb}`)
                        : null;
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i === order.items.length - 1 ? 'none' : '1px solid #f8f9fa' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8f9fa', overflow: 'hidden', flexShrink: 0 }}>
                               {thumbSrc ? (
                                 <img src={thumbSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                               ) : (
                                 <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🧁</div>
                               )}
                            </div>
                            <div>
                               <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{item.name} <span style={{ color: 'var(--primary)', opacity: 0.6 }}>×{item.quantity}</span></p>
                               {item.options && item.options.cakeType && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '0.25rem' }}>
                                  {item.options.cakeType}
                                </span>
                              )}
                            </div>
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.9rem' }}>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Final Total</span>
                       <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem' }}>Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8f9fa', borderRadius: '20px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                  <Clock size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tracking ID: <code style={{ color: 'var(--secondary)', fontWeight: 800 }}>{order.trackingId}</code></span>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Link to="/" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>← Back to Home</Link>
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {!error && !order && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '4rem 2rem' }}
              >
                <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                   <Package size={40} style={{ opacity: 0.2 }} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                  Enter your tracking ID above to see your order's journey.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default TrackOrder;
