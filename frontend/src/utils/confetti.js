const COLORS = ['#4c4cff', '#f4a340', '#2fb67c', '#e0559c', '#2aa9d6'];

/** Short confetti burst. Skipped for people who prefer reduced motion. */
export function burstConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div');
  box.className = 'confetti';
  box.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 42; i++) {
    const piece = document.createElement('i');
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = COLORS[i % COLORS.length];
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    piece.style.setProperty('--dx', `${Math.random() * 200 - 100}px`);
    piece.style.setProperty('--rot', `${Math.random() * 720}deg`);
    box.appendChild(piece);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2400);
}
