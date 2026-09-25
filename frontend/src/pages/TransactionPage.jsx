import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Smartphone, 
  MapPin, 
  IndianRupee, 
  User, 
  AlertCircle,
  HelpCircle,
  Zap,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import DecisionModal from '../components/DecisionModal';

export default function TransactionPage({ onTransactionProcessed, setActivePage }) {
  const [userId, setUserId] = useState('user_101');
  const [amount, setAmount] = useState('75000');
  const [device, setDevice] = useState('New');
  const [location, setLocation] = useState('Delhi');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Submit real transaction to FastAPI backend
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId.trim(),
          amount: parseFloat(amount),
          device: device.trim(),
          location: location.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Backend failed to evaluate transaction');
      }

      const result = await response.json();
      setLastResult(result);
      setShowModal(true);
      if (onTransactionProcessed) {
        onTransactionProcessed(result);
      }
    } catch (err) {
      setError(err.message || 'Could not connect to FastAPI server at http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset loader for presentations
  const applyPreset = (presetUserId, presetAmount, presetDevice, presetLocation) => {
    setUserId(presetUserId);
    setAmount(presetAmount.toString());
    setDevice(presetDevice);
    setLocation(presetLocation);
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit Real-Time Transaction</h1>
          <p className="page-subtitle">Instant fraud risk assessment via rules engine + scikit-learn ML</p>
        </div>
      </div>

      {/* Preset Scenarios Header for Hackathon Demos */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Zap size={16} style={{ color: '#818cf8' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c7d2fe' }}>
            One-Click Presentation Test Scenarios
          </span>
        </div>

        <div className="scenario-grid">
          {/* Preset A: The exact prompt test case */}
          <div 
            className="scenario-card"
            id="preset-user-block"
            onClick={() => applyPreset('user_101', 75000, 'New', 'Delhi')}
          >
            <div className="scenario-title">
              <span>Critical Risk (BLOCK)</span>
              <span className="decision-badge decision-block" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>BLOCK</span>
            </div>
            <p className="scenario-desc">
              Amount: ₹75,000 • Device: New • Location: Delhi (User 101 Home: Mumbai). Triggers 85/100 risk.
            </p>
          </div>

          {/* Preset B: Normal clean transaction */}
          <div 
            className="scenario-card"
            id="preset-normal-allow"
            onClick={() => applyPreset('user_101', 3500, 'Existing', 'Mumbai')}
          >
            <div className="scenario-title">
              <span>Standard (ALLOW)</span>
              <span className="decision-badge decision-allow" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>ALLOW</span>
            </div>
            <p className="scenario-desc">
              Amount: ₹3,500 • Device: Existing • Location: Mumbai. Clean transaction within standard bounds.
            </p>
          </div>

          {/* Preset C: Moderate review */}
          <div 
            className="scenario-card"
            id="preset-review-flag"
            onClick={() => applyPreset('user_102', 55000, 'New', 'Delhi')}
          >
            <div className="scenario-title">
              <span>Elevated Risk (REVIEW)</span>
              <span className="decision-badge decision-review" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>REVIEW</span>
            </div>
            <p className="scenario-desc">
              Amount: ₹55,000 • Device: New • Location: Delhi (Home: Delhi). Score: 45 (Amount + Device).
            </p>
          </div>
        </div>
      </div>

      {/* Main Form & Rules Guide Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.75rem', alignItems: 'start' }}>
        
        {/* Form Panel */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Send size={18} style={{ color: '#818cf8' }} />
            <span>Transaction Parameters</span>
          </h2>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} id="transaction-form">
            <div className="form-group">
              <label className="form-label" htmlFor="tx-user-id">
                User / Account Identifier
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="tx-user-id"
                  type="text"
                  className="form-input"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. user_101 or student"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', marginTop: '0.25rem', display: 'block' }}>
                Note: <code>user_101</code> registered profile location is <strong>Mumbai</strong>.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-amount">
                Transaction Amount (INR)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="tx-amount"
                  type="number"
                  step="1"
                  min="1"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 75000"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <IndianRupee size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', marginTop: '0.25rem', display: 'block' }}>
                Rule: Amounts &gt; ₹50,000 add risk points.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-device">
                Device Status
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="tx-device"
                  className="form-select"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                >
                  <option value="New">New (Unrecognized Device - High Risk)</option>
                  <option value="Existing">Existing (Trusted Device)</option>
                </select>
                <Smartphone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-location">
                Transaction Location
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="tx-location"
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Delhi, Mumbai, London"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <MapPin size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', marginTop: '0.25rem', display: 'block' }}>
                Locations differing from account home trigger the unusual location rule.
              </span>
            </div>

            <button
              type="submit"
              id="tx-submit-btn"
              className="primary-btn"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem', padding: '0.95rem' }}
            >
              {loading ? (
                <span>Evaluating via AI & Rules...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Analyze Transaction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Info: Live Rules Specs Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} style={{ color: '#06b6d4' }} />
              <span>Fraud Risk Scoring Rules</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                <strong style={{ color: '#ffffff' }}>Amount &gt; 50,000</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>+25 risk score</p>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: '3px solid #06b6d4' }}>
                <strong style={{ color: '#ffffff' }}>New Device</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>+20 risk score</p>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                <strong style={{ color: '#ffffff' }}>Unusual Location</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>+20 risk score</p>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                <strong style={{ color: '#ffffff' }}>Velocity (&gt; 5 txs in short period)</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>+25 risk score</p>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-faint)', fontWeight: 700 }}>
                Decision Thresholds
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span className="decision-badge decision-allow" style={{ fontSize: '0.72rem' }}>Risk &lt; 40: ALLOW</span>
                <span className="decision-badge decision-review" style={{ fontSize: '0.72rem' }}>Risk 40-69: REVIEW</span>
                <span className="decision-badge decision-block" style={{ fontSize: '0.72rem' }}>Risk ≥ 70: BLOCK</span>
              </div>
            </div>
          </div>

          {/* Quick Last Result Snippet if Available */}
          {lastResult && (
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${lastResult.decision === 'BLOCK' ? '#ef4444' : (lastResult.decision === 'REVIEW' ? '#f59e0b' : '#10b981')}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Latest Result ({lastResult.transaction_ref})</span>
                <button 
                  id="reopen-modal-btn"
                  onClick={() => setShowModal(true)} 
                  style={{ background: 'transparent', color: '#818cf8', fontSize: '0.75rem', textDecoration: 'underline' }}
                >
                  View Details
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{lastResult.decision}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Risk: {lastResult.risk_score}/100</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showModal && (
        <DecisionModal
          result={lastResult}
          onClose={() => setShowModal(false)}
          onNavigateAlerts={() => setActivePage('alerts')}
        />
      )}
    </div>
  );
}
