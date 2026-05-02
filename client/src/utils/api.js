/**
 * API utility for communicating with the Express backend proxy
 */

const API_BASE = 'http://localhost:3001/api';

/**
 * Exchange OAuth authorization code for tokens
 */
export async function exchangeCodeForTokens(code, codeVerifier, redirectUri) {
  const res = await fetch(`${API_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, codeVerifier, redirectUri })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Token exchange failed');
  }

  return res.json();
}

/**
 * Fetch user info from Salesforce
 */
export async function fetchUserInfo(accessToken, instanceUrl) {
  const res = await fetch(`${API_BASE}/auth/userinfo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, instanceUrl })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch user info');
  }

  return res.json();
}

/**
 * Fetch all validation rules for the Account object
 */
export async function fetchValidationRules(accessToken, instanceUrl) {
  const res = await fetch(`${API_BASE}/rules`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-SFDC-Instance-URL': instanceUrl
    }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch validation rules');
  }

  return res.json();
}

/**
 * Deploy validation rule changes to Salesforce
 */
export async function deployChanges(accessToken, instanceUrl, changes) {
  const res = await fetch(`${API_BASE}/rules/deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-SFDC-Instance-URL': instanceUrl
    },
    body: JSON.stringify({ changes })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Deployment failed');
  }

  return res.json();
}
