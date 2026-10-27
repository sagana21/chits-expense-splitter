export default function EmptyState({ title, text }) {
  return (
    <div className="card empty-state">
      <svg width="96" height="80" viewBox="0 0 96 80" fill="none" aria-hidden="true">
        <rect x="14" y="10" width="50" height="62" rx="10" className="es-back" />
        <rect x="26" y="4" width="50" height="62" rx="10" className="es-front" />
        <rect x="35" y="18" width="26" height="5" rx="2.5" className="es-line" />
        <rect x="35" y="30" width="32" height="5" rx="2.5" className="es-line" />
        <rect x="35" y="42" width="20" height="5" rx="2.5" className="es-line" />
        <circle cx="72" cy="58" r="14" className="es-coin" />
        <path d="M72 51v14M68 55h6a3 3 0 0 1 0 6h-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}
