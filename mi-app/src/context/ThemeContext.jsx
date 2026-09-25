import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../db/db';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('auto');

  useEffect(() => {
    // Load initial theme from DB
    db.configuracion.get('theme').then((item) => {
      if (item && item.value) {
        setThemeState(item.value);
      }
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (mode) => {
      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.remove('dark');
      } else {
        // Auto - match system media query
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme(theme);

    // Listen for system changes if mode is auto
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    await db.configuracion.put({ key: 'theme', value: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
