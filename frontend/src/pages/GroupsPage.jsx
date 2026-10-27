import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { rupees } from '../utils/format.js';
import Sheet from '../components/Sheet.jsx';
import Money from '../components/Money.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { ArrowIcon, PlusIcon } from '../components/Icons.jsx';

export default function GroupsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [groups, setGroups] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const sheetOpen = params.get('sheet') === 'group';

  useEffect(() => { api('/groups').then(setGroups).catch((e) => setError(e.message)); }, []);

  const close = () => { setError(''); setParams({}, { replace: true }); };

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const g = await api('/groups', { method: 'POST', body: { name } });
      setName('');
      navigate(`/groups/${g.id}`);
    } catch (err) { setError(err.message); }
  };

  const owed = (groups || []).reduce((s, g) => s + Math.max(g.myBalance, 0), 0);
  const owe = (groups || []).reduce((s, g) => s + Math.max(-g.myBalance, 0), 0);

  return (
    <>
      <header className="greeting">
        <div>
          <p>Hi, {user.name.split(' ')[0]}</p>
          <h1>Your groups</h1>
        </div>
        <ThemeToggle />
      </header>

      {groups === null && !error && <Skeleton count={3} height={84} />}
      {!sheetOpen && error && <p className="banner bad" role="alert">{error}</p>}

      {groups?.length > 0 && (
        <section className="card overview rise">
          <div className="ov-cols">
            <div>
              <small>You are owed</small>
              <Money paise={owed} className="ov-num pos" />
            </div>
            <div>
              <small>You owe</small>
              <Money paise={owe} className="ov-num neg" />
            </div>
          </div>
          <div className="ov-bar" aria-hidden="true">
            <i style={{ width: owed + owe === 0 ? '0%' : `${(owed / (owed + owe)) * 100}%` }} />
          </div>
          <p className="hint">
            {owed + owe === 0 ? 'You are all settled up across every group.' : `Across ${groups.length} ${groups.length === 1 ? 'group' : 'groups'}.`}
          </p>
        </section>
      )}

      {groups?.length === 0 && <EmptyState title="No groups yet" text="Tap + to create your first one." />}
      {groups?.map((g, i) => (
        <Link to={`/groups/${g.id}`} className="card group-card rise" key={g.id} style={{ '--i': i + 1 }}>
          <span className="group-badge" aria-hidden="true">{g.name[0]?.toUpperCase()}</span>
          <span className="group-info">
            <strong>{g.name}</strong>
            <small>{g.memberCount} {g.memberCount === 1 ? 'person' : 'people'}</small>
            <span className={`bal-chip ${g.myBalance > 0 ? 'pos' : g.myBalance < 0 ? 'neg' : 'zero'}`}>
              {g.myBalance > 0 ? `you're owed ${rupees(g.myBalance)}` : g.myBalance < 0 ? `you owe ${rupees(g.myBalance)}` : 'settled up'}
            </span>
          </span>
          <ArrowIcon width={18} height={18} />
        </Link>
      ))}

      <button className="add-bar" onClick={() => setParams({ sheet: 'group' })}>
        <PlusIcon width={18} height={18} /> New group
      </button>

      <Sheet open={sheetOpen} title="New group" onClose={close}>
        <form onSubmit={create}>
          <label htmlFor="gname">Group name</label>
          <input id="gname" value={name} maxLength={60} placeholder="Room 204, Goa trip…" autoFocus
            onChange={(e) => setName(e.target.value)} />
          {error && <p className="banner bad" role="alert">{error}</p>}
          <button type="submit" className="btn block">Create group</button>
        </form>
      </Sheet>
    </>
  );
}
