import RuleCard from './RuleCard';

export default function RuleList({ rules, originalRules, onToggle, onActivateAll, onDeactivateAll }) {
  const activeCount = rules.filter(r => r.active).length;
  const inactiveCount = rules.length - activeCount;
  const modifiedIds = getModifiedIds(rules, originalRules);

  return (
    <div className="rule-list-container">
      <div className="rule-list-toolbar">
        <div className="rule-stats">
          <span className="stat-item stat-total">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {rules.length} Rules
          </span>
          <span className="stat-item stat-active">
            <span className="stat-dot dot-active"></span>
            {activeCount} Active
          </span>
          <span className="stat-item stat-inactive">
            <span className="stat-dot dot-inactive"></span>
            {inactiveCount} Inactive
          </span>
          {modifiedIds.size > 0 && (
            <span className="stat-item stat-modified">
              <span className="stat-dot dot-modified"></span>
              {modifiedIds.size} Modified
            </span>
          )}
        </div>

        <div className="rule-actions">
          <button
            className="action-btn btn-activate-all"
            onClick={onActivateAll}
            id="activate-all-btn"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Activate All
          </button>
          <button
            className="action-btn btn-deactivate-all"
            onClick={onDeactivateAll}
            id="deactivate-all-btn"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Deactivate All
          </button>
        </div>
      </div>

      <div className="rule-list">
        {rules.map(rule => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onToggle={onToggle}
            isModified={modifiedIds.has(rule.id)}
          />
        ))}
      </div>
    </div>
  );
}

function getModifiedIds(rules, originalRules) {
  const modified = new Set();
  for (const rule of rules) {
    const original = originalRules.find(r => r.id === rule.id);
    if (original && original.active !== rule.active) {
      modified.add(rule.id);
    }
  }
  return modified;
}
