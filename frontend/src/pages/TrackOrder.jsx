import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Clock, CheckCircle, Truck, ChefHat, XCircle } from 'lucide-react';
import { orderService } from '../services/api';
import Navbar from '../components/Navbar';
import { Link, useSearchParams } from 'react-router-dom';

// ── Status pipeline config ─────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Received',   icon: Package,    color: '#f59e0b' },
  { key: 'preparing', label: 'Preparing',         icon: ChefHat,    color: '#8b5cf6' },
  { key: 'ready',     label: 'Ready',             icon: CheckCircle, color: '#10b981' },
  { key: 'delivered', label: 'Delivered',         icon: Truck,      color: '#3b82f6' },
];

const STATUS_META = {
  pending:    { color: '#f59e0b', bg: '#fffbeb', label: 'Order Received' },
  preparing:  { color: '#8b5cf6', bg: '#f5f3ff', label: 'Preparing' },
  ready:      { color: '#10b981', bg: '#ecfdf5', label: 'Ready for Pickup/Delivery' },
  delivered:  { color: '#3b82f6', bg: '#eff6ff', label: 'Delivered' },
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
      <section className="track-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}
          >
            <div className="track-hero-icon">
              <Package size={36} />
            </div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
              Track Your Order
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '2.5rem' }}>
              Enter the tracking ID you received after checkout to see your live order status.
            </p>

            {/* ── Search form ── */}
            <form onSubmit={handleTrack} className="track-search-form">
              <input
                id="tracking-id-input"
                type="text"
                className="track-search-input"
                placeholder="e.g. 3f6e2b1c-9d4a-4e7f-8abc-1234567890ab"
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                required
              />
              <button
                type="submit"
                id="track-submit-btn"
                className="track-search-btn"
                disabled={loading}
              >
                {loading
                  ? <span className="spin" style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  : <><Search size={18} /> Track</>
                }
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ── Result Area ── */}
      <section style={{ padding: '3rem 0 6rem' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <AnimatePresence mode="wait">

            {/* Error state */}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="track-error-card"
              >
                <XCircle size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 600, color: '#b91c1c', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Order Not Found</p>
                <p style={{ color: '#7f1d1d' }}>{error}</p>
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
              >
                {/* Status badge */}
                <div className="track-status-card" style={{ '--status-color': meta.color, '--status-bg': meta.bg }}>
                  <div className="track-status-badge">
                    <span className="track-status-dot" />
                    {meta.label}
                  </div>
                  <div className="track-meta-row">
                    <div>
                      <span className="track-label">Customer</span>
                      <span className="track-value">{order.customerName}</span>
                    </div>
                    <div>
                      <span className="track-label">Placed On</span>
                      <span className="track-value">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                      <span className="track-label">Total</span>
                      <span className="track-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress timeline */}
                {order.status !== 'cancelled' && (
                  <div className="track-timeline-card">
                    <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '1.5rem', fontSize: '1.3rem' }}>Order Progress</h3>
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
                                animate={{ background: done ? step.color : '#e5e7eb', scale: active ? 1.15 : 1 }}
                                transition={{ duration: 0.4 }}
                                style={{ background: done ? step.color : '#e5e7eb' }}
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
                              <span style={{ fontWeight: active ? 700 : 500, color: done ? 'var(--secondary)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {step.label}
                              </span>
                              {active && (
                                <motion.span
                                  className="track-active-badge"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  style={{ background: step.color + '22', color: step.color }}
                                >
                                  Current
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
                  <div className="track-cancelled-banner">
                    <XCircle size={24} color="#ef4444" />
                    <span>This order has been cancelled. Please contact us for assistance.</span>
                  </div>
                )}

                {/* Order Items */}
                <div className="track-items-card">
                  <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '1.25rem', fontSize: '1.3rem' }}>Order Items</h3>
                  <div className="track-items-list">
                    {order.items.map((item, i) => {
                      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                      const thumbSrc = item.image_thumb
                        ? (item.image_thumb.startsWith('http') ? item.image_thumb : `${backendUrl}${item.image_thumb}`)
                        : null;
                      return (
                        <div key={i} className="track-item-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {thumbSrc ? (
                              <img
                                src={thumbSrc}
                                alt={item.name}
                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                              />
                            ) : (
                              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)', fontSize: '1.2rem' }}>
                                🧁
                              </div>
                            )}
                            <div>
                              <div className="track-item-qty" style={{ display: 'inline-block', marginBottom: '2px' }}>{item.quantity}×</div>
                              <span style={{ fontWeight: 500, display: 'block' }}>{item.name}</span>
                            </div>
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                            Rs. {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="track-total-row">
                      <span style={{ fontWeight: 700 }}>Total</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                        Rs. {order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking ID reminder */}
                <div className="track-id-reminder">
                  <Clock size={16} />
                  <span>Tracking ID: <strong style={{ fontFamily: 'monospace' }}>{order.trackingId}</strong></span>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <Link to="/" className="btn-outline" style={{ fontSize: '0.95rem' }}>← Back to Home</Link>
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {!error && !order && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="track-empty"
              >
                <Package size={64} style={{ opacity: 0.15, margin: '0 auto 1.5rem', display: 'block' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                  Enter your tracking ID above to get started.
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
