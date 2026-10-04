import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService, TOKEN_KEY } from '../services/api';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setUser(null); }, []);
  const persist = useCallback(({ token, user: u }) => { localStorage.setItem(TOKEN_KEY, token); setUser(u); return u; }, []);
  const login = useCallback(async (creds) => persist(await authService.login(creds)), [persist]);
  const register = useCallback(async (body) => persist(await authService.register(body)), [persist]);
  const updateProfile = useCallback(async (body) => {
    const r = await authService.updateMe(body);
    setUser(r.user);
    return r.user;
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService.me().then((r) => setUser(r.user)).catch(logout).finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  const value = useMemo(() => ({ user, loading, isAdmin: user?.role === 'admin', login, register, logout, updateProfile }), [user, loading, login, register, logout, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
