import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import './AdminLogin.css';
// You can replace this with your actual logo or a better icon
const AdminLogo = () => (
  <div style={{ textAlign: 'center', marginBottom: 24 }}>
    <span style={{ fontSize: 48, color: '#2b7cff', display: 'inline-block', marginBottom: 8, animation: 'pulse 1.5s infinite' }}>🛡️</span>
    <div style={{ fontWeight: 700, fontSize: 22, color: '#2b7cff', letterSpacing: 1 }}>Admin Portal</div>
  </div>
);

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      // TODO: Check for admin role in token or response
      localStorage.setItem('token', data.token);
      // Redirect to admin dashboard
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-login-bg">
        <motion.div
          className="admin-login-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <AdminLogo />
          <div className="admin-login-welcome">Welcome back, Admin! Please sign in to continue.</div>
          <form className="admin-login-form" onSubmit={handleSubmit} autoComplete="off">
            <h2 className="admin-login-title">Admin Login</h2>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="admin-login-input"
            />
            <div className="admin-login-password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="admin-login-input"
                style={{ marginBottom: 0 }}
              />
              <button
                type="button"
                className="admin-login-showpass"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="admin-login-remember-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ accentColor: '#2b7cff' }}
                />
                Remember me
              </label>
              <a href="#" className="admin-login-forgot">Forgot password?</a>
            </div>
            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? <span className="admin-login-spinner" role="status">🔄</span> : 'Login'}
            </button>
            {error && <div className="admin-login-error-msg">{error}</div>}
          </form>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLogin; 