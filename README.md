# SF Switch — Salesforce Validation Rule Manager

A web application to manage Salesforce Account validation rules. Connect to your Salesforce org via OAuth 2.0, fetch validation rules, toggle them on/off, and deploy changes — all from a modern web interface.

## Architecture

- **Frontend**: React + Vite (port 5173)
- **Backend**: Express.js proxy server (port 3001)
- **Auth**: OAuth 2.0 Authorization Code Flow with PKCE
- **API**: Salesforce Tooling API v62.0

## Setup

### 1. Salesforce Configuration
- Create a Developer Org at [developer.salesforce.com/signup](https://developer.salesforce.com/signup)
- Create validation rules on the Account object
- Create a Connected App with OAuth + PKCE enabled
- Set callback URL to `http://localhost:5173/oauth/callback`

### 2. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your Consumer Key and Consumer Secret
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd client
# Edit .env with your Consumer Key (VITE_SF_CLIENT_ID)
npm install
npm run dev
```

### 4. Open the App
Navigate to `http://localhost:5173` and click "Connect to Salesforce".

## Environment Variables

### Server (`server/.env`)
| Variable | Description |
|----------|-------------|
| `SF_CLIENT_ID` | Connected App Consumer Key |
| `SF_CLIENT_SECRET` | Connected App Consumer Secret |
| `SF_LOGIN_URL` | Salesforce login URL (default: `https://login.salesforce.com`) |
| `PORT` | Server port (default: 3001) |
| `CLIENT_URL` | Frontend URL (default: `http://localhost:5173`) |

### Client (`client/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_SF_CLIENT_ID` | Connected App Consumer Key |
| `VITE_SF_LOGIN_URL` | Salesforce login URL (default: `https://login.salesforce.com`) |
