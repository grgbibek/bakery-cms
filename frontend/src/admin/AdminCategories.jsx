import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/api';
import { Edit2, Trash2, Plus, X, Tags } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, formData);
        showNotification('Category updated successfully!');
      } else {
        await categoryService.createCategory(formData);
        showNotification('Category added successfully!');
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setIsFormOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? (Products within this category might be unlinked)')) {
      try {
        await categoryService.deleteCategory(id);
        showNotification('Category deleted');
        fetchCategories();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setIsFormOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-container">
      
      {/* Header Area */}
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Category Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Organize your bakery's menus</p>
        </div>
      </div>

      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -20 }}
          style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <div style={{ width: 8, height: 8, background: '#166534', borderRadius: '50%' }}></div>
          {notification}
        </motion.div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: '2rem' }}
          >
            <div className="admin-card" style={{ borderTop: '4px solid var(--primary)', marginBottom: 0 }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {editingId ? 'Edit Category' : 'New Category'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Category Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" placeholder="e.g. Pastries" required />
                </div>
                
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-control" rows="2" placeholder="Describe the category..."></textarea>
                </div>
                
                <div className="form-action" style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {editingId ? 'Save Changes' : 'Create Category'}
                  </button>
                  <button type="button" className="btn-outline" onClick={handleCancel}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Categories List ({categories.length})</h3>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="btn-primary" 
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => { handleCancel(); setIsFormOpen(!isFormOpen); }}
          >
            {isFormOpen ? <><X size={16}/> Close</> : <><Plus size={16}/> Add Category</>}
          </motion.button>
        </div>
        
        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Tags size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
            <p>No categories found. Start by adding one above!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {categories.map((category, index) => (
                    <motion.tr 
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: '#fcfbfa' }}
                    >
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--primary)' }}>{category.name}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {category.description || '-'}
                      </td>
                      <td>
                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-icon" onClick={() => handleEdit(category)} title="Edit"><Edit2 size={16} /></motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-icon danger" onClick={() => handleDelete(category.id)} title="Delete"><Trash2 size={16} /></motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default AdminCategories;
