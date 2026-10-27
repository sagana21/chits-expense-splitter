import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Gauge from '../components/Gauge.jsx';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, saveSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api(isRegister ? '/auth/register' : '/auth/login', { method: 'POST', body: form });
      saveSession(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="splash">
      <div className="splash-art" aria-hidden="true">
        <Gauge progress={0.72}>
          <span className="g-label">Room 204</span>
          <span className="g-value">₹6,420</span>
          <span className="g-sub">72% settled</span>
        </Gauge>
        <span className="float-chip c1">Dinner ₹900</span>
        <span className="float-chip c2">Rent ₹6,000</span>
        <span className="float-chip c3">Cab ₹240</span>
      </div>

      <h1 className="splash-title">Split bills,<br />not friendships.</h1>
      <p className="splash-sub">Add what you spent. Chits works out who pays whom.</p>

      <form className="card auth-card" onSubmit={submit}>
        {isRegister && (
          <>
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={set('name')} autoComplete="name" />
          </>
        )}
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={form.password} onChange={set('password')}
          autoComplete={isRegister ? 'new-password' : 'current-password'} />
        {error && <p className="banner bad" role="alert">{error}</p>}
        <button type="submit" className="btn block" disabled={busy}>
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
        </button>
        <p className="switch">
          {isRegister ? <>Already have an account? <Link to="/login">Log in</Link></>
            : <>New here? <Link to="/register">Create an account</Link></>}
        </p>
      </form>
    </div>
  );
}
