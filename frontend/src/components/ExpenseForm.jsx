import { useState } from 'react';
import Avatar from './Avatar.jsx';
import { CATEGORIES } from '../utils/categories.js';
import { rupees } from '../utils/format.js';

// Local calendar date as YYYY-MM-DD (what <input type="date"> uses).
const toDateStr = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};
const toIso = (str) => (str === toDateStr(new Date()) ? new Date().toISOString() : new Date(`${str}T12:00:00`).toISOString());

const MODES = [['equal', 'Equal'], ['exact', 'Exact ₹'], ['percent', 'Percent %']];

// Used for both "Add expense" and "Edit expense" (pass `initial` to edit).
export default function ExpenseForm({ members, currentUserId, initial, onSubmit, submitLabel = 'Add expense' }) {
  const editing = Boolean(initial);
  const [amount, setAmount] = useState(editing ? String(initial.amount / 100) : '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || 'food');
  const [date, setDate] = useState(toDateStr(initial?.date || new Date()));
  const [paidBy, setPaidBy] = useState(initial?.paidBy.id || currentUserId);
  // Custom splits are opened as exact amounts when editing, which reproduces the stored shares exactly.
  const [splitType, setSplitType] = useState(editing && initial.splitType !== 'equal' ? 'exact' : 'equal');
  const [splitAmong, setSplitAmong] = useState(initial ? initial.splits.map((s) => s.user.id) : members.map((m) => m.id));
  const [exact, setExact] = useState(() => Object.fromEntries((initial?.splits || []).map((s) => [s.user.id, String(s.share / 100)])));
  const [percent, setPercent] = useState({});
  const [busy, setBusy] = useState(false);

  const total = Number(amount) > 0 ? Math.round(Number(amount) * 100) : 0;
  const exactSum = members.reduce((s, m) => s + Math.round((Number(exact[m.id]) || 0) * 100), 0);
  const pctSum = members.reduce((s, m) => s + (Number(percent[m.id]) || 0), 0);

  const toggle = (id) => setSplitAmong((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const values = splitType === 'exact' ? exact : percent;
  const setValue = (id, v) => (splitType === 'exact' ? setExact : setPercent)((cur) => ({ ...cur, [id]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const body = {
      description, amount, paidBy, category, splitType,
      date: editing && date === toDateStr(initial.date) ? initial.date : toIso(date),
    };
    if (splitType === 'equal') body.splitAmong = splitAmong;
    else {
      body.splitDetails = members
        .filter((m) => Number(values[m.id]) > 0)
        .map((m) => ({ user: m.id, value: values[m.id] }));
    }
    await onSubmit(body);
    setBusy(false);
  };

  let hint = null;
  if (splitType === 'equal' && total > 0 && splitAmong.length) {
    hint = <p className="hint">Each person pays about <b>{rupees(Math.round(total / splitAmong.length))}</b></p>;
  } else if (splitType === 'exact' && total > 0) {
    const ok = exactSum === total;
    hint = (
      <p className={`hint ${ok ? 'good' : ''}`}>
        {ok ? 'Adds up perfectly' : `${rupees(exactSum)} of ${rupees(total)} assigned (${exactSum < total ? rupees(total - exactSum) + ' left' : rupees(exactSum - total) + ' too much'})`}
      </p>
    );
  } else if (splitType === 'percent') {
    const ok = Math.abs(pctSum - 100) < 0.01;
    hint = <p className={`hint ${ok ? 'good' : ''}`}>{ok ? 'Adds up to 100%' : `${Number(pctSum.toFixed(2))}% of 100% assigned`}</p>;
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="amt">Amount</label>
      <div className="amount-wrap">
        <span aria-hidden="true">₹</span>
        <input id="amt" className="amount-input" type="number" min="0" step="0.01" inputMode="decimal"
          placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus={!editing} />
      </div>

      <label htmlFor="desc">What was it for?</label>
      <input id="desc" value={description} maxLength={80} placeholder="Dinner, electricity bill…"
        onChange={(e) => setDescription(e.target.value)} />

      <label id="cat-label">Category</label>
      <div className="chips scroll" role="group" aria-labelledby="cat-label">
        {CATEGORIES.map((c) => (
          <button type="button" key={c.key} className={`chip ${category === c.key ? 'on' : ''}`}
            aria-pressed={category === c.key} onClick={() => setCategory(c.key)}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="two-col">
        <div>
          <label htmlFor="payer">Paid by</label>
          <select id="payer" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="when">Date</label>
          <input id="when" type="date" value={date} max={toDateStr(new Date())} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <label id="split-label">How to split</label>
      <div className="seg-control" role="group" aria-labelledby="split-label">
        {MODES.map(([k, label]) => (
          <button type="button" key={k} className={splitType === k ? 'on' : ''} aria-pressed={splitType === k}
            onClick={() => setSplitType(k)}>{label}</button>
        ))}
      </div>

      {splitType === 'equal' ? (
        <div className="chips top-gap" role="group" aria-label="Split between">
          {members.map((m) => (
            <button type="button" key={m.id} className={`chip ${splitAmong.includes(m.id) ? 'on' : ''}`}
              aria-pressed={splitAmong.includes(m.id)} onClick={() => toggle(m.id)}>{m.name}</button>
          ))}
        </div>
      ) : (
        <div className="split-rows">
          {members.map((m) => (
            <div className="split-row" key={m.id}>
              <Avatar name={m.name} size={32} />
              <span className="grow">{m.name}</span>
              <div className="suffix-input">
                <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0" value={values[m.id] ?? ''}
                  aria-label={`${m.name} ${splitType === 'exact' ? 'amount in rupees' : 'percent'}`}
                  onChange={(e) => setValue(m.id, e.target.value)} />
                <em>{splitType === 'exact' ? '₹' : '%'}</em>
              </div>
            </div>
          ))}
        </div>
      )}
      {hint}

      <button type="submit" className="btn block" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
    </form>
  );
}
