import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

const sections = [
  { key: 'hero_title', label: 'Hero Title', type: 'text' },
  { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'text' },
  { key: 'about_us', label: 'About Us Text', type: 'textarea' },
  { key: 'contact_address', label: 'Contact Address', type: 'text' },
  { key: 'contact_phone', label: 'Contact Phone', type: 'text' },
  { key: 'contact_email', label: 'Contact Email', type: 'text' },
];

const AdminContent = () => {
  const [content, setContent] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/content');
      setContent(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (section_key) => {
    try {
      await axios.post('http://localhost:5000/api/content', {
        section_key,
        content_text: content[section_key] || ''
      });
      setMessage('Layout updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Error updating content.');
    }
  };

  const handleInputChange = (section_key, value) => {
    setContent({ ...content, [section_key]: value });
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Website Content Manager</h1>
      </div>

      <div className="admin-card">
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Update the display text for your website. Changes reflect immediately on the frontend.
        </p>

        {message && (
          <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '2rem' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sections.map(({ key, label, type }) => (
            <div key={key} style={{ borderBottom: '1px solid #eee', paddingBottom: '2rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '1.1rem', color: 'var(--secondary)' }}>{label} ({key})</label>
                {type === 'textarea' ? (
                  <textarea 
                    className="form-control" 
                    rows="4"
                    value={content[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  />
                ) : (
                  <input 
                    type="text" 
                    className="form-control" 
                    value={content[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  />
                )}
              </div>
              <button className="btn-outline" onClick={() => handleSave(key)}>
                <Save size={18} /> Save {label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
