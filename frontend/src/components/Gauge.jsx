// Segmented arc gauge. `progress` is 0..1. Children are drawn in the middle.
const N = 11;
const START = -125;
const END = 125;
const R = 100;

export default function Gauge({ progress = 0, children, label }) {
  const filled = Math.round(Math.min(Math.max(progress, 0), 1) * N);
  return (
    <div className="gauge" role="img" aria-label={label}>
      <svg viewBox="-125 -128 250 210">
        {Array.from({ length: N }, (_, i) => {
          const angle = START + ((END - START) * i) / (N - 1);
          const on = i < filled;
          return (
            <rect key={i} x={-13} y={-R - 17} width={26} height={34} rx={11}
              transform={`rotate(${angle})`}
              className={on ? 'seg on' : 'seg'}
              style={on ? { animationDelay: `${i * 45}ms` } : undefined} />
          );
        })}
      </svg>
      <div className="gauge-center">{children}</div>
    </div>
  );
}
