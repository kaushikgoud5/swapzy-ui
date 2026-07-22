import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('swapzy_theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('swapzy_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('swapzy_theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((v) => !v) };
}
