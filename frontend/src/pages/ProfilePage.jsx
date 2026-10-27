import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { LogoutIcon } from '../components/Icons.jsx';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <header className="greeting"><div><h1>Profile</h1></div></header>
      <section className="card profile-card rise">
        <Avatar name={user.name} size={72} />
        <strong>{user.name}</strong>
        <span>{user.email}</span>
        <p className="hint">Friends add you to a group using this email.</p>
      </section>
      <ThemeToggle row />
      <button className="btn ghost block" onClick={() => { logout(); navigate('/login'); }}>
        <LogoutIcon width={18} height={18} /> Log out
      </button>
    </>
  );
}
