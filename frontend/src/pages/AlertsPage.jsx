import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowRight, 
  RefreshCw,
  Clock,
  MapPin,
  Smartphone,
  IndianRupee,
  FileCheck2
} from 'lucide-react';
import { DecisionBadge, RiskScorePill } from '../components/RiskBadge';

export default function AlertsPage({ setActivePage, onSelectCase }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, BLOCK, REVIEW
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/alerts');
      if (!res.ok) throw new Error('Failed to retrieve alerts');
      const data = await res.json();
      setAlerts(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(a => {
    if (filter !== 'ALL' && a.decision !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = a.transaction_ref?.toLowerCase().includes(q);
      const matchUser = a.user_id?.toLowerCase().includes(q);
      const matchLoc = a.location?.toLowerCase().includes(q);
      return matchRef || matchUser || matchLoc;
    }
    return true;
  });

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suspicious Activity Alerts</h1>
          <p className="page-subtitle">Real-time queue of transactions requiring compliance review or blocked for fraud</p>
        </div>
        <button 
          id="alerts-refresh-btn"
          className="secondary-btn" 
          onClick={fetchAlerts}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {error && (
        <div className="info-banner" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
          <AlertTriangle size={18} />
          <span>Error loading alerts: {error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Filter:</span>
          <button 
            id="filter-all-btn"
            className={`secondary-btn ${filter === 'ALL' ? 'active' : ''}`}
            style={{ 
              fontSize: '0.8rem', 
              padding: '0.4rem 0.85rem',
              background: filter === 'ALL' ? 'rgba(99, 102, 241, 0.2)' : undefined,
              borderColor: filter === 'ALL' ? 'var(--accent-primary)' : undefined
            }}
            onClick={() => setFilter('ALL')}
          >
            All Alerts ({alerts.length})
          </button>
          <button 
            id="filter-block-btn"
            className={`secondary-btn ${filter === 'BLOCK' ? 'active' : ''}`}
            style={{ 
              fontSize: '0.8rem', 
              padding: '0.4rem 0.85rem',
              background: filter === 'BLOCK' ? 'rgba(239, 68, 68, 0.2)' : undefined,
              borderColor: filter === 'BLOCK' ? 'var(--color-block)' : undefined
            }}
            onClick={() => setFilter('BLOCK')}
          >
            Blocked ({alerts.filter(a => a.decision === 'BLOCK').length})
          </button>
          <button 
            id="filter-review-btn"
            className={`secondary-btn ${filter === 'REVIEW' ? 'active' : ''}`}
            style={{ 
              fontSize: '0.8rem', 
              padding: '0.4rem 0.85rem',
              background: filter === 'REVIEW' ? 'rgba(245, 158, 11, 0.2)' : undefined,
              borderColor: filter === 'REVIEW' ? 'var(--color-review)' : undefined
            }}
            onClick={() => setFilter('REVIEW')}
          >
            Review ({alerts.filter(a => a.decision === 'REVIEW').length})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <input
            id="alerts-search-input"
            type="text"
            className="form-input"
            placeholder="Search by Ref, User, or City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.3rem', paddingRight: '0.8rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontSize: '0.85rem' }}
          />
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Alerts Feed */}
      {filteredAlerts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileCheck2 size={42} style={{ margin: '0 auto 1rem', color: '#10b981', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>No Alerts In Queue</h3>
          <p style={{ fontSize: '0.85rem' }}>No suspicious transactions matching current criteria. Submit a new flagged transaction to see it appear live.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} id="alerts-list-container">
          {filteredAlerts.map(alert => {
            const isBlock = alert.decision === 'BLOCK';
            const accentBorder = isBlock ? 'var(--color-block)' : 'var(--color-review)';

            return (
              <div 
                key={alert.id}
                className="glass-panel"
                style={{ 
                  padding: '1.35rem', 
                  borderLeft: `4px solid ${accentBorder}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <DecisionBadge decision={alert.decision} />
                    <strong style={{ fontSize: '1.05rem', fontFamily: 'monospace', color: '#ffffff' }}>
                      {alert.transaction_ref}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      User: <strong>{alert.user_id}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <RiskScorePill score={alert.risk_score} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} />
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                </div>

                {/* Attributes pill row */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                    <IndianRupee size={14} style={{ color: '#06b6d4' }} />
                    <span>Amount: <strong>INR {Number(alert.amount).toLocaleString('en-IN')}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                    <Smartphone size={14} style={{ color: '#818cf8' }} />
                    <span>Device: <strong>{alert.device}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                    <MapPin size={14} style={{ color: '#f59e0b' }} />
                    <span>Location: <strong>{alert.location}</strong></span>
                  </div>
                </div>

                {/* Reasons triggered */}
                <div>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 600 }}>
                    Triggered Violations:
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                    {Array.isArray(alert.reasons) ? (
                      alert.reasons.map((r, idx) => (
                        <span 
                          key={idx} 
                          style={{ 
                            fontSize: '0.76rem', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '4px',
                            background: isBlock ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                            color: isBlock ? '#fca5a5' : '#fde68a',
                            border: `1px solid ${isBlock ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`
                          }}
                        >
                          • {r}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{alert.reasons}</span>
                    )}
                  </div>
                </div>

                {/* Footer action bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                    AI Anomaly: <strong style={{ color: '#818cf8' }}>{alert.ml_prediction || 'NORMAL'} ({alert.ml_anomaly_score || 0}%)</strong>
                  </div>

                  <button 
                    id={`alert-case-btn-${alert.id}`}
                    className="secondary-btn" 
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                    onClick={() => {
                      if (onSelectCase) onSelectCase(alert);
                      setActivePage('cases');
                    }}
                  >
                    <span>Investigate Case {alert.case_ref ? `(${alert.case_ref})` : ''}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
