import { useCountUp } from '../hooks/useCountUp.js';
import { rupees } from '../utils/format.js';

// Shows an amount that counts up when it appears or changes.
export default function Money({ paise, className }) {
  const v = useCountUp(Math.abs(paise));
  return <span className={className}>{rupees(v)}</span>;
}
