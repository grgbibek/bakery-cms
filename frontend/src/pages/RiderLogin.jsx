import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Truck, Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RiderLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.login({ username, password });
      const user = res.data.user;
      
      if (user.role !== 'rider') {
        setError('Access denied. Only riders can login here.');
        setLoading(false);
        return;
      }

      localStorage.setItem('riderToken', res.data.token);
      localStorage.setItem('riderUser', JSON.stringify(user));
      navigate('/rider');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfaf8', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', padding: '2.5rem', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--secondary)', color: 'white', padding: '1rem', borderRadius: '20px', width: 'fit-content', margin: '0 auto 1.5rem' }}>
            <Truck size={32} />
          </div>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', margin: 0 }}>Rider Portal</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Enter your credentials to start delivering</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: '#444' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input 
                type="text" 
                className="form-control" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: '#444' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input 
                type="password" 
                className="form-control" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '1rem', borderRadius: '15px', justifyContent: 'center', fontSize: '1rem' }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RiderLogin;
