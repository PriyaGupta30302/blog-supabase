'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'blue' | 'green' | 'rose' | 'violet' | 'amber' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove all theme-related classes and attributes
    root.removeAttribute('data-theme');
    root.classList.remove('dark');

    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', newTheme);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

