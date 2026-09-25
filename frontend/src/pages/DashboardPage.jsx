import React, { useEffect, useState } from 'react';
import {
  Activity,
  IndianRupee,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Send,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { DecisionBadge, RiskScorePill } from '../components/RiskBadge';

export default function DashboardPage({ setActivePage }) {
  const [stats, setStats] = useState(null);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [statsRes, mlRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/ml/metrics')
      ]);

      if (!statsRes.ok) throw new Error('Failed to load dashboard metrics');
      if (!mlRes.ok) throw new Error('Failed to load ML metrics');

      const statsData = await statsRes.json();
      const mlData = await mlRes.json();

      setStats(statsData);
      setMlMetrics(mlData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const total = stats?.total_transactions || 1;
  const allowPct = Math.round(((stats?.allowed_count || 0) / total) * 100);
  const reviewPct = Math.round(((stats?.review_count || 0) / total) * 100);
  const blockPct = Math.round(((stats?.blocked_count || 0) / total) * 100);

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fraud Risk Operations Center</h1>
          <p className="page-subtitle">Real-time heuristics & scikit-learn anomaly monitoring</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            id="dash-refresh-btn"
            className="secondary-btn"
            onClick={fetchStats}
            title="Refresh metrics"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            id="dash-new-tx-btn"
            className="primary-btn"
            onClick={() => setActivePage('transactions')}
          >
            <Send size={15} />
            <span>Submit Transaction</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="info-banner" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
          <AlertTriangle size={18} />
          <span>Error loading live stats: {error}. Make sure FastAPI is running on port 8000.</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card" style={{ '--card-accent': '#6366f1' }}>
          <div className="stat-top">
            <span className="stat-label">Total Transactions</span>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Activity size={18} />
            </div>
          </div>
          <div className="stat-value" id="stat-total-tx">{stats?.total_transactions ?? '...'}</div>
          <div className="stat-sub">Live SQLite persistent records</div>
        </div>

        <div className="glass-panel stat-card" style={{ '--card-accent': '#06b6d4' }}>
          <div className="stat-top">
            <span className="stat-label">Processed Volume</span>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="stat-value" id="stat-total-vol">
            INR {stats?.total_volume ? stats.total_volume.toLocaleString('en-IN') : '0'}
          </div>
          <div className="stat-sub">Total financial activity</div>
        </div>

        <div className="glass-panel stat-card" style={{ '--card-accent': '#ef4444' }}>
          <div className="stat-top">
            <span className="stat-label">Blocked Fraud</span>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="stat-value" id="stat-blocked-count" style={{ color: '#f87171' }}>
            {stats?.blocked_count ?? '0'}
          </div>
          <div className="stat-sub">High-risk threats stopped (Risk ≥ 70)</div>
        </div>

        <div className="glass-panel stat-card" style={{ '--card-accent': '#f59e0b' }}>
          <div className="stat-top">
            <span className="stat-label">Flagged Alerts</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-value" id="stat-alerts-count" style={{ color: '#fbbf24' }}>
            {stats?.total_alerts ?? '0'}
          </div>
          <div className="stat-sub">Requires manual analyst review</div>
        </div>
      </div>
      {/* ML Model Performance */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            className="stat-icon"
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8'
            }}
          >
            <Cpu size={20} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Random Forest Model Performance
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Evaluation on held-out synthetic test data
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem'
        }}>
          <div className="stat-card">
            <div className="stat-label">Accuracy</div>
            <div className="stat-value">
              {mlMetrics ? `${mlMetrics.accuracy}%` : '...'}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Precision</div>
            <div className="stat-value">
              {mlMetrics ? `${mlMetrics.precision}%` : '...'}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Recall</div>
            <div className="stat-value">
              {mlMetrics ? `${mlMetrics.recall}%` : '...'}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">F1 Score</div>
            <div className="stat-value">
              {mlMetrics ? `${mlMetrics.f1_score}%` : '...'}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          Note: Metrics are based on synthetic test data and are not production performance claims.
        </div>
      </div>
      {/* Decision Distribution Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Risk Decision Distribution</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Proportion of transactions classified by risk tiers</p>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }}></span>
              Allow ({stats?.allowed_count || 0})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }}></span>
              Review ({stats?.review_count || 0})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444' }}></span>
              Block ({stats?.blocked_count || 0})
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '14px',
          borderRadius: '7px',
          background: 'rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          gap: '2px'
        }}>
          <div style={{ width: `${allowPct}%`, background: '#10b981', transition: 'width 0.5s ease' }} title={`Allow: ${allowPct}%`} />
          <div style={{ width: `${reviewPct}%`, background: '#f59e0b', transition: 'width 0.5s ease' }} title={`Review: ${reviewPct}%`} />
          <div style={{ width: `${blockPct}%`, background: '#ef4444', transition: 'width 0.5s ease' }} title={`Block: ${blockPct}%`} />
        </div>
      </div>

      {/* Live Recent Transactions Feed */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Transactions Stream</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Latest transactions analyzed by rules engine & scikit-learn model</p>
          </div>
          <button
            id="dash-view-all-alerts-btn"
            className="secondary-btn"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
            onClick={() => setActivePage('alerts')}
          >
            <span>View All Alerts</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table" id="dashboard-recent-tx-table">
            <thead>
              <tr>
                <th>Tx Reference</th>
                <th>User / Account</th>
                <th>Amount</th>
                <th>Device</th>
                <th>Location</th>
                <th>Risk Score</th>
                <th>Decision</th>
                <th>Evaluation Summary</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_transactions?.length > 0 ? (
                stats.recent_transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{tx.transaction_ref}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>ID #{tx.id}</div>
                    </td>
                    <td>{tx.user_id}</td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>INR {Number(tx.amount).toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: tx.device === 'New' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: tx.device === 'New' ? '#fca5a5' : '#cbd5e1'
                      }}>
                        {tx.device}
                      </span>
                    </td>
                    <td>{tx.location}</td>
                    <td>
                      <RiskScorePill score={tx.risk_score} />
                    </td>
                    <td>
                      <DecisionBadge decision={tx.decision} />
                    </td>
                    <td style={{ maxWidth: '250px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {Array.isArray(tx.reasons) ? tx.reasons.join(', ') : tx.reasons}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No transactions recorded yet. Click "Submit Transaction" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
