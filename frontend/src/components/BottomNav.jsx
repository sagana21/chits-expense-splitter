import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { HomeIcon, PlusIcon, UserIcon } from './Icons.jsx';

// Floating dark tab bar. The centre button opens whichever sheet fits the current page.
export default function BottomNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (!user) return null;

  const inGroup = pathname.startsWith('/groups/');
  const addTo = inGroup ? `${pathname}?sheet=expense` : '/?sheet=group';
  const homeActive = pathname === '/' || inGroup;

  return (
    <nav className="bottom-nav" aria-label="Main">
      <Link to="/" className={`nav-item ${homeActive ? 'active' : ''}`} aria-label="Groups"
        aria-current={homeActive ? 'page' : undefined}><HomeIcon /></Link>
      <button className="fab" onClick={() => navigate(addTo)} aria-label={inGroup ? 'Add expense' : 'New group'}>
        <PlusIcon width={26} height={26} />
      </button>
      <Link to="/profile" className={`nav-item ${pathname === '/profile' ? 'active' : ''}`} aria-label="Profile"
        aria-current={pathname === '/profile' ? 'page' : undefined}><UserIcon /></Link>
    </nav>
  );
}
