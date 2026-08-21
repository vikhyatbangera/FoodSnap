import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { updateSettings } from '../api/users';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [hasStoredTheme] = useState(() => Boolean(localStorage.getItem('foodsnap_theme')));
  const [theme, setTheme] = useState(() => localStorage.getItem('foodsnap_theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('foodsnap_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user?.settings?.theme && !hasStoredTheme) setTheme(user.settings.theme);
  }, [hasStoredTheme, user]);

  async function toggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (user) {
      try {
        await updateSettings({ theme: nextTheme });
      } catch {
        // The local preference remains useful if the server is temporarily unavailable.
      }
    }
  }

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
