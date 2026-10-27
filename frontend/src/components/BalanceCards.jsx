import Avatar from './Avatar.jsx';
import { rupees } from '../utils/format.js';

export default function BalanceCards({ balances }) {
  return (
    <section>
      <h2 className="sec">Balances</h2>
      <div className="carousel">
        {balances.map((b, i) => {
          const cls = b.balance > 0 ? 'pos' : b.balance < 0 ? 'neg' : 'zero';
          const note = b.balance > 0 ? 'gets back' : b.balance < 0 ? 'owes' : 'settled up';
          return (
            <div className="bal-card rise" key={b.userId} style={{ '--i': i }}>
              <Avatar name={b.name} size={40} />
              <div className="bal-name">{b.name}</div>
              <div className={`bal-amt ${cls}`}>{b.balance === 0 ? '₹0' : rupees(b.balance)}</div>
              <small>{note}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
