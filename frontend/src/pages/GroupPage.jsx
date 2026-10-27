import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { categoryOf } from '../utils/categories.js';
import { burstConfetti } from '../utils/confetti.js';
import { downloadCsv, summaryText } from '../utils/share.js';
import { AvatarStack } from '../components/Avatar.jsx';
import Gauge from '../components/Gauge.jsx';
import Money from '../components/Money.jsx';
import Sheet from '../components/Sheet.jsx';
import Skeleton from '../components/Skeleton.jsx';
import BalanceCards from '../components/BalanceCards.jsx';
import SettleUp from '../components/SettleUp.jsx';
import Insights from '../components/Insights.jsx';
import ExpenseForm from '../components/ExpenseForm.jsx';
import ExpenseList from '../components/ExpenseList.jsx';
import { BackIcon, CopyIcon, DownloadIcon, PlusIcon, SearchIcon, ShareIcon, UsersIcon } from '../components/Icons.jsx';

export default function GroupPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const sheet = params.get('sheet'); // 'expense' | 'person' | null
  const [data, setData] = useState(null);
  const [email, setEmail] = useState('');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // the expense being edited
  const [message, setMessage] = useState(null); // { text, bad }
  const prevOpen = useRef(null); // how many payments were still open last time

  const load = useCallback(
    () => api(`/groups/${id}`).then(setData).catch((e) => setMessage({ text: e.message, bad: true })),
    [id]
  );
  useEffect(() => {
    prevOpen.current = null;
    setData(null);
    setFilter('all');
    setQuery('');
    load();
  }, [load]);

  // Confetti the moment the last open payment is settled.
  useEffect(() => {
    if (!data) return;
    const open = data.settleUp.length;
    if (prevOpen.current > 0 && open === 0) burstConfetti();
    prevOpen.current = open;
  }, [data]);

  // Good news fades away by itself.
  useEffect(() => {
    if (!message || message.bad) return undefined;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const closeSheet = useCallback(() => { setMessage(null); setParams({}, { replace: true }); }, [setParams]);
  const openSheet = (name) => { setMessage(null); setParams({ sheet: name }); };

  // Runs an action, shows a message, reloads. Returns true on success.
  const run = async (action, okText) => {
    setMessage(null);
    try {
      await action();
      setMessage({ text: okText });
      await load();
      return true;
    } catch (e) {
      setMessage({ text: e.message, bad: true });
      return false;
    }
  };

  if (!data) {
    if (message) return <p className="banner bad">{message.text}</p>;
    return (<><Skeleton height={48} /><Skeleton height={300} radius={28} /><Skeleton height={90} count={2} /></>);
  }

  const modalOpen = sheet !== null || editing !== null;
  const banner = message && (
    <p className={`banner ${message.bad ? 'bad' : 'ok'}`} role="status">{message.text}</p>
  );

  const addExpense = async (form) => {
    if (await run(() => api(`/groups/${id}/expenses`, { method: 'POST', body: form }), 'Expense added')) {
      setParams({}, { replace: true });
    }
  };
  const saveEdit = async (form) => {
    if (await run(() => api(`/groups/${id}/expenses/${editing.id}`, { method: 'PUT', body: form }), 'Expense updated')) {
      setEditing(null);
    }
  };
  const markPaid = (t) =>
    run(() => api(`/groups/${id}/expenses`, {
      method: 'POST',
      body: { description: 'Payment', amount: (t.amount / 100).toFixed(2), paidBy: t.from.id, splitAmong: [t.to.id], isPayment: true },
    }), 'Payment recorded');
  const removeExpense = (e) => {
    if (!confirm(`Delete "${e.description}"?`)) return;
    run(() => api(`/groups/${id}/expenses/${e.id}`, { method: 'DELETE' }), 'Expense deleted');
  };
  const addMember = async (e) => {
    e.preventDefault();
    if (await run(() => api(`/groups/${id}/members`, { method: 'POST', body: { email } }), 'Person added')) {
      setEmail('');
      setParams({}, { replace: true });
    }
  };
  const deleteGroup = async () => {
    if (!confirm('Delete this group and all its expenses?')) return;
    try { await api(`/groups/${id}`, { method: 'DELETE' }); navigate('/'); }
    catch (e) { setMessage({ text: e.message, bad: true }); }
  };

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(summaryText(data))}`, '_blank', 'noopener');
  const copySummary = async () => {
    try { await navigator.clipboard.writeText(summaryText(data)); setMessage({ text: 'Summary copied' }); }
    catch { setMessage({ text: 'Could not copy. Try WhatsApp or CSV instead', bad: true }); }
  };

  // How much of the money that was owed has already been paid back.
  const outstanding = data.balances.filter((b) => b.balance > 0).reduce((s, b) => s + b.balance, 0);
  const paidBack = data.expenses.filter((e) => e.isPayment).reduce((s, e) => s + e.amount, 0);
  const progress = paidBack + outstanding === 0 ? (data.totalSpent > 0 ? 1 : 0) : paidBack / (paidBack + outstanding);

  const q = query.trim().toLowerCase();
  const shown = data.expenses.filter(
    (e) =>
      (filter === 'all' || e.paidBy.id === filter || e.splits.some((s) => s.user.id === filter)) &&
      (!q || e.description.toLowerCase().includes(q) || categoryOf(e.category).label.toLowerCase().includes(q))
  );

  return (
    <>
      <header className="page-head">
        <Link to="/" className="icon-btn" aria-label="Back to groups"><BackIcon /></Link>
        <h1 className="page-title">{data.group.name}</h1>
        <button className="icon-btn" onClick={() => openSheet('person')} aria-label="Add person"><UsersIcon /></button>
      </header>

      {!modalOpen && banner}

      <section className="card hero rise">
        <Gauge progress={progress} label={`${Math.round(progress * 100)} percent settled`}>
          <span className="g-label">Total spent</span>
          <Money paise={data.totalSpent} className="g-value" />
          <span className="g-sub">{Math.round(progress * 100)}% settled</span>
        </Gauge>
        <AvatarStack names={data.members.map((m) => m.name)} />
      </section>

      <button className="add-bar" onClick={() => openSheet('expense')}>
        <PlusIcon width={18} height={18} /> Add expense
      </button>

      <BalanceCards balances={data.balances} />
      <SettleUp transfers={data.settleUp} onPay={markPaid} />

      {data.expenses.length > 0 && (
        <div className="actions" role="group" aria-label="Share this group">
          <button className="chip" onClick={shareWhatsApp}><ShareIcon width={16} height={16} /> WhatsApp</button>
          <button className="chip" onClick={copySummary}><CopyIcon width={16} height={16} /> Copy</button>
          <button className="chip" onClick={() => downloadCsv(data)}><DownloadIcon width={16} height={16} /> CSV</button>
        </div>
      )}

      <Insights expenses={data.expenses} members={data.members} />

      <h2 className="sec">History</h2>
      {data.expenses.length > 0 && (
        <label className="search">
          <SearchIcon width={18} height={18} />
          <input type="search" value={query} placeholder="Search expenses" aria-label="Search expenses"
            onChange={(e) => setQuery(e.target.value)} />
        </label>
      )}
      <div className="chips scroll" role="group" aria-label="Filter history by person">
        <button className={`chip ${filter === 'all' ? 'on' : ''}`} aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}>All</button>
        {data.members.map((m) => (
          <button key={m.id} className={`chip ${filter === m.id ? 'on' : ''}`} aria-pressed={filter === m.id}
            onClick={() => setFilter(m.id)}>{m.name}</button>
        ))}
      </div>
      <ExpenseList expenses={shown} totalSpent={data.totalSpent} filtered={q !== '' || filter !== 'all'}
        onDelete={removeExpense} onEdit={(e) => { setMessage(null); setEditing(e); }} />

      {data.group.createdBy === user.id && (
        <button className="text-btn danger" onClick={deleteGroup}>Delete this group</button>
      )}

      <Sheet open={sheet === 'expense'} title="Add expense" onClose={closeSheet}>
        {banner}
        {/* key resets the form when members change */}
        <ExpenseForm key={data.members.length} members={data.members} currentUserId={user.id} onSubmit={addExpense} />
      </Sheet>

      <Sheet open={editing !== null} title="Edit expense" onClose={() => { setMessage(null); setEditing(null); }}>
        {banner}
        {editing && (
          <ExpenseForm key={editing.id} members={data.members} currentUserId={user.id} initial={editing}
            submitLabel="Save changes" onSubmit={saveEdit} />
        )}
      </Sheet>

      <Sheet open={sheet === 'person'} title="Add a person" onClose={closeSheet}>
        {banner}
        <form onSubmit={addMember}>
          <label htmlFor="pemail">Their account email</label>
          <input id="pemail" type="email" value={email} placeholder="friend@example.com" autoFocus
            onChange={(e) => setEmail(e.target.value)} />
          <p className="hint">They need to have signed up first.</p>
          <button type="submit" className="btn block">Add person</button>
        </form>
      </Sheet>
    </>
  );
}
