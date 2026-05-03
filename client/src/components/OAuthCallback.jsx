import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exchangeCodeForTokens, fetchUserInfo } from '../utils/api';

export default function OAuthCallback() {
  const [status, setStatus] = useState('Connecting to Salesforce...');
  const [error, setError] = useState(null);
  const { setTokens, setUser } = useAuth();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    async function handleCallback() {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const errorParam = params.get('error');

        if (errorParam) {
          setError(params.get('error_description') || 'Authorization failed');
          return;
        }

        if (!code) {
          setError('No authorization code received');
          return;
        }

        const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
        if (!codeVerifier) {
          setError('PKCE verifier not found. Please try logging in again.');
          return;
        }

        setStatus('Exchanging authorization code...');

        const redirectUri = `${window.location.origin}/oauth/callback`;
        const tokenData = await exchangeCodeForTokens(code, codeVerifier, redirectUri);

        setTokens(tokenData);
        sessionStorage.removeItem('pkce_code_verifier');

        setStatus('Fetching user info...');

        try {
          const userInfoData = await fetchUserInfo(tokenData.access_token, tokenData.instance_url);
          setUser(userInfoData);
        } catch {
          // Non-critical — proceed without user info
          console.warn('Could not fetch user info, continuing...');
        }

        setStatus('Success! Redirecting...');
        setTimeout(() => navigate('/dashboard', { replace: true }), 500);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
      }
    }

    handleCallback();
  }, []);

  return (
    <div className="callback-container">
      <div className="callback-card">
        {error ? (
          <>
            <div className="callback-icon callback-error-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="callback-title">Connection Failed</h2>
            <p className="callback-message callback-error">{error}</p>
            <button className="callback-retry-btn" onClick={() => navigate('/', { replace: true })}>
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="callback-spinner"></div>
            <h2 className="callback-title">{status}</h2>
            <p className="callback-message">Please wait while we establish a secure connection.</p>
          </>
        )}
      </div>
    </div>
  );
}
