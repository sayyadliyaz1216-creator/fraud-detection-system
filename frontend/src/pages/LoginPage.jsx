import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Login failed. Please check credentials.');
      }

      const data = await response.json();
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Could not connect to FastAPI backend on port 8000');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative'
    }}>
      <div 
        className="glass-panel" 
        style={{ 
          maxWidth: '440px', 
          width: '100%', 
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(99,102,241,0.2)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 1rem',
            borderRadius: '16px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 25px rgba(99,102,241,0.5)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            SentinelShield
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Real-Time AI Fraud Detection Portal
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }} id="login-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            className="primary-btn"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.9rem' }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access Security System</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Buttons for Hackathon Presentation */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)', marginBottom: '0.75rem', textAlign: 'center' }}>
            Quick Demo Accounts (1-Click Fill)
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <button
              type="button"
              id="demo-login-admin"
              className="secondary-btn"
              onClick={() => handleQuickFill('admin', 'admin123')}
              style={{ fontSize: '0.8rem', justifyContent: 'space-between', padding: '0.6rem 0.85rem' }}
            >
              <span>👤 <strong>Admin:</strong> admin / admin123</span>
              <span style={{ fontSize: '0.72rem', color: '#818cf8' }}>Select</span>
            </button>
            <button
              type="button"
              id="demo-login-student"
              className="secondary-btn"
              onClick={() => handleQuickFill('student', 'demo123')}
              style={{ fontSize: '0.8rem', justifyContent: 'space-between', padding: '0.6rem 0.85rem' }}
            >
              <span>🎓 <strong>Student:</strong> student / demo123</span>
              <span style={{ fontSize: '0.72rem', color: '#818cf8' }}>Select</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
