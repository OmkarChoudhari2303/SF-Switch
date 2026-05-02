import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('sf_access_token'));
  const [instanceUrl, setInstanceUrl] = useState(() => sessionStorage.getItem('sf_instance_url'));
  const [refreshToken, setRefreshToken] = useState(() => sessionStorage.getItem('sf_refresh_token'));
  const [userInfo, setUserInfo] = useState(() => {
    const stored = sessionStorage.getItem('sf_user_info');
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = !!accessToken && !!instanceUrl;

  function setTokens({ access_token, instance_url, refresh_token }) {
    setAccessToken(access_token);
    setInstanceUrl(instance_url);
    if (refresh_token) setRefreshToken(refresh_token);

    sessionStorage.setItem('sf_access_token', access_token);
    sessionStorage.setItem('sf_instance_url', instance_url);
    if (refresh_token) sessionStorage.setItem('sf_refresh_token', refresh_token);
  }

  function setUser(info) {
    setUserInfo(info);
    sessionStorage.setItem('sf_user_info', JSON.stringify(info));
  }

  function logout() {
    setAccessToken(null);
    setInstanceUrl(null);
    setRefreshToken(null);
    setUserInfo(null);
    sessionStorage.removeItem('sf_access_token');
    sessionStorage.removeItem('sf_instance_url');
    sessionStorage.removeItem('sf_refresh_token');
    sessionStorage.removeItem('sf_user_info');
  }

  return (
    <AuthContext.Provider value={{
      accessToken,
      instanceUrl,
      refreshToken,
      userInfo,
      isAuthenticated,
      setTokens,
      setUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
