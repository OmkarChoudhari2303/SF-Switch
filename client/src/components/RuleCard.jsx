import { useState } from 'react';

export default function RuleCard({ rule, onToggle, isModified }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rule-card ${rule.active ? 'rule-active' : 'rule-inactive'} ${isModified ? 'rule-modified' : ''}`}>
      <div className="rule-card-header">
        <div className="rule-info">
          <div className="rule-name-row">
            <h3 className="rule-name">{rule.name}</h3>
            {isModified && <span className="rule-modified-badge">Modified</span>}
          </div>
          {rule.description && (
            <p className="rule-description">{rule.description}</p>
          )}
        </div>

        <div className="rule-controls">
          <span className={`rule-status-badge ${rule.active ? 'badge-active' : 'badge-inactive'}`}>
            {rule.active ? 'Active' : 'Inactive'}
          </span>
          <label className="toggle-switch" htmlFor={`toggle-${rule.id}`}>
            <input
              type="checkbox"
              id={`toggle-${rule.id}`}
              checked={rule.active}
              onChange={() => onToggle(rule.id)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <button
        className="rule-expand-btn"
        onClick={() => setExpanded(!expanded)}
        id={`expand-${rule.id}`}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`expand-icon ${expanded ? 'expanded' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div className="rule-details">
          <div className="detail-group">
            <label>Error Condition Formula</label>
            <code className="detail-code">{rule.errorConditionFormula || 'N/A'}</code>
          </div>
          <div className="detail-group">
            <label>Error Message</label>
            <p className="detail-text">{rule.errorMessage || 'N/A'}</p>
          </div>
          {rule.errorDisplayField && (
            <div className="detail-group">
              <label>Error Display Field</label>
              <p className="detail-text">{rule.errorDisplayField}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
