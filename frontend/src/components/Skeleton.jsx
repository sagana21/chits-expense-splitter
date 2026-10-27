// Grey shimmering placeholders shown while data loads.
export default function Skeleton({ height = 72, count = 1, radius = 20 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="skeleton" style={{ height, borderRadius: radius }} aria-hidden="true" />
  ));
}
