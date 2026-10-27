import { useState } from 'react';

/** Light/dark theme saved in localStorage. index.html sets the first value before the page paints. */
export function useTheme() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || 'light');
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('chits_theme', next); } catch { /* private mode: ignore */ }
    setTheme(next);
  };
  return [theme, toggle];
}
