import Avatar from './Avatar.jsx';
import { ArrowIcon } from './Icons.jsx';
import { rupees } from '../utils/format.js';

export default function SettleUp({ transfers, onPay }) {
  return (
    <section>
      <h2 className="sec">Settle up</h2>
      {transfers.length === 0 ? (
        <div className="card empty-card">Everyone is settled up.</div>
      ) : (
        transfers.map((t, i) => (
          <div className="card settle-card rise" key={`${t.from.id}-${t.to.id}`} style={{ '--i': i }}>
            <div className="pair">
              <Avatar name={t.from.name} size={38} />
              <ArrowIcon width={16} height={16} />
              <Avatar name={t.to.name} size={38} />
            </div>
            <div className="settle-text">
              <b>{t.from.name} pays {t.to.name}</b>
              <span className="amt">{rupees(t.amount)}</span>
            </div>
            <button className="btn ghost sm" onClick={() => onPay(t)}>Mark paid</button>
          </div>
        ))
      )}
    </section>
  );
}
