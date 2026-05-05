import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService, settingService } from '../services/api';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  ExternalLink,
  Map,
  Camera,
  CheckCircle,
  QrCode,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '../utils/imageUtils';

const RiderOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentQR, setPaymentQR] = useState('');
  const riderUser = JSON.parse(localStorage.getItem('riderUser') || '{}');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          orderService.getOrderDetails(id),
          settingService.getSettings()
        ]);
        setOrder(orderRes.data);
        if (settingsRes.data && settingsRes.data.payment_qr) {
          setPaymentQR(settingsRes.data.payment_qr);
        }
      } catch (err) {
        console.error('Failed to fetch details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUpdating(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressedBase64 = await compressImage(reader.result, 500);
          await orderService.uploadPaymentProof(id, compressedBase64);
          alert('Proof uploaded successfully!');
          // Refresh order data
          const res = await orderService.getOrderDetails(id);
          setOrder(res.data);
        } catch (err) {
          alert('Failed to upload proof');
        } finally {
          setUpdating(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Failed to read file');
      setUpdating(false);
    }
  };

  const isActive = order && order.rider_id === riderUser.id && order.status !== 'delivered' && order.status !== 'cancelled';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!order) return <div style={{ padding: '2rem', textAlign: 'center' }}>Order not found.</div>;

  return (
    <div className="rider-mobile-container" style={{ minHeight: '100vh', background: '#f8f9fa', padding: '1rem' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'Playfair Display', flex: 1 }}>Order #{order.id.toString().padStart(5, '0')}</h1>
        {paymentQR && (
          <button 
            onClick={() => setShowQR(true)} 
            style={{ background: '#f5ece3', border: 'none', color: 'var(--primary)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            title="Show Payment QR"
          >
            <QrCode size={20} />
          </button>
        )}
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Main Status & Info */}
        <div style={{ background: 'white', borderRadius: '28px', padding: '1.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
               <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                padding: '4px 10px', 
                borderRadius: '8px', 
                background: order.status === 'delivered' ? '#ecfdf5' : '#fffbeb',
                color: order.status === 'delivered' ? '#059669' : '#d97706',
                display: 'inline-block',
                marginBottom: '0.5rem'
              }}>
                {order.status}
              </span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Created {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>Rs. {Number(order.total_amount).toFixed(2)}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{order.payment_method}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem' }}>
             <a href={`tel:${order.customer_phone}`} style={{ flex: 1, height: '56px', borderRadius: '16px', background: '#f8f9fa', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: 'var(--secondary)', textDecoration: 'none', fontWeight: 700 }}>
                <Phone size={20} color="var(--primary)" /> Call
             </a>
             <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer_address)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, height: '56px', borderRadius: '16px', background: '#f8f9fa', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: 'var(--secondary)', textDecoration: 'none', fontWeight: 700 }}>
                <Map size={20} color="var(--primary)" /> Map
             </a>
             {isActive && (
               <div style={{ flex: 1, height: '56px', position: 'relative' }}>
                 <button style={{ width: '100%', height: '100%', borderRadius: '16px', background: order.payment_proof ? '#ecfdf5' : 'var(--secondary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: 'white', fontWeight: 700 }}>
                    {updating ? '...' : (order.payment_proof ? <CheckCircle size={20} /> : <Camera size={20} />)}
                    {order.payment_proof ? 'Done' : 'Proof'}
                 </button>
                 <input 
                   type="file" 
                   accept="image/*" 
                   capture="environment"
                   onChange={handleFileUpload}
                   disabled={updating}
                   style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                 />
               </div>
             )}
          </div>
        </div>

        {/* Details Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: '0 0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Details</h3>
          
          <div style={{ background: 'white', borderRadius: '28px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                <User size={22} />
              </div>
              <div style={{ flex: 1 }}>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Recipient</p>
                 <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{order.customer_name}</p>
                 <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{order.customer_phone}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                <MapPin size={22} />
              </div>
              <div style={{ flex: 1 }}>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Address</p>
                 <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 }}>{order.customer_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <h3 style={{ margin: '0 0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Summary</h3>
           
           <div style={{ background: 'white', borderRadius: '28px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}>
             {order.items && order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: i === order.items.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
                   <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: '#f8f9fa', position: 'relative' }}>
                      {item.image_thumb_url ? (
                        <img src={item.image_thumb_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={24} color="#ddd" />
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--primary)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, border: '2px solid white' }}>
                        {item.quantity}
                      </div>
                   </div>
                   <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{item.product_name}</h4>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Rs. {Number(item.price_at_purchase).toFixed(2)} / unit</p>
                      {item.options && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                          {Object.entries(item.options).map(([key, val]) => (
                            <span key={key} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: '#f5ece3', color: 'var(--primary)', fontWeight: 700 }}>
                              {val}
                            </span>
                          ))}
                        </div>
                      )}
                   </div>
                </div>
             ))}
           </div>
        </div>
      </motion.div>

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
    </div>
  );
};

export default RiderOrderDetail;
