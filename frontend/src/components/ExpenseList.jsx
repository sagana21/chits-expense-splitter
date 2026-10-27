import { EditIcon, TrashIcon } from './Icons.jsx';
import EmptyState from './EmptyState.jsx';
import { categoryOf } from '../utils/categories.js';
import { rupees, whenLabel } from '../utils/format.js';

export default function ExpenseList({ expenses, totalSpent, onDelete, onEdit, filtered }) {
  if (expenses.length === 0) {
    return filtered
      ? <div className="card empty-card">No expenses match that.</div>
      : <EmptyState title="No expenses yet" text="Tap + to add the first one." />;
  }
  return expenses.map((e, i) => {
    const n = e.splits.length || 1;
    const pct = totalSpent > 0 ? Math.round((e.amount / totalSpent) * 100) : 0;
    const cat = categoryOf(e.category);
    const custom = e.splitType && e.splitType !== 'equal';
    return (
      <article className={`card exp-card rise ${e.isPayment ? 'payment' : ''}`} key={e.id} style={{ '--i': Math.min(i, 8) }}>
        <div className="exp-top">
          <span className="cat-tile" style={{ background: e.isPayment ? 'var(--soft)' : `${cat.color}26` }} aria-hidden="true">
            {e.isPayment ? '💸' : cat.emoji}
          </span>
          <div className="exp-title">
            <strong>{e.description}</strong>
            <span>{e.isPayment ? 'Payment' : cat.label}, {whenLabel(e.date || e.createdAt)}</span>
          </div>
          <div className="exp-amt">
            <strong>{rupees(e.amount)}</strong>
            <span className="accent">{e.isPayment ? 'Settled' : `${pct}% of total`}</span>
          </div>
        </div>
        <div className="exp-stats">
          <div><small>{e.isPayment ? 'From' : 'Paid by'}</small><b>{e.paidBy.name}</b></div>
          {e.isPayment ? (
            <div><small>To</small><b>{e.splits.map((s) => s.user.name).join(', ')}</b></div>
          ) : (
            <>
              <div><small>Split</small><b>{n} {n === 1 ? 'person' : 'people'}</b></div>
              <div>
                <small>{custom ? 'Type' : 'Each'}</small>
                <b>{custom ? (e.splitType === 'percent' ? 'By percent' : 'Custom') : rupees(Math.round(e.amount / n))}</b>
              </div>
            </>
          )}
          <span className="row-actions">
            {!e.isPayment && (
              <button className="icon-btn sm" onClick={() => onEdit(e)} aria-label={`Edit ${e.description}`}>
                <EditIcon width={17} height={17} />
              </button>
            )}
            <button className="icon-btn sm" onClick={() => onDelete(e)} aria-label={`Delete ${e.description}`}>
              <TrashIcon width={17} height={17} />
            </button>
          </span>
        </div>
      </article>
    );
  });
}
