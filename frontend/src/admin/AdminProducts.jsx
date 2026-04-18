import React, { useState, useEffect } from 'react';
import { productService } from '../services/api';
import { Edit2, Trash2, Plus, X, Image as ImageIcon, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getProducts();
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productService.updateProduct(editingId, formData);
        showNotification('Product updated successfully!');
      } else {
        await productService.createProduct(formData);
        showNotification('Product added successfully!');
      }
      setFormData({ name: '', description: '', price: '', image: '', category: '' });
      setEditingId(null);
      setIsFormOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        showNotification('Product deleted');
        fetchProducts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', image: '', category: '' });
    setIsFormOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-container">
      
      {/* Header Area */}
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Product Inventory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your bakery's offerings</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="btn-primary" 
          onClick={() => { handleCancel(); setIsFormOpen(!isFormOpen); }}
        >
          {isFormOpen ? <><X size={18}/> Close Panel</> : <><Plus size={18}/> Add Product</>}
        </motion.button>
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
                {editingId ? 'Edit Product Configuration' : 'New Product Registration'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" placeholder="e.g. Sourdough Loaf" required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="form-control" placeholder="e.g. Bread, Pastry..." required />
                  </div>
                </div>
                
                <div className="form-grid-2-1">
                  <div className="form-group">
                    <label>Image URL</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageIcon size={20} color="var(--text-muted)" />
                      <input type="url" name="image" value={formData.image} onChange={handleInputChange} className="form-control" placeholder="https://" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Retail Price (NRs)</label>
                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="form-control" placeholder="0.00" required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-control" rows="3" placeholder="A rich, flavorful desc..." required></textarea>
                </div>
                
                <div className="form-action" style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {editingId ? 'Save Changes' : 'Publish Product'}
                  </button>
                  <button type="button" className="btn-outline" onClick={handleCancel}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Inventory List ({products.length})</h3>
        
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
            <p>No products found. Start by adding one above!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {products.map((product, index) => (
                    <motion.tr 
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: '#fcfbfa' }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={product.image} alt={product.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                          <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{product.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: '#f5ece3', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500 }}>
                          {product.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.description}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>NRs {Number(product.price).toFixed(2)}</td>
                      <td>
                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-icon" onClick={() => handleEdit(product)} title="Edit"><Edit2 size={16} /></motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-icon danger" onClick={() => handleDelete(product.id)} title="Delete"><Trash2 size={16} /></motion.button>
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

export default AdminProducts;
