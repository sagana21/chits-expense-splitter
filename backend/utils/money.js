/** Rupees from the form (string or number) -> integer paise, or null if invalid. */
export function toPaise(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const paise = Math.round(n * 100);
  return paise > 0 ? paise : null;
}
