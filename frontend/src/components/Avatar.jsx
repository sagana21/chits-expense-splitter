// Coloured circle with initials. The colour is picked from the name so a person always looks the same.
const PALETTE = [
  ['#ffe3d6', '#9a3f1c'], ['#dcf3e7', '#14694a'], ['#e3e4ff', '#3b3bb5'],
  ['#fff0c2', '#7a5a00'], ['#f9ddf0', '#8b2c6d'], ['#d9eef9', '#175e82'],
];
// FNV-1a: spreads similar names across the palette
const hash = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

export default function Avatar({ name = '', size = 40 }) {
  const [bg, fg] = PALETTE[hash(name) % PALETTE.length];
  return (
    <span className="avatar" title={name}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.38 }}>
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, max = 5 }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="avatar-stack" aria-label={`${names.length} people`}>
      {shown.map((n) => <Avatar key={n} name={n} size={34} />)}
      {extra > 0 && <span className="avatar more" style={{ width: 34, height: 34 }}>+{extra}</span>}
    </div>
  );
}
