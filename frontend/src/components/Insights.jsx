import { useState } from 'react';
import { categoryOf } from '../utils/categories.js';
import { rupees } from '../utils/format.js';

const R = 46;
const C = 2 * Math.PI * R;

// "Where did the money go?" donut + "who paid how much" bars.
export default function Insights({ expenses, members }) {
  const [tab, setTab] = useState('category');
  const spend = expenses.filter((e) => !e.isPayment);
  if (spend.length === 0) return null;
  const total = spend.reduce((s, e) => s + e.amount, 0);

  const byCat = {};
  spend.forEach((e) => { byCat[e.category || 'other'] = (byCat[e.category || 'other'] || 0) + e.amount; });
  let acc = 0;
  const cats = Object.entries(byCat)
    .map(([k, amount]) => ({ ...categoryOf(k), amount }))
    .sort((a, b) => b.amount - a.amount)
    .map((c) => {
      const len = (c.amount / total) * C;
      const seg = { ...c, len, offset: acc };
      acc += len;
      return seg;
    });

  const byPayer = {};
  spend.forEach((e) => { byPayer[e.paidBy.id] = (byPayer[e.paidBy.id] || 0) + e.amount; });
  const payers = members.map((m) => ({ name: m.name, amount: byPayer[m.id] || 0 })).sort((a, b) => b.amount - a.amount);
  const max = Math.max(...payers.map((p) => p.amount), 1);

  return (
    <section>
      <h2 className="sec">Insights</h2>
      <div className="card">
        <div className="seg-control sm" role="group" aria-label="Insight type">
          <button className={tab === 'category' ? 'on' : ''} aria-pressed={tab === 'category'} onClick={() => setTab('category')}>By category</button>
          <button className={tab === 'payer' ? 'on' : ''} aria-pressed={tab === 'payer'} onClick={() => setTab('payer')}>Who paid</button>
        </div>

        {tab === 'category' ? (
          <div className="insight-body">
            <div className="donut" role="img" aria-label="Spending by category">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={R} fill="none" className="donut-track" strokeWidth="16" />
                {cats.map((c) => (
                  <circle key={c.key} cx="60" cy="60" r={R} fill="none" stroke={c.color} strokeWidth="16"
                    strokeDasharray={`${Math.max(c.len - 2, 0.5)} ${C}`} strokeDashoffset={-c.offset}
                    transform="rotate(-90 60 60)" />
                ))}
              </svg>
              <div className="donut-center"><small>Spent</small><b>{rupees(total)}</b></div>
            </div>
            <div className="legend">
              {cats.map((c) => (
                <div className="legend-row" key={c.key}>
                  <span className="dot" style={{ background: c.color }} />
                  <span className="grow">{c.emoji} {c.label}</span>
                  <b>{Math.round((c.amount / total) * 100)}%</b>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bars">
            {payers.map((p) => (
              <div className="bar-row" key={p.name}>
                <div className="bar-top"><span>{p.name}</span><span>{rupees(p.amount)}</span></div>
                <div className="bar"><i style={{ width: `${(p.amount / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
