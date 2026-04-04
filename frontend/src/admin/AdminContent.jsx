import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const pageSections = [
  {
    title: 'Hero Section',
    description: 'The introductory header displayed at the very top of your homepage.',
    fields: [
      { key: 'hero_title', label: 'Main Headline', type: 'text', help: 'The large text appearing on the homepage.' },
      { key: 'hero_subtitle', label: 'Subtitle Description', type: 'text', help: 'A short sentence under the main headline.' },
    ]
  },
  {
    title: 'About Us Section',
    description: 'The story and background showcasing your bakery.',
    fields: [
      { key: 'about_us', label: 'About Us Biography', type: 'textarea', help: 'Detailed text talking about the bakery.' },
    ]
  },
  {
    title: 'Contact Information',
    description: 'Business details displayed in the footer or contact area.',
    fields: [
      { key: 'contact_address', label: 'Store Physical Address', type: 'text', help: 'E.g., 123 Baker Street' },
      { key: 'contact_phone', label: 'Support Phone Number', type: 'text', help: 'Contact number shown on the site.' },
      { key: 'contact_email', label: 'Contact Email Address', type: 'text', help: 'Business email.' },
    ]
  },
  {
    title: 'Announcement Banner',
    description: 'A pop-up modal or banner displayed as soon as visitors open the site. Great for Mother\'s Day and holidays!',
    fields: [
      { key: 'announcement_enabled', label: 'Enable Banner', type: 'select', help: 'Type "true" to enable, "false" to hide.' },
      { key: 'announcement_title', label: 'Banner Title', type: 'text', help: 'E.g. Mother\'s Day Special!' },
      { key: 'announcement_text', label: 'Banner Message', type: 'textarea', help: 'Describe your offers or event.' }
    ]
  }
];

const AdminContent = () => {
  const [content, setContent] = useState({});
  const [savingKeys, setSavingKeys] = useState({});
  const [successKeys, setSuccessKeys] = useState({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/content');
      const contentObj = res.data.reduce((acc, item) => {
        acc[item.key_name] = item.value;
        return acc;
      }, {});
      setContent(contentObj);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (section_key) => {
    setSavingKeys({ ...savingKeys, [section_key]: true });
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } };
      await axios.post('http://localhost:5000/api/content', {
        key_name: section_key,
        value: content[section_key] || ''
      }, config);
      
      setSavingKeys({ ...savingKeys, [section_key]: false });
      setSuccessKeys({ ...successKeys, [section_key]: true });
      setTimeout(() => setSuccessKeys(prev => ({ ...prev, [section_key]: false })), 3000);
      
    } catch (error) {
      console.error(error);
      setSavingKeys({ ...savingKeys, [section_key]: false });
    }
  };

  const handleInputChange = (section_key, value) => {
    setContent({ ...content, [section_key]: value });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-container">
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Website Content</h1>
          <p style={{ color: 'var(--text-muted)' }}>Update texts, descriptions, and contact info instantly across your site.</p>
        </div>
      </div>

      {pageSections.map((section, sectionIndex) => (
        <motion.div 
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.15 }}
          className="admin-card" 
          style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}
        >
          <div style={{ background: '#faf8f5', padding: '1.5rem 2rem', borderBottom: '1px solid #E2DDD5' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--secondary)' }}>{section.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>{section.description}</p>
          </div>

          {section.fields.map(({ key, label, type, help }, fieldIndex) => (
            <div 
              key={key} 
              style={{ 
                borderBottom: fieldIndex < section.fields.length - 1 ? '1px solid #E2DDD5' : 'none', 
                padding: '2rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'flex-start',
                background: successKeys[key] ? 'rgba(22, 101, 52, 0.02)' : 'white',
                transition: 'background 0.5s ease'
              }}
            >
              
              <div style={{ flex: '0 0 300px' }}>
                <label style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  {label}
                </label>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <code style={{ background: '#f5ece3', padding: '0.2rem 0.4rem', borderRadius: '4px', color: 'var(--primary)', fontWeight: 500 }}>{key}</code>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {help}
                </p>
              </div>
              
              <div style={{ flex: 1 }}>
                {type === 'textarea' ? (
                  <textarea 
                    className="form-control" 
                    rows="4"
                    value={content[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                ) : type === 'select' ? (
                  <select 
                    className="form-control" 
                    value={content[key] || 'false'}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  >
                    <option value="false">Disabled / Hidden</option>
                    <option value="true">Enabled / Visible</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-control" 
                    value={content[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  />
                )}
              </div>
              
              <div style={{ flex: '0 0 140px', textAlign: 'right' }}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={successKeys[key] ? "btn-primary" : "btn-outline"}
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    background: successKeys[key] ? '#166534' : '', 
                    borderColor: successKeys[key] ? '#166534' : '',
                    color: successKeys[key] ? 'white' : ''
                  }}
                  onClick={() => handleSave(key)}
                  disabled={savingKeys[key]}
                >
                  {savingKeys[key] ? (
                    <RefreshCw size={18} className="spin" />
                  ) : successKeys[key] ? (
                    <><CheckCircle size={18} /> Saved!</>
                  ) : (
                    <><Save size={18} /> Update</>
                  )}
                </motion.button>
              </div>
              
            </div>
          ))}
        </motion.div>
      ))}

    </motion.div>
  );
};

export default AdminContent;
