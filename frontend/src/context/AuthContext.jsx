import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

function persistSession(token, user) {
  if (token) localStorage.setItem('foodsnap_token', token);
  if (user) localStorage.setItem('foodsnap_user', JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('foodsnap_user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('foodsnap_token')));

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('foodsnap:logout', handleLogout);
    if (!localStorage.getItem('foodsnap_token')) {
      setLoading(false);
      return () => window.removeEventListener('foodsnap:logout', handleLogout);
    }
    authApi.getMe()
      .then(({ user: hydratedUser }) => {
        setUser(hydratedUser);
        persistSession(null, hydratedUser);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
    return () => window.removeEventListener('foodsnap:logout', handleLogout);
  }, []);

  async function login(credentials) {
    const result = await authApi.login(credentials);
    persistSession(result.token, result.user);
    setUser(result.user);
    return result.user;
  }

  async function register(payload) {
    const result = await authApi.register(payload);
    persistSession(result.token, result.user);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    localStorage.removeItem('foodsnap_token');
    localStorage.removeItem('foodsnap_user');
    setUser(null);
  }

  function updateUser(nextUser) {
    setUser(nextUser);
    persistSession(null, nextUser);
  }

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateUser
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
