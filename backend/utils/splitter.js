// Pure money logic: no Express, no database. All amounts are integer paise.

/** Split `amount` equally. Leftover paise go one each to the first people,
 *  so the shares always add up to exactly `amount`. */
export function splitEqual(amount, userIds) {
  if (!userIds.length) throw new Error('Pick at least one person to split with');
  const base = Math.floor(amount / userIds.length);
  const extra = amount % userIds.length;
  return Object.fromEntries(userIds.map((id, i) => [id, base + (i < extra ? 1 : 0)]));
}

/** expenses: [{ paidBy, amount, shares: { userId: share } }]
 *  Returns { userId: net }. Positive = is owed money. Negative = owes money. */
export function computeBalances(memberIds, expenses) {
  const bal = Object.fromEntries(memberIds.map((id) => [id, 0]));
  for (const e of expenses) {
    bal[e.paidBy] = (bal[e.paidBy] || 0) + e.amount;
    for (const [id, share] of Object.entries(e.shares)) {
      bal[id] = (bal[id] || 0) - share;
    }
  }
  return bal;
}

/** Greedy settle-up: match the biggest debtor with the biggest creditor until
 *  everyone is square. A group of N people needs at most N-1 payments. */
export function simplifyDebts(balances) {
  const byAmountThenId = (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]);
  const creditors = Object.entries(balances).filter(([, b]) => b > 0).sort(byAmountThenId);
  const debtors = Object.entries(balances)
    .filter(([, b]) => b < 0)
    .map(([id, b]) => [id, -b])
    .sort(byAmountThenId);

  const transfers = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i][1], creditors[j][1]);
    transfers.push({ from: debtors[i][0], to: creditors[j][0], amount: pay });
    debtors[i][1] -= pay;
    creditors[j][1] -= pay;
    if (debtors[i][1] === 0) i++;
    if (creditors[j][1] === 0) j++;
  }
  return transfers;
}

/** Split `amount` by percentages. entries: [{ id, percent }] (should add up to 100).
 *  Uses the "largest remainder" method so the shares add up to exactly `amount`. */
export function splitPercent(amount, entries) {
  const total = entries.reduce((s, e) => s + e.percent, 0);
  const raw = entries.map((e) => (amount * e.percent) / total);
  const shares = raw.map(Math.floor);
  let left = amount - shares.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => [r - shares[i], i])
    .sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let k = 0; left > 0; k++, left--) shares[order[k % order.length][1]] += 1;
  return Object.fromEntries(entries.map((e, i) => [e.id, shares[i]]));
}
