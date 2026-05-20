import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-logo">
          TaskFlow
          <span>Team Manager</span>
        </div>

        <div className="sidebar-scroll">
          <div className="sidebar-section">Navigation</div>
          <button
            className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <span className="icon">#</span> Projects
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            {user?.email}
          </div>
          <button className="btn btn-ghost btn-sm btn-full mt-12" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
