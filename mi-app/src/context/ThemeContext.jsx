import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../db/db';

const ThemeContext = createContext();
const ACCENTS = {
  bosque: { primary: '#184a42', hover: '#133c35', soft: '#eaf4f1' },
  esmeralda: { primary: '#1b7a4e', hover: '#145f3c', soft: '#ebf8f2' },
  teal: { primary: '#0f766e', hover: '#0b5e58', soft: '#e7f6f4' },
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [accent, setAccentState] = useState('bosque');

  useEffect(() => {
    Promise.all([db.configuracion.get('theme'), db.configuracion.get('accent'), db.configuracion.get('themeModeVersion')]).then(async ([themeItem, accentItem, versionItem]) => {
      const isNewThemeModel = versionItem?.value === 2;
      const savedTheme = isNewThemeModel && themeItem?.value === 'dark' ? 'dark' : 'light';
      const savedAccent = ACCENTS[accentItem?.value] ? accentItem.value : 'bosque';
      setThemeState(savedTheme);
      setAccentState(savedAccent);
      if (!isNewThemeModel || themeItem?.value !== savedTheme) {
        await db.configuracion.bulkPut([{ key: 'theme', value: savedTheme }, { key: 'themeModeVersion', value: 2 }]);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const colors = ACCENTS[accent] || ACCENTS.bosque;
    const root = document.documentElement;
    root.dataset.accent = accent;
    root.style.setProperty('--accent', colors.primary);
    root.style.setProperty('--accent-hover', colors.hover);
    root.style.setProperty('--accent-soft', colors.soft);
  }, [accent]);

  const setTheme = async (nextTheme) => {
    const safeTheme = nextTheme === 'dark' ? 'dark' : 'light';
    setThemeState(safeTheme);
    await db.configuracion.put({ key: 'theme', value: safeTheme });
  };

  const setAccent = async (nextAccent) => {
    if (!ACCENTS[nextAccent]) return;
    setAccentState(nextAccent);
    await db.configuracion.put({ key: 'accent', value: nextAccent });
  };

  return <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
