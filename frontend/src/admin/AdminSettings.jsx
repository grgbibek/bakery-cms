import React, { useState, useEffect } from 'react';
import { settingService } from '../services/api';
import { Save, Plus, Trash2, Truck, Cake, CheckCircle, RefreshCw, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    delivery_settings: { base_fee: 100, premium_fee: 200, free_min: 2000, nearby_areas: '' },
    cake_types: [],
    max_cake_pounds: 10
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingService.getSettings();
      if (res.data) {
        setSettings({
          delivery_settings: res.data.delivery_settings || settings.delivery_settings,
          cake_types: res.data.cake_types || [],
          max_cake_pounds: res.data.max_cake_pounds || 10
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      delivery_settings: {
        ...prev.delivery_settings,
        [field]: value
      }
    }));
  };

  const handleCakeTypeChange = (index, field, value) => {
    const updated = [...settings.cake_types];
    updated[index] = { ...updated[index], [field]: value };
    setSettings(prev => ({ ...prev, cake_types: updated }));
  };

  const addCakeType = () => {
    setSettings(prev => ({
      ...prev,
      cake_types: [...prev.cake_types, { name: '', extra: 0 }]
    }));
  };

  const removeCakeType = (index) => {
    const updated = settings.cake_types.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, cake_types: updated }));
  };

  const saveSettings = async (key, value) => {
    try {
      setSaving(true);
      await settingService.updateSetting(key, value);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <RefreshCw className="spin" style={{ color: 'var(--primary)' }} size={32} />
      </div>
    );
  }

  return (
    <div className="admin-main">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>System Settings</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>Configure global pricing and delivery rules.</p>
        </div>
        
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ 
                background: '#ecfdf5', color: '#10b981', padding: '0.8rem 1.2rem', 
                borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.6rem',
                fontWeight: 600, fontSize: '0.9rem', border: '1px solid #d1fae5'
              }}
            >
              <CheckCircle size={18} /> {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Delivery Rules */}
        <section className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ 
            background: 'rgba(195,132,82,0.05)', padding: '1.2rem 2rem', 
            borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.8rem'
          }}>
            <Truck size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Delivery Configuration</h3>
          </div>
          
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Base Fee (Nearby)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Rs.</span>
                  <input 
                    type="number"
                    value={settings.delivery_settings.base_fee}
                    onChange={(e) => handleDeliveryChange('base_fee', e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '2.8rem' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Premium Fee (Far)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Rs.</span>
                  <input 
                    type="number"
                    value={settings.delivery_settings.premium_fee}
                    onChange={(e) => handleDeliveryChange('premium_fee', e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '2.8rem' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Free Delivery Threshold (Min. Order)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Rs.</span>
                <input 
                  type="number"
                  value={settings.delivery_settings.free_min}
                  onChange={(e) => handleDeliveryChange('free_min', e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.8rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} /> Nearby Areas (Comma Separated)
              </label>
              <textarea 
                value={settings.delivery_settings.nearby_areas}
                onChange={(e) => handleDeliveryChange('nearby_areas', e.target.value)}
                className="form-control"
                style={{ minHeight: '120px', resize: 'vertical', lineHeight: 1.5, fontSize: '0.9rem' }}
                placeholder="List neighborhoods for the base fee..."
              />
            </div>

            <button 
              onClick={() => saveSettings('delivery_settings', settings.delivery_settings)}
              disabled={saving}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Update Delivery Rules'}
            </button>
          </div>
        </section>

        {/* Cake Customization */}
        <section className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ 
            background: 'rgba(195,132,82,0.05)', padding: '1.2rem 2rem', 
            borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.8rem'
          }}>
            <Cake size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Cake Types & Pricing</h3>
          </div>

          <div style={{ padding: '2rem' }}>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              {settings.cake_types.map((type, index) => (
                <motion.div 
                  layout
                  key={index} 
                  style={{ 
                    display: 'flex', gap: '1rem', alignItems: 'flex-end', 
                    background: '#fcfaf8', padding: '1rem', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)', marginBottom: '1rem'
                  }}
                >
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Name</label>
                    <input 
                      type="text"
                      value={type.name}
                      onChange={(e) => handleCakeTypeChange(index, 'name', e.target.value)}
                      className="form-control"
                      style={{ padding: '0.6rem' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Extra Rs.</label>
                    <input 
                      type="number"
                      value={type.extra}
                      onChange={(e) => handleCakeTypeChange(index, 'extra', e.target.value)}
                      className="form-control"
                      style={{ padding: '0.6rem' }}
                    />
                  </div>
                  <button 
                    onClick={() => removeCakeType(index)}
                    className="btn-icon danger"
                    style={{ marginBottom: '2px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>

            <button 
              onClick={addCakeType}
              className="btn-outline"
              style={{ width: '100%', borderStyle: 'dashed', background: 'transparent', marginBottom: '1.5rem', padding: '0.6rem' }}
            >
              <Plus size={16} /> Add New Cake Type
            </button>

            <div className="form-group" style={{ marginBottom: '1.5rem', background: '#fcfaf8', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Maximum Cake Pounds Allowed</label>
              <input 
                type="number"
                min="1"
                value={settings.max_cake_pounds}
                onChange={(e) => setSettings(prev => ({ ...prev, max_cake_pounds: e.target.value }))}
                className="form-control"
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Customers can select weight up to this limit.</p>
            </div>

            <button 
              onClick={async () => {
                setSaving(true);
                try {
                  await settingService.updateSetting('cake_types', settings.cake_types);
                  await settingService.updateSetting('max_cake_pounds', settings.max_cake_pounds);
                  setMessage('Cake settings saved successfully!');
                  setTimeout(() => setMessage(''), 3000);
                } catch(error) {
                  console.error(error);
                  alert('Error saving settings');
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Cake Settings'}
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminSettings;
