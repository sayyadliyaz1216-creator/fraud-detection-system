import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  BrainCircuit, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { DecisionBadge } from './RiskBadge';

export default function DecisionModal({ result, onClose, onNavigateAlerts }) {
  if (!result) return null;

  const {
    transaction_id,
    transaction_ref,
    amount,
    device,
    location,
    user_id,
    risk_score,
    decision,
    reasons = [],
    ml_anomaly_score,
    ml_prediction,
    case_ref
  } = result;

  const isBlock = decision === 'BLOCK';
  const isReview = decision === 'REVIEW';
  const isAllow = decision === 'ALLOW';

  const accentColor = isBlock ? '#ef4444' : (isReview ? '#f59e0b' : '#10b981');
  const accentBg = isBlock ? 'rgba(239, 68, 68, 0.12)' : (isReview ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)');

  return (
    <div className="modal-overlay" id="decision-modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        id="decision-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `4px solid ${accentColor}` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: accentBg, 
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isBlock ? <ShieldAlert size={22} /> : (isReview ? <AlertTriangle size={22} /> : <ShieldCheck size={22} />)}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Transaction Evaluation</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>ID: {transaction_id} | Ref: {transaction_ref}</p>
            </div>
          </div>
          <button 
            id="modal-close-btn"
            onClick={onClose} 
            style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.4rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Big Verdict Header */}
        <div style={{ 
          background: accentBg, 
          padding: '1.25rem', 
          borderRadius: '12px', 
          border: `1px solid ${accentColor}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Final Decision
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: accentColor, letterSpacing: '-0.02em' }}>
                {decision}
              </span>
              <DecisionBadge decision={decision} />
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Calculated Risk Score
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
              {risk_score}<span style={{ fontSize: '1rem', color: 'var(--text-faint)' }}>/100</span>
            </div>
          </div>
        </div>

        {/* Transaction Summary Chips */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '0.75rem', 
          marginBottom: '1.5rem',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '0.85rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Amount</span>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>INR {Number(amount).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Device</span>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>{device}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Location</span>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>{location}</p>
          </div>
        </div>

        {/* Reasons Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.75rem' }}>
            Risk Evaluation Reasons:
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} id="modal-reasons-list">
            {reasons.map((r, i) => (
              <li 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.6rem',
                  fontSize: '0.88rem',
                  color: isBlock || isReview ? '#fecdd3' : '#a7f3d0',
                  background: isBlock || isReview ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px'
                }}
              >
                <span style={{ color: accentColor, marginTop: '2px' }}>•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Scikit-Learn AI Anomaly Indicator */}
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.08)', 
          border: '1px solid rgba(99, 102, 241, 0.25)', 
          borderRadius: '8px', 
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BrainCircuit size={18} style={{ color: '#818cf8' }} />
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e0e7ff' }}>Scikit-Learn AI Model</span>
              <p style={{ fontSize: '0.74rem', color: '#a5b4fc' }}>Random Forest Anomaly Assessment</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              fontSize: '0.78rem', 
              fontWeight: 700, 
              padding: '0.2rem 0.5rem', 
              borderRadius: '4px',
              background: ml_prediction === 'FRAUD' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: ml_prediction === 'FRAUD' ? '#f87171' : '#34d399'
            }}>
              {ml_prediction || 'NORMAL'} ({ml_anomaly_score || 0}%)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {(isReview || isBlock) && (
            <button 
              id="modal-btn-view-alert"
              className="secondary-btn" 
              onClick={() => {
                onClose();
                onNavigateAlerts();
              }}
            >
              <span>View in Alerts</span>
              <ArrowRight size={15} />
            </button>
          )}

          <button 
            id="modal-btn-submit-another"
            className="primary-btn" 
            onClick={onClose}
          >
            <span>Done / New Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
}
