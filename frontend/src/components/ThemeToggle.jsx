import { useTheme } from '../hooks/useTheme.js';
import { MoonIcon, SunIcon } from './Icons.jsx';

export default function ThemeToggle({ row = false }) {
  const [theme, toggle] = useTheme();
  const dark = theme === 'dark';
  if (row) {
    return (
      <button className="btn ghost block" onClick={toggle}>
        {dark ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
        {dark ? 'Switch to light mode' : 'Switch to dark mode'}
      </button>
    );
  }
  return (
    <button className="icon-btn" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
