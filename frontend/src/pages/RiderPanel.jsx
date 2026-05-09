import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Phone, CheckCircle, Package, Clock, ExternalLink, Navigation, LogOut, User, Camera, Image as ImageIcon, QrCode, X, Volume2, VolumeX } from 'lucide-react';
import { orderService, settingService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { compressImage } from '../utils/imageUtils';

const RiderPanel = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'active', or 'completed'
  const [updating, setUpdating] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [paymentQR, setPaymentQR] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('riderSoundEnabled') !== 'false');
  const lastRiderOrderIdRef = useRef(parseInt(localStorage.getItem('lastRiderOrderId') || '0', 10));
  const riderUser = JSON.parse(localStorage.getItem('riderUser') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('riderToken');
    localStorage.removeItem('riderUser');
    navigate('/rider/login');
  };

  const fetchRiderOrders = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await orderService.getRiderOrders();
      const fetchedOrders = res.data || [];
      setOrders(fetchedOrders);

      const relevantOrders = fetchedOrders.filter(o => (o.status === 'ready' && !o.rider_id) || (o.rider_id === riderUser.id && o.status !== 'delivered' && o.status !== 'cancelled'));
      if (relevantOrders.length > 0) {
        const maxId = Math.max(...relevantOrders.map(o => o.id));
        if (maxId > lastRiderOrderIdRef.current) {
          if (lastRiderOrderIdRef.current > 0 && soundEnabled) {
            const audio = new Audio('/assets/sounds/order-alert.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
          }
          lastRiderOrderIdRef.current = maxId;
          localStorage.setItem('lastRiderOrderId', maxId.toString());
        }
      }
    } catch (err) {
      console.error('Failed to fetch rider orders:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handlePickOrder = async (orderId) => {
    setUpdating(orderId);
    try {
      await orderService.pickOrder(orderId);
      await fetchRiderOrders();
      setActiveTab('active');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to pick order');
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchRiderOrders();
    
    // Fetch Payment QR
    settingService.getSettings().then(res => {
      if (res.data && res.data.payment_qr) {
        setPaymentQR(res.data.payment_qr);
      }
    }).catch(err => console.error('Failed to fetch settings:', err));

    const interval = setInterval(() => fetchRiderOrders(true), 20000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await orderService.updateOrderStatus(orderId, status);
      await fetchRiderOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const handleFileUpload = async (orderId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUpdating(orderId);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressedBase64 = await compressImage(reader.result, 500);
        await orderService.uploadPaymentProof(orderId, compressedBase64);
        alert('Payment proof uploaded successfully!');
        fetchRiderOrders();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload payment proof');
    } finally {
      setUpdating(null);
    }
  };

  const availableOrders = orders.filter(o => o.status === 'ready' && !o.rider_id);
  const activeDeliveries = orders.filter(o => o.rider_id === riderUser.id && o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.rider_id === riderUser.id && (o.status === 'delivered' || o.status === 'cancelled'));

  return (
    <div className="rider-mobile-container" style={{ minHeight: '100vh', background: '#f8f9fa', padding: '1rem' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
             <Truck size={24} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Playfair Display' }}>Vibe Rider</h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hello, {riderUser.full_name || riderUser.username}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {paymentQR && (
            <button 
              onClick={() => setShowQR(true)} 
              style={{ background: '#f5ece3', border: 'none', color: 'var(--primary)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Show Payment QR"
            >
              <QrCode size={20} />
            </button>
          )}
          <button 
            onClick={() => {
              const newState = !soundEnabled;
              setSoundEnabled(newState);
              localStorage.setItem('riderSoundEnabled', newState.toString());
            }}
            style={{ background: 'white', border: '1px solid #eee', color: 'var(--text-muted)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={soundEnabled ? "Mute Notifications" : "Unmute Notifications"}
          >
            {soundEnabled ? <Volume2 size={20} color="var(--primary)" /> : <VolumeX size={20} />}
          </button>
          <button onClick={handleLogout} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(0,0,0,0.85)', 
              zIndex: 1000, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '2rem',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ 
                background: 'white', 
                borderRadius: '32px', 
                padding: '2.5rem', 
                maxWidth: '400px', 
                width: '100%',
                position: 'relative',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowQR(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f5f5f5', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontFamily: 'Playfair Display', margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Scan to Pay</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Show this QR to the customer for digital payment.</p>
              
              <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
                <img 
                  src={paymentQR} 
                  alt="Payment QR" 
                  style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }} 
                />
              </div>

              <button 
                onClick={() => setShowQR(false)}
                style={{ width: '100%', background: 'var(--secondary)', color: 'white', border: 'none', padding: '1.1rem', borderRadius: '16px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(0,0,0,0.8)', 
              zIndex: 1001, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '2rem',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => setShowConfirmModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ 
                background: 'white', 
                borderRadius: '32px', 
                padding: '2.5rem', 
                maxWidth: '400px', 
                width: '100%',
                position: 'relative',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: '80px', height: '80px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={40} />
              </div>

              <h2 style={{ fontFamily: 'Playfair Display', margin: '0 0 0.75rem', fontSize: '1.8rem' }}>Complete Delivery?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                Have you successfully handed over the order <strong>#{showConfirmModal.toString().padStart(5, '0')}</strong> to the customer?
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button 
                  onClick={() => {
                    handleUpdateStatus(showConfirmModal, 'delivered');
                    setShowConfirmModal(null);
                  }}
                  style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '1.1rem', borderRadius: '18px', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}
                >
                  Yes, Delivered
                </button>
                <button 
                  onClick={() => setShowConfirmModal(null)}
                  style={{ width: '100%', background: '#f8f9fa', color: 'var(--text-muted)', border: '1px solid #eee', padding: '1.1rem', borderRadius: '18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                >
                  Not Yet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isRefreshing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginBottom: '1rem' }}>
           <div className="spin" style={{ display: 'inline-block' }}><Clock size={14} color="var(--primary)" /></div>
           <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginLeft: '0.5rem', fontWeight: 600 }}>Syncing...</span>
        </motion.div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div className="spin" style={{ marginBottom: '1rem' }}><Package size={48} color="#ddd" /></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Initializing your dashboard...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'available' && (
              <motion.div key="available" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {availableOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #eee' }}>
                    <Package size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem' }}>No New Orders</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Check back soon for new available deliveries in your area.</p>
                  </div>
                ) : (
                  availableOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      actionLabel="Claim Order" 
                      onAction={() => handlePickOrder(order.id)}
                      loading={updating === order.id}
                      color="var(--primary)"
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'active' && (
              <motion.div key="active" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {activeDeliveries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #eee' }}>
                    <Navigation size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem' }}>No Active Tasks</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Claim an order from the available list to start your delivery.</p>
                  </div>
                ) : (
                  activeDeliveries.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      actionLabel="Complete Delivery" 
                      onAction={() => setShowConfirmModal(order.id)}
                      onUpload={handleFileUpload}
                      loading={updating === order.id}
                      color="var(--secondary)"
                      isActive
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'completed' && (
              <motion.div key="completed" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {completedOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #eee' }}>
                    <CheckCircle size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem' }}>Empty History</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You haven't completed any deliveries yet.</p>
                  </div>
                ) : (
                  completedOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      color="#10b981"
                      isCompleted
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* App-style Bottom Navigation */}
      <nav className="rider-bottom-nav">
        <button onClick={() => setActiveTab('available')} className={`rider-nav-item ${activeTab === 'available' ? 'active' : ''}`}>
          <div style={{ position: 'relative' }}>
            <Package size={24} />
            {availableOrders.length > 0 && <span style={{ position: 'absolute', top: -5, right: -10, background: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '50px', fontWeight: 800 }}>{availableOrders.length}</span>}
          </div>
          <span>Available</span>
        </button>
        <button onClick={() => setActiveTab('active')} className={`rider-nav-item ${activeTab === 'active' ? 'active' : ''}`}>
          <div style={{ position: 'relative' }}>
            <Truck size={24} />
            {activeDeliveries.length > 0 && <span style={{ position: 'absolute', top: -5, right: -10, background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '50px', fontWeight: 800 }}>{activeDeliveries.length}</span>}
          </div>
          <span>Active</span>
        </button>
        <button onClick={() => setActiveTab('completed')} className={`rider-nav-item ${activeTab === 'completed' ? 'active' : ''}`}>
          <CheckCircle size={24} />
          <span>History</span>
        </button>
      </nav>
    </div>
  );
};

const OrderCard = ({ order, actionLabel, onAction, onUpload, loading, color, isActive, isCompleted }) => {
  const isOnline = order.payment_method === 'Online';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rider-order-card"
    >
      <div className="rider-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span className="rider-status-pill" style={{ 
              background: isOnline ? '#eff6ff' : '#fffbeb', 
              color: isOnline ? '#3b82f6' : '#d97706'
            }}>
              {isOnline ? 'Prepaid' : 'Pay on Delivery'}
            </span>
            {isActive && <span className="rider-status-pill" style={{ background: '#ecfdf5', color: '#059669' }}>Active</span>}
          </div>
          <Link to={`/rider/order/${order.id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              #{order.id.toString().padStart(5, '0')}
              <ExternalLink size={14} style={{ opacity: 0.4 }} />
            </h3>
          </Link>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>Rs. {Number(order.total_amount).toFixed(2)}</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      <div className="rider-card-body">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ marginTop: '0.2rem', color: 'var(--primary)' }}><MapPin size={16} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{order.customer_name}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{order.customer_address}</p>
          </div>
        </div>
      </div>

      {!isCompleted && (
        <div className="rider-card-footer">
           <a 
            href={`tel:${order.customer_phone}`}
            className="rider-btn-secondary"
            style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
          >
            <Phone size={20} />
          </a>
          
          <button 
            onClick={onAction}
            disabled={loading}
            className="rider-action-btn"
            style={{ background: color }}
          >
            {loading ? '...' : <><CheckCircle size={18} /> {actionLabel}</>}
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isActive && (
              <div style={{ position: 'relative' }}>
                <button className="rider-btn-secondary" style={{ background: order.payment_proof ? '#dcfce7' : '#f8f9fa', color: order.payment_proof ? '#16a34a' : '#444' }}>
                  {order.payment_proof ? <CheckCircle size={20} /> : <Camera size={20} />}
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={(e) => onUpload(order.id, e)}
                  disabled={loading}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
              </div>
            )}
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer_address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rider-btn-secondary"
            >
              <Navigation size={20} />
            </a>
          </div>
        </div>
      )}
      
      {isCompleted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', borderRadius: '16px', background: order.status === 'delivered' ? '#ecfdf5' : '#fff1f2', color: order.status === 'delivered' ? '#059669' : '#e11d48', fontWeight: 700, fontSize: '0.85rem', justifyContent: 'center' }}>
          {order.status === 'delivered' ? <CheckCircle size={18} /> : <Clock size={18} />}
          {order.status === 'delivered' ? 'Successfully Delivered' : 'Order Cancelled'}
        </div>
      )}
    </motion.div>
  );
};

export default RiderPanel;
