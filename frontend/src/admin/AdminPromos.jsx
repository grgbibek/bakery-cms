import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPromos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    expiration_date: '',
    usage_limit: '',
    is_active: true
  });

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/promos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPromos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch promos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingId(promo.id);
      setFormData({
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        min_order_amount: promo.min_order_amount || '',
        expiration_date: promo.expiration_date ? new Date(promo.expiration_date).toISOString().split('T')[0] : '',
        usage_limit: promo.usage_limit || '',
        is_active: Boolean(promo.is_active)
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        expiration_date: '',
        usage_limit: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const url = `${import.meta.env.VITE_API_BASE_URL || ''}/api/promos${editingId ? `/${editingId}` : ''}`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const payload = {
        ...formData,
        min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : 0,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        expiration_date: formData.expiration_date || null
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save promo');
      }

      setShowModal(false);
      fetchPromos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/promos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      fetchPromos();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-content">
      <div className="admin-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Tag size={24} color="var(--primary)" /> Promo Codes
          </h2>
          <button 
            onClick={() => handleOpenModal()} 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
          >
            <Plus size={18} /> Add Promo
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading promo codes...</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Expiry Date</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px' }}>{p.code}</td>
                    <td>
                      {p.discount_type === 'percentage' ? `${p.discount_value}%` : `Rs. ${p.discount_value}`}
                    </td>
                    <td>{p.min_order_amount > 0 ? `Rs. ${p.min_order_amount}` : 'None'}</td>
                    <td>{p.expiration_date ? new Date(p.expiration_date).toLocaleDateString() : 'Never'}</td>
                    <td>{p.usage_count} {p.usage_limit ? `/ ${p.usage_limit}` : ''}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: p.is_active ? '#ecfdf5' : '#fef2f2',
                        color: p.is_active ? '#10b981' : '#ef4444'
                      }}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenModal(p)} style={{ background: '#eff6ff', border: 'none', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {promos.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No promo codes defined.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="modal-container"
              style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 1.5rem', fontFamily: 'Playfair Display' }}>
                {editingId ? 'Edit Promo Code' : 'New Promo Code'}
              </h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div className="form-group">
                  <label>Code (e.g. SUMMER20)</label>
                  <input 
                    type="text" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                    className="form-control" 
                    required 
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Discount Type</label>
                    <select 
                      value={formData.discount_type} 
                      onChange={e => setFormData({...formData, discount_type: e.target.value})} 
                      className="form-control"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Value</label>
                    <input 
                      type="number" 
                      min="0"
                      step={formData.discount_type === 'percentage' ? "1" : "0.01"}
                      value={formData.discount_value} 
                      onChange={e => setFormData({...formData, discount_value: e.target.value})} 
                      className="form-control" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Minimum Order Amount (Rs.)</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Leave empty for no minimum"
                    value={formData.min_order_amount} 
                    onChange={e => setFormData({...formData, min_order_amount: e.target.value})} 
                    className="form-control" 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input 
                      type="date" 
                      value={formData.expiration_date} 
                      onChange={e => setFormData({...formData, expiration_date: e.target.value})} 
                      className="form-control" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Usage Limit</label>
                    <input 
                      type="number" 
                      min="1"
                      placeholder="Unlimited"
                      value={formData.usage_limit} 
                      onChange={e => setFormData({...formData, usage_limit: e.target.value})} 
                      className="form-control" 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={formData.is_active} 
                    onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>Active</label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
                  <button type="submit" className="btn-primary">{editingId ? 'Save Changes' : 'Create Promo'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminPromos;
