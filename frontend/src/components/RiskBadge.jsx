import React from 'react';
import { CheckCircle2, AlertCircle, Ban } from 'lucide-react';

export function DecisionBadge({ decision }) {
  const dec = (decision || '').toUpperCase();

  if (dec === 'ALLOW') {
    return (
      <span className="decision-badge decision-allow" id="badge-allow">
        <CheckCircle2 size={13} />
        <span>ALLOW</span>
      </span>
    );
  }

  if (dec === 'REVIEW') {
    return (
      <span className="decision-badge decision-review" id="badge-review">
        <AlertCircle size={13} />
        <span>REVIEW</span>
      </span>
    );
  }

  return (
    <span className="decision-badge decision-block" id="badge-block">
      <Ban size={13} />
      <span>BLOCK</span>
    </span>
  );
}

export function RiskScorePill({ score }) {
  const numScore = Number(score) || 0;
  let riskClass = 'risk-low';

  if (numScore >= 70) {
    riskClass = 'risk-high';
  } else if (numScore >= 40) {
    riskClass = 'risk-med';
  }

  return (
    <div className={`risk-meter ${riskClass}`} title={`Risk Score: ${numScore}/100`}>
      <span className="risk-dot"></span>
      <span>{numScore} / 100</span>
    </div>
  );
}
