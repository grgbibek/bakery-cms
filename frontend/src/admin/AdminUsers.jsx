import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { Users, UserPlus, Trash2, Shield, Truck, AlertCircle, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'rider' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userRole, setUserRole] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await authService.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || '');
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
    fetchUsers();
  }, []);

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (isEditMode) {
        await authService.updateUser(editingUserId, newUser);
      } else {
        await authService.createUser({ ...newUser, is_active: 1 });
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (user) => {
    if (user.role === 'admin') return;
    try {
      await authService.updateUser(user.id, { 
        ...user, 
        is_active: user.is_active ? 0 : 1 
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setNewUser({ 
      username: user.username, 
      full_name: user.full_name || '', 
      password: '', // Keep empty for security
      role: user.role || 'rider',
      is_active: user.is_active
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setNewUser({ username: '', full_name: '', password: '', role: 'rider', is_active: 1 });
    setError('');
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await authService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (userRole && userRole !== 'admin') {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '24px', margin: '2rem' }}>
        <Shield size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '1rem' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-muted)' }}>You do not have permission to access the User Management section.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-container">
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>User Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage admins and delivery riders</p>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Team Members List ({users.length})</h3>
          <button 
            onClick={() => { setIsEditMode(false); setIsModalOpen(true); }}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
          >
            <UserPlus size={18} /> Create New User
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((user) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td style={{ fontWeight: 600 }}>{user.full_name || '-'}</td>
                      <td>{user.username}</td>
                      <td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: user.role === 'admin' ? '#8b5cf6' : (user.role === 'manager' ? '#059669' : '#3b82f6'),
                          background: user.role === 'admin' ? '#f5f3ff' : (user.role === 'manager' ? '#ecfdf5' : '#eff6ff'),
                          padding: '0.25rem 0.75rem',
                          borderRadius: '50px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          width: 'fit-content',
                          textTransform: 'capitalize'
                        }}>
                          {user.role === 'admin' ? <Shield size={14} /> : (user.role === 'manager' ? <Users size={14} /> : <Truck size={14} />)}
                          {user.role}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleStatusToggle(user)}
                          disabled={user.role === 'admin'}
                          style={{
                            padding: '0.3rem 0.8rem',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: user.role === 'admin' ? 'default' : 'pointer',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: user.is_active ? '#ecfdf5' : '#f3f4f6',
                            color: user.is_active ? '#10b981' : '#6b7280',
                            transition: 'all 0.2s',
                            opacity: user.role === 'admin' ? 0.7 : 1
                          }}
                        >
                          <div style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            background: user.is_active ? '#10b981' : '#6b7280' 
                          }} />
                          {user.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleEditClick(user)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.5rem', marginRight: '0.5rem' }}
                          title="Edit User"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontFamily: 'Playfair Display', fontSize: '1.4rem' }}>{isEditMode ? 'Edit User' : 'Create New User'}</h3>
                <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleCreateOrUpdateUser}>
                {error && (
                  <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    placeholder="e.g. Ram Bahadur"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="e.g. rider_ram"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    required={!isEditMode}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder={isEditMode ? '********' : 'Min. 6 characters'}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Role</label>
                  <select 
                    className="form-control" 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    style={{ appearance: 'none', background: 'white' }}
                  >
                    <option value="rider">Delivery Rider</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    fontWeight: 600, 
                    cursor: newUser.role === 'admin' ? 'default' : 'pointer',
                    opacity: newUser.role === 'admin' ? 0.6 : 1 
                  }}>
                    Account Status
                    <div 
                      onClick={() => {
                        if (newUser.role !== 'admin') {
                          setNewUser(prev => ({ ...prev, is_active: prev.is_active ? 0 : 1 }));
                        }
                      }}
                      style={{
                        width: '44px', height: '22px', borderRadius: '50px',
                        background: newUser.is_active ? '#10b981' : '#d1d5db',
                        position: 'relative', transition: 'all 0.3s', 
                        cursor: newUser.role === 'admin' ? 'default' : 'pointer'
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                        position: 'absolute', top: '2px', left: newUser.is_active ? '24px' : '2px',
                        transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }} />
                    </div>
                  </label>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {newUser.role === 'admin' 
                      ? 'Admins are always active for safety.' 
                      : (newUser.is_active ? 'Account is currently active and can login.' : 'Account is disabled and cannot login.')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={handleCloseModal} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUsers;
