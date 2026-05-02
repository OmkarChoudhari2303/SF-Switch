import { Router } from 'express';

const router = Router();

const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;

/**
 * POST /api/auth/token
 * Exchange authorization code for access token (OAuth 2.0 + PKCE)
 */
router.post('/token', async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;

    if (!code || !codeVerifier || !redirectUri) {
      return res.status(400).json({ error: 'Missing required parameters: code, codeVerifier, redirectUri' });
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri
    });

    const response = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Token exchange failed:', data);
      return res.status(response.status).json({ error: data.error_description || 'Token exchange failed' });
    }

    res.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      instance_url: data.instance_url,
      token_type: data.token_type,
      id: data.id
    });
  } catch (err) {
    console.error('Token exchange error:', err);
    res.status(500).json({ error: 'Internal server error during token exchange' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh an expired access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Missing refreshToken' });
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
      refresh_token: refreshToken
    });

    const response = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error_description || 'Token refresh failed' });
    }

    res.json({
      access_token: data.access_token,
      instance_url: data.instance_url
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ error: 'Internal server error during token refresh' });
  }
});

/**
 * POST /api/auth/userinfo
 * Get the current user's info from Salesforce
 */
router.post('/userinfo', async (req, res) => {
  try {
    const { accessToken, instanceUrl } = req.body;

    if (!accessToken || !instanceUrl) {
      return res.status(400).json({ error: 'Missing accessToken or instanceUrl' });
    }

    const response = await fetch(`${instanceUrl}/services/oauth2/userinfo`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch user info' });
    }

    res.json(data);
  } catch (err) {
    console.error('Userinfo error:', err);
    res.status(500).json({ error: 'Internal server error fetching user info' });
  }
});

export default router;
