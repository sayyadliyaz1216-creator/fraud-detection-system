import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Save, 
  User, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { DecisionBadge, RiskScorePill } from '../components/RiskBadge';

export default function CasesPage({ selectedCaseRef }) {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editStatus, setEditStatus] = useState('OPEN');
  const [editNotes, setEditNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/cases');
      if (!res.ok) throw new Error('Failed to load fraud investigation cases');
      const data = await res.json();
      setCases(data);
      if (data.length > 0) {
        if (selectedCaseRef) {
          const match = data.find(c => c.case_ref === selectedCaseRef || c.transaction_ref === selectedCaseRef);
          if (match) {
            selectCase(match);
            return;
          }
        }
        if (!selectedCase) {
          selectCase(data[0]);
        }
      }
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectCase = (c) => {
    setSelectedCase(c);
    setEditStatus(c.status);
    setEditNotes(c.notes || '');
    setSuccessMsg('');
  };

  useEffect(() => {
    fetchCases();
  }, [selectedCaseRef]);

  // Real backend update call
  const handleUpdateCase = async (e) => {
    e?.preventDefault();
    if (!selectedCase) return;

    try {
      setUpdating(true);
      setSuccessMsg('');
      setError('');

      const res = await fetch(`http://localhost:8000/api/cases/${selectedCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
          assigned_to: 'Security Officer'
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Failed to update case');
      }

      setSuccessMsg(`Case ${selectedCase.case_ref} updated successfully!`);

      // Update local state
      setSelectedCase(prev => ({
        ...prev,
        status: editStatus,
        notes: editNotes
      }));

      // Refresh list
      setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, status: editStatus, notes: editNotes } : c));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fraud Investigation Cases</h1>
          <p className="page-subtitle">Security analyst workspace for investigating, tagging, and resolving flagged incidents</p>
        </div>
        <button 
          id="cases-refresh-btn"
          className="secondary-btn" 
          onClick={fetchCases}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Cases</span>
        </button>
      </div>

      {error && (
        <div className="info-banner" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="info-banner" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.4fr)', gap: '1.75rem', alignItems: 'start' }}>
        
        {/* Left Column: Cases List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: '#818cf8' }} />
            <span>Active Cases ({cases.length})</span>
          </h2>

          {cases.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '1rem 0' }}>
              No fraud cases registered yet. Suspicious transactions (REVIEW or BLOCK) will auto-generate cases.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '650px', overflowY: 'auto' }} id="cases-list-scroll">
              {cases.map(c => {
                const isSelected = selectedCase?.id === c.id;
                const isBlock = c.decision === 'BLOCK';

                return (
                  <div
                    key={c.id}
                    id={`case-card-${c.id}`}
                    onClick={() => selectCase(c)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontFamily: 'monospace', color: '#ffffff', fontSize: '0.92rem' }}>
                        {c.case_ref}
                      </strong>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: c.status === 'RESOLVED_LEGIT' ? 'rgba(16, 185, 129, 0.2)' : 
                                    c.status === 'RESOLVED_FRAUD' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: c.status === 'RESOLVED_LEGIT' ? '#34d399' : 
                               c.status === 'RESOLVED_FRAUD' ? '#f87171' : '#fbbf24'
                      }}>
                        {c.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Tx: {c.transaction_ref}</span>
                      <span>INR {Number(c.amount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Case Details & Resolution Workspace */}
        {selectedCase ? (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)' }}>
                  Case Docket
                </span>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                  {selectedCase.case_ref}
                </h3>
              </div>
              <DecisionBadge decision={selectedCase.decision} />
            </div>

            {/* Transaction Data Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Amount</span>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>INR {Number(selectedCase.amount).toLocaleString('en-IN')}</p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Risk Score</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <RiskScorePill score={selectedCase.risk_score} />
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Device & Location</span>
                <p style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>{selectedCase.device} device in {selectedCase.location}</p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Target User</span>
                <p style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>{selectedCase.user_id}</p>
              </div>
            </div>

            {/* Reasons flagged */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 600 }}>
                Rule Violations Detected:
              </span>
              <ul style={{ listStyle: 'none', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {Array.isArray(selectedCase.reasons) ? selectedCase.reasons.map((r, i) => (
                  <li key={i} style={{ fontSize: '0.84rem', color: '#fca5a5', display: 'flex', gap: '0.5rem' }}>
                    <span>•</span>
                    <span>{r}</span>
                  </li>
                )) : <li>{selectedCase.reasons}</li>}
              </ul>
            </div>

            {/* Investigation Form */}
            <form onSubmit={handleUpdateCase} id="case-update-form" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#cbd5e1' }}>
                Investigator Action & Case Status
              </h4>

              <div className="form-group">
                <label className="form-label" htmlFor="case-status-select">Investigation Disposition</label>
                <select
                  id="case-status-select"
                  className="form-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="OPEN">OPEN (Awaiting Review)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Active Investigation)</option>
                  <option value="RESOLVED_FRAUD">RESOLVED_FRAUD (Confirmed Fraudulent Transaction)</option>
                  <option value="RESOLVED_LEGIT">RESOLVED_LEGIT (False Positive - Legitimate User)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="case-notes-input">Analyst Case Notes</label>
                <textarea
                  id="case-notes-input"
                  className="form-input"
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record verification notes, customer interview findings, or chargeback details..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                id="case-save-btn"
                className="primary-btn"
                disabled={updating}
                style={{ width: '100%', padding: '0.85rem' }}
              >
                {updating ? (
                  <span>Saving to SQLite...</span>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Case Disposition</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a case on the left to view details and update its disposition.
          </div>
        )}
      </div>
    </div>
  );
}
