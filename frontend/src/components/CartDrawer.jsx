import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Minus, Plus, Trash2, CheckCircle, Copy, Check, MapPin, Banknote, Smartphone, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const KATHMANDU_LOCALITIES = [
  "Thamel", "Maharajgunj", "Golfutar", "Budhanilkantha", "New Baneshwor",
  "Old Baneshwor", "Koteshwor", "Putalisadak", "Lazimpat", "Balaju",
  "Kalanki", "Chabahil", "Bouddha", "Jorpati", "Basantapur", "Swayambhu",
  "Sitapaila", "Dhapasi", "Baluwatar", "Bishal Nagar", "Gairidhara",
  "Sinamangal", "Gongabu", "Samakhushi", "Naxal", "Maitidevi", "Dillibazar"
].sort();

const CartDrawer = () => {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    cartTotal,
    cartCount,
    getDeliveryCharge,
    deliverySettings,
    clearCart
  } = useCart();

  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    area: '', 
    houseDetails: ''
  });
  const [orderStatus, setOrderStatus] = useState({ loading: false, success: false, error: '' });
  const [trackingId, setTrackingId] = useState('');
  const [copied, setCopied] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const filteredLocalities = KATHMANDU_LOCALITIES.filter(loc => 
    loc.toLowerCase().includes(areaSearch.toLowerCase())
  );

  let discountAmount = 0;
  if (appliedPromo && !appliedPromo.error) {
    if (appliedPromo.type === 'percentage') {
      discountAmount = (cartTotal * appliedPromo.value) / 100;
    } else {
      discountAmount = Number(appliedPromo.value);
    }
    discountAmount = Math.min(discountAmount, cartTotal);
  }

  const deliveryCharge = getDeliveryCharge(orderForm.area);
  const finalTotal = Math.max(0, cartTotal + deliveryCharge - discountAmount);

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    setPromoLoading(true);
    setAppliedPromo(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/promos/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, order_amount: cartTotal })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Invalid promo code');
      
      setAppliedPromo({
        code: data.promo.code,
        type: data.promo.discount_type,
        value: data.promo.discount_value,
        message: 'Promo applied successfully!'
      });
      setPromoInput('');
    } catch (err) {
      setAppliedPromo({ error: err.message });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setOrderStatus({ loading: true, success: false, error: '' });
    try {
      const payload = {
        customer: {
          ...orderForm,
          address: `${orderForm.area}, Kathmandu (${orderForm.houseDetails})`
        },
        cartItems: cart.map(c => ({ 
          id: c.id, 
          quantity: c.quantity,
          options: c.options 
        })),
        promoCode: appliedPromo && !appliedPromo.error ? appliedPromo.code : null,
        discountAmount: discountAmount
      };
      const res = await orderService.createOrder(payload);
      setTrackingId(res.data.trackingId || '');
      setOrderStatus({ loading: false, success: true, error: '' });
      clearCart();
    } catch (err) {
      setOrderStatus({ loading: false, success: false, error: err.response?.data?.message || 'Failed to submit order. Please try again.' });
    }
  };

  const handleCopyTracking = () => {
    if (!trackingId) return;
    navigator.clipboard.writeText(trackingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCloseSuccess = () => {
    setIsCheckoutOpen(false);
    setIsSidebarOpen(false);
    setOrderStatus(prev => ({ ...prev, success: false }));
    setOrderForm({ name: '', email: '', phone: '', area: '', houseDetails: '' });
    setTrackingId('');
    setAppliedPromo(null);
    setPromoInput('');
  };

  return (
    <>


      {/* Cart Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'black', zIndex: 1000 }}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}
              style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '400px', height: '100%', background: 'white', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart /> Your Cart</h2>
                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                    <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cart.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #f5ece3', paddingBottom: '1rem' }}>
                        <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.25rem' }}>{item.name}</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>Rs. {Number(item.price).toFixed(2)}</span>
                              {item.options && item.options.cakeType && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, background: '#fef3c7', padding: '0.1rem 0.4rem', borderRadius: '4px', marginTop: '0.2rem', alignSelf: 'flex-start' }}>
                                  {item.options.cakeType}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5ece3', borderRadius: '4px', padding: '0.25rem' }}>
                              <button onClick={() => updateQuantity(item.id, -1, item.options)} style={{ background: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}><Minus size={14} /></button>
                              <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1, item.options)} style={{ background: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}><Plus size={14} /></button>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id, item.options)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'flex-start' }}><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ padding: '1.5rem', background: '#fcfbfa', borderTop: '1px solid #eee' }}>
                {cartTotal > 0 && cartTotal < deliverySettings.minFree && (
                  <div style={{ marginBottom: '1.5rem', background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.8rem', borderRadius: '12px', fontSize: '0.85rem', color: '#d97706', textAlign: 'center' }}>
                    Add <strong>Rs. {(deliverySettings.minFree - cartTotal).toFixed(2)}</strong> more for <strong>FREE Delivery</strong>!
                    <div style={{ height: '6px', background: '#f5ece3', borderRadius: '3px', marginTop: '0.6rem', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (cartTotal / deliverySettings.minFree) * 100)}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                )}
                {cartTotal >= deliverySettings.minFree && (
                  <div style={{ marginBottom: '1.5rem', background: '#ecfdf5', border: '1px solid #10b981', padding: '0.8rem', borderRadius: '12px', fontSize: '0.85rem', color: '#059669', textAlign: 'center', fontWeight: 600 }}>
                    🎊 You've unlocked FREE Delivery!
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                    Promo Code
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={promoInput} 
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Got a discount code?" 
                      className="form-control"
                      style={{ borderRadius: '12px', padding: '0.8rem', flex: 1, textTransform: 'uppercase', fontSize: '0.9rem' }}
                      disabled={promoLoading || (appliedPromo && !appliedPromo.error)}
                    />
                    <button 
                      type="button"
                      onClick={appliedPromo && !appliedPromo.error ? () => setAppliedPromo(null) : handleApplyPromo}
                      disabled={promoLoading || (!promoInput && !appliedPromo)}
                      style={{ 
                        padding: '0 1rem', 
                        borderRadius: '12px', 
                        background: appliedPromo && !appliedPromo.error ? '#fee2e2' : 'var(--secondary)', 
                        color: appliedPromo && !appliedPromo.error ? '#ef4444' : 'white', 
                        border: 'none', 
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {promoLoading ? '...' : (appliedPromo && !appliedPromo.error ? 'Remove' : 'Apply')}
                    </button>
                  </div>
                  {appliedPromo && appliedPromo.error && (
                    <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 500 }}>{appliedPromo.error}</p>
                  )}
                  {appliedPromo && !appliedPromo.error && (
                    <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={14} /> {appliedPromo.message}
                    </p>
                  )}
                </div>

                <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)' }}>Subtotal</span>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Excl. Delivery</p>
                    </div>
                    <span style={{ fontSize: discountAmount > 0 ? '1.2rem' : '1.5rem', fontWeight: 900, color: discountAmount > 0 ? 'var(--secondary)' : 'var(--primary)', letterSpacing: '-0.02em' }}>
                      Rs. {cartTotal.toFixed(2)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #eee' }}>
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Tag size={14}/> Discount ({appliedPromo?.code})</span>
                      </div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981', letterSpacing: '-0.02em' }}>
                        - Rs. {discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                      <div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>New Total</span>
                      </div>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                        Rs. {Math.max(0, cartTotal - discountAmount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal Overlay */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="modal-container"
              style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              {orderStatus.success ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <CheckCircle size={72} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                  </motion.div>
                  <h2 style={{ fontFamily: 'Playfair Display', color: 'var(--secondary)', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Order Confirmed!</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>Save your tracking ID to follow your order status.</p>

                  <div style={{ background: '#f5ece3', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px dashed var(--primary)' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '0.6rem' }}>Your Tracking ID</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '1rem', wordBreak: 'break-all', color: 'var(--secondary)', fontWeight: 800 }}>{trackingId}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    <button
                      onClick={handleCopyTracking}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '14px', background: copied ? '#ecfdf5' : 'white', color: copied ? '#10b981' : 'var(--text-main)', transition: 'all 0.2s', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
                    >
                      {copied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy ID</>}
                    </button>
                    <button
                      onClick={() => { handleCloseSuccess(); navigate(`/track-order?id=${trackingId}`); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '1rem', borderRadius: '14px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(195, 132, 82, 0.2)' }}
                    >
                      <MapPin size={18} /> Track Your Order
                    </button>
                  </div>

                  <button onClick={handleCloseSuccess} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.95rem', textDecoration: 'underline', fontWeight: 500 }}>Return to Store</button>
                </div>
              ) : (
                <>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'Playfair Display' }}>Secure Checkout</h2>
                    <button onClick={() => setIsCheckoutOpen(false)} style={{ background: '#f5f5f5', border: 'none', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
                  </div>
                  <form onSubmit={handleCheckoutSubmit} style={{ padding: '1.5rem' }}>
                    {orderStatus.error && (
                      <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                        {orderStatus.error}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                          Full Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input type="text" className="form-control" required value={orderForm.name} onChange={e => setOrderForm({ ...orderForm, name: e.target.value })} placeholder="e.g. Ram Sharma" style={{ borderRadius: '12px', padding: '0.9rem' }} />
                      </div>
 
                       <div className="form-grid-2-1" style={{ gap: '1.25rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                            Email <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>(Optional)</span>
                          </label>
                          <input type="email" className="form-control" value={orderForm.email} onChange={e => setOrderForm({ ...orderForm, email: e.target.value })} placeholder="your@email.com" style={{ borderRadius: '12px', padding: '0.9rem' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                            Phone Number <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input type="tel" className="form-control" required value={orderForm.phone} onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })} placeholder="98XXXXXXXX" style={{ borderRadius: '12px', padding: '0.9rem' }} />
                        </div>
                      </div>
 
                       <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #10b981', color: '#059669', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle size={18} style={{ flexShrink: 0 }} />
                        <span>We currently deliver within <strong>Kathmandu District</strong> only.</span>
                      </div>
 
                       <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                          Delivery Area <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Type to search your area..."
                            value={orderForm.area || areaSearch}
                            onFocus={() => setShowAreaDropdown(true)}
                            onChange={(e) => {
                              setAreaSearch(e.target.value);
                              setOrderForm({ ...orderForm, area: '' }); // Clear area if they are typing
                              setShowAreaDropdown(true);
                            }}
                            style={{ borderRadius: '12px', padding: '0.9rem', width: '100%' }}
                            required
                          />
                          <MapPin size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
                        </div>
 
                         <AnimatePresence>
                          {showAreaDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                width: '100%', 
                                background: 'white', 
                                borderRadius: '12px', 
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                                zIndex: 100, 
                                marginTop: '0.5rem',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                border: '1px solid #eee'
                              }}
                            >
                              {filteredLocalities.length === 0 ? (
                                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                  No matching areas found.
                                </div>
                              ) : (
                                filteredLocalities.map(loc => {
                                  const fee = getDeliveryCharge(loc);
                                  return (
                                    <div 
                                      key={loc}
                                      onClick={() => {
                                        setOrderForm({ ...orderForm, area: loc });
                                        setAreaSearch(loc);
                                        setShowAreaDropdown(false);
                                      }}
                                      style={{ 
                                        padding: '0.8rem 1rem', 
                                        cursor: 'pointer', 
                                        borderBottom: '1px solid #f9f9f9',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.9rem',
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#faf8f5'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                      <span style={{ fontWeight: 500 }}>{loc}</span>
                                      <span style={{ 
                                        fontSize: '0.75rem', 
                                        color: fee === 0 ? '#10b981' : 'var(--primary)', 
                                        fontWeight: 700,
                                        background: fee === 0 ? '#ecfdf5' : '#fef3c7',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '6px'
                                      }}>
                                        {fee === 0 ? 'FREE' : `Rs. ${fee}`}
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
 
                       <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                          Detailed Address / Landmark <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          required 
                          value={orderForm.houseDetails} 
                          onChange={e => setOrderForm({ ...orderForm, houseDetails: e.target.value })} 
                          placeholder="House #, Street name, Near school..." 
                          style={{ borderRadius: '12px', padding: '0.9rem' }}
                        />
                      </div>
 

                    </div>

                    <div style={{ marginTop: '1.5rem', background: '#fcfbfa', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          <span>Subtotal</span>
                          <span>Rs. {cartTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          <span>Delivery Fee {orderForm.area && `(${getDeliveryCharge(orderForm.area) === deliverySettings.fee ? 'Nearby' : 'Far Area'})`}</span>
                          <span>{deliveryCharge === 0 ? <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span> : `Rs. ${deliveryCharge.toFixed(2)}`}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981', fontWeight: 600 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Tag size={14} /> Discount ({appliedPromo?.code})
                            </span>
                            <span>- Rs. {discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div style={{ height: '1px', background: '#eee', margin: '0.4rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)' }}>
                          <span>Grand Total</span>
                          <span style={{ color: 'var(--primary)' }}>Rs. {finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '2.5rem' }}>
                      <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', borderRadius: '14px', fontSize: '1.1rem', boxShadow: '0 8px 20px rgba(195, 132, 82, 0.3)' }} disabled={orderStatus.loading}>
                        {orderStatus.loading ? 'Creating Order...' : `Confirm Order (Rs. ${finalTotal.toFixed(2)})`}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartDrawer;
