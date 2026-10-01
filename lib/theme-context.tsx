'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'oled';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycleTheme: () => void;
}

const themeOrder: Theme[] = ['light', 'dark', 'oled'];
const themeClass: Record<Theme, string> = {
  light: '',
  dark: 'dark',
  oled: 'oled',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  cycleTheme: () => {},
});

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove('dark', 'oled');
  if (themeClass[theme]) html.classList.add(themeClass[theme]);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('g-english-theme') as Theme | null;
    const initial: Theme = stored && themeOrder.includes(stored) ? stored : 'light';
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem('g-english-theme', t);
  };

  const cycleTheme = () => {
    const idx = themeOrder.indexOf(theme);
    const next = themeOrder[(idx + 1) % themeOrder.length];
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
