import { createContext, useContext, useState, useEffect } from 'react';
import { loginBuyer, registerBuyer, getProfile } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'luxe_token';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      getProfile()
        .then(setUser)
        .catch(() => localStorage.removeItem(TOKEN_KEY))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    try {
      const data = await loginBuyer({ email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      const profile = await getProfile();
      setUser(profile);
      return { ok: true, user: profile };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function signup(data) {
    try {
      const res = await registerBuyer(data);
      localStorage.setItem(TOKEN_KEY, res.token);
      const profile = await getProfile();
      setUser(profile);
      return { ok: true, user: profile };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  function refreshUser() {
    return getProfile().then(setUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, isBuyer: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
