import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';

const SF_CLIENT_ID = import.meta.env.VITE_SF_CLIENT_ID || '';
const SF_LOGIN_URL = import.meta.env.VITE_SF_LOGIN_URL || 'https://login.salesforce.com';
const REDIRECT_URI = `${window.location.origin}/oauth/callback`;

export default function LoginButton() {
  async function handleLogin() {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    // Store verifier for the callback to use
    sessionStorage.setItem('pkce_code_verifier', verifier);

    const authUrl = new URL(`${SF_LOGIN_URL}/services/oauth2/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', SF_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('scope', 'full refresh_token');

    window.location.href = authUrl.toString();
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-glow"></div>
        <div className="login-content">
          <div className="login-icon">
            <svg viewBox="0 0 100 100" width="80" height="80">
              <defs>
                <linearGradient id="sfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00A1E0" />
                  <stop offset="100%" stopColor="#0176D3" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="url(#sfGrad)" />
              <text x="50" y="62" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" fontFamily="Arial">SF</text>
            </svg>
          </div>
          <h1 className="login-title">SF Switch</h1>
          <p className="login-subtitle">
            Manage your Salesforce validation rules with ease.
            <br />
            Toggle, deploy, and stay in control.
          </p>
          <button className="login-btn" onClick={handleLogin} id="salesforce-login-btn">
            <svg className="login-btn-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Connect to Salesforce
          </button>
          <p className="login-footer">
            Secured with OAuth 2.0 + PKCE
          </p>
        </div>
      </div>
    </div>
  );
}
