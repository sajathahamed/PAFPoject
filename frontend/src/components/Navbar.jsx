import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isTechnician, isStudent, isLecturer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const hideOnPaths = ['/dashboard', '/student/home', '/admin/home', '/technician/dashboard', '/lecturer/home', '/profile', '/admin/users'];
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          🏫 Smart Campus
        </Link>

        <ul className="navbar-nav">
          <li>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </li>

          {isAdmin() && (
            <li>
              <Link to="/admin/users" className="nav-link">
                Manage Users
              </Link>
            </li>
          )}

          {(isStudent() || isLecturer()) && (
            <li>
              <Link to="/bookings" className="nav-link">
                My Bookings
              </Link>
            </li>
          )}

          {isTechnician() && (
            <li>
              <Link to="/work-orders" className="nav-link">
                Work Orders
              </Link>
            </li>
          )}

          <li className="nav-user">
            {user?.profilePicture && (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="nav-avatar"
              />
            )}
            <span className="nav-link" style={{ cursor: 'default' }}>
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
