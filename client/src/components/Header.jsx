import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { userInfo, instanceUrl, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-logo">
          <svg viewBox="0 0 100 100" width="36" height="36">
            <defs>
              <linearGradient id="hGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00A1E0" />
                <stop offset="100%" stopColor="#0176D3" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#hGrad)" />
            <text x="50" y="62" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" fontFamily="Arial">SF</text>
          </svg>
        </div>
        <h1 className="header-title">SF Switch</h1>
      </div>

      <div className="header-right">
        {userInfo && (
          <div className="header-user-info">
            <span className="header-user-name">{userInfo.name || userInfo.preferred_username}</span>
            <span className="header-org-url">{instanceUrl ? new URL(instanceUrl).hostname : ''}</span>
          </div>
        )}
        <button className="header-logout-btn" onClick={handleLogout} id="logout-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
