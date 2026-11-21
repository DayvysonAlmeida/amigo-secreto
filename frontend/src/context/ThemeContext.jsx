import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const DARK_QUERY = '(prefers-color-scheme: dark)';

const savedTheme = () => {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
};

const systemTheme = () => (window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light');

export const ThemeProvider = ({ children }) => {
  // Segue o tema do aparelho até a pessoa escolher um no Perfil (o index.html já aplica antes de carregar).
  const [theme, setTheme] = useState(() => savedTheme() || systemTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY);
    if (!media) return undefined;
    const onChange = (e) => {
      if (!savedTheme()) setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Sem armazenamento (ex.: navegação privada): vale só nesta visita.
    }
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
