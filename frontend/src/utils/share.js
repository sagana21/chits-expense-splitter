import { rupees } from './format.js';

/** Plain-text settle-up summary for WhatsApp / clipboard. */
export function summaryText(data) {
  const lines = [`*${data.group.name}*`, `Total spent: ${rupees(data.totalSpent)}`, ''];
  if (data.settleUp.length === 0) lines.push('Everyone is settled up ✅');
  else data.settleUp.forEach((t) => lines.push(`${t.from.name} pays ${t.to.name} ${rupees(t.amount)}`));
  lines.push('', 'Split with Chits');
  return lines.join('\n');
}

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;

/** Downloads every expense of the group as a CSV file (opens fine in Excel). */
export function downloadCsv(data) {
  const header = ['Date', 'Description', 'Category', 'Paid by', 'Amount (INR)', 'Type', 'Split between'];
  const rows = data.expenses.map((e) => [
    new Date(e.date || e.createdAt).toLocaleDateString('en-IN'),
    e.description,
    e.isPayment ? 'Payment' : e.category,
    e.paidBy.name,
    (e.amount / 100).toFixed(2),
    e.isPayment ? 'payment' : e.splitType,
    e.splits.map((s) => `${s.user.name} (${(s.share / 100).toFixed(2)})`).join('; '),
  ]);
  const csv = '\uFEFF' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.group.name.replace(/[^\w-]+/g, '_')}-expenses.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
