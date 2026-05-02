import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchValidationRules, deployChanges } from '../utils/api';
import Header from './Header';
import RuleList from './RuleList';

export default function Dashboard() {
  const { accessToken, instanceUrl } = useAuth();
  const [rules, setRules] = useState([]);
  const [originalRules, setOriginalRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [toast, setToast] = useState(null);

  const modifiedCount = rules.filter((r, i) => {
    const orig = originalRules.find(o => o.id === r.id);
    return orig && orig.active !== r.active;
  }).length;

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  const handleFetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchValidationRules(accessToken, instanceUrl);
      setRules(data.rules);
      setOriginalRules(JSON.parse(JSON.stringify(data.rules)));
      setFetched(true);
      showToast(`Loaded ${data.rules.length} validation rules from Salesforce`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [accessToken, instanceUrl]);

  function handleToggle(id) {
    setRules(prev =>
      prev.map(r => r.id === id ? { ...r, active: !r.active } : r)
    );
  }

  function handleActivateAll() {
    setRules(prev => prev.map(r => ({ ...r, active: true })));
  }

  function handleDeactivateAll() {
    setRules(prev => prev.map(r => ({ ...r, active: false })));
  }

  async function handleDeploy() {
    const changes = [];
    for (const rule of rules) {
      const original = originalRules.find(o => o.id === rule.id);
      if (original && original.active !== rule.active) {
        changes.push({
          id: rule.id,
          metadata: {
            ...rule.metadata,
            active: rule.active
          }
        });
      }
    }

    if (changes.length === 0) {
      showToast('No changes to deploy', 'info');
      return;
    }

    setDeploying(true);
    try {
      const result = await deployChanges(accessToken, instanceUrl, changes);
      if (result.failed > 0) {
        showToast(`Deployed ${result.successful}/${result.totalChanges} — ${result.failed} failed`, 'error');
      } else {
        showToast(`Successfully deployed ${result.successful} change(s) to Salesforce! ✓`);
      }
      // Refresh rules from Salesforce to get the latest state
      await handleFetchRules();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div className="dashboard">
      <Header />

      {toast && (
        <div className={`toast toast-${toast.type}`} id="toast-notification">
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      <main className="dashboard-main">
        <div className="dashboard-hero">
          <h2 className="dashboard-title">Validation Rule Manager</h2>
          <p className="dashboard-subtitle">
            Fetch, toggle, and deploy Account validation rules directly to your Salesforce org.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="primary-btn fetch-btn"
            onClick={handleFetchRules}
            disabled={loading}
            id="fetch-rules-btn"
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Fetching...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                {fetched ? 'Refresh Rules' : 'Fetch Validation Rules'}
              </>
            )}
          </button>

          {fetched && (
            <button
              className={`primary-btn deploy-btn ${modifiedCount > 0 ? 'deploy-ready' : ''}`}
              onClick={handleDeploy}
              disabled={deploying || modifiedCount === 0}
              id="deploy-btn"
            >
              {deploying ? (
                <>
                  <span className="btn-spinner"></span>
                  Deploying...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                  Deploy Changes {modifiedCount > 0 && `(${modifiedCount})`}
                </>
              )}
            </button>
          )}
        </div>

        {loading && !fetched && (
          <div className="skeleton-container">
            {[1, 2, 3, 4, 5].map(i => (
              <div className="skeleton-card" key={i}>
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-desc"></div>
                <div className="skeleton-toggle"></div>
              </div>
            ))}
          </div>
        )}

        {fetched && rules.length > 0 && (
          <RuleList
            rules={rules}
            originalRules={originalRules}
            onToggle={handleToggle}
            onActivateAll={handleActivateAll}
            onDeactivateAll={handleDeactivateAll}
          />
        )}

        {fetched && rules.length === 0 && !loading && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <h3>No Validation Rules Found</h3>
            <p>No validation rules were found on the Account object in this org.</p>
          </div>
        )}
      </main>
    </div>
  );
}
