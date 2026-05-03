import React, { useState, useEffect } from 'react';
import { productService, categoryService } from '../services/api';
import { Edit2, Trash2, Plus, X, Image as ImageIcon, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', images: [], category: '' });
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

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
      if (validFiles.length < files.length) {
        showNotification('Some files were too large (max 10MB) and skipped.');
      }
      
      const readers = validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(results => {
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...results] }));
      });
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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
      setFormData({ name: '', description: '', price: '', images: [], category: '' });
      setEditingId(null);
      setIsFormOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async (product) => {
    try {
      const res = await productService.getProduct(product.id);
      const fullProduct = res.data;
      setFormData({ ...fullProduct, images: fullProduct.images || (fullProduct.image ? [fullProduct.image] : []) });
      setEditingId(fullProduct.id);
      setIsFormOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showNotification('Failed to load product details');
    }
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
    setFormData({ name: '', description: '', price: '', images: [], category: '' });
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
                    <select name="category" value={formData.category} onChange={handleInputChange} className="form-control" required style={{ backgroundColor: 'white' }}>
                      <option value="" disabled>Select a Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-grid-2-1">
                  <div className="form-group">
                    <label>Product Images (First image will be the main thumbnail)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                        <button type="button" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                          <Package size={18} /> Upload Multiple Images
                        </button>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                      </div>

                      {/* Image Gallery Preview */}
                      {formData.images && formData.images.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {formData.images.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', border: idx === 0 ? '2px solid var(--primary)' : '1px solid #ddd', overflow: 'hidden' }}>
                              <img src={img.startsWith('data:') || img.startsWith('http') ? img : `${import.meta.env.VITE_API_BASE_URL || ''}${img}`} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button 
                                type="button" 
                                onClick={() => removeImage(idx)}
                                style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '0 0 0 4px' }}
                              >
                                <X size={12} />
                              </button>
                              {idx === 0 && <span style={{ position: 'absolute', bottom: 0, left: 0, background: 'var(--primary)', color: 'white', fontSize: '0.5rem', padding: '2px 4px', fontWeight: 'bold' }}>MAIN</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Retail Price (Rs.)</label>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Inventory List ({products.length})</h3>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="btn-primary" 
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => { handleCancel(); setIsFormOpen(!isFormOpen); }}
          >
            {isFormOpen ? <><X size={16}/> Close Panel</> : <><Plus size={16}/> Add Product</>}
          </motion.button>
        </div>
        
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', border: '1px solid var(--border-color)', background: '#fcfbfa', flexShrink: 0 }}>
                            <img 
                              src={
                                (product.image_thumb || product.image) 
                                  ? ((product.image_thumb || product.image).startsWith('data:') || (product.image_thumb || product.image).startsWith('http') 
                                      ? (product.image_thumb || product.image) 
                                      : `${import.meta.env.VITE_API_BASE_URL || ''}${product.image_thumb || product.image}`) 
                                  : 'https://via.placeholder.com/200?text=No+Image'
                              } 
                              alt={product.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--secondary)' }}>{product.name}</span>
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
                      <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>Rs. {Number(product.price).toFixed(2)}</td>
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
