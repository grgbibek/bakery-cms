import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Plus } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', image_url: '', category: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
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
        await axios.put(`http://localhost:5000/api/products/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/products', formData);
      }
      setFormData({ name: '', description: '', price: '', image_url: '', category: '' });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Manage Products</h1>
      </div>

      <div className="admin-card">
        <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="form-control" required />
            </div>
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input type="url" name="image_url" value={formData.image_url} onChange={handleInputChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="form-control" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-control" rows="3" required></textarea>
          </div>
          <div className="form-action">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Product' : <><Plus size={18}/> Add Product</>}
            </button>
            {editingId && (
              <button type="button" className="btn-outline" onClick={() => { setEditingId(null); setFormData({ name: '', description: '', price: '', image_url: '', category: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h3>Current Products</h3>
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                  </td>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" onClick={() => handleEdit(product)} title="Edit"><Edit2 size={16} /></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(product.id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
